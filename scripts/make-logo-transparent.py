"""
Remove the dark navy background from the supplied logo, producing a
transparent PNG.

Approach: flood fill inward from the image border, treating a pixel as
background only if it is dark AND reachable from the edge without crossing
the artwork. A plain colour-threshold pass would also punch holes in the dark
recesses inside the shield and between the wheel spokes, because those are the
same colour as the background. Reachability is what distinguishes "outside the
badge" from "a dark gap inside it".

The background is a gradient (R 0-1, G 3-24, B 13-49 sampled at the border),
so the test is a luminance ceiling rather than an exact colour match.

Edges are then feathered one pixel to avoid a hard aliased cutout.
"""

import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

# A pixel is background-coloured if it is dark and blue-dominant. The chrome
# bevels, wheels and white text sit far above this ceiling.
MAX_LUMA = 72
# Allowance for the glow halo bleeding into the surround.
GLOW_LUMA = 110


def luma(r: int, g: int, b: int) -> float:
    return 0.299 * r + 0.587 * g + 0.114 * b


def remove_background(src: Path, dest: Path) -> None:
    img = Image.open(src).convert('RGBA')
    width, height = img.size
    px = img.load()

    # Alpha mask: 255 = keep. Start fully opaque and carve away the reachable
    # dark surround.
    alpha = [[255] * width for _ in range(height)]
    seen = [[False] * width for _ in range(height)]
    queue: deque[tuple[int, int]] = deque()

    # Seed from every border pixel that looks like background.
    for x in range(width):
        for y in (0, height - 1):
            r, g, b, _ = px[x, y]
            if luma(r, g, b) <= MAX_LUMA:
                queue.append((x, y))
                seen[y][x] = True
    for y in range(height):
        for x in (0, width - 1):
            r, g, b, _ = px[x, y]
            if luma(r, g, b) <= MAX_LUMA:
                queue.append((x, y))
                seen[y][x] = True

    while queue:
        x, y = queue.popleft()
        r, g, b, _ = px[x, y]
        lum = luma(r, g, b)
        if lum > GLOW_LUMA:
            continue

        # Fully transparent in the flat surround; partially so through the
        # glow, which gives a soft edge instead of a halo ring.
        if lum <= MAX_LUMA:
            alpha[y][x] = 0
        else:
            span = GLOW_LUMA - MAX_LUMA
            alpha[y][x] = int(255 * (lum - MAX_LUMA) / span)

        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height and not seen[ny][nx]:
                seen[ny][nx] = True
                queue.append((nx, ny))

    mask = Image.new('L', (width, height))
    mask.putdata([a for row in alpha for a in row])
    # Feather by a hair to kill jagged stair-stepping on the diagonals.
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))

    img.putalpha(mask)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, optimize=True)

    opaque = sum(1 for row in alpha for a in row if a > 200)
    pct = 100 * opaque / (width * height)
    print(f'wrote {dest} ({dest.stat().st_size // 1024} KB, {pct:.1f}% opaque)')


if __name__ == '__main__':
    source = Path(sys.argv[1] if len(sys.argv) > 1 else 'bowral wheel repairs.png')
    target = Path(sys.argv[2] if len(sys.argv) > 2 else 'public/assets/logo-clear.png')
    remove_background(source, target)
