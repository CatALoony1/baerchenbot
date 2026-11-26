const { createCanvas, loadImage } = require('canvas');
const twemoji = require('twemoji');

// Bildgröße
const WIDTH = 640;
const HEIGHT = 360;

// Avatar- und Textbereich
const AVATAR_WIDTH = 330;
const TEXT_X = 285;
const TEXT_WIDTH = 340;
const TEXT_CENTER = TEXT_X + TEXT_WIDTH / 2;

// Textlayout
const MAX_FONT_SIZE = 42;
const MIN_FONT_SIZE = 16;
const MAX_TEXT_HEIGHT = 270;
const LINE_HEIGHT_FACTOR = 1.25;

// Emoji-Cache
const emojiCache = new Map();

/**
 * Lädt ein Emoji als PNG und speichert es im Cache.
 *
 * Wichtig:
 * Wir verwenden 72x72 PNG statt SVG.
 * Dadurch ist keine SVG-Unterstützung in node-canvas nötig.
 */
async function loadEmoji(src) {
  if (emojiCache.has(src)) {
    return emojiCache.get(src);
  }

  const promise = loadImage(src);
  emojiCache.set(src, promise);

  try {
    return await promise;
  } catch (error) {
    emojiCache.delete(src);
    console.error('Emoji konnte nicht geladen werden:', src, error);
    throw error;
  }
}

/**
 * Wandelt HTML-Entities zurück in normale Zeichen.
 */
function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Extrahiert Text und farbige Emoji-Bilder.
 */
async function parseSegments(text) {
  // PNG statt SVG verwenden!
  const html = twemoji.parse(String(text), {
    folder: '72x72',
    ext: '.png',
  });

  const segments = [];
  const imageRegex = /<img\b[^>]*>/gi;

  let lastIndex = 0;
  let match;

  while ((match = imageRegex.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index);

    if (before) {
      segments.push({
        type: 'text',
        value: decodeHtml(before),
      });
    }

    const tag = match[0];

    const srcMatch = tag.match(/\bsrc="([^"]+)"/i);
    const altMatch = tag.match(/\balt="([^"]*)"/i);

    if (srcMatch) {
      const alt = altMatch ? decodeHtml(altMatch[1]) : '';

      try {
        const image = await loadEmoji(srcMatch[1]);

        segments.push({
          type: 'emoji',
          value: alt,
          image,
        });
      } catch (error) {
        // Falls das Bild nicht geladen werden kann,
        // wird das Emoji als Text dargestellt.
        segments.push({
          type: 'text',
          value: alt,
        });
      }
    }

    lastIndex = imageRegex.lastIndex;
  }

  const remaining = html.slice(lastIndex);

  if (remaining) {
    segments.push({
      type: 'text',
      value: decodeHtml(remaining),
    });
  }

  return segments;
}

/**
 * Erstellt einzelne Text- und Emoji-Tokens.
 */
function createTokens(segments, ctx, fontSize) {
  const tokens = [];

  for (const segment of segments) {
    if (segment.type === 'emoji') {
      tokens.push({
        type: 'emoji',
        image: segment.image,
        width: fontSize,
        height: fontSize,
      });

      continue;
    }

    const parts = segment.value.match(/\s+|[^\s]+/gu) || [];

    for (const part of parts) {
      tokens.push({
        type: 'text',
        value: part,
        width: ctx.measureText(part).width,
      });
    }
  }

  return tokens;
}

/**
 * Teilt zu lange Wörter auf.
 */
function splitLongToken(token, ctx, maxWidth) {
  if (token.type !== 'text' || token.width <= maxWidth) {
    return [token];
  }

  const result = [];
  const characters = Array.from(token.value);

  let current = '';

  for (const character of characters) {
    const candidate = current + character;

    if (current && ctx.measureText(candidate).width > maxWidth) {
      result.push({
        type: 'text',
        value: current,
        width: ctx.measureText(current).width,
      });

      current = character;
    } else {
      current = candidate;
    }
  }

  if (current) {
    result.push({
      type: 'text',
      value: current,
      width: ctx.measureText(current).width,
    });
  }

  return result;
}

/**
 * Bricht den Text automatisch um.
 */
function wrapSegments(segments, ctx, fontSize, maxWidth) {
  const originalTokens = createTokens(segments, ctx, fontSize);

  const tokens = originalTokens.flatMap((token) =>
    splitLongToken(token, ctx, maxWidth),
  );

  const lines = [];

  let currentLine = [];
  let currentWidth = 0;

  for (const token of tokens) {
    const isWhitespace = token.type === 'text' && /^\s+$/u.test(token.value);

    if (isWhitespace && currentLine.length === 0) {
      continue;
    }

    if (currentWidth + token.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);

      currentLine = [];
      currentWidth = 0;

      if (isWhitespace) {
        continue;
      }
    }

    currentLine.push(token);
    currentWidth += token.width;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Berechnet die passende Schriftgröße.
 */
function calculateFontSize(ctx, quoteSegments, author) {
  for (let fontSize = MAX_FONT_SIZE; fontSize >= MIN_FONT_SIZE; fontSize--) {
    ctx.font = `bold ${fontSize}px Arial`;

    const lines = wrapSegments(quoteSegments, ctx, fontSize, TEXT_WIDTH);

    const lineHeight = fontSize * LINE_HEIGHT_FACTOR;
    const quoteHeight = lines.length * lineHeight;
    const authorHeight = author ? 35 : 0;

    const totalHeight = quoteHeight + authorHeight + 20;

    if (totalHeight <= MAX_TEXT_HEIGHT) {
      return {
        fontSize,
        lines,
        lineHeight,
        totalHeight,
      };
    }
  }

  ctx.font = `bold ${MIN_FONT_SIZE}px Arial`;

  const lines = wrapSegments(quoteSegments, ctx, MIN_FONT_SIZE, TEXT_WIDTH);

  return {
    fontSize: MIN_FONT_SIZE,
    lines,
    lineHeight: MIN_FONT_SIZE * LINE_HEIGHT_FACTOR,
    totalHeight: lines.length * MIN_FONT_SIZE * LINE_HEIGHT_FACTOR,
  };
}

/**
 * Zeichnet eine Zeile mit Text und farbigen Emojis.
 */
function drawLine(ctx, line, centerX, y, fontSize) {
  const totalWidth = line.reduce((sum, token) => sum + token.width, 0);

  let x = centerX - totalWidth / 2;

  for (const token of line) {
    if (token.type === 'emoji') {
      const size = fontSize;

      // Emoji als echtes PNG-Bild zeichnen.
      ctx.drawImage(token.image, x, y - size * 0.8, size, size);
    } else {
      ctx.fillText(token.value, x, y);
    }

    x += token.width;
  }
}

/**
 * Erstellt das Quote-Bild.
 */
async function createQuote({ quoteNumber, avatarURL, quote, author = '' }) {
  if (!quoteNumber || !avatarURL || !quote) {
    throw new Error(
      'quoteNumber, avatarURL und quote müssen angegeben werden.',
    );
  }

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Hintergrund
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Avatar laden
  const avatar = await loadImage(avatarURL);

  // Avatar links zeichnen
  ctx.save();

  ctx.beginPath();
  ctx.rect(0, 0, AVATAR_WIDTH, HEIGHT);
  ctx.clip();

  const scale = Math.max(AVATAR_WIDTH / avatar.width, HEIGHT / avatar.height);

  const avatarWidth = avatar.width * scale;
  const avatarHeight = avatar.height * scale;

  const avatarX = (AVATAR_WIDTH - avatarWidth) / 2;
  const avatarY = (HEIGHT - avatarHeight) / 2;

  ctx.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);

  ctx.restore();

  // Weicher Übergang zum schwarzen Bereich
  const gradient = ctx.createLinearGradient(130, 0, AVATAR_WIDTH, 0);

  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.25, 'rgba(0, 0, 0, 0.12)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
  gradient.addColorStop(0.75, 'rgba(0, 0, 0, 0.85)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

  ctx.fillStyle = gradient;
  ctx.fillRect(130, 0, AVATAR_WIDTH - 130, HEIGHT);

  // Rechter Bereich schwarz
  ctx.fillStyle = '#000000';
  ctx.fillRect(AVATAR_WIDTH, 0, WIDTH - AVATAR_WIDTH, HEIGHT);

  // Quote und Autor parsen
  const quoteSegments = await parseSegments(quote);

  const authorSegments = author ? await parseSegments(author) : [];

  // Schriftgröße berechnen
  const layout = calculateFontSize(ctx, quoteSegments, author);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${layout.fontSize}px Arial`;

  // Quote vertikal zentrieren
  const authorHeight = author ? 38 : 0;

  const totalHeight = layout.lines.length * layout.lineHeight + authorHeight;

  let y = (HEIGHT - totalHeight) / 2 + layout.fontSize;

  // Quote zeichnen
  for (const line of layout.lines) {
    drawLine(ctx, line, TEXT_CENTER, y, layout.fontSize);

    y += layout.lineHeight;
  }

  // Autor zeichnen
  if (author) {
    y += 12;

    const authorFontSize = 17;

    ctx.font = `italic ${authorFontSize}px Arial`;
    ctx.fillStyle = '#999999';

    const authorLines = wrapSegments(
      authorSegments,
      ctx,
      authorFontSize,
      TEXT_WIDTH,
    );

    for (const line of authorLines) {
      drawLine(ctx, line, TEXT_CENTER, y, authorFontSize);

      y += authorFontSize * 1.2;
    }
  }

  // Quote-Nummer aus MongoDB holen

  // Quote-Nummer unten rechts
  ctx.font = '14px Arial';
  ctx.fillStyle = '#777777';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';

  ctx.fillText(`Quote #${quoteNumber}`, WIDTH - 15, HEIGHT - 14);

  return canvas.toBuffer('image/png');
}

module.exports = {
  createQuote,
  getNextQuoteNumber,
};
