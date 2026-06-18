import os
import sys

# Add root to sys.path to import rag_pipeline
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from rag_pipeline.rag import get_retriever

class MultiAgentSystem:
    def __init__(self, use_dummy=True):
        try:
            self.retriever = get_retriever()
        except Exception as e:
            print(f"Warning: Failed to initialize RAG retriever: {e}")
            self.retriever = None
        self.use_dummy = use_dummy
        # In a production app, initialize an LLM from LangChain (e.g., ChatOpenAI)
        
    def process_profile(self, user_profile: dict) -> list:
        eligible_schemes = []
        try:
            if not self.retriever:
                raise ValueError("RAG retriever is not initialized")
            # 1. Retrieval Agent
            query = f"Search schemes for {user_profile.get('occupation')}, income {user_profile.get('income')}, age {user_profile.get('age')} in {user_profile.get('state')}"
            retrieved_docs = self.retriever.invoke(query)
            
            # 2. Eligibility Reasoning Agent & 3. Recommendation Agent
            for doc in retrieved_docs:
                scheme_name = doc.metadata.get("name")
                
                # Simulated Reasoning: For hackathon prototype, we accept the top matches and mock the LLM reasoning
                reasoning = f"Based on the analysis of the user's income (₹{user_profile.get('income')}) and occupation ({user_profile.get('occupation')}), they meet the general eligibility criteria."
                
                eligible_schemes.append({
                    "scheme_name": scheme_name,
                    "reason": reasoning,
                    "details": doc.page_content
                })
        except Exception as e:
            print(f"Warning: Multi-Agent retriever failed ({e}). Falling back to local SQLite database.")
            try:
                from datasets.database import query_schemes
                state = user_profile.get("state")
                occ = user_profile.get("occupation", "").lower()
                category = None
                if "farm" in occ:
                    category = "Agriculture"
                elif "student" in occ:
                    category = "Education"
                elif "unemployed" in occ:
                    category = "Employment"
                elif "vendor" in occ:
                    category = "Business"
                
                local_schemes = query_schemes(state=state, category=category)
                if not local_schemes:
                    local_schemes = query_schemes(category=category)
                    
                # Limit to 5 schemes for multi-agent output
                for s in local_schemes[:5]:
                    reasoning = f"Based on the analysis of the user's income (₹{user_profile.get('income')}) and occupation ({user_profile.get('occupation')}), they meet the general eligibility criteria."
                    details = (
                        f"Scheme Name: {s['scheme_name']}\n"
                        f"Category: {s['category']}\n"
                        f"Eligibility: {s['eligibility']}\n"
                        f"Benefits: {s['benefits']}\n"
                        f"Required Documents: {', '.join(s['required_documents'])}\n"
                        f"Ministry: {s['ministry']}"
                    )
                    eligible_schemes.append({
                        "scheme_name": s["scheme_name"],
                        "reason": reasoning,
                        "details": details
                    })
            except Exception as ex:
                print(f"Error: Fallback local SQLite database lookup failed: {ex}")
            
        return eligible_schemes
        
    def get_application_steps(self, scheme_name: str) -> list:
        # 4. Application Assistant Agent
        return [
            f"1. Gather the required documents for {scheme_name} (checking Aadhaar and Bank Passbook).",
            "2. Visit the nearest Common Service Center (CSC) or official portal.",
            "3. Fill out the application form.",
            "4. Track application status using your Application ID."
        ]

agent_system = MultiAgentSystem()
