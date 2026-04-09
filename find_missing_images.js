import fs from 'fs';
import path from 'path';

// Note: This script needs to be run in a way that it can access the project files.
// Since I can't easily import TS files here, I'll read the file content and parse it roughly or use a simple regex.

const showcasePath = 'f:/zz/jixia2.0【完整链路版本】/src/data/showcaseCards.ts';
const assetsPath = 'f:/zz/jixia2.0【完整链路版本】/src/utils/assets.ts';
const cardsImagesDir = 'f:/zz/jixia2.0【完整链路版本】/public/assets/cards';

const showcaseContent = fs.readFileSync(showcasePath, 'utf8');
const assetsContent = fs.readFileSync(assetsPath, 'utf8');

// Rough parsing of CARDS array in showcaseCards.ts
const cardsMatch = showcaseContent.match(/export const CARDS: CardData\[\] = \[([\s\S]+?)\];/);
if (!cardsMatch) {
    console.error('Could not find CARDS array in showcaseCards.ts');
    process.exit(1);
}

const cardsRaw = cardsMatch[1];
const cardRegex = /\{ id: '([^']+)', name: '([^']+)'/g;
let match;
const cards = [];
while ((match = cardRegex.exec(cardsRaw)) !== null) {
    cards.push({ id: match[1], name: match[2] });
}

// Rough parsing of CARD_NAME_TO_IMAGE_ID in assets.ts
const nameToImageMatch = assetsContent.match(/const CARD_NAME_TO_IMAGE_ID: Record<string, string> = \{([\s\S]+?)\};/);
const nameToImageId = {};
if (nameToImageMatch) {
    const pairs = nameToImageMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    pairs.forEach(p => {
        const [name, id] = p.split(':').map(s => s.trim().replace(/'/g, ''));
        nameToImageId[name] = id;
    });
}

// Extension overrides
const extOverridesMatch = assetsContent.match(/const CARD_IMAGE_EXT_OVERRIDES: Record<string, 'png' | 'jpg'> = \{([\s\S]+?)\};/);
const extOverrides = {};
if (extOverridesMatch) {
    // This part is complex due to spreads, but let's do a simple check for direct keys first
    const pairs = extOverridesMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    pairs.forEach(p => {
        if (p.includes(':')) {
            const [id, ext] = p.split(':').map(s => s.trim().replace(/'/g, ''));
            extOverrides[id] = ext;
        }
    });
}

// Determine image ID for each card
function resolveImageId(id, name) {
    if (nameToImageId[name]) return nameToImageId[name];
    return id.toLowerCase();
}

const missing = [];
const existing = fs.readdirSync(cardsImagesDir);

cards.forEach(card => {
    const imageId = resolveImageId(card.id, card.name);
    const ext = extOverrides[imageId] || 'jpg';
    const fileName = `${imageId}.${ext}`;
    const pngName = `${imageId}.png`;

    if (!existing.includes(fileName) && !existing.includes(pngName)) {
        missing.push({ ...card, imageId, expectedFile: fileName });
    }
});

console.log(JSON.stringify(missing, null, 2));
