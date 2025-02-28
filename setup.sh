#!/bin/bash
# Setup script for Healthcare Translation App

# Create and activate virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment based on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install system dependencies for PyAudio if on Linux
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Installing system dependencies for PyAudio..."
    sudo apt-get update
    sudo apt-get install -y portaudio19-dev python3-pyaudio
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create data directory
echo "Creating data directory..."
mkdir -p data

# Initialize medical terms database
echo "Initializing medical terms database..."
python -c "from medical_terms import initialize_medical_terms; initialize_medical_terms()"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
    echo "Please edit the .env file to add your OpenAI API key"
fi

echo "Setup complete! Run the app with: streamlit run app.py"