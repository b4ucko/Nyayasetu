import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "schemes.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "dataset.json")

def init_db():
    """Initializes the SQLite database and seeds it from dataset.json if empty."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schemes (
            id INTEGER PRIMARY KEY,
            scheme_name TEXT NOT NULL,
            category TEXT NOT NULL,
            eligibility TEXT NOT NULL,
            benefits TEXT NOT NULL,
            required_documents TEXT NOT NULL,
            ministry TEXT NOT NULL,
            stateApplicability TEXT NOT NULL,
            officialWebsite TEXT NOT NULL
        )
    """)
    conn.commit()
    
    # Check if empty
    cursor.execute("SELECT COUNT(*) FROM schemes")
    count = cursor.fetchone()[0]
    
    if count == 0 and os.path.exists(JSON_PATH):
        print(f"Seeding SQLite database {DB_PATH} from {JSON_PATH}...")
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            schemes = json.load(f)
            
        for s in schemes:
            required_docs_str = json.dumps(s.get("required_documents", []))
            cursor.execute("""
                INSERT INTO schemes (id, scheme_name, category, eligibility, benefits, required_documents, ministry, stateApplicability, officialWebsite)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s.get("id"),
                s.get("scheme_name"),
                s.get("category"),
                s.get("eligibility"),
                s.get("benefits"),
                required_docs_str,
                s.get("ministry"),
                s.get("stateApplicability", "All India"),
                s.get("officialWebsite", "")
            ))
        conn.commit()
        print(f"Successfully seeded {len(schemes)} schemes.")
        
    conn.close()

def get_connection():
    """Returns a connection to the SQLite database. Ensures DB is initialized."""
    if not os.path.exists(DB_PATH):
        init_db()
    return sqlite3.connect(DB_PATH)

def query_schemes(state: str = None, category: str = None) -> list:
    """Queries schemes from the local database filtering by state and category."""
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = "SELECT * FROM schemes WHERE 1=1"
    params = []
    
    if category:
        query += " AND LOWER(category) = ?"
        params.append(category.lower())
        
    if state:
        # Match "All India" or the user's specific state
        query += " AND (LOWER(stateApplicability) = 'all india' OR LOWER(stateApplicability) = ?)"
        params.append(state.lower())
        
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "scheme_name": r["scheme_name"],
            "category": r["category"],
            "eligibility": r["eligibility"],
            "benefits": r["benefits"],
            "required_documents": json.loads(r["required_documents"]),
            "ministry": r["ministry"],
            "stateApplicability": r["stateApplicability"],
            "officialWebsite": r["officialWebsite"]
        })
        
    conn.close()
    return results

if __name__ == "__main__":
    init_db()
    print("Database connection test. Found schemes count:", len(query_schemes()))
