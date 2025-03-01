# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes import speech, translation, tts

app = FastAPI(title="Healthcare Translation API")

# Allow CORS from frontend domain (update to your real domain or localhost)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(speech.router, prefix="/api/speech", tags=["Speech"])
app.include_router(translation.router, prefix="/api/translate", tags=["Translation"])
app.include_router(tts.router, prefix="/api/tts", tags=["TTS"])


@app.get("/")
def root():
    return {"message": "Healthcare Translation API is running"}
