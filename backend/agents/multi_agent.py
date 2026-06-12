import os
import sys

# Add root to sys.path to import rag_pipeline
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from rag_pipeline.rag import get_retriever

class MultiAgentSystem:
    def __init__(self, use_dummy=True):
        self.retriever = get_retriever()
        self.use_dummy = use_dummy
        # In a production app, initialize an LLM from LangChain (e.g., ChatOpenAI)
        
    def process_profile(self, user_profile: dict) -> list:
        # 1. Retrieval Agent
        query = f"Search schemes for {user_profile.get('occupation')}, income {user_profile.get('income')}, age {user_profile.get('age')} in {user_profile.get('state')}"
        retrieved_docs = self.retriever.invoke(query)
        
        # 2. Eligibility Reasoning Agent & 3. Recommendation Agent
        eligible_schemes = []
        for doc in retrieved_docs:
            scheme_name = doc.metadata.get("name")
            
            # Simulated Reasoning: For hackathon prototype, we accept the top matches and mock the LLM reasoning
            # In a real system, an LLM checks: Profile data vs doc.page_content (Eligibility text)
            reasoning = f"Based on the analysis of the user's income (₹{user_profile.get('income')}) and occupation ({user_profile.get('occupation')}), they meet the general eligibility criteria."
            
            eligible_schemes.append({
                "scheme_name": scheme_name,
                "reason": reasoning,
                "details": doc.page_content
            })
            
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
