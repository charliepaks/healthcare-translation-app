import streamlit as st
import openai
import time
import base64
import os
from gtts import gTTS
from io import BytesIO
import speech_recognition as sr
from dotenv import load_dotenv
from medical_terms import enhance_medical_terminology

# Load environment variables
load_dotenv()

# Configure OpenAI API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    openai.api_key = api_key
else:
    st.error("OpenAI API key not found. Please add it to your .env file as OPENAI_API_KEY=your_key_here")

# Set page configuration
st.set_page_config(
    page_title="Healthcare Translation App",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Define supported languages
LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "zh": "Chinese (Simplified)",
    "ar": "Arabic",
    "hi": "Hindi",
    "ru": "Russian",
    "pt": "Portuguese",
    "ja": "Japanese"
}

# Define medical specialty contexts
MEDICAL_CONTEXTS = {
    "general": "General Medical",
    "cardiology": "Cardiology",
    "neurology": "Neurology",
    "orthopedics": "Orthopedics",
    "pediatrics": "Pediatrics",
    "oncology": "Oncology"
}

# Initialize session state
if 'original_text' not in st.session_state:
    st.session_state.original_text = ""
if 'translated_text' not in st.session_state:
    st.session_state.translated_text = ""
if 'recording' not in st.session_state:
    st.session_state.recording = False
if 'translation_history' not in st.session_state:
    st.session_state.translation_history = []
if 'source_lang' not in st.session_state:
    st.session_state.source_lang = "en"
if 'target_lang' not in st.session_state:
    st.session_state.target_lang = "es"
if 'med_context' not in st.session_state:
    st.session_state.med_context = "general"
if 'last_translated_text' not in st.session_state:
    st.session_state.last_translated_text = ""

# Function to translate text
def translate_text(text, source_lang, target_lang, medical_context):
    if not text or not openai.api_key:
        return ""
    
    try:
        # Enhance medical terminology
        enhanced_text = enhance_medical_terminology(text, medical_context)
        
        # Construct prompt for medical translation
        prompt = f"""
        Translate the following medical text from {LANGUAGES[source_lang]} to {LANGUAGES[target_lang]}.
        Maintain medical terminology accuracy and ensure the translation is culturally appropriate for healthcare contexts.
        
        Text to translate: "{enhanced_text}"
        
        Translation:
        """
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a medical translator with expertise in healthcare terminology."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        translated_text = response.choices[0].message.content.strip()
        
        # Add to translation history
        st.session_state.translation_history.append({
            "original": text,
            "translated": translated_text,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "context": medical_context,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        })
        
        return translated_text
    
    except Exception as e:
        st.error(f"Translation error: {str(e)}")
        return ""

# Function to convert text to speech
def text_to_speech(text, language):
    try:
        if not text:
            return None
            
        tts = gTTS(text=text, lang=language, slow=False)
        fp = BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        
        return fp
    except Exception as e:
        st.error(f"Text-to-speech error: {str(e)}")
        return None

# Function to create audio playback HTML
def get_audio_player_html(audio_bytes):
    if audio_bytes is None:
        return ""
        
    audio_base64 = base64.b64encode(audio_bytes.read()).decode()
    return f"""
    <audio controls autoplay style="width: 100%;">
        <source src="data:audio/mp3;base64,{audio_base64}" type="audio/mp3">
        Your browser does not support the audio element.
    </audio>
    """

# Function to record audio with silence detection
def record_and_transcribe():
    r = sr.Recognizer()
    
    transcript_placeholder = st.empty()
    transcript_placeholder.info("Calibrating microphone... Please wait.")
    
    try:
        with sr.Microphone() as source:
            # Adjust for ambient noise
            r.adjust_for_ambient_noise(source, duration=1)
            transcript_placeholder.info("Listening... Speak now! (Recording will stop after 2 seconds of silence)")
            
            # Set the energy threshold based on ambient noise
            r.energy_threshold = 300  # Lower value makes it more sensitive to quiet sounds
            
            # Set non_speaking_duration to 2 seconds (wait 2 seconds of silence before stopping)
            r.pause_threshold = 2.0
            
            # Record audio with silence detection
            audio = r.listen(source, timeout=None, phrase_time_limit=None)
            
            transcript_placeholder.info("Processing speech...")
            
            # Recognize speech using Google Speech Recognition
            lang_code = st.session_state.source_lang
            if lang_code == "en":
                lang_code = "en-US"
            elif lang_code == "es":
                lang_code = "es-ES"
            elif lang_code == "fr":
                lang_code = "fr-FR"
            elif lang_code == "de":
                lang_code = "de-DE"
            else:
                # Fallback to English for unsupported languages
                lang_code = "en-US"
                
            text = r.recognize_google(audio, language=lang_code)
            
            # Update session state
            st.session_state.original_text = text
            
            # Show transcribed text
            transcript_placeholder.empty()
            
            # Automatically translate
            with st.spinner("Translating..."):
                translation = translate_text(
                    text,
                    st.session_state.source_lang,
                    st.session_state.target_lang,
                    st.session_state.med_context
                )
                st.session_state.translated_text = translation
                
            return text
            
    except sr.UnknownValueError:
        transcript_placeholder.error("Sorry, I could not understand your speech.")
        return ""
    except sr.RequestError as e:
        transcript_placeholder.error(f"Could not request results; {e}")
        return ""
    except Exception as e:
        transcript_placeholder.error(f"Error during speech recognition: {e}")
        return ""
    finally:
        # Make sure to reset recording state
        st.session_state.recording = False

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1E88E5;
        text-align: center;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #424242;
        text-align: center;
        margin-bottom: 2rem;
    }
    .stButton button {
        width: 100%;
        height: 3rem;
        font-size: 1.2rem;
        font-weight: bold;
        border-radius: 10px;
    }
    .recording-button button {
        background-color: #f44336;
        color: white;
    }
    .speech-button button {
        background-color: #4CAF50;
        color: white;
    }
    .transcript-box {
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        padding: 1rem;
        background-color: #f5f5f5;
        height: 200px;
        overflow-y: auto;
    }
    .info-text {
        color: #757575;
        font-style: italic;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }
    .footer {
        text-align: center;
        color: #9e9e9e;
        margin-top: 2rem;
        font-size: 0.8rem;
    }
    .sidebar .block-container {
        padding-top: 2rem;
    }
</style>
""", unsafe_allow_html=True)

# App header
st.markdown('<h1 class="main-header">Healthcare Translation App</h1>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Breaking language barriers in healthcare</p>', unsafe_allow_html=True)

# Sidebar for settings
with st.sidebar:
    st.header("Settings")
    
    # Use different keys for the widgets to avoid session state conflicts
    source_lang = st.selectbox(
        "Source Language",
        options=list(LANGUAGES.keys()),
        format_func=lambda x: LANGUAGES[x],
        index=list(LANGUAGES.keys()).index(st.session_state.source_lang),
        key="source_lang_widget"
    )
    st.session_state.source_lang = source_lang
    
    target_lang = st.selectbox(
        "Target Language",
        options=list(LANGUAGES.keys()),
        format_func=lambda x: LANGUAGES[x],
        index=list(LANGUAGES.keys()).index(st.session_state.target_lang),
        key="target_lang_widget"
    )
    st.session_state.target_lang = target_lang
    
    med_context = st.selectbox(
        "Medical Context",
        options=list(MEDICAL_CONTEXTS.keys()),
        format_func=lambda x: MEDICAL_CONTEXTS[x],
        index=list(MEDICAL_CONTEXTS.keys()).index(st.session_state.med_context),
        key="med_context_widget"
    )
    st.session_state.med_context = med_context
    
    st.divider()
    
    if st.button("Clear History", key="clear_history_button"):
        st.session_state.translation_history = []
        st.session_state.original_text = ""
        st.session_state.translated_text = ""
        st.session_state.last_translated_text = ""
        st.experimental_rerun()

# Main content area with two columns
col1, col2 = st.columns(2)

with col1:
    st.subheader(f"Original Text ({LANGUAGES[st.session_state.source_lang]})")
    
    # Text area for original text
    original_text = st.text_area(
        "Original text",
        value=st.session_state.original_text,
        height=150,
        key="original_text_input"
    )
    
    # Update session state if text changed
    if original_text != st.session_state.original_text:
        st.session_state.original_text = original_text
        
        # Auto-translate when text changes
        if original_text and original_text != st.session_state.last_translated_text:
            with st.spinner("Translating..."):
                st.session_state.last_translated_text = original_text
                translation = translate_text(
                    original_text,
                    st.session_state.source_lang,
                    st.session_state.target_lang,
                    st.session_state.med_context
                )
                st.session_state.translated_text = translation
    
    # Record button
    if st.button(
        "🎤 Record Speech",
        key="record_button",
        type="primary"
    ):
        # Set recording state and process audio
        st.session_state.recording = True
        record_and_transcribe()
        # Refresh the page to update UI
        st.experimental_rerun()
    
    # Add notice about recording behavior
    st.markdown(
        '<p class="info-text">Press the Record button once. Recording will automatically stop after 2 seconds of silence.</p>',
        unsafe_allow_html=True
    )

with col2:
    st.subheader(f"Translated Text ({LANGUAGES[st.session_state.target_lang]})")
    
    # Translated text display
    st.text_area(
        "Translation",
        value=st.session_state.translated_text,
        height=150,
        key="translated_text_display"
    )
    
    # Text-to-speech button
    if st.button(
        "🔊 Speak Translation",
        key="speak_button",
        disabled=not st.session_state.translated_text
    ):
        if st.session_state.translated_text:
            with st.spinner("Generating audio..."):
                audio_bytes = text_to_speech(
                    st.session_state.translated_text,
                    st.session_state.target_lang
                )
                if audio_bytes:
                    st.markdown(get_audio_player_html(audio_bytes), unsafe_allow_html=True)

# Translation history
if st.session_state.translation_history:
    st.divider()
    st.subheader("Translation History")
    
    for i, item in enumerate(reversed(st.session_state.translation_history)):
        with st.expander(f"Translation {len(st.session_state.translation_history) - i}: {item['timestamp']}"):
            col_hist1, col_hist2 = st.columns(2)
            
            with col_hist1:
                st.markdown(f"**{LANGUAGES[item['source_lang']]}**")
                st.markdown(item['original'])
            
            with col_hist2:
                st.markdown(f"**{LANGUAGES[item['target_lang']]}**")
                st.markdown(item['translated'])
            
            st.caption(f"Context: {MEDICAL_CONTEXTS[item['context']]}")

# Footer
st.markdown('<div class="footer">© 2025 Healthcare Translation App | For demonstration purposes only</div>', unsafe_allow_html=True)