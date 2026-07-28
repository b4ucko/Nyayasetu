import os
import sys
import json
from google import genai
from google.genai import types
from pydantic import BaseModel

# Import load_dotenv
from dotenv import load_dotenv

# Path to backend/.env
env_path = r"c:\Users\Saikat\Desktop\repositories\omnigov final\omnigov final\omnigov final\omnigov (5)\omnigov\backend\.env"
load_dotenv(env_path)

key = os.getenv("GEMINI_API_KEY")
print("API Key found in env:", bool(key))

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

client = genai.Client(api_key=key)

async def test_run():
    # User Profile Details
    profile = {
        "name": "Ramesh Kumar",
        "age": 45,
        "occupation": "Farmer",
        "income": 200000.0,
        "state": "Maharashtra",
        "land_acres": 2.0,
        "gender": "Male",
        "marital_status": "Married",
        "caste": "OBC",
        "disability": "No",
        "education": "10th Pass",
        "filterCategory": "All",
        "filterState": "All",
        "page": 1
    }
    
    target_state = profile["state"]
    target_category = "all categories"
    
    # Step 1: Plain search grounding
    search_query = (
        f"Indian government schemes for a citizen who is {profile['age']} years old, "
        f"living in {target_state}, occupation: {profile['occupation']}, annual family income: {profile['income']} INR, "
        f"gender: {profile['gender']}, caste: {profile['caste']}, disability: {profile['disability']}, "
        f"education: {profile['education']}. Focus on {target_category} schemes. Find at least 10 eligible schemes."
    )
    
    prompt_step1 = f"""
    You are an expert Indian Government Scheme matching advisor.
    Using Google Search, find active and real government schemes (central or state-level for {target_state}) that the citizen is eligible for.
    
    Citizen Profile:
    - Age: {profile['age']}
    - State: {target_state}
    - Occupation: {profile['occupation']}
    - Income: ₹{profile['income']}
    - Gender: {profile['gender']}
    - Caste/Category: {profile['caste']}
    - Disability: {profile['disability']}
    - Education: {profile['education']}
    - Land Holding: {profile['land_acres']} acres
    
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
    
    print("Running Step 1 (Search)...")
    google_search_tool = types.Tool(google_search=types.GoogleSearch())
    
    response_search = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt_step1,
        config=types.GenerateContentConfig(
            tools=[google_search_tool],
            temperature=0.3
        )
    )
    
    search_text = response_search.text
    print("\n--- Search Results Text ---")
    print(search_text)
    
    # Step 2: Parse into structured JSON
    prompt_step2 = f"""
    You are a data extraction assistant.
    Below is a list of government schemes found via search for a citizen profile.
    Extract the schemes and format them exactly matching the requested JSON schema.
    
    Search Results:
    {search_text}
    """
    
    print("\nRunning Step 2 (Structured Parsing)...")
    response_parse = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt_step2,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RecommendationsList,
            temperature=0.1
        )
    )
    
    print("\n--- Parsed JSON Output ---")
    print(response_parse.text)

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_run())
