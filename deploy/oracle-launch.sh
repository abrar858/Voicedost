#!/usr/bin/env bash
# Creates the VoiceDost API server on Oracle Cloud Always Free.
# Run inside Oracle Cloud Shell (OCI CLI is already signed in there):
#   curl -sL https://raw.githubusercontent.com/abrar858/voicedost/main/deploy/oracle-launch.sh | bash
# Safe to run again: it reuses the network it made before.
set -u
C="${OCI_TENANCY:?Run this in Oracle Cloud Shell}"
RAW=https://raw.githubusercontent.com/abrar858/voicedost/main/deploy
cd ~
curl -sL -o voicedost-init.yaml "$RAW/oracle-cloud-init.yaml"
[ -f ~/.ssh/id_rsa ] || ssh-keygen -q -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa

q() { oci "$@" --raw-output 2>/dev/null; }

echo "== Network"
VCN=$(q network vcn list -c "$C" --display-name voicedost-vcn --lifecycle-state AVAILABLE --query 'data[0].id')
if [ -z "$VCN" ]; then
  VCN=$(q network vcn create -c "$C" --cidr-block 10.0.0.0/16 --display-name voicedost-vcn \
        --dns-label vdvcn --wait-for-state AVAILABLE --query data.id)
fi
echo "VCN $VCN"
IGW=$(q network internet-gateway list -c "$C" --vcn-id "$VCN" --query 'data[0].id')
if [ -z "$IGW" ]; then
  IGW=$(q network internet-gateway create -c "$C" --vcn-id "$VCN" --is-enabled true \
        --display-name voicedost-igw --wait-for-state AVAILABLE --query data.id)
fi
RT=$(q network vcn get --vcn-id "$VCN" --query 'data."default-route-table-id"')
oci network route-table update --rt-id "$RT" --force \
  --route-rules "[{\"destination\":\"0.0.0.0/0\",\"destinationType\":\"CIDR_BLOCK\",\"networkEntityId\":\"$IGW\"}]" >/dev/null
SL=$(q network vcn get --vcn-id "$VCN" --query 'data."default-security-list-id"')
oci network security-list update --security-list-id "$SL" --force --ingress-security-rules '[
 {"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":22,"max":22}}},
 {"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":80,"max":80}}},
 {"source":"0.0.0.0/0","protocol":"6","tcpOptions":{"destinationPortRange":{"min":443,"max":443}}},
 {"source":"0.0.0.0/0","protocol":"1","icmpOptions":{"type":3,"code":4}}]' >/dev/null
SUB=$(q network subnet list -c "$C" --vcn-id "$VCN" --query 'data[0].id')
if [ -z "$SUB" ]; then
  SUB=$(q network subnet create -c "$C" --vcn-id "$VCN" --cidr-block 10.0.0.0/24 \
        --display-name voicedost-subnet --dns-label vdsub --wait-for-state AVAILABLE --query data.id)
fi
echo "Subnet $SUB (ports 22, 80, 443 open)"

echo "== Image"
IMG=$(q compute image list -c "$C" --operating-system "Canonical Ubuntu" --operating-system-version "24.04" \
      --shape VM.Standard.A1.Flex --sort-by TIMECREATED --sort-order DESC --query 'data[0].id')
echo "Ubuntu 24.04 $IMG"

echo "== Server"
ID=$(q compute instance list -c "$C" --display-name voicedost-api --lifecycle-state RUNNING --query 'data[0].id')
if [ -z "$ID" ]; then
  for AD in $(q iam availability-domain list -c "$C" --query "join(' ', data[].name)"); do
    echo "Trying $AD ..."
    ID=$(oci compute instance launch -c "$C" --availability-domain "$AD" \
         --shape VM.Standard.A1.Flex --shape-config '{"ocpus":2,"memoryInGBs":12}' \
         --image-id "$IMG" --subnet-id "$SUB" --assign-public-ip true \
         --display-name voicedost-api --ssh-authorized-keys-file ~/.ssh/id_rsa.pub \
         --user-data-file ~/voicedost-init.yaml --wait-for-state RUNNING \
         --query data.id --raw-output) && [ -n "$ID" ] && break
    ID=""
  done
fi
if [ -z "$ID" ]; then
  echo "RESULT: NO CAPACITY right now. Run the same command again in a few minutes."
  exit 1
fi
IP=$(q compute instance list-vnics --instance-id "$ID" --query 'data[0]."public-ip"')
echo "RESULT: SERVER RUNNING  PUBLIC IP = $IP"
echo "Set-up continues inside the server for about 10 minutes."
