#!/bin/bash

# Update package lists
sudo apt-get update -y

# Install system dependencies (if required)
sudo apt-get install -y ffmpeg portaudio19-dev python3.11 python3.11-venv python3.11-dev

# Create and activate a virtual environment (optional but recommended)
python3.11 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install required Python packages
pip install -r requirements.txt

# Ensure permissions for audio recording (if needed)
sudo chmod a+rw /dev/snd

# Exit script successfully
exit 0
