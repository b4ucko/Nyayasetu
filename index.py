import sys
import os

# Add the root directory to sys.path so backend imports can resolve agents, rag_pipeline, etc.
root_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root_dir)
sys.path.append(os.path.join(root_dir, "backend"))

from backend.main import app
