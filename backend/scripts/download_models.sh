#!/usr/bin/env bash
# Downloads the Kokoro voice model (about 350 MB) into backend/models.
# Kokoro is Apache-2.0 licensed; files come from the kokoro-onnx GitHub releases.
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)/models"
mkdir -p "$DIR"
BASE="https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  if [ -s "$DIR/$f" ]; then
    echo "Already have $f"
  else
    echo "Downloading $f ..."
    curl -fL --retry 3 -o "$DIR/$f.part" "$BASE/$f"
    mv "$DIR/$f.part" "$DIR/$f"
  fi
done
echo "Models ready in $DIR"
