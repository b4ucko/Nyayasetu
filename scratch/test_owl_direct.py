import os
import json
from openai import OpenAI
from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))
load_dotenv(env_path)

key = os.getenv("OPENROUTER_API_KEY")
print("Key exists:", bool(key))

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=key
)

try:
    print("Querying openrouter/owl-alpha...")
    response = client.chat.completions.create(
        model="openrouter/owl-alpha",
        messages=[{"role": "user", "content": "Say hello!"}],
        max_tokens=50
    )
    print("Response text:")
    print(response.choices[0].message.content)
except Exception as e:
    print("Error:", e)
