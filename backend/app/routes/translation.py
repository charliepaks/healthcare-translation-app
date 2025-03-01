# backend/app/routes/translation.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai
from ..config import settings

router = APIRouter()

openai.api_key = settings.OPENAI_API_KEY

class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str

@router.post("/")
async def translate_text(payload: TranslationRequest):
    """Use OpenAI GPT-3.5 to translate medical text."""
    prompt = (
        f"Please translate the following medical text from {payload.source_lang} "
        f"to {payload.target_lang}, preserving medical accuracy:\n\n{payload.text}"
    )
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a medical translation assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2
        )
        translated_text = response.choices[0].message.content.strip()
        return {"translated_text": translated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
