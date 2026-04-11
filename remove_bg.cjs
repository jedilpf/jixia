const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const targetChars = ['yuchu.png'];
const dir = 'public/assets/chars/stand/';

async function processImage(filename) {
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) return;

    console.log(`Processing ${filename}...`);
    const image = await Jimp.read(filePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Tolerance for "white"
    const isWhite = (r, g, b) => r > 240 && g > 240 && b > 240;

    // We will do a flood fill starting from the boundaries
    const visited = new Uint8Array(width * height);
    const stack = [];

    // Add boundaries to stack
    for (let x = 0; x < width; x++) {
        stack.push([x, 0]);
        stack.push([x, height - 1]);
    }
    for (let y = 0; y < height; y++) {
        stack.push([0, y]);
        stack.push([width - 1, y]);
    }

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const idx = y * width + x;
        if (visited[idx]) continue;
        visited[idx] = 1;

        const hex = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(hex);

        if (isWhite(rgba.r, rgba.g, rgba.b)) {
            // Set pixel to transparent
            image.setPixelColor(0x00000000, x, y);
            
            // Add neighbors
            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
    }

    // Optional: Soften the edges (basic alpha blending mitigation)
    // Find pixels that are NOT transparent but adjacent to transparent ones, and reduce their alpha if they are light colored
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            if (!visited[idx]) {
                const isEdge = visited[(y-1)*width+x] || visited[(y+1)*width+x] || visited[y*width+x-1] || visited[y*width+x+1];
                if (isEdge) {
                    const hex = image.getPixelColor(x, y);
                    const rgba = Jimp.intToRGBA(hex);
                    // If it's a bright pixel near the edge, reduce alpha to anti-alias
                    if (rgba.r > 200 && rgba.g > 200 && rgba.b > 200) {
                        image.setPixelColor(Jimp.rgbaToInt(rgba.r, rgba.g, rgba.b, 128), x, y);
                    }
                }
            }
        }
    }

    await image.writeAsync(filePath);
    console.log(`Finished ${filename}.`);
}

async function run() {
    for (const char of targetChars) {
        await processImage(char);
    }
    console.log('All backgrounds removed via flood fill method!');
}

run();
