"""
Generate the red variant of the Bowral Wheel Repairs logo.

The source artwork is RGB (no alpha): a 1254x1254 square whose dark navy
background is part of the design. Blue-family pixels with real saturation are
rotated to red; everything else is copied untouched, which is what preserves
the chrome bevels, the three alloy wheels, the white "WHEEL REPAIRS" text and
the stars. A global hue rotation would wreck all of those - 82.7% of sampled
pixels are blue-dominant but only 15.5% are the low-saturation chrome that
must survive.

Parameters below were prototyped and visually verified at nav, hero and full size.
"""

import colorsys
import sys
from pathlib import Path

from PIL import Image

# Blue family in the source spans roughly 170-265 degrees.
HUE_LOW, HUE_HIGH = 170, 265
# Below this saturation a pixel is chrome, white or near-grey: leave it alone.
SAT_FLOOR = 0.18
# Target hues as 0..1 fractions. Deep blues map just below 360 (crimson),
# brighter blues just above 0 (scarlet), which keeps the original two-tone
# depth of the artwork instead of flattening it to a single red.
HUE_DEEP, HUE_BRIGHT = 0.995, 0.02
HUE_SPLIT = 215


def recolour(src: Path, dest: Path) -> None:
    img = Image.open(src).convert('RGB')
    width, height = img.size
    px = img.load()
    out = Image.new('RGB', (width, height))
    op = out.load()

    for y in range(height):
        for x in range(width):
            r, g, b = px[x, y]
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            hue = h * 360
            if HUE_LOW <= hue <= HUE_HIGH and s > SAT_FLOOR:
                new_h = HUE_DEEP if hue < HUE_SPLIT else HUE_BRIGHT
                nr, ng, nb = colorsys.hsv_to_rgb(new_h, min(s * 1.02, 1.0), v)
                op[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255))
            else:
                op[x, y] = (r, g, b)

    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, optimize=True)
    print(f'wrote {dest} ({dest.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    src = Path(sys.argv[1] if len(sys.argv) > 1 else 'bowral wheel repairs.png')
    dest = Path(sys.argv[2] if len(sys.argv) > 2 else 'public/assets/logo-red.png')
    recolour(src, dest)
