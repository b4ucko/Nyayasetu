import json
import os
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from google import genai

DB_DIR = os.path.join(os.path.dirname(__file__), "../chroma_db")
DATA_FILE = os.path.join(os.path.dirname(__file__), "../datasets/dataset.json")

class GeminiEmbeddings(Embeddings):
    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_api_key_here":
            # Try loading from backend/.env as fallback for local dev
            try:
                from dotenv import load_dotenv
                env_path = os.path.join(os.path.dirname(__file__), "../backend/.env")
                if os.path.exists(env_path):
                    load_dotenv(env_path)
                    api_key = os.environ.get("GEMINI_API_KEY")
            except ImportError:
                pass
        
        if not api_key or api_key == "your_gemini_api_key_here":
            print("Warning: GEMINI_API_KEY is missing or using placeholder in GeminiEmbeddings!")
            
        self.client = genai.Client(api_key=api_key if api_key != "your_gemini_api_key_here" else None)
        self.model = "gemini-embedding-001"

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        try:
            response = self.client.models.embed_content(
                model=self.model,
                contents=texts,
            )
            return [e.values for e in response.embeddings]
        except Exception as e:
            print(f"Error embedding documents: {e}")
            raise e

    def embed_query(self, text: str) -> list[float]:
        if not text:
            return []
        try:
            response = self.client.models.embed_content(
                model=self.model,
                contents=text,
            )
            return response.embeddings[0].values
        except Exception as e:
            print(f"Error embedding query: {e}")
            raise e

def load_and_embed_data():
    if not os.path.exists(DATA_FILE):
        print(f"Data file {DATA_FILE} not found.")
        return

    with open(DATA_FILE, "r") as f:
        schemes = json.load(f)

    docs = []
    for scheme in schemes:
        text = f"Scheme Name: {scheme['scheme_name']}\n"
        text += f"Category: {scheme['category']}\n"
        text += f"Eligibility: {scheme['eligibility']}\n"
        text += f"Benefits: {scheme['benefits']}\n"
        text += f"Required Documents: {', '.join(scheme['required_documents'])}\n"
        text += f"Ministry: {scheme['ministry']}"
        
        metadata = {"id": scheme["id"], "name": scheme["scheme_name"], "category": scheme["category"]}
        docs.append(Document(page_content=text, metadata=metadata))

    print(f"Loaded {len(docs)} schemes. Generating Gemini embeddings...")
    embeddings = GeminiEmbeddings()
    vectorstore = Chroma.from_documents(docs, embeddings, persist_directory=DB_DIR)
    print(f"Vector Database saved to {DB_DIR}")

def get_retriever():
    embeddings = GeminiEmbeddings()
    vectorstore = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
    return vectorstore.as_retriever(search_kwargs={"k": 5})

if __name__ == "__main__":
    load_and_embed_data()

