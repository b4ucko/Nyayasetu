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

# DigiLocker endpoints removed in favor of Secure local-first Document Vault.
