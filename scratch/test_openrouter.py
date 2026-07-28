import os
import requests
import json
from dotenv import load_dotenv

# Path to backend/.env (desktop project or workspace project)
# Let's load the active workspace .env first, then fallback to desktop .env
load_dotenv(r"c:\Users\Saikat\Desktop\repositories\omnigov final\omnigov final\omnigov final\omnigov (5)\omnigov\backend\.env")
load_dotenv(r"c:\Users\Saikat\Desktop\omnigov final\omnigov final\backend\.env")

api_key = os.getenv("OPENROUTER_API_KEY")
print("OpenRouter API Key found:", bool(api_key))
if api_key:
    print("API Key Prefix:", api_key[:10])

def call_openrouter(prompt, model="google/gemini-2.5-flash:online", response_format=None):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1500
    }
    
    if response_format:
        payload["response_format"] = response_format
        
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        raise Exception(f"OpenRouter Error {response.status_code}: {response.text}")

try:
    print("Testing OpenRouter Search Grounding...")
    # Maharashtra farmer scheme query
    search_prompt = "Find 3 active government schemes in Maharashtra for farmers. Briefly list them."
    res = call_openrouter(search_prompt)
    print("\nSearch Result:")
    print(res)
    
    print("\nTesting OpenRouter JSON output...")
    # Formatting
    json_prompt = f"Parse the following text into a JSON format with scheme names: \n{res}"
    res_json = call_openrouter(json_prompt, model="google/gemini-2.5-flash", response_format={"type": "json_object"})
    print("\nJSON Result:")
    print(res_json)
    
except Exception as e:
    print("Failed:", e)
