# Healthcare Translation App: Local Setup Instructions

Below is a **single file** containing **step-by-step** instructions for testing the **Healthcare Translation App** **locally**. This includes the **FastAPI backend** (with pinned versions for dependencies) and the **React/Next.js frontend**. By the end, you will have:

1. **Backend** running at `http://127.0.0.1:8000`
2. **Frontend** running at `http://127.0.0.1:3000`

---

## **1. Requirements**

### **System Requirements**
- **Python 3.11** installed on your machine.
- **Node.js** (version 18.x or 16.x recommended) + **npm**.
- Internet connection to install packages.
- (Optional) A modern browser that supports **MediaRecorder** for audio.

### **Backend Dependencies (with versions)**
Here’s a pinned `requirements.txt` for the **FastAPI** backend:

```
fastapi==0.95.2
uvicorn==0.22.0
pydantic==1.10.7
python-dotenv==1.0.0
gTTS==2.3.2
SpeechRecognition==3.10.0
openai==0.27.2
```

Explanation:
- **fastapi==0.95.2**: The web framework.
- **uvicorn==0.22.0**: ASGI server to run FastAPI.
- **pydantic==1.10.7**: Data validation for Python.
- **python-dotenv==1.0.0**: Load environment variables.
- **gTTS==2.3.2**: Text-to-speech.
- **SpeechRecognition==3.10.0**: For server-side speech recognition (if needed).
- **openai==0.27.2**: Access OpenAI GPT models.

---

## **2. Project Structure**

```
healthcare-translation-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── speech.py
│   │   │   ├── translation.py
│   │   │   └── tts.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
└── frontend/
    ├── package.json
    ├── next.config.js
    ├── .env.local.example
    ├── public/
    ├── pages/
    ├── components/
    ├── styles/
    └── README.md
```

This guide focuses on **local testing**. You can adapt it later for DigitalOcean (backend) and Vercel (frontend) deployment.

---

## **3. Setting Up the Backend**

### **Step 1: Navigate to the Backend Folder**
```bash
cd healthcare-translation-app/backend
```

### **Step 2: Create and Activate a Virtual Environment**
```bash
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows (PowerShell):
# python -m venv venv
# . venv/Scripts/activate
```

### **Step 3: Create `requirements.txt`** (If not already present)
```bash
echo "fastapi==0.95.2\nuvicorn==0.22.0\npydantic==1.10.7\npython-dotenv==1.0.0\ngTTS==2.3.2\nSpeechRecognition==3.10.0\nopenai==0.27.2" > requirements.txt
```

### **Step 4: Install Dependencies**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### **Step 5: Create a `.env` File**
Copy from `.env.example` or create your own:

```bash
touch .env
```

Inside `.env`, add:
```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```
Replace `YOUR_OPENAI_API_KEY` with your actual key.

### **Step 6: Verify Code Structure**

- **`app/main.py`** should define your FastAPI instance, set up CORS, and include routes.
- **`app/routes/`** folder with `speech.py`, `translation.py`, `tts.py`.
- **`app/config.py`** to load `.env` (optional) and parse environment variables.

Example minimal `app/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import speech, translation, tts

app = FastAPI()

origins = ["http://localhost:3000"]  # local React dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(speech.router, prefix="/api/speech", tags=["Speech"])
app.include_router(translation.router, prefix="/api/translate", tags=["Translation"])
app.include_router(tts.router, prefix="/api/tts", tags=["TTS"])

@app.get("/")
def root():
    return {"message": "Healthcare Translation API running locally"}
```

### **Step 7: Run the Server**
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **`--reload`** for hot-reloading.
- Access the docs at: **http://127.0.0.1:8000/docs**.

If everything is correct, you’ll see the JSON: `{"message": "Healthcare Translation API running locally"}` at **http://127.0.0.1:8000**.

---

## **4. Setting Up the Frontend (Next.js)**

### **Step 1: Navigate to the Frontend Folder**
```bash
cd ../frontend
```

### **Step 2: Install Node Dependencies**
```bash
npm install
```

Make sure you have a valid `package.json` with Next.js dependencies:
```json
{
  "name": "healthcare-translation-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "13.x",
    "react": "18.x",
    "react-dom": "18.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

### **Step 3: Set Up `.env.local`**
```bash
touch .env.local
```
Inside `.env.local`, set:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```
So your frontend calls the local backend.

### **Step 4: Run Next.js in Development**
```bash
npm run dev
```

Frontend runs at **http://127.0.0.1:3000**.

### **Step 5: Test the Application**
1. Open **http://127.0.0.1:3000** in your browser.
2. Click **Record** (if you have a `RecordButton.js` using the browser’s MediaRecorder).
3. The recorded audio is sent to **`/api/speech/transcribe`** at the backend.
4. The returned transcript is displayed.
5. The text is translated via **`/api/translate`**.
6. The translation is TTS’d at **`/api/tts`**.
7. The **AudioPlayer** plays the MP3 from memory.

Check the **browser console** and **terminal logs** if something fails.

---

## **5. Summary of Commands**

### **Backend**
```bash
# 1) Go to backend folder
cd healthcare-translation-app/backend

# 2) Create venv & activate
python3 -m venv venv
source venv/bin/activate

# 3) Install Python deps
pip install --upgrade pip
pip install -r requirements.txt

# 4) Start server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### **Frontend**
```bash
# 1) Go to frontend folder
cd ../frontend

# 2) Install Node deps
npm install

# 3) Start Next.js dev server
npm run dev

# Access at http://127.0.0.1:3000
```

If all is successful, you’ll see your React app and can record audio from the browser.

---

## **That’s It!**
You’ve now set up the **Healthcare Translation App** locally:
1. The **FastAPI backend** handles transcription, translation, TTS.
2. The **Next.js frontend** runs a modern, mobile-friendly UI, recording audio in-browser.
3. Both pieces run on your local machine, so you can easily test.
4. When ready, you can deploy:
   - **Backend** → DigitalOcean
   - **Frontend** → Vercel

**Good luck testing!** If any errors arise, check logs in your terminal or browser console. Feel free to customize the code to match your exact needs.

