# backend/app/routes/tts.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
import os
from gtts import gTTS

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    lang: str  # e.g. "en", "es"

@router.post("/")
async def text_to_speech(payload: TTSRequest):
    """Convert translated text to audio using gTTS."""
    try:
        tts_obj = gTTS(payload.text, lang=payload.lang, slow=False)
        filename = f"tts_{uuid.uuid4()}.mp3"
        tts_obj.save(filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {e}")

    # You can serve this file or encode it to base64 and return
    with open(filename, "rb") as f:
        audio_data = f.read()
    os.remove(filename)

    return {
        "audio_base64": audio_data.hex()
    }
