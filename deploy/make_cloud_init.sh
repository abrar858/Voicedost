#!/usr/bin/env bash
# Builds deploy/oracle-cloud-init.yaml: a one-paste setup for an Ubuntu 24.04
# server (Oracle Cloud ARM or any VPS). It installs the voice API, downloads
# the Kokoro model, runs it as a service and serves it over HTTPS with Caddy.
# Usage: bash deploy/make_cloud_init.sh [api-domain]
set -euo pipefail
cd "$(dirname "$0")/.."
DOMAIN="${1:-api.voicedost.com}"
ORIGINS="https://www.voicedost.com,https://voicedost.com,https://voicedost.vercel.app"
TARB64=$(tar --exclude='__pycache__' --exclude='models' --exclude='tests' --exclude='.pytest_cache' -czf - backend | base64 -w0)
cat > deploy/oracle-cloud-init.yaml <<YAML
#cloud-config
package_update: true
packages:
  - python3-venv
  - python3-pip
  - ffmpeg
  - espeak-ng
  - caddy
  - curl
write_files:
  - path: /opt/voicedost/backend.tar.gz
    encoding: b64
    permissions: "0644"
    content: ${TARB64}
  - path: /etc/systemd/system/voicedost-api.service
    permissions: "0644"
    content: |
      [Unit]
      Description=VoiceDost voice API
      After=network-online.target
      [Service]
      WorkingDirectory=/opt/voicedost/backend
      Environment=VOICEDOST_ALLOWED_ORIGINS=${ORIGINS}
      Environment=VOICEDOST_MAX_CONCURRENT_JOBS=2
      Environment=VOICEDOST_MODELS_DIR=/opt/voicedost/backend/models
      ExecStart=/opt/voicedost/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1
      Restart=always
      RestartSec=5
      [Install]
      WantedBy=multi-user.target
  - path: /etc/caddy/Caddyfile
    permissions: "0644"
    content: |
      ${DOMAIN} {
        encode gzip
        reverse_proxy 127.0.0.1:8000
      }
runcmd:
  - [bash, -c, "cd /opt/voicedost && tar xzf backend.tar.gz"]
  - [bash, -c, "python3 -m venv /opt/voicedost/venv && /opt/voicedost/venv/bin/pip install --upgrade pip && /opt/voicedost/venv/bin/pip install fastapi 'uvicorn[standard]' kokoro-onnx numpy soundfile pydantic"]
  - [bash, -c, "cd /opt/voicedost/backend && bash scripts/download_models.sh"]
  - [bash, -c, "iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT; iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT; netfilter-persistent save || true"]
  - [systemctl, daemon-reload]
  - [systemctl, enable, --now, voicedost-api]
  - [systemctl, restart, caddy]
final_message: "VoiceDost API setup finished after \$UPTIME seconds"
YAML
echo "Wrote deploy/oracle-cloud-init.yaml ($(wc -c < deploy/oracle-cloud-init.yaml) bytes) for ${DOMAIN}"
