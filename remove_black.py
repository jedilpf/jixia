import sys
import subprocess

try:
    from PIL import Image
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

img = Image.open('public/assets/text-bg.jpg').convert('RGBA')
pixels = img.load()
width, height = img.size

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # Calculate max intensity to determine if it's black background
        lum = max(r, g, b)
        if lum < 30:
            pixels[x, y] = (0, 0, 0, 0)
        elif lum < 80:
            # Smooth edge transition
            alpha = int((lum - 30) / 50.0 * 255)
            pixels[x, y] = (r, g, b, alpha)

img.save('public/assets/text-bg.png', 'PNG')
print("Image saved as text-bg.png successfully.")
