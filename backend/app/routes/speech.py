# backend/app/routes/speech.py

import subprocess
import uuid
import os
from fastapi import APIRouter, File, UploadFile, HTTPException
import speech_recognition as sr

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    input_filename = f"temp_input_{uuid.uuid4()}.webm"  # or .ogg
    output_filename = f"temp_output_{uuid.uuid4()}.wav"

    # Save raw file
    with open(input_filename, "wb") as temp_file:
        temp_file.write(file.file.read())

    # Convert using ffmpeg
    convert_cmd = [
        "ffmpeg",
        "-i", input_filename,
        "-ac", "1",           # mono
        "-ar", "16000",       # sample rate 16k
        output_filename
    ]
    try:
        subprocess.run(convert_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        os.remove(input_filename)
        raise HTTPException(status_code=400, detail="Failed to convert audio")

    # Now use SpeechRecognition on the WAV
    r = sr.Recognizer()
    try:
        with sr.AudioFile(output_filename) as source:
            audio_data = r.record(source)
            text = r.recognize_google(audio_data)
    except sr.UnknownValueError:
        text = "Could not understand audio"
    except sr.RequestError:
        text = "Speech service unavailable"

    # cleanup
    os.remove(input_filename)
    os.remove(output_filename)

    return {"transcript": text}

