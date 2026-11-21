const { createCanvas, loadImage } = require('canvas');

const WIDTH = 640;
const HEIGHT = 360;

async function createQuote({ avatarURL, quote, author }) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Komplett schwarzer Hintergrund
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Discord-Profilbild laden
  const avatar = await loadImage(avatarURL);

  // Profilbild links proportional zuschneiden
  const imageWidth = 300;
  const scale = Math.max(imageWidth / avatar.width, HEIGHT / avatar.height);

  const drawWidth = avatar.width * scale;
  const drawHeight = avatar.height * scale;

  const offsetX = (imageWidth - drawWidth) / 2;
  const offsetY = (HEIGHT - drawHeight) / 2;

  // Originalfarben beibehalten
  ctx.drawImage(avatar, offsetX, offsetY, drawWidth, drawHeight);

  // Schwarzer Bereich rechts
  ctx.fillStyle = '#000000';
  ctx.fillRect(imageWidth, 0, WIDTH - imageWidth, HEIGHT);

  // Text-Einstellungen
  const textX = 320;
  const textWidth = 290;

  function wrapText(text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';

    for (const word of words) {
      const test = line ? `${line} ${word}` : word;

      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }

    if (line) lines.push(line);
    return lines;
  }

  // Schriftgröße automatisch anpassen
  let fontSize = 32;
  let lines = [];

  do {
    ctx.font = `${fontSize}px Arial`;
    lines = wrapText(quote, textWidth);
    if (lines.length <= 5) break;
    fontSize -= 2;
  } while (fontSize >= 18);

  // Zitat vertikal zentrieren
  const lineHeight = fontSize * 1.3;
  const authorHeight = author ? 40 : 0;
  const totalHeight = lines.length * lineHeight + authorHeight;

  let y = (HEIGHT - totalHeight) / 2;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (const line of lines) {
    ctx.fillText(line, textX + textWidth / 2, y);
    y += lineHeight;
  }

  // Autorenname
  if (author) {
    y += 12;
    ctx.font = 'italic 16px Arial';
    ctx.fillStyle = '#AAAAAA';

    ctx.fillText(`- ${author}`, textX + textWidth / 2, y);
  }

  return canvas.toBuffer('image/png');
}

module.exports = { createQuote };
