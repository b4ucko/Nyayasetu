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
        
    def process_profile(self, user_profile: dict) -> list:
        import os
        import json
        from openai import OpenAI
        from dotenv import load_dotenv
        
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
        key = os.getenv("OPENROUTER_API_KEY")
        if not key:
            # Fallback mock data if API key is not configured/valid
            return [
                {
                    "scheme_name": "PM Kisan Samman Nidhi",
                    "reason": "You are a farmer holding 2.0 acres of land, meeting the criteria.",
                    "details": "Direct income support of Rs. 6,000 per year in three equal installments."
                },
                {
                    "scheme_name": "Ayushman Bharat",
                    "reason": "Your annual income is below Rs. 5 Lakhs, making you eligible for healthcare cover.",
                    "details": "Health cover of Rs. 5 Lakhs per family per year for secondary and tertiary care hospitalization."
                }
            ]
            
        or_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=key
        )
        
        schemes_input = ""
        retrieval_success = False
        
        try:
            if not self.retriever:
                raise ValueError("RAG retriever is not initialized")
            
            # 1. Retrieval Agent queries ChromaDB
            query = f"Search schemes for {user_profile.get('occupation')}, income {user_profile.get('income')}, age {user_profile.get('age')} in {user_profile.get('state')}"
            retrieved_docs = self.retriever.invoke(query)
            
            if retrieved_docs:
                for i, doc in enumerate(retrieved_docs):
                    schemes_input += f"\n--- Scheme {i+1} ---\n{doc.page_content}\n"
                retrieval_success = True
        except Exception as e:
            print(f"Warning: Multi-Agent retriever failed ({e}). Falling back to local SQLite database.")
            
        if not retrieval_success:
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
                    
                for i, s in enumerate(local_schemes[:5]):
                    details = (
                        f"Scheme Name: {s['scheme_name']}\n"
                        f"Category: {s['category']}\n"
                        f"Eligibility: {s['eligibility']}\n"
                        f"Benefits: {s['benefits']}\n"
                        f"Required Documents: {', '.join(s['required_documents'])}\n"
                        f"Ministry: {s['ministry']}"
                    )
                    schemes_input += f"\n--- Scheme {i+1} ---\n{details}\n"
            except Exception as ex:
                print(f"Error: Fallback local SQLite database lookup failed: {ex}")
                
        if not schemes_input:
            # If no schemes could be retrieved or loaded, fallback
            return [
                {
                    "scheme_name": "PM Kisan Samman Nidhi",
                    "reason": "You are a farmer holding 2.0 acres of land, meeting the criteria.",
                    "details": "Direct income support of Rs. 6,000 per year in three equal installments."
                },
                {
                    "scheme_name": "Ayushman Bharat",
                    "reason": "Your annual income is below Rs. 5 Lakhs, making you eligible for healthcare cover.",
                    "details": "Health cover of Rs. 5 Lakhs per family per year for secondary and tertiary care hospitalization."
                }
            ]
            
        try:
            # Evaluate using openrouter/owl-alpha
            prompt = f"""
            You are a multi-agent AI system containing:
            1. Eligibility Reasoning Agent: Analyzes the citizen's profile against government schemes to determine eligibility reasons.
            2. Recommendation Agent: Formulates structured details and recommendations.
            
            Citizen Profile:
            - Age: {user_profile.get('age')}
            - State: {user_profile.get('state')}
            - Occupation: {user_profile.get('occupation')}
            - Income: ₹{user_profile.get('income')}
            - Land Holding: {user_profile.get('land_acres', 0)} acres
            - Gender: {user_profile.get('gender', '')}
            - Caste: {user_profile.get('caste', '')}
            - Disability: {user_profile.get('disability', 'No')}
            - Education: {user_profile.get('education', '')}
            
            Evaluate eligibility and extract details for these schemes:
            {schemes_input}
            
            Return a JSON object with a single key "schemes" which maps to a list of objects. Each object MUST contain:
            - "scheme_name": Exact name of the scheme
            - "reason": A specific, detailed explanation of why the user is eligible (Eligibility Reasoning Agent)
            - "details": A plain text string (NOT a nested JSON object or list) summarizing the key benefits, document requirements, and application guidance (Recommendation Agent)
            """
            
            response = or_client.chat.completions.create(
                model="openrouter/owl-alpha",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=2000,
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            parsed = json.loads(content)
            
            raw_schemes = []
            if isinstance(parsed, dict) and "schemes" in parsed:
                raw_schemes = parsed["schemes"]
            elif isinstance(parsed, list):
                raw_schemes = parsed
            elif isinstance(parsed, dict):
                for k, v in parsed.items():
                    if isinstance(v, list):
                        raw_schemes = v
                        break
                else:
                    raw_schemes = [parsed]
            
            # Defensively format each scheme to ensure string values for details
            sanitized_schemes = []
            for s in raw_schemes:
                s_name = s.get("scheme_name") or s.get("name") or "Government Scheme"
                reason = s.get("reason") or "Eligible based on profile parameters."
                details = s.get("details") or "Details not specified."
                
                if not isinstance(details, str):
                    if isinstance(details, dict):
                        details = "\n".join(f"- {k.replace('_', ' ').capitalize()}: {v}" for k, v in details.items())
                    elif isinstance(details, list):
                        details = "\n".join(f"- {x}" for x in details)
                    else:
                        details = str(details)
                        
                sanitized_schemes.append({
                    "scheme_name": s_name,
                    "reason": reason,
                    "details": details
                })
                
            return sanitized_schemes
        except Exception as e:
            print(f"Error calling OpenRouter in multi_agent: {e}")
            # Fallback mock data if API call fails
            return [
                {
                    "scheme_name": "PM Kisan Samman Nidhi",
                    "reason": "You are a farmer holding 2.0 acres of land, meeting the criteria.",
                    "details": "Direct income support of Rs. 6,000 per year in three equal installments."
                },
                {
                    "scheme_name": "Ayushman Bharat",
                    "reason": "Your annual income is below Rs. 5 Lakhs, making you eligible for healthcare cover.",
                    "details": "Health cover of Rs. 5 Lakhs per family per year for secondary and tertiary care hospitalization."
                }
            ]
        
    def get_application_steps(self, scheme_name: str) -> list:
        # 4. Application Assistant Agent
        return [
            f"1. Gather the required documents for {scheme_name} (checking Aadhaar and Bank Passbook).",
            "2. Visit the nearest Common Service Center (CSC) or official portal.",
            "3. Fill out the application form.",
            "4. Track application status using your Application ID."
        ]

agent_system = MultiAgentSystem()
