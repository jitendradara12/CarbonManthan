import sys
from pathlib import Path

# Add the backend directory to PYTHONPATH so 'server' is importable
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
