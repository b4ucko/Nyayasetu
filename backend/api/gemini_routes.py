import os
import time
import html
import hashlib
from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel, Field, ConfigDict, field_validator
from google import genai
from google.genai import types
import json

from .validation_utils import validate_alphanumeric_dashed, validate_uploaded_file

# Initialize the router
router = APIRouter()
MATCHES_CACHE = {}

# --- GEMINI CLIENT CONFIGURATION ---
# Load up to 10 sequential API keys from environment variables
FREE_KEYS = []
for i in range(1, 11):
    # Support multiple naming patterns (GEMINI_SECRET_KEY1, GEMINI_SECRET_KEY_1, GEMINI_API_KEY_1, GEMINI_API_KEY1)
    keys_to_try = [
        os.getenv(f"GEMINI_SECRET_KEY{i}"),
        os.getenv(f"GEMINI_SECRET_KEY_{i}"),
        os.getenv(f"GEMINI_API_KEY_{i}"),
        os.getenv(f"GEMINI_API_KEY{i}")
    ]
    for key in keys_to_try:
        if key and key.strip() and not key.startswith("your_gemini_"):
            val = key.strip()
            if val not in FREE_KEYS:
                FREE_KEYS.append(val)
            break

# Fallback to the default single GEMINI_API_KEY or GEMINI_SECRET_KEY if no sequential keys were set
for default_env_var in ["GEMINI_API_KEY", "GEMINI_SECRET_KEY"]:
    default_key = os.getenv(default_env_var)
    if default_key and default_key.strip() and not default_key.startswith("your_gemini_"):
        if default_key.strip() not in FREE_KEYS:
            FREE_KEYS.append(default_key.strip())


class RotatingModels:
    def __init__(self, parent):
        self.parent = parent

    async def generate_content(self, *args, **kwargs):
        clients_to_try = self.parent.clients if self.parent.clients else [genai.Client()]
        last_error = None
        
        for _ in range(len(clients_to_try)):
            idx = self.parent.current_index
            current_client = clients_to_try[idx]
            
            # Rotate index to next client
            if self.parent.clients:
                self.parent.current_index = (idx + 1) % len(self.parent.clients)
                
            try:
                return await current_client.aio.models.generate_content(*args, **kwargs)
            except Exception as e:
                print(f"Key Rotation Failover: Key at index {idx} failed with error: {str(e)}. Trying next key...")
                last_error = e
                continue
                
        raise last_error

class RotatingAio:
    def __init__(self, parent):
        self.models = RotatingModels(parent)

class RoundRobinClient:
    def __init__(self, keys):
        self.clients = []
        self.current_index = 0
        for key in keys:
            try:
                self.clients.append(genai.Client(api_key=key))
            except Exception as e:
                print(f"Warning: Failed to load a Gemini Key: {e}")
        
        self.aio = RotatingAio(self)

    def __bool__(self):
        return len(self.clients) > 0 or os.getenv("GEMINI_API_KEY") is not None or os.getenv("GEMINI_SECRET_KEY") is not None

# Initialize Master Rotating Client
client = RoundRobinClient(FREE_KEYS)

# For backwards compatibility and design separation, we alias all clients to the same master client
guides_client = client
scanner_client = client

# -----------------------------------------------------
# Models
# -----------------------------------------------------
class UserProfile(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True
    )

    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=0, le=125)
    occupation: str = Field(..., min_length=1, max_length=100)
    income: float = Field(..., ge=0.0, le=1000000000.0)
    state: str = Field(..., min_length=1, max_length=100)
    land_acres: float = Field(default=0.0, ge=0.0, le=100000.0)
    gender: str = Field(default="", max_length=50)
    marital_status: str = Field(default="", max_length=50)
    caste: str = Field(default="", max_length=50)
    disability: str = Field(default="No", max_length=50)
    education: str = Field(default="", max_length=100)
    filterCategory: str = Field(default="", max_length=100)
    filterState: str = Field(default="", max_length=100)
    page: int = Field(default=1, ge=1)

    @field_validator(
        "name", "occupation", "state", "gender", "marital_status",
        "caste", "disability", "education", "filterCategory", "filterState"
    )
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        # Escape HTML inputs to prevent injection / XSS
        return html.escape(v)

class VoiceRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True
    )
    transcript: str = Field(..., min_length=1, max_length=5000)

    @field_validator("transcript")
    @classmethod
    def sanitize_transcript(cls, v: str) -> str:
        return html.escape(v)

# -----------------------------------------------------
# Schema for AI Matcher Output
# -----------------------------------------------------
class RecommendationSchema(BaseModel):
    name: str
    description: str
    eligibilityScore: int
    category: str
    stateApplicability: str
    id: str
    officialWebsite: str

class RecommendationsList(BaseModel):
    schemes: list[RecommendationSchema]
    has_more: bool = False

class NoticeAnalysisSchema(BaseModel):
    notice_type: str
    sender: str
    recipient: str
    key_dates: str
    summary: str
    required_action: str
    severity: str


# -----------------------------------------------------
# Routes
# -----------------------------------------------------

@router.post("/ai/match")
async def match_schemes(profile: UserProfile):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized. Check API Key.")
    
    # 1. Profile hashing and local caching
    try:
        profile_json = json.dumps(profile.model_dump(), sort_keys=True)
        profile_hash = hashlib.md5(profile_json.encode('utf-8')).hexdigest()
        if profile_hash in MATCHES_CACHE:
            return MATCHES_CACHE[profile_hash]
    except Exception as e:
        profile_hash = None
        print(f"Warning: Hashing/Caching setup failed: {e}")

    # 2. RAG Context Generation (Query Chroma database)
    schemes_context = ""
    has_more = False
    try:
        from rag_pipeline.rag import GeminiEmbeddings, DB_DIR
        from langchain_community.vectorstores import Chroma
        
        embeddings = GeminiEmbeddings()
        # Verify client key is available
        if embeddings.client and embeddings.client.api_key:
            vectorstore = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
            search_query = f"Government schemes for state {profile.state}, age {profile.age}, occupation {profile.occupation}, category {profile.filterCategory or 'all'}, gender {profile.gender or 'all'}"
            matching_docs = vectorstore.similarity_search(search_query, k=40)
            
            # De-duplicate documents
            seen = set()
            unique_docs = []
            for doc in matching_docs:
                name = doc.metadata.get('name')
                if name and name not in seen:
                    seen.add(name)
                    unique_docs.append(doc)
            
            PAGE_SIZE = 10
            start_idx = (profile.page - 1) * PAGE_SIZE
            end_idx = start_idx + PAGE_SIZE
            
            sliced_docs = unique_docs[start_idx:end_idx]
            has_more = end_idx < len(unique_docs)
            
            for doc in sliced_docs:
                schemes_context += f"---\n{doc.page_content}\nMetadata: {json.dumps(doc.metadata)}\n"
    except Exception as e:
        print(f"Warning: Chroma vector DB search failed ({e}). Falling back to local dataset file.")
        schemes_context = ""

    # 3. Local JSON Registry Fallback
    if not schemes_context:
        try:
            dataset_path = os.path.join(os.path.dirname(__file__), "../datasets/dataset.json")
            if os.path.exists(dataset_path):
                with open(dataset_path, "r", encoding="utf-8") as f:
                    local_schemes = json.load(f)
                
                filtered_local = []
                for s in local_schemes:
                    # Filter category
                    if profile.filterCategory and s.get("category", "").lower() != profile.filterCategory.lower():
                        continue
                    # Filter state applicability
                    state_app = s.get("stateApplicability", "All India")
                    if profile.filterState and state_app != "All India" and state_app.lower() != profile.filterState.lower():
                        continue
                    filtered_local.append(s)
                
                target_schemes = filtered_local if filtered_local else local_schemes
                
                PAGE_SIZE = 10
                start_idx = (profile.page - 1) * PAGE_SIZE
                end_idx = start_idx + PAGE_SIZE
                
                sliced_schemes = target_schemes[start_idx:end_idx]
                has_more = end_idx < len(target_schemes)
                
                for s in sliced_schemes:
                    schemes_context += (
                        f"---\n"
                        f"Scheme Name: {s.get('scheme_name')}\n"
                        f"Category: {s.get('category')}\n"
                        f"Eligibility: {s.get('eligibility')}\n"
                        f"Benefits: {s.get('benefits')}\n"
                        f"Required Documents: {', '.join(s.get('required_documents', []))}\n"
                        f"Ministry: {s.get('ministry')}\n"
                        f"Metadata: {json.dumps({'id': s.get('id'), 'name': s.get('scheme_name'), 'category': s.get('category'), 'officialWebsite': s.get('officialWebsite')})}\n"
                    )
        except Exception as ex:
            print(f"Warning: Dataset file fallback failed: {ex}")

    # 4. Prompt Optimization for compact outputs
    prompt = f"""
    You are an expert Indian Government Scheme matching advisor.
    Evaluate the Citizen profile below against the candidate government schemes provided in the Context.
    
    Citizen Profile:
    Name: {profile.name}
    Age: {profile.age}
    Gender: {profile.gender}
    Marital Status: {profile.marital_status}
    Caste/Category: {profile.caste}
    Disability: {profile.disability}
    Education: {profile.education}
    Occupation: {profile.occupation}
    Income: ₹{profile.income}
    State: {profile.state}
    Land Holding: {profile.land_acres} acres

    Context - Candidate Schemes (Page {profile.page}):
    {schemes_context}

    CRITICAL RULES:
    1. Only return schemes from the Context above that the citizen is eligible for based on their profile criteria. Do not output any other schemes.
    2. Keep the JSON field 'description' very short (maximum 1-2 brief sentences) stating the primary benefit and why the citizen qualifies.
    3. Determine the 'id' field by matching it to the key in metadata (or slugify the scheme name, e.g., 'pm-kisan').
    4. Provide the correct officialWebsite from the context.
    5. Set the 'eligibilityScore' (70-100) based on criteria suitability.
    """

    try:
        import asyncio
        # Invoke Gemini content generation with strict 15 seconds timeout
        response = await asyncio.wait_for(
            client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=RecommendationsList,
                    temperature=0.2
                ),
            ),
            timeout=15.0
        )
        data = json.loads(response.text)
        
        # Inject python-computed has_more flag
        if isinstance(data, dict):
            data["has_more"] = has_more
        
        # Save to memory cache
        if profile_hash and data:
            MATCHES_CACHE[profile_hash] = data
            
        return data
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="AI Recommendation request timed out. Trying next fallback key.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Recommendation failed: {str(e)}")


@router.get("/ai/scheme/{scheme_name}")
async def get_scheme_details(scheme_name: str):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized. Check API Key.")
    
    sanitized_scheme_name = validate_alphanumeric_dashed(scheme_name, max_len=100)
    
    prompt = f"""
    You are an expert government scheme advisor.
    Provide a comprehensive guide for the government scheme named "{sanitized_scheme_name}" formatted in Markdown.

    Please include exactly these sections:
    # Scheme Overview
    ## Eligibility Criteria
    ## Exact Financial/Other Benefits
    ## Required Documents
    ## Step-by-Step Application Process
    """

    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3
            ),
        )
        return {"markdown": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Details retrieval failed: {str(e)}")


@router.get("/ai/document-guide/{document_name}")
async def get_document_guide(document_name: str):
    """
    Returns an exhaustive semantic markdown guide for applying to or editing an Essential Document, 
    using the distinct secondary API key.
    """
    if not guides_client:
        raise HTTPException(status_code=500, detail="Secondary Gemini Guides client not initialized. Check API Key.")
    
    sanitized_document_name = validate_alphanumeric_dashed(document_name, max_len=100)
    
    prompt = f"""
    You are an expert Indian Government Document Advisor. 
    Provide an EXTREMELY BRIEF, short, and sweet practical guide to applying for and editing the document: "{sanitized_document_name}". 
    
    CRITICAL: Keep it incredibly concise to generate text fast. Use maximum 3 bullet points per section. 
    You MUST provide the exact official government website URL for applying.

    Include exactly these sections formatted in clean Markdown:
    # 📄 Guide to {sanitized_document_name}
    ## 📋 Documents Required (Short list)
    ## 💻 Quick Application Steps
    ## ✏️ Quick Editing Steps
    ## 🔗 Official Portal URL
    """

    try:
        response = await guides_client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3
            ),
        )
        return {"markdown": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/ocr")
async def analyze_document(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image using gemini-2.5-flash with a dedicated tertiary API key.
    Extracts key information like Name, DOB, Address, and masks the ID numbers.
    """
    if not scanner_client:
        raise HTTPException(status_code=500, detail="Tertiary Gemini Scanner client not initialized. Check API Key.")
    
    validate_uploaded_file(
        file,
        allowed_mimes=["image/jpeg", "image/png", "image/webp", "application/pdf"],
        max_size_bytes=10 * 1024 * 1024  # 10MB limit
    )
    
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # Prepare the part. (We assume image/jpeg or image/png, etc.)
        doc_part = types.Part.from_bytes(
            data=file_bytes,
            mime_type=file.content_type
        )
        
        prompt = """
        Analyze this legal or government document. It could be any official or legal document (Notice, Aadhaar, PAN, Court Order, Contract, Rejection Letter, etc.).
        Extract all relevant key information natively. Specifically:
        1. Extract the Name, Date of Birth (DOB), and full Address if available. If missing, mark as 'Not Found'.
        2. Identify the Unique ID Number or Document Number, but MASK it (e.g., XXXX-XXXX-1234).
        3. Identify any other parties involved, key dates, monetary values, and a concise summary.
        
        NEW LEGAL CAPABILITIES:
        4. "document_type": Accurately classify the document (e.g., "Show-cause notice", "Consumer complaint notice", "Land-related notice", "Tax notice", "Benefit rejection letter", "Identity Card").
        5. "legal_notice_analysis": IF the document is a notice or rejection, extract:
            - "notice_type": (tax, land, benefits, etc.)
            - "issuing_authority": (Who sent it)
            - "important_dates": (Deadlines, hearings)
            - "required_action": (What the user MUST do)
            - "risk_if_ignored": (Consequences of missing deadline)
        6. "rights_awareness": What are the user's rights relating to this document? Suggest next actions (e.g., "You may file an appeal", "You may use RTI"). Point to basic relevant law/act references.
        7. "fraud_evaluation": Check for missing official patterns, unusual wording, fake payment requests, or unverified authority references. Return "fraud_flag" (boolean) and "suspicious_hints" (array of strings if any).

        Return the information as a clean, well-structured JSON with all the descriptive keys mentioned above.
        """
        
        response = await scanner_client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, doc_part],
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json"
            ),
        )
        return {"extracted_text": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/detect-fraud")
async def detect_document_fraud(file: UploadFile = File(...)):
    """
    Analyzes an uploaded document for potential fraud, scams, or forgery.
    """
    if not scanner_client:
        raise HTTPException(status_code=500, detail="Tertiary Gemini Scanner client not initialized. Check API Key.")
    
    validate_uploaded_file(
        file,
        allowed_mimes=["image/jpeg", "image/png", "image/webp", "application/pdf"],
        max_size_bytes=10 * 1024 * 1024  # 10MB limit
    )
    
    try:
        file_bytes = await file.read()
        doc_part = types.Part.from_bytes(data=file_bytes, mime_type=file.content_type)
        
        prompt = """
        You are an expert forensic document examiner and cybersecurity AI.
        Analyze this document specifically for signs of fraud, forgery, scams, or illegitimacy.
        Check for:
        1. Inconsistent fonts, misaligned text, or signs of digital manipulation (photoshop).
        2. Missing watermarks, seals, or official government signatures or holograms.
        3. Suspicious language, urgency, or requests for unexpected payments (classic scam signs).
        4. Invalid formatting for the claimed document type (e.g. Aadhaar, PAN, Bank Notice, Court Order).
        
        Return a JSON object with:
        - "is_authentic": an integer (0-100) estimating the likelihood the document is real and authentic.
        - "fraud_risk": string ("Low", "Medium", or "High").
        - "anomalies_detected": An array of strings describing any suspicious elements found.
        - "recommendation": Advice to the user on what to do next based on your findings.
        """
        
        response = await scanner_client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, doc_part],
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json"
            ),
        )
        return {"fraud_analysis": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/extract-profile")
async def extract_profile_from_id(file: UploadFile = File(...)):
    """
    Specifically extracts profile information (Name, Age, State, etc.) from an ID. 
    Strictly returns a JSON object matching the frontend form data structure.
    """
    if not scanner_client:
        raise HTTPException(status_code=500, detail="Scanner client not initialized.")
    
    validate_uploaded_file(
        file,
        allowed_mimes=["image/jpeg", "image/png", "image/webp", "application/pdf"],
        max_size_bytes=10 * 1024 * 1024  # 10MB limit
    )

    try:
        file_bytes = await file.read()
        doc_part = types.Part.from_bytes(data=file_bytes, mime_type=file.content_type)
        
        prompt = """
        Analyze this ID document (like Aadhaar, PAN, Voter ID, driving license, etc.).
        Extract demographic details to auto-fill a user profile form.
        
        CRITICAL RULES:
        1. STRICLY NO ASSUMPTIONS: If a piece of information is NOT explicitly visible on the ID, leave it completely empty ("").
        2. Do NOT guess, hallucinate, or estimate fields. For example, if the card only has DOB, do NOT calculate the Age. Leave 'age' empty "".
        3. Do NOT return "Other", "Unknown", or "Not found". Use an empty string "" exactly.

        Return exactly ONE JSON object with these exact keys:
        {
          "name": "Extracted Name, if unavailable return empty string",
          "age": "Age clearly written on the card, if unavailable return empty string",
          "gender": "Gender (Male/Female/Transgender) if explicitly written, else empty string",
          "state": "State Name from address explicitly written, if unavailable return empty string",
          "id_type": "Type of ID (e.g. Aadhaar Card, PAN Card), or empty string",
          "id_number_masked": "Masked ID number, or empty string",
          "dob": "Exact Date of Birth extracted, or empty string",
          "full_address": "Complete address line found explicitly written, or empty string"
        }
        Return NOTHING else. No markdown wrappers. Just the JSON object.
        """
        
        response = await scanner_client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, doc_part],
            config=types.GenerateContentConfig(
                temperature=0.0,
                response_mime_type="application/json"
            ),
        )
        data = json.loads(response.text)
        return data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile extraction failed: {str(e)}")


@router.post("/ai/generate-document")
async def generate_document(
    prompt_text: str = Form(...),
    document_context: str = Form(None),
    profile_context: str = Form(None)
):
    """
    Generates structured legal replies, RTIs, appeals, and official letters.
    """
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized.")
        
    # Input bounds check and escaping
    if not prompt_text or len(prompt_text) > 10000:
        raise HTTPException(status_code=400, detail="prompt_text length must be between 1 and 10000 characters.")
    sanitized_prompt_text = html.escape(prompt_text.strip())

    sanitized_document_context = ""
    if document_context:
        if len(document_context) > 100000:
            raise HTTPException(status_code=400, detail="document_context exceeds maximum length of 100000 characters.")
        sanitized_document_context = html.escape(document_context.strip())

    sanitized_profile_context = ""
    if profile_context:
        if len(profile_context) > 10000:
            raise HTTPException(status_code=400, detail="profile_context exceeds maximum length of 10000 characters.")
        sanitized_profile_context = html.escape(profile_context.strip())

    system_instruction = (
        "You are an expert Indian Legal and Administrative Drafter. "
        "You MUST generate the document strictly following the actual standard format for that specific type of legal document. "
        "For letters, notices, or appeals, ensure proper standard layout: \n"
        "1. Sender's details at the top.\n"
        "2. Date.\n"
        "3. Recipient's details.\n"
        "4. A clear, concise 'Subject' line and 'Reference' line if applicable.\n"
        "5. Formal Salutation (e.g., 'Respected Sir/Madam,').\n"
        "6. Body of the document strictly organized into numbered paragraphs.\n"
        "7. Formal Sign-off (e.g., 'Yours faithfully,') followed by Name and Signature placeholders.\n"
        "Output ONLY the drafted document text formatted perfectly using markdown. "
        "Ensure a highly professional tone, and use precise placeholders like [Your Name], [Sender Address], or [Date] where info is missing. "
        "Always reference official Indian Acts (like RTI Act, 2005, Consumer Protection Act) accurately where relevant."
    )
    
    contents = [f"User Request: {sanitized_prompt_text}"]
    if sanitized_document_context:
        contents.append(f"Context from uploaded document: {sanitized_document_context}")
    if sanitized_profile_context:
        contents.append(f"User Profile details: {sanitized_profile_context}")

    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3
            ),
        )
        return {"markdown": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Document Generation failed: {str(e)}")


@router.post("/ai/voice")
async def voice_assistant(
    audio: UploadFile = File(None),
    transcript: str = Form(None),
    profile_context: str = Form(None),
    document_context: str = Form(None)
):
    """
    1. Accepts a raw audio file (.webm/.wav) OR a text transcript.
    2. Sends the content natively to gemini-2.5-flash for multimodal processing.
    3. Handles Legal, Procedural, Application Status, and general questions.
    """
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized. Check API Key.")
    
    sanitized_transcript = ""
    if transcript:
        if len(transcript) > 5000:
            raise HTTPException(status_code=400, detail="transcript length exceeds 5000 characters.")
        sanitized_transcript = html.escape(transcript.strip())

    sanitized_profile_context = ""
    if profile_context:
        if len(profile_context) > 10000:
            raise HTTPException(status_code=400, detail="profile_context length exceeds 10000 characters.")
        sanitized_profile_context = html.escape(profile_context.strip())

    sanitized_document_context = ""
    if document_context:
        if len(document_context) > 100000:
            raise HTTPException(status_code=400, detail="document_context length exceeds 100000 characters.")
        sanitized_document_context = html.escape(document_context.strip())

    system_instruction = (
        "You are Omni-Gov Voice Assistant, an expert, warm, and highly capable legal/administrative advocate for the citizen. "
        "1. Legal FAQ & Rights: Answer legal questions, reference relevant acts (like Consumer Protection, RTI), and explain what they mean practically. "
        "2. Escalation & Application Status: If asked about delayed applications, suggest normal wait periods, where to raise grievances, and next steps. "
        "3. Scenarios: If an application is rejected or lost, provide constructive scenario-based guidance. "
        "4. Document Analysis: If 'document_context' is provided, answer questions related to the document practically. "
        "Keep your response concise, conversational, and under 3 or 4 sentences if possible since it will be spoken aloud to them. Never say 'I am an AI'."
    )
    if sanitized_profile_context:
        system_instruction += f"\n\nContext - User Profile: {sanitized_profile_context}"
    if sanitized_document_context:
        system_instruction += f"\n\nContext - Extracted info from user's recently uploaded document: {sanitized_document_context}"
    
    try:
        contents = []
        if audio and audio.filename:
            # Validate uploaded audio file
            validate_uploaded_file(
                audio,
                allowed_mimes=[
                    "audio/webm", "video/webm", "audio/wav", "audio/x-wav", 
                    "audio/mpeg", "audio/ogg", "application/octet-stream"
                ],
                max_size_bytes=5 * 1024 * 1024  # 5MB limit for voice files
            )
            file_bytes = await audio.read()
            contents.append(types.Part.from_bytes(data=file_bytes, mime_type=audio.content_type or 'audio/webm'))
        elif sanitized_transcript:
            contents.append(sanitized_transcript)
        else:
            raise HTTPException(status_code=400, detail="No valid audio file or text transcript provided.")

        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.5
            ),
        )
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Voice processing failed: {str(e)}")


@router.post("/ai/analyze-notice")
async def analyze_notice(file: UploadFile = File(...)):
    """
    Resilient notice analyzer with security validation.
    """
    if not scanner_client:
        raise HTTPException(status_code=500, detail="Scanner client not initialized.")
    
    validate_uploaded_file(
        file,
        allowed_mimes=["image/jpeg", "image/png", "image/webp", "application/pdf"],
        max_size_bytes=10 * 1024 * 1024  # 10MB limit
    )
    
    try:
        file_bytes = await file.read()
        
        # Defensive MIME type resolution
        mime_type = file.content_type
        if not mime_type or mime_type == "application/octet-stream":
            import mimetypes
            guessed_type, _ = mimetypes.guess_type(file.filename or "")
            mime_type = guessed_type or "image/jpeg"
            
        supported_types = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"]
        if mime_type not in supported_types:
            if file.filename and file.filename.lower().endswith(".pdf"):
                mime_type = "application/pdf"
            else:
                mime_type = "image/jpeg"
                
        doc_part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
        
        prompt = """
        You are an expert Indian Legal Aid AI. Analyze this uploaded legal or official notice.
        Extract the values matching the requested schema.
        """
        
        response = await scanner_client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, doc_part],
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=1500,  # Optimize speed by limiting output token length
                response_mime_type="application/json",
                response_schema=NoticeAnalysisSchema
            ),
        )
        try:
            parsed_analysis = json.loads(response.text)
        except Exception:
            parsed_analysis = response.text
        return {"analysis": parsed_analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/chat-notice")
async def chat_notice(
    question: str = Form(...),
    notice_context: str = Form(...)
):
    """
    Allows the user to chat with the AI about the uploaded notice.
    """
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized.")
    
    if not question or len(question) > 5000:
        raise HTTPException(status_code=400, detail="question length must be between 1 and 5000 characters.")
    sanitized_question = html.escape(question.strip())

    if not notice_context or len(notice_context) > 100000:
        raise HTTPException(status_code=400, detail="notice_context length must be between 1 and 100000 characters.")
    sanitized_notice_context = html.escape(notice_context.strip())

    prompt = f"""
    You are an expert Legal Advisor AI. The user has uploaded an official/legal notice.
    Here is the AI-extracted context of that notice:
    {sanitized_notice_context}

    The user asks you this follow-up question about the notice:
    {sanitized_question}

    Provide a clear, accurate, and practical answer. Explain legal terms simply. Outline any next steps if necessary. Keep your response in Markdown format.
    """
    
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.3
            ),
        )
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Chat failed: {str(e)}")

