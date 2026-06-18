from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field, ConfigDict, field_validator
import sys
import os
import html

# Import agents
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from agents.multi_agent import agent_system

from .validation_utils import validate_alphanumeric_dashed, validate_uploaded_file

router = APIRouter()

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

    @field_validator(
        "name", "occupation", "state", "gender", "marital_status",
        "caste", "disability", "education", "filterCategory", "filterState"
    )
    @classmethod
    def sanitize_strings(cls, v: str) -> str:
        # Prevent XSS by HTML-escaping all string inputs
        return html.escape(v)

class DigiLockerInitRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True
    )
    redirectUrl: str = Field(..., min_length=1, max_length=500)

    @field_validator("redirectUrl")
    @classmethod
    def sanitize_url(cls, v: str) -> str:
        escaped = html.escape(v)
        # Verify it looks like a valid HTTP URL or simple local path
        if not (escaped.startswith("http://") or escaped.startswith("https://") or escaped.startswith("/")):
            raise ValueError("redirectUrl must start with http://, https://, or /")
        return escaped

@router.post("/recommendations")
def get_recommendations(profile: UserProfile):
    """Retrieves schemes based on citizen profile using Multi-Agent RAG."""
    schemes = agent_system.process_profile(profile.model_dump())
    return {"status": "success", "eligible_schemes": schemes}

@router.get("/scheme/{scheme_name}/steps")
def get_application_steps(scheme_name: str):
    """Application Assistant Agent returns steps."""
    # Sanitize and validate route param
    sanitized_scheme_name = validate_alphanumeric_dashed(scheme_name, max_len=100)
    steps = agent_system.get_application_steps(sanitized_scheme_name)
    return {"status": "success", "scheme": sanitized_scheme_name, "steps": steps}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Mock document upload and OCR processing with strict validation."""
    # Validate file size, extension, and content type
    validate_uploaded_file(
        file,
        allowed_mimes=["image/jpeg", "image/png", "image/webp", "application/pdf"],
        max_size_bytes=10 * 1024 * 1024  # 10MB limit
    )
    return {"status": "success", "filename": html.escape(file.filename or ""), "message": "Document uploaded and verified successfully by the Check Agent."}

import requests
from dotenv import load_dotenv

load_dotenv()

@router.post("/digilocker/init")
def init_digilocker(request: DigiLockerInitRequest):
    redirect_url = request.redirectUrl
    client_id = os.getenv("SETU_CLIENT_ID")
    client_secret = os.getenv("SETU_CLIENT_SECRET")
    product_instance_id = os.getenv("SETU_PRODUCT_INSTANCE_ID")

    headers = {
        "x-client-id": client_id,
        "x-client-secret": client_secret,
        "x-product-instance-id": product_instance_id,
        "Content-Type": "application/json"
    }
    payload = {
        "redirectUrl": redirect_url
    }
    resp = requests.post("https://dg-sandbox.setu.co/api/digilocker", headers=headers, json=payload)
    if resp.status_code in (200, 201):
        return resp.json()
    raise HTTPException(status_code=resp.status_code, detail=f"Setu API Error: {resp.text}")

@router.get("/digilocker/data/{request_id}")
def fetch_digilocker_data(request_id: str):
    # Sanitize and validate path param
    sanitized_request_id = validate_alphanumeric_dashed(request_id, max_len=100)
    client_id = os.getenv("SETU_CLIENT_ID")
    client_secret = os.getenv("SETU_CLIENT_SECRET")
    product_instance_id = os.getenv("SETU_PRODUCT_INSTANCE_ID")

    headers = {
        "x-client-id": client_id,
        "x-client-secret": client_secret,
        "x-product-instance-id": product_instance_id
    }
    resp = requests.get(f"https://dg-sandbox.setu.co/api/digilocker/{sanitized_request_id}/aadhaar", headers=headers)
    if resp.status_code in (200, 201):
        return resp.json()
    raise HTTPException(status_code=resp.status_code, detail=f"Setu API Error: {resp.text}")

@router.get("/digilocker/document/{request_id}/{doc_type}")
def fetch_specific_document(request_id: str, doc_type: str):
    # Sanitize and validate path params
    sanitized_request_id = validate_alphanumeric_dashed(request_id, max_len=100)
    sanitized_doc_type = validate_alphanumeric_dashed(doc_type, max_len=50)
    
    client_id = os.getenv("SETU_CLIENT_ID")
    client_secret = os.getenv("SETU_CLIENT_SECRET")
    product_instance_id = os.getenv("SETU_PRODUCT_INSTANCE_ID")
    
    headers = {
        "x-client-id": client_id,
        "x-client-secret": client_secret,
        "x-product-instance-id": product_instance_id
    }
    
    # Forward the request to Setu Sandbox generic document endpoint
    resp = requests.get(f"https://dg-sandbox.setu.co/api/digilocker/{sanitized_request_id}/document/{sanitized_doc_type}", headers=headers)
    
    if resp.status_code in (200, 201):
        return resp.json()
    raise HTTPException(status_code=resp.status_code, detail=f"Setu API Error: {resp.text}")
