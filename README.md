# Healthcare Translation App with Streamlit

A Streamlit-based web application that enables real-time, multilingual translation between patients and healthcare providers. This application converts spoken input into text, provides a live transcript, and offers a translated version with audio playback.

## Features

- **Voice-to-Text**: Convert spoken input into a text transcript with medical term enhancement
- **Real-Time Translation**: Translate text between multiple languages using OpenAI's API
- **Audio Playback**: Listen to translated text through text-to-speech functionality
- **Medical Terminology Enhancement**: Automatically standardizes medical terms and expands abbreviations
- **Multiple Languages**: Support for 10 major languages
- **Different Medical Contexts**: Specialized terminology for different medical fields
- **Translation History**: Keep track of past translations in the session

## Requirements

- Python 3.8 or higher
- OpenAI API key
- Microphone for speech recognition

## Installation

### Using the Setup Script

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/healthcare-translation-app.git
   cd healthcare-translation-app
   ```

2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. Edit the `.env` file to add your OpenAI API key.

### Manual Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/healthcare-translation-app.git
   cd healthcare-translation-app
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install system dependencies for PyAudio (Linux only):
   ```bash
   sudo apt-get update
   sudo apt-get install -y portaudio19-dev python3-pyaudio
   ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

1. Start the Streamlit app:
   ```bash
   streamlit run app.py
   ```

2. Open your web browser and go to `http://localhost:8501`

3. Use the app:
   - Select source and target languages
   - Enter text or use the voice recording feature
   - Click "Translate" to get the translation
   - Click "Speak Translation" to hear the translated text

## Deployment

### Deploying to Streamlit Cloud

1. Push your code to a GitHub repository
2. Go to [Streamlit Cloud](https://streamlit.io/cloud)
3. Connect your GitHub repository
4. Add your OpenAI API key as a secret
5. Deploy your app

### Deploying with Docker

1. Build the Docker image:
   ```bash
   docker build -t healthcare-translation-app .
   ```

2. Run the container:
   ```bash
   docker run -p 8501:8501 -e OPENAI_API_KEY=your_openai_api_key_here healthcare-translation-app
   ```

## Extending the App

### Adding New Languages

Edit the `LANGUAGES` dictionary in `app.py` to add more languages.

### Adding Medical Terminology

Edit the medical terms database in `data/medical_terms.json` to add more medical terms and contexts.

### Improving Speech Recognition

The app currently uses Google's Speech Recognition API. You can extend it to use other APIs like Microsoft Azure or Amazon Transcribe for better accuracy.

## Security and Privacy

- The app processes data in transit and does not store any patient information permanently
- Translation history is only stored in the session and is cleared when the browser is closed
- The app uses HTTPS for secure data transmission when deployed to Streamlit Cloud
- For a production healthcare application, additional security measures should be implemented to ensure HIPAA compliance

## License

This project is licensed under the MIT License - see the LICENSE file for details.