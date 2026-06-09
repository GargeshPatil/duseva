import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import parse_pdf, fetch_url
from backend.models.schemas import HealthCheckResponse

app = FastAPI(
    title="DU Seva Score Checker Backend",
    description="FastAPI service to parse CUET response sheets and answer keys.",
    version="1.0.0"
)

# CORS Configuration
# Allow local Next.js development server, Vercel/production domains, and Render preview URLs
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000")
origins = [
    CORS_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.duseva.in",
    "https://duseva.in",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(parse_pdf.router, tags=["PDF Parsing"])
app.include_router(fetch_url.router, tags=["URL Fetching"])

@app.get("/health", response_model=HealthCheckResponse)
def health_check():
    return HealthCheckResponse(status="ok")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
