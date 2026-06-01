from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import sys
import os

# Import agents
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from agents.multi_agent import agent_system

router = APIRouter()

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

@router.post("/recommendations")
def get_recommendations(profile: UserProfile):
    """Retrieves schemes based on citizen profile using Multi-Agent RAG."""
    schemes = agent_system.process_profile(profile.dict())
    return {"status": "success", "eligible_schemes": schemes}

@router.get("/scheme/{scheme_name}/steps")
def get_application_steps(scheme_name: str):
    """Application Assistant Agent returns steps."""
    steps = agent_system.get_application_steps(scheme_name)
    return {"status": "success", "scheme": scheme_name, "steps": steps}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Mock document upload and OCR processing."""
    # In a real app, process file.file with Tesseract OCR or multimodal LLM
    return {"status": "success", "filename": file.filename, "message": "Document uploaded and verified successfully by the Check Agent."}

import requests
from dotenv import load_dotenv

load_dotenv()

@router.post("/digilocker/init")
def init_digilocker(request: dict):
    redirect_url = request.get("redirectUrl", "http://localhost:5173/callback")
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
    client_id = os.getenv("SETU_CLIENT_ID")
    client_secret = os.getenv("SETU_CLIENT_SECRET")
    product_instance_id = os.getenv("SETU_PRODUCT_INSTANCE_ID")

    headers = {
        "x-client-id": client_id,
        "x-client-secret": client_secret,
        "x-product-instance-id": product_instance_id
    }
    resp = requests.get(f"https://dg-sandbox.setu.co/api/digilocker/{request_id}/aadhaar", headers=headers)
    if resp.status_code in (200, 201):
        return resp.json()
    raise HTTPException(status_code=resp.status_code, detail=f"Setu API Error: {resp.text}")

@router.get("/digilocker/document/{request_id}/{doc_type}")
def fetch_specific_document(request_id: str, doc_type: str):
    client_id = os.getenv("SETU_CLIENT_ID")
    client_secret = os.getenv("SETU_CLIENT_SECRET")
    product_instance_id = os.getenv("SETU_PRODUCT_INSTANCE_ID")
    
    headers = {
        "x-client-id": client_id,
        "x-client-secret": client_secret,
        "x-product-instance-id": product_instance_id
    }
    
    # Forward the request to Setu Sandbox generic document endpoint
    resp = requests.get(f"https://dg-sandbox.setu.co/api/digilocker/{request_id}/document/{doc_type}", headers=headers)
    
    if resp.status_code in (200, 201):
        return resp.json()
    raise HTTPException(status_code=resp.status_code, detail=f"Setu API Error: {resp.text}")
