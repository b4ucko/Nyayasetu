import os
import time
import html
import hashlib
import json
import base64
from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel, Field, ConfigDict, field_validator
from google import genai
from google.genai import types
from openai import OpenAI
from dotenv import load_dotenv
# Resolve path to backend/.env
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(backend_dir, ".env"))

from .validation_utils import validate_alphanumeric_dashed, validate_uploaded_file

# Initialize the router
router = APIRouter()
MATCHES_CACHE = {}

# --- OPENROUTER CLIENT CONFIGURATION ---
# PLACE YOUR OPENROUTER API KEY IN YOUR ENVIRONMENT OR `.env` FILE AS: OPENROUTER_API_KEY
# THE BASE URL ROUTING MUST POINT TO OPENROUTER'S GATEWAY API INTERFACE
or_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")  # <- WRITE / STORE YOUR API KEY IN YOUR LOCAL ENV VARIABLES
)

class OmniGovModels:
    LEGAL_REASONING = "openrouter/owl-alpha"
    DOCUMENT_VISION = "nvidia/nemotron-nano-12b-v2-vl:free"
    VOICE_PERCEPTION = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"

# For backwards compatibility and design separation
client = or_client
guides_client = or_client
scanner_client = or_client

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
    # 1. Profile hashing and local caching
    try:
        profile_json = json.dumps(profile.model_dump(), sort_keys=True)
        profile_hash = hashlib.md5(profile_json.encode('utf-8')).hexdigest()
        if profile_hash in MATCHES_CACHE:
            return MATCHES_CACHE[profile_hash]
    except Exception as e:
        profile_hash = None
        print(f"Warning: Hashing/Caching setup failed: {e}")

    # 2. Web Search Grounding with Google Search
    target_state = profile.filterState if (profile.filterState and profile.filterState != "All") else profile.state
    target_category = profile.filterCategory if (profile.filterCategory and profile.filterCategory != "All") else "all categories"
    
    # Constructing a descriptive prompt for search grounding
    prompt_step1 = f"""
    You are an expert Indian Government Scheme matching advisor.
    Using Google Search, find active and real government schemes (central or state-level for {target_state}) that the citizen is eligible for.
    
    Citizen Profile:
    - Age: {profile.age}
    - State: {target_state}
    - Occupation: {profile.occupation}
    - Income: ₹{profile.income}
    - Gender: {profile.gender or 'Not Specified'}
    - Caste/Category: {profile.caste or 'General'}
    - Disability: {profile.disability or 'No'}
    - Education: {profile.education or 'Not Specified'}
    - Land Holding: {profile.land_acres} acres
    
    Search for schemes specifically targeting this profile.
    Retrieve at least 10 schemes if possible, representing various categories like Agriculture, Health, Education, Housing, Finance, etc.
    
    For each eligible scheme found, retrieve:
    1. Scheme Name
    2. Short description (1-2 sentences) of why they qualify and benefits
    3. Category (e.g. Agriculture, Health, Education, Housing, Finance, etc.)
    4. State Applicability (e.g. 'All' or specific state name like '{target_state}')
    5. Official website URL (make sure it's the real government website ending in .gov.in if possible)
    6. Estimated eligibility score (70-100) based on how well they fit.
    
    List them clearly in your response.
    """

    try:
        # Invoke Step 1: Plain text generation with google search tool enabled
        response_search = or_client.chat.completions.create(
            model=OmniGovModels.LEGAL_REASONING,
            messages=[{"role": "user", "content": prompt_step1}],
            tools=[{"type": "openrouter:web_search"}],
            max_tokens=1500,
            temperature=0.3
        )
        search_text = response_search.choices[0].message.content
        
        # Step 2: Parse into structured JSON format matching RecommendationsList schema
        prompt_step2 = f"""
        You are a data extraction assistant.
        Below is a list of government schemes found via search for a citizen profile.
        Extract the schemes and format them exactly matching the requested JSON schema.
        
        JSON schema structure:
        {{
            "schemes": [
                {{
                    "name": "Scheme Name",
                    "description": "Short description of why they qualify and benefits",
                    "eligibilityScore": 85,
                    "category": "Agriculture",
                    "stateApplicability": "All" or "State Name",
                    "id": "slugified-id",
                    "officialWebsite": "https://example.gov.in"
                }}
            ]
        }}
        
        Search Results:
        {search_text}
        """
        
        response_parse = or_client.chat.completions.create(
            model=OmniGovModels.LEGAL_REASONING,
            messages=[{"role": "user", "content": prompt_step2}],
            response_format={"type": "json_object"},
            max_tokens=1500,
            temperature=0.1
        )
        
        data = json.loads(response_parse.choices[0].message.content)
        
        # Inject has_more flag
        if isinstance(data, dict):
            data["has_more"] = False
        
        # Save to memory cache
        if profile_hash and data:
            MATCHES_CACHE[profile_hash] = data
            
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Recommendation failed: {str(e)}")


@router.get("/ai/scheme/{scheme_name}")
async def get_scheme_details(scheme_name: str):
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
        response = or_client.chat.completions.create(
            model=OmniGovModels.LEGAL_REASONING,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2000
        )
        return {"markdown": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Details retrieval failed: {str(e)}")


@router.get("/ai/document-guide/{document_name}")
async def get_document_guide(document_name: str):
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
        response = or_client.chat.completions.create(
            model=OmniGovModels.LEGAL_REASONING,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1500
        )
        return {"markdown": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/ocr")
async def analyze_document(file: UploadFile = File(...)):
    validate_uploaded_file(
        file,
        allowed_mimes=["image/jpeg", "image/png", "image/webp", "application/pdf"],
        max_size_bytes=10 * 1024 * 1024  # 10MB limit
    )
    
    try:
        file_bytes = await file.read()
        base64_data = base64.b64encode(file_bytes).decode("utf-8")
        
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
        
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{file.content_type or 'image/jpeg'};base64,{base64_data}"
                        }
                    }
                ]
            }
        ]
        
        response = or_client.chat.completions.create(
            model=OmniGovModels.DOCUMENT_VISION,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=2000
        )
        return {"extracted_text": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/detect-fraud")
async def detect_document_fraud(file: UploadFile = File(...)):
    validate_uploaded_file(
        file,
        allowed_mimes=["image/jpeg", "image/png", "image/webp", "application/pdf"],
        max_size_bytes=10 * 1024 * 1024  # 10MB limit
    )
    
    try:
        file_bytes = await file.read()
        base64_data = base64.b64encode(file_bytes).decode("utf-8")
        
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
        
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{file.content_type or 'image/jpeg'};base64,{base64_data}"
                        }
                    }
                ]
            }
        ]
        
        response = or_client.chat.completions.create(
            model=OmniGovModels.DOCUMENT_VISION,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=1500
        )
        return {"fraud_analysis": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/extract-profile")
async def extract_profile_from_id(file: UploadFile = File(...)):
    validate_uploaded_file(
        file,
        allowed_mimes=["image/jpeg", "image/png", "image/webp", "application/pdf"],
        max_size_bytes=10 * 1024 * 1024  # 10MB limit
    )

    try:
        file_bytes = await file.read()
        base64_data = base64.b64encode(file_bytes).decode("utf-8")
        
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
        
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{file.content_type or 'image/jpeg'};base64,{base64_data}"
                        }
                    }
                ]
            }
        ]
        
        response = or_client.chat.completions.create(
            model=OmniGovModels.DOCUMENT_VISION,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.0,
            max_tokens=1500
        )
        data = json.loads(response.choices[0].message.content)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile extraction failed: {str(e)}")


@router.post("/ai/generate-document")
async def generate_document(
    prompt_text: str = Form(...),
    document_context: str = Form(None),
    profile_context: str = Form(None)
):
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
        response = or_client.chat.completions.create(
            model=OmniGovModels.LEGAL_REASONING,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": "\n".join(contents)}
            ],
            temperature=0.3,
            max_tokens=2500
        )
        return {"markdown": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Document Generation failed: {str(e)}")


@router.post("/ai/voice")
async def voice_assistant(
    audio: UploadFile = File(None),
    transcript: str = Form(None),
    profile_context: str = Form(None),
    document_context: str = Form(None)
):
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
        user_content = []
        if audio and audio.filename:
            validate_uploaded_file(
                audio,
                allowed_mimes=[
                    "audio/webm", "video/webm", "audio/wav", "audio/x-wav", 
                    "audio/mpeg", "audio/ogg", "application/octet-stream"
                ],
                max_size_bytes=5 * 1024 * 1024  # 5MB limit for voice files
            )
            file_bytes = await audio.read()
            base64_audio = base64.b64encode(file_bytes).decode("utf-8")
            
            fmt = "wav"
            if audio.content_type and "mp3" in audio.content_type:
                fmt = "mp3"
            elif audio.content_type and "webm" in audio.content_type:
                fmt = "webm"
                
            user_content.append({
                "type": "input_audio",
                "input_audio": {
                    "data": base64_audio,
                    "format": fmt
                }
            })
        elif sanitized_transcript:
            user_content.append({"type": "text", "text": sanitized_transcript})
        else:
            raise HTTPException(status_code=400, detail="No valid audio file or text transcript provided.")

        response = or_client.chat.completions.create(
            model=OmniGovModels.VOICE_PERCEPTION,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_content}
            ],
            temperature=0.5,
            max_tokens=1000
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=504, detail=f"AI Voice processing failed: {str(e)}")


@router.post("/ai/analyze-notice")
async def analyze_notice(file: UploadFile = File(...)):
    validate_uploaded_file(
        file,
        allowed_mimes=["image/jpeg", "image/png", "image/webp", "application/pdf"],
        max_size_bytes=10 * 1024 * 1024  # 10MB limit
    )
    
    try:
        file_bytes = await file.read()
        base64_data = base64.b64encode(file_bytes).decode("utf-8")
        
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
                
        prompt = """
        You are an expert Indian Legal Aid AI. Analyze this uploaded legal or official notice.
        Extract the values matching the requested schema.
        
        JSON schema structure:
        {
            "notice_type": "type of notice",
            "sender": "sender",
            "recipient": "recipient",
            "key_dates": "important dates",
            "summary": "concise summary",
            "required_action": "action required",
            "severity": "High/Medium/Low"
        }
        """
        
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{base64_data}"
                        }
                    }
                ]
            }
        ]
        
        response = or_client.chat.completions.create(
            model=OmniGovModels.DOCUMENT_VISION,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=2000
        )
        try:
            parsed_analysis = json.loads(response.choices[0].message.content)
        except Exception:
            parsed_analysis = response.choices[0].message.content
        return {"analysis": parsed_analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/chat-notice")
async def chat_notice(
    question: str = Form(...),
    notice_context: str = Form(...)
):
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
        response = or_client.chat.completions.create(
            model=OmniGovModels.LEGAL_REASONING,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2000
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Chat failed: {str(e)}")

