#!/bin/bash
# Sendport 1-Click Autonomous MTA Installer
set -e

echo "🚀 Installing Sendport Autonomous Python MTA Engine..."

# Update and install Python3 & pip
apt update -y && apt install -y python3 python3-pip python3-venv

# Setup directory
mkdir -p /opt/sendport-mta
cd /opt/sendport-mta

# Create venv
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install fastapi "uvicorn[standard]" aiosmtplib dnspython dkimpy pydantic

echo "✅ Sendport MTA Dependencies Installed Successfully!"
echo "🌟 To run: python3 /opt/sendport-mta/mta_daemon.py"
