import os
import sys
import json

# Add backend directory to path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.append(backend_path)

from agents.multi_agent import agent_system

profile = {
    "name": "Ramesh Kumar",
    "age": 45,
    "occupation": "Farmer",
    "income": 45000.0,
    "state": "Maharashtra",
    "land_acres": 2.5,
    "gender": "Male",
    "caste": "OBC",
    "disability": "No",
    "education": "10th Pass"
}

print("Running process_profile for Ramesh Kumar...")
schemes = agent_system.process_profile(profile)

out_file = os.path.join(os.path.dirname(__file__), "output.json")
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(schemes, f, indent=2, ensure_ascii=False)

print("Successfully wrote schemes to:", out_file)
print(f"Retrieved {len(schemes)} schemes.")
for i, s in enumerate(schemes):
    name = s.get("scheme_name", "Unknown")
    # Clean non-ascii for safe console printing
    name_clean = name.encode('ascii', 'ignore').decode('ascii')
    print(f"{i+1}. {name_clean}")
