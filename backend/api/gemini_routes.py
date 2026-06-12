import os
import time
from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from google import genai
from google.genai import types
import json

# Initialize the router
router = APIRouter()

# Global AI Rate Limiter (Protects the Gemini Free Tier Free API Key)
class AIRateLimiter:
    def __init__(self, max_rpm=12):
        self.max_rpm = max_rpm
        self.timestamps = []

    def check_limit(self):
        current_time = time.time()
        # Filter timestamps older than 60 seconds
        self.timestamps = [ts for ts in self.timestamps if current_time - ts < 60.0]
        
        if len(self.timestamps) >= self.max_rpm:
            raise HTTPException(
                status_code=429, 
                detail="Safety Limit Reached: To protect your Gemini API Key from being blocked, please wait 30 seconds before submitting another AI request."
            )
        self.timestamps.append(current_time)

# Initialize limiter to a much higher threshold (assuming upgraded tier or using flash-8b)
api_limiter = AIRateLimiter(max_rpm=100)

# --- GEMINI CLIENT CONFIGURATION ---
# Load up to 10 sequential API keys from environment variables (GEMINI_API_KEY_1 to GEMINI_API_KEY_10)
FREE_KEYS = []
for i in range(1, 11):
    key = os.getenv(f"GEMINI_API_KEY_{i}")
    if key and key.strip() and key != f"your_gemini_api_key_{i}_here":
        FREE_KEYS.append(key.strip())

# Fallback to the default single GEMINI_API_KEY if no sequential keys were set
default_key = os.getenv("GEMINI_API_KEY")
if default_key and default_key.strip() and default_key != "your_gemini_api_key_here":
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
        return len(self.clients) > 0 or os.getenv("GEMINI_API_KEY") is not None

# Initialize Master Rotating Client
client = RoundRobinClient(FREE_KEYS)

# For backwards compatibility and design separation, we alias all clients to the same master client
guides_client = client
scanner_client = client

# -----------------------------------------------------
# Models
# -----------------------------------------------------
class UserProfile(BaseModel):
    name: str
    age: int
    occupation: str
    income: float
    state: str
    land_acres: float = 0.0
    gender: str = ""
    marital_status: str = ""
    caste: str = ""
    disability: str = "No"
    education: str = ""
    filterCategory: str = ""
    filterState: str = ""

class VoiceRequest(BaseModel):
    transcript: str

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


# -----------------------------------------------------
# Routes
# -----------------------------------------------------

@router.post("/ai/match")
async def match_schemes(profile: UserProfile):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized. Check API Key.")
    
    api_limiter.check_limit()
    
    filter_instruction = ""
    if hasattr(profile, 'filterCategory') and profile.filterCategory:
        filter_instruction += f"\nCRITICAL: The user is explicitly filtering for the '{profile.filterCategory}' sector. You MUST return EVERY SINGLE eligible scheme in this specific category."
    if hasattr(profile, 'filterState') and profile.filterState:
        filter_instruction += f"\nCRITICAL: The user is explicitly filtering for '{profile.filterState}'. You MUST include EVERY SINGLE state-level scheme for {profile.filterState} alongside applicable Central schemes."

    prompt = f"""
    You are the absolute definitive, exhaustive database of EVERY SINGLE central and state government scheme in India (acting as an omniscient MyScheme portal).
    You have deep, native access to thousands of schemes natively across every single state and every single department in the country.
    Carefully cross-reference the Citizen's profile below against EVERY known scheme in the country.
    
    You MUST return an EXHAUSTIVE, UNBOUNDED array of EVERY SINGLE government scheme they actively qualify for based on their exact state, caste, age, income, and gender. 
    DO NOT STOP AT 5 OR 10. If they are eligible for 30 schemes, return all 30. If they are eligible for 50, return all 50. Output the absolute maximum number of valid schemes possible.
    {filter_instruction}
    
    You MUST extract the following details perfectly for each scheme:
    - name: Official legal Name of the scheme
    - description: Exact summary of what financial or resources it provides
    - eligibilityScore: 70 to 100 based on their profile match
    - category: The sector (e.g., 'Agriculture', 'Health', 'Education', 'Housing', 'Finance')
    - stateApplicability: 'All India', or the exact specific state name if it's a state-only scheme (e.g., 'Maharashtra')
    - id: A URL slug (e.g., 'pm-kisan')
    - officialWebsite: The exact authentic government URL (e.g., 'https://pmkisan.gov.in')
    Profile details:
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
    """

    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RecommendationsList,
                temperature=0.2
            ),
        )
        # Parse the JSON string returned by Gemini into a Python dictionary
        data = json.loads(response.text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Recommendation failed: {str(e)}")


@router.get("/ai/scheme/{scheme_name}")
async def get_scheme_details(scheme_name: str):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized. Check API Key.")
    
    api_limiter.check_limit()
    
    prompt = f"""
    You are an expert government scheme advisor.
    Provide a comprehensive guide for the government scheme named "{scheme_name}" formatted in Markdown.

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
    
    api_limiter.check_limit()
    
    prompt = f"""
    You are an expert Indian Government Document Advisor. 
    Provide an EXTREMELY BRIEF, short, and sweet practical guide to applying for and editing the document: "{document_name}". 
    
    CRITICAL: Keep it incredibly concise to generate text fast. Use maximum 3 bullet points per section. 
    You MUST provide the exact official government website URL for applying.

    Include exactly these sections formatted in clean Markdown:
    # 📄 Guide to {document_name}
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
    
    api_limiter.check_limit()
    
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
    
    api_limiter.check_limit()
    
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
    
    api_limiter.check_limit()

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
        
    api_limiter.check_limit()

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
    
    contents = [f"User Request: {prompt_text}"]
    if document_context:
        contents.append(f"Context from uploaded document: {document_context}")
    if profile_context:
        contents.append(f"User Profile details: {profile_context}")

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
    
    system_instruction = (
        "You are Omni-Gov Voice Assistant, an expert, warm, and highly capable legal/administrative advocate for the citizen. "
        "1. Legal FAQ & Rights: Answer legal questions, reference relevant acts (like Consumer Protection, RTI), and explain what they mean practically. "
        "2. Escalation & Application Status: If asked about delayed applications, suggest normal wait periods, where to raise grievances, and next steps. "
        "3. Scenarios: If an application is rejected or lost, provide constructive scenario-based guidance. "
        "4. Document Analysis: If 'document_context' is provided, answer questions related to the document practically. "
        "Keep your response concise, conversational, and under 3 or 4 sentences if possible since it will be spoken aloud to them. Never say 'I am an AI'."
    )
    if profile_context:
        system_instruction += f"\n\nContext - User Profile: {profile_context}"
    if document_context:
        system_instruction += f"\n\nContext - Extracted info from user's recently uploaded document: {document_context}"
    
    try:
        contents = []
        if audio and audio.filename:
            file_bytes = await audio.read()
            contents.append(types.Part.from_bytes(data=file_bytes, mime_type=audio.content_type or 'audio/webm'))
        elif transcript:
            contents.append(transcript)
        else:
            raise HTTPException(status_code=400, detail="No audio or text provided.")

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
    Analyzes an uploaded legal/official notice to classify and summarize it.
    """
    if not scanner_client:
        raise HTTPException(status_code=500, detail="Scanner client not initialized.")
    
    api_limiter.check_limit()
    
    try:
        file_bytes = await file.read()
        doc_part = types.Part.from_bytes(data=file_bytes, mime_type=file.content_type)
        
        prompt = """
        You are an expert Indian Legal Aid AI. Analyze this uploaded legal or official notice.
        Return a exact JSON object where ALL VALUES MUST BE STRINGS. Do NOT use arrays or nested objects.
        {
          "notice_type": "What kind of notice is this? (e.g., Tax Notice, Traffic Challan, Bank Default)",
          "sender": "Who sent it exactly? (Authority/Person name)",
          "recipient": "Who is it addressed to?",
          "key_dates": "Any deadlines, hearing dates, or issue dates found (comma separated if multiple)",
          "summary": "A brief, plain-English summary of what the notice actually means.",
          "required_action": "What must the user do next?",
          "severity": "Low, Medium, or High"
        }
        """
        response = await scanner_client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, doc_part],
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json"
            ),
        )
        return {"analysis": response.text}
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
    api_limiter.check_limit()
    
    prompt = f"""
    You are an expert Legal Advisor AI. The user has uploaded an official/legal notice.
    Here is the AI-extracted context of that notice:
    {notice_context}

    The user asks you this follow-up question about the notice:
    {question}

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
