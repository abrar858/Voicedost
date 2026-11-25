#!/usr/bin/env bash
# Updates the voice API code on the server to the latest GitHub version.
# From Oracle Cloud Shell:  ssh ubuntu@<server-ip> 'curl -sL https://github.com/abrar858/Voicedost/raw/main/deploy/update_server.sh | sudo bash'
set -euo pipefail
tmp=$(mktemp -d)
curl -sL https://github.com/abrar858/Voicedost/archive/refs/heads/main.tar.gz | tar -xz -C "$tmp"
rm -rf /opt/voicedost/backend/app
cp -r "$tmp"/*/backend/app /opt/voicedost/backend/
/opt/voicedost/venv/bin/pip install -q -r "$tmp"/*/backend/requirements.txt 2>/dev/null || /opt/voicedost/venv/bin/pip install -q httpx
rm -rf "$tmp"
systemctl restart voicedost-api
sleep 5
curl -s localhost:8000/health; echo
