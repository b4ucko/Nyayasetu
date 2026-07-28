import os
from openai import OpenAI
from dotenv import load_dotenv

# Load .env
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))
print("Loading env from:", env_path)
load_dotenv(env_path)

key = os.getenv("OPENROUTER_API_KEY")
print("Key exists:", bool(key))
print("Key prefix:", key[:10] if key else "None")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=key
)

try:
    print("Sending requests to OpenRouter...")
    response = client.chat.completions.create(
        model="openrouter/owl-alpha",
        messages=[{"role": "user", "content": "hello"}],
        max_tokens=50
    )
    print("Response:")
    print(response.choices[0].message.content)
except Exception as e:
    print("Error:", e)
