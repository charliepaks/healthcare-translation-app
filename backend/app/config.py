# backend/app/config.py
import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    # Potentially other config like: AZURE_SPEECH_KEY, etc.

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
