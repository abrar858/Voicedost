# Deploying the voice API

`oracle-cloud-init.yaml` sets up a fresh **Ubuntu 24.04** server in one step
(tested for Oracle Cloud Always Free ARM, also fine on Hetzner or any VPS):

- installs Python, ffmpeg, espeak-ng and Caddy
- unpacks the backend, installs it in a virtualenv, downloads the Kokoro model
- runs it as the `voicedost-api` service on 127.0.0.1:8000
- serves it over HTTPS at **api.voicedost.com** with Caddy (automatic certificate)
- opens ports 80 and 443 in the server firewall

Rebuild it after backend changes: `bash deploy/make_cloud_init.sh [domain]`.

After the server starts:
1. Allow TCP 80 and 443 in the cloud provider's firewall (Oracle: VCN → Security List → Ingress rules).
2. DNS: add an **A** record `api` → the server's public IP.
3. Check `https://api.voicedost.com/health`.
4. Vercel → Settings → Environment Variables: `NEXT_PUBLIC_API_URL=https://api.voicedost.com`, then redeploy.

Logs on the server: `journalctl -u voicedost-api -f`, setup log: `/var/log/cloud-init-output.log`.
