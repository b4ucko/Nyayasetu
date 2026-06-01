# Nyayasetu Agentic Network 🇮🇳

Nyayasetu is an advanced, AI-powered Digital Citizen Advocate designed to bridge the gap between Indian citizens and complex government schemes, directives, and legal frameworks. By employing multi-agent AI networks and advanced RAG (Retrieval-Augmented Generation), Nyayasetu makes citizen empowerment simple, seamless, and lightning-fast.

---

## 🚀 Key Features

* **Multi-Agent AI Network**: Powered by LangChain, queries are routed dynamically through dedicated specialized agents to assess eligibility, retrieve rules, and recommend tailored schemes.
* **Semantic Search & RAG**: Cross-references profiles with official PDF documents and scheme guidelines ingested into a local high-performance ChromaDB vector store.
* **Fraud Detection AI**: Scans, validates, and visually verifies physical documents/images to extract text, cross-reference authenticity, and spot tampered seals or dates.
* **Legal Assessor AI**: Decodes complex legal notices (e.g., tax or traffic challans) in plain language, explaining your rights and automatically drafting professional legal replies.
* **Regional Voice Assistant**: Interactive voice support in regional languages (English, Hindi, Bengali, Tamil, Telugu, etc.) to guide users step-by-step.
* **Premium Citizen Dashboard**: Sleek, fully responsive modern dark-mode enabled UI built with React and Tailwind.

---

## 📂 Project Architecture

```text
nyayasetu/
├── docs/                      # Architecture, Design, Pitch, and Plans
│   └── architecture_and_design.md
├── datasets/                  # Government schemes dataset
│   └── dataset.json
├── rag_pipeline/              # Document loaders, chunking, and ChromaDB integration
│   └── rag.py
├── agents/                    # LangChain multi-agent orchestration
│   └── multi_agent.py
├── backend/                   # FastAPI backend services
│   ├── main.py
│   └── api/
│       └── routes.py
└── frontend/                  # React + Vite web application
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   └── styles/
    ├── package.json
    └── tailwind.config.js
```

---

## 🛠️ Getting Started & Setup

### 1. Environmental Configurations (Keys & Credentials)

To publish securely, hardcoded secret credentials have been removed. You must configure them in your local environment files before running the project:

#### Backend Credentials
Navigate to the `backend/` directory, copy `.env.template` to `.env`, and populate it with your keys:
```bash
cp backend/.env.template backend/.env
```
Ensure your `backend/.env` file contains:
* `GEMINI_API_KEY`: Your official Google Gemini API Key (obtainable for free from Google AI Studio). *Note: The complex round-robin multi-key structure has been removed. You only need to paste your single Gemini API key here, and it will be securely used across all agent services.*
* `SETU_CLIENT_ID` / `SETU_CLIENT_SECRET` / `SETU_PRODUCT_INSTANCE_ID`: Your official Setu sandbox gateway credentials.

#### Frontend Credentials (Supabase & Firebase)
Navigate to the `frontend/` directory, copy `.env.example` to `.env`, and populate it with your Supabase and Firebase credentials:
```bash
cp frontend/.env.example frontend/.env
```
Ensure your `frontend/.env` file contains:
* `VITE_SUPABASE_URL`: Your Supabase Project API URL.
* `VITE_SUPABASE_ANON_KEY`: Your Supabase Anonymous Public Key.
* `VITE_FIREBASE_API_KEY`: Your Firebase Web Client API Key.
* `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase Auth Domain.
* `VITE_FIREBASE_PROJECT_ID`: Your Firebase Project ID.
* `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase Storage Bucket.
* `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase Messaging Sender ID.
* `VITE_FIREBASE_APP_ID`: Your Firebase Application ID.
* `VITE_FIREBASE_MEASUREMENT_ID`: Your Firebase Measurement ID (Analytics ID).

---

### 2. Vector Database & RAG Pipeline Setup

#### On macOS / Linux:
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Ingest official datasets/documents into ChromaDB
python3 rag_pipeline/rag.py
```

#### On Windows:
```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Ingest official datasets/documents into ChromaDB
python rag_pipeline/rag.py
```

### 3. FastAPI Backend Startup
```bash
cd backend
# On macOS/Linux:
python3 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
# On Windows:
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 4. React Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to **http://127.0.0.1:5173/**.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
