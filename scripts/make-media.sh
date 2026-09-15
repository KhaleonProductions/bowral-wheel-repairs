#!/usr/bin/env bash
# Produce every derived media asset. Idempotent: safe to re-run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/assets"
mkdir -p "$OUT"

# ffmpeg is installed via winget and may not be on PATH in a fresh shell.
FFMPEG="$(command -v ffmpeg || true)"
if [ -z "$FFMPEG" ]; then
  FFMPEG="$LOCALAPPDATA/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe"
fi
[ -x "$FFMPEG" ] || { echo "ffmpeg not found at: $FFMPEG" >&2; exit 1; }

# --- copy supplied originals under stable names ---
cp "$ROOT/bowral wheel repairs.png"                                    "$OUT/logo-blue.png"
cp "$ROOT/IMG_20260915_225126.jpg"                                     "$OUT/lathe.jpg"
cp "$ROOT/Messenger_creation_4AE294B9-E93A-4833-B9ED-CD07980F4182.mp4" "$OUT/video-cutting.mp4"
cp "$ROOT/Messenger_creation_1EB72D5D-9005-43C8-8DB7-275024EDE505.mp4" "$OUT/video-finished.mp4"

# --- red logo variant ---
python "$ROOT/scripts/make-logo-red.py" "$ROOT/bowral wheel repairs.png" "$OUT/logo-red.png"

# --- poster frames ---
# Taken at moments verified to show the subject clearly: the cutting clip has
# the tool engaged with swarf visible around 9s; the finished wheel fills the
# frame around 11s.
"$FFMPEG" -y -loglevel error -ss 9  -i "$OUT/video-cutting.mp4"  -frames:v 1 -q:v 3 "$OUT/poster-cutting.jpg"
"$FFMPEG" -y -loglevel error -ss 11 -i "$OUT/video-finished.mp4" -frames:v 1 -q:v 3 "$OUT/poster-finished.jpg"

# --- sized logo derivatives ---
# The 1.8 MB source is far too large to ship for a 44px nav mark.
for theme in blue red; do
  "$FFMPEG" -y -loglevel error -i "$OUT/logo-$theme.png" -vf scale=176:-1 "$OUT/logo-$theme-nav.png"
  "$FFMPEG" -y -loglevel error -i "$OUT/logo-$theme.png" -vf scale=512:-1 "$OUT/logo-$theme-hero.png"
done
"$FFMPEG" -y -loglevel error -i "$OUT/logo-red.png"  -vf scale=64:-1 "$OUT/favicon-red.png"
"$FFMPEG" -y -loglevel error -i "$OUT/logo-blue.png" -vf scale=64:-1 "$OUT/favicon-graphite.png"

# --- lathe photo: cap width, strip EXIF ---
"$FFMPEG" -y -loglevel error -i "$OUT/lathe.jpg" -vf "scale='min(1800,iw)':-1" -q:v 4 "$OUT/lathe-web.jpg"
mv "$OUT/lathe-web.jpg" "$OUT/lathe.jpg"

# --- drop the full-size logo originals: nothing references them ---
rm -f "$OUT/logo-blue.png" "$OUT/logo-red.png"

echo "--- assets ---"
ls -la "$OUT"
