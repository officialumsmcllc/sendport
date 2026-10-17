#!/bin/bash
set -e

echo "🚀 [1/5] Updating packages & installing curl, python, nginx..."
apt-get update -y
apt-get install -y python3 python3-pip python3-venv nginx curl ufw git

echo "📁 [2/5] Creating /opt/sendport-mta directory..."
mkdir -p /opt/sendport-mta
cd /opt/sendport-mta

python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install fastapi uvicorn aiosmtplib dnspython dkimpy pydantic

echo "⚙️ [3/5] Downloading MTA Engine..."
curl -sSL -o /opt/sendport-mta/mta_daemon.py https://raw.githubusercontent.com/officialumsmcllc/sendport/main/server/mta_daemon.py

echo "🔧 [4/5] Creating Systemd Service..."
cat << 'SERVICE' > /etc/systemd/system/sendport-mta.service
[Unit]
Description=Sendport Autonomous Outbound MTA Engine
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/sendport-mta
ExecStart=/opt/sendport-mta/venv/bin/python /opt/sendport-mta/mta_daemon.py
Restart=always
RestartSec=3
Environment=PORT=8000
Environment=MTA_SECRET_KEY=sendport_mta_master_secret_key_2026
Environment=MTA_HELO_HOST=mail.getsendport.com

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable sendport-mta
systemctl restart sendport-mta

echo "🌐 [5/5] Configuring Nginx Reverse Proxy..."
cat << 'NGINX' > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name mail.getsendport.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX

nginx -t
systemctl restart nginx

echo "✅ [DONE] Sendport MTA is running! Checking health..."
sleep 2
curl -s http://127.0.0.1:8000/health
echo ""
echo "🎉 Setup complete! Server is ready."
