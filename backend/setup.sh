#!/bin/bash

# Install system-level dependencies
sudo apt-get update && sudo apt-get install -y ffmpeg

# Create Python 3.11 virtual environment
python3.11 -m venv /app/venv

# Activate virtual environment
source /app/venv/bin/activate

# Install Python dependencies
pip install --no-cache-dir -r /app/requirements.txt

# Set environment variables
export PYTHONUNBUFFERED=1

# Run the application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000