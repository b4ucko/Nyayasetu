import json
import os
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

DB_DIR = os.path.join(os.path.dirname(__file__), "../chroma_db")
DATA_FILE = os.path.join(os.path.dirname(__file__), "../datasets/dataset.json")

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

    print(f"Loaded {len(docs)} schemes. Generating embeddings...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = Chroma.from_documents(docs, embeddings, persist_directory=DB_DIR)
    print(f"Vector Database saved to {DB_DIR}")

def get_retriever():
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
    return vectorstore.as_retriever(search_kwargs={"k": 5})

if __name__ == "__main__":
    load_and_embed_data()
