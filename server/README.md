# DGI API Server

FastAPI server for vehicle compliance prediction.

## Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
.\venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

## Run

```bash
# Development
source venv/bin/activate && uvicorn app:app --host 0.0.0.0 --port 8001
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
