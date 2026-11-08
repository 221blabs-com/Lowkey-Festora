import QRCode from 'qrcode';
import { CRITERIA, EVENT, MILESTONES, TEAM } from '@/content/event';

/**
 * Procedural print art for the 3D ticket. Every face is drawn twice:
 *   - `color`: what you see (sRGB)
 *   - `mat`:   a packed material map (G = roughness, B = metalness) so that
 *              foil-stamped elements turn metallic and catch the light while
 *              the card stock stays matte. three.js reads exactly these channels.
 */

export const TICKET = {
  width: 5.2,
  height: 2.2,
  depth: 0.028,
  stubAt: 0.715, // fraction of width where the perforation sits
  notch: 0.15, // world-unit radius of the semicircle bites
} as const;

export const ART_W = 2048;
export const ART_H = Math.round(ART_W / (TICKET.width / TICKET.height)); // 866
const PX = ART_W / TICKET.width;
const STUB_X = Math.round(ART_W * TICKET.stubAt);
const NOTCH_PX = TICKET.notch * PX;

const C = {
  oxblood: '#2b0d14',
  oxbloodDeep: '#1d070c',
  crimson: '#96182a',
  champagne: '#e8d0a8',
  sand: '#b89870',
  paper: '#f2e7d5',
  paperShade: '#e6d6bb',
  ink: '#2a0d13',
};

// Material channel values. three: roughness = G/255, metalness = B/255.
const MAT_PAPER = 'rgb(0,235,0)';
const MAT_PRINT = 'rgb(0,185,0)';
const MAT_FOIL = 'rgb(0,70,255)';

type Mode = 'color' | 'mat';
type Fonts = { display: string; mono: string; sans: string };
export type TicketFaces = { front: { color: HTMLCanvasElement; mat: HTMLCanvasElement }; back: { color: HTMLCanvasElement; mat: HTMLCanvasElement } };

function cssFont(variable: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v || fallback;
}

async function loadImage(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

function canvas() {
  const c = document.createElement('canvas');
  c.width = ART_W;
  c.height = ART_H;
  return c;
}

/** Fit text into maxWidth by stepping the font size down. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, family: string, start: number, maxWidth: number, tracking = 0) {
  let size = start;
  for (; size > 10; size -= 2) {
    ctx.font = `${size}px ${family}`;
    const w = ctx.measureText(text).width + tracking * size * (text.length - 1);
    if (w <= maxWidth) break;
  }
  return size;
}

function trackedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number, align: 'left' | 'right' = 'left') {
  ctx.letterSpacing = `${tracking}px`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';
}

function guilloche(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.1;
  for (let k = 0; k < 46; k++) {
    ctx.beginPath();
    for (let i = 0; i <= 720; i++) {
      const t = (i / 720) * Math.PI * 2;
      const rr = r + 42 * Math.cos(9 * t + k * 0.14) + 18 * Math.sin(4 * t - k * 0.07);
      const x = cx + rr * Math.cos(t) * (1 + k * 0.006);
      const y = cy + rr * Math.sin(t) * 0.62 * (1 + k * 0.006);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function perforation(ctx: CanvasRenderingContext2D, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  for (let y = NOTCH_PX + 18; y < ART_H - NOTCH_PX - 12; y += 17) {
    ctx.beginPath();
    ctx.arc(STUB_X, y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Inset frame that bows around the notches — like a foil die line. */
function frame(ctx: CanvasRenderingContext2D, inset: number, color: string, width: number) {
  const r = NOTCH_PX + inset;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(inset, inset);
  ctx.lineTo(STUB_X - r, inset);
  ctx.arc(STUB_X, 0, r, Math.PI, 0, true);
  ctx.lineTo(ART_W - inset, inset);
  ctx.lineTo(ART_W - inset, ART_H - inset);
  ctx.lineTo(STUB_X + r, ART_H - inset);
  ctx.arc(STUB_X, ART_H, r, 0, Math.PI, true);
  ctx.lineTo(inset, ART_H - inset);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawQR(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, fg: string) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const n = qr.modules.size;
  const cell = size / n;
  ctx.save();
  ctx.fillStyle = fg;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.get(r, c)) ctx.fillRect(Math.floor(x + c * cell), Math.floor(y + r * cell), Math.ceil(cell), Math.ceil(cell));
    }
  }
  ctx.restore();
}

function drawFront(ctx: CanvasRenderingContext2D, mode: Mode, fonts: Fonts, mark: HTMLImageElement, wordmark: HTMLImageElement, registerUrl: string) {
  const foil = mode === 'color' ? C.champagne : MAT_FOIL;
  const print = (c: string) => (mode === 'color' ? c : MAT_PRINT);

  // Stock
  if (mode === 'color') {
    const g = ctx.createLinearGradient(0, 0, ART_W, ART_H);
    g.addColorStop(0, '#34111a');
    g.addColorStop(0.55, C.oxblood);
    g.addColorStop(1, C.oxbloodDeep);
    ctx.fillStyle = g;
  } else ctx.fillStyle = MAT_PAPER;
  ctx.fillRect(0, 0, ART_W, ART_H);

  // Security linework
  if (mode === 'color') guilloche(ctx, STUB_X * 0.66, ART_H * 0.52, 330, 'rgba(232,208,168,0.05)');
  // Stub tint
  if (mode === 'color') {
    ctx.fillStyle = 'rgba(110,16,32,0.55)';
    ctx.fillRect(STUB_X, 0, ART_W - STUB_X, ART_H);
  }

  frame(ctx, 34, foil, 3);
  frame(ctx, 46, mode === 'color' ? 'rgba(232,208,168,0.35)' : MAT_PRINT, 1);
  perforation(ctx, mode === 'color' ? 'rgba(232,208,168,0.55)' : MAT_FOIL);

  const L = 104;
  const mainW = STUB_X - L - 96;

  // Festora identity — the real mark and wordmark, printed (not foiled) so their colours stay true.
  if (mode === 'color') {
    const mh = 112;
    ctx.drawImage(mark, L, 92, mh * (mark.width / mark.height), mh);
    const wh = 30;
    ctx.drawImage(wordmark, L + mh * (mark.width / mark.height) + 26, 92 + mh / 2 - wh / 2, wh * (wordmark.width / wordmark.height), wh);
  }

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = print(C.sand);
  ctx.font = `500 26px ${fonts.mono}`;
  trackedText(ctx, `ADMIT ONE TEAM · ${TEAM.min}–${TEAM.max} MEMBERS`, STUB_X - 96, 132, 5, 'right');
  trackedText(ctx, 'PAN-INDIA · EDITION 2026', STUB_X - 96, 174, 5, 'right');

  // Title — foil
  ctx.fillStyle = foil;
  const title = EVENT.name;
  const size = fitFont(ctx, title, fonts.display, 230, mainW, -0.02);
  ctx.font = `${size}px ${fonts.display}`;
  ctx.letterSpacing = `${-0.02 * size}px`;
  ctx.fillText(title, L - 6, 470);
  ctx.letterSpacing = '0px';

  // Edition line
  ctx.fillStyle = print(C.champagne);
  ctx.font = `500 30px ${fonts.mono}`;
  trackedText(ctx, 'STARTUP & AI HACKATHON', L, 548, 6);
  ctx.fillStyle = mode === 'color' ? C.crimson : MAT_PRINT;
  ctx.font = `${120}px ${fonts.display}`;
  ctx.textAlign = 'right';
  ctx.fillText('2026', STUB_X - 92, 600);
  ctx.textAlign = 'left';

  // Rule
  ctx.fillStyle = foil;
  ctx.fillRect(L, 640, mainW, 2);

  // Itinerary
  const cols = [
    { k: 'ROUND 01 · ONLINE', v: 'DEC 05–06', s: '48 HOURS · REMOTE' },
    { k: 'SHORTLIST', v: 'DEC 16', s: 'ANNOUNCED' },
    { k: 'ROUND 02 · FINALE', v: 'DEC 20–21', s: '24 HOURS · HYDERABAD' },
  ];
  const colW = mainW / 3;
  cols.forEach((c, i) => {
    const x = L + i * colW;
    ctx.fillStyle = print(C.sand);
    ctx.font = `500 22px ${fonts.mono}`;
    trackedText(ctx, c.k, x, 690, 4);
    ctx.fillStyle = foil;
    ctx.font = `56px ${fonts.display}`;
    ctx.fillText(c.v, x, 756);
    ctx.fillStyle = print(C.sand);
    ctx.font = `500 20px ${fonts.mono}`;
    trackedText(ctx, c.s, x, 794, 4);
  });

  // Stub
  const sx = STUB_X + 72;
  const sw = ART_W - sx - 84;
  ctx.fillStyle = print(C.champagne);
  ctx.font = `500 24px ${fonts.mono}`;
  trackedText(ctx, 'Nº LT—2026', sx, 132, 5);
  ctx.fillStyle = foil;
  ctx.font = `92px ${fonts.display}`;
  ctx.fillText('Admit', sx, 236);

  const q = Math.min(sw, 340);
  const qx = sx;
  const qy = 300;
  if (mode === 'color') {
    ctx.fillStyle = C.champagne;
    ctx.fillRect(qx - 14, qy - 14, q + 28, q + 28);
  } else {
    ctx.fillStyle = MAT_PRINT;
    ctx.fillRect(qx - 14, qy - 14, q + 28, q + 28);
  }
  drawQR(ctx, registerUrl, qx, qy, q, mode === 'color' ? C.oxbloodDeep : MAT_PRINT);
  ctx.fillStyle = print(C.champagne);
  ctx.font = `500 21px ${fonts.mono}`;
  trackedText(ctx, 'SCAN TO REGISTER', sx, qy + q + 70, 4);
  ctx.fillStyle = print(C.sand);
  trackedText(ctx, 'ON FESTORA', sx, qy + q + 102, 4);
}

function drawBack(ctx: CanvasRenderingContext2D, mode: Mode, fonts: Fonts, mark: HTMLImageElement) {
  const ink = (c: string) => (mode === 'color' ? c : MAT_PRINT);
  // Cream stock
  ctx.fillStyle = mode === 'color' ? C.paper : MAT_PAPER;
  ctx.fillRect(0, 0, ART_W, ART_H);
  if (mode === 'color') {
    const g = ctx.createRadialGradient(ART_W * 0.3, ART_H * 0.2, 50, ART_W * 0.5, ART_H * 0.5, ART_W * 0.7);
    g.addColorStop(0, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(160,120,80,0.12)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ART_W, ART_H);
  }

  // Back is mirrored relative to the front: the stub sits on the LEFT.
  const stubX = ART_W - STUB_X;
  ctx.save();
  ctx.fillStyle = ink('rgba(42,13,19,0.4)');
  for (let y = NOTCH_PX + 18; y < ART_H - NOTCH_PX - 12; y += 17) {
    ctx.beginPath();
    ctx.arc(stubX, y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Stub (left): the mark, embossed in foil on the matte card
  if (mode === 'color') {
    const mh = 300;
    const mw = mh * (mark.width / mark.height);
    ctx.drawImage(mark, stubX / 2 - mw / 2, ART_H / 2 - mh / 2 - 40, mw, mh);
  }
  ctx.fillStyle = ink(C.ink);
  ctx.font = `500 22px ${fonts.mono}`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '5px';
  ctx.fillText('TICKETED ON FESTORA', stubX / 2, ART_H - 150);
  ctx.fillStyle = ink(C.crimson);
  ctx.fillText('A 221B LABS PRODUCT', stubX / 2, ART_H - 116);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';

  // Main (right): conditions of entry
  const L = stubX + 96;
  const R = ART_W - 104;
  ctx.fillStyle = ink(C.crimson);
  ctx.font = `500 24px ${fonts.mono}`;
  trackedText(ctx, 'CONDITIONS OF ENTRY', L, 136, 6);
  ctx.fillStyle = ink(C.ink);
  ctx.font = `86px ${fonts.display}`;
  ctx.fillText('Think beyond code.', L, 240);
  ctx.fillText('Build beyond ideas.', L, 330);

  const rules = [
    `Teams of ${TEAM.min}–${TEAM.max}. Solo entries are not allowed.`,
    'Same team across the online and offline rounds.',
    'Fees are per participant, non-refundable and non-transferable.',
    'Bring a valid college or government-issued ID to the finale.',
    'You keep your ideas, code, designs and IP.',
  ];
  ctx.font = `500 27px ${fonts.sans}`;
  rules.forEach((r, i) => {
    const y = 420 + i * 50;
    ctx.fillStyle = ink(C.crimson);
    ctx.fillText(String(i + 1).padStart(2, '0'), L, y);
    ctx.fillStyle = ink('#3d2a22');
    ctx.fillText(r, L + 64, y);
  });

  // Barcode = the judging weights. Bar widths are proportional to each criterion.
  const bx = L;
  const bw = R - L;
  const by = 690;
  const bh = 92;
  let x = bx;
  CRITERIA.forEach((c, ci) => {
    const segW = (c.weight / 100) * bw;
    const bars = Math.round(segW / 9);
    for (let b = 0; b < bars; b++) {
      const w = ((b * 7 + ci * 3) % 4) + 1.5;
      ctx.fillStyle = ink(ci === 0 ? C.crimson : C.ink);
      ctx.fillRect(x + b * (segW / bars), by, w, bh);
    }
    x += segW;
  });
  ctx.fillStyle = ink('#5c463a');
  ctx.font = `500 19px ${fonts.mono}`;
  trackedText(ctx, 'SCORING · 25 · 20 · 20 · 15 · 10 · 10', bx, by + bh + 38, 4);
  trackedText(ctx, MILESTONES[2].where.toUpperCase(), R, by + bh + 38, 4, 'right');
}

export async function paintTicketFaces(registerUrl: string): Promise<TicketFaces> {
  const fonts: Fonts = {
    display: cssFont('--font-marcellus', 'serif'),
    mono: cssFont('--font-plex-mono', 'monospace'),
    sans: cssFont('--font-satoshi', 'sans-serif'),
  };
  await Promise.all([
    document.fonts.load(`100px ${fonts.display}`),
    document.fonts.load(`500 30px ${fonts.mono}`),
    document.fonts.load(`500 30px ${fonts.sans}`),
  ]).catch(() => undefined);
  const [mark, wordmark] = await Promise.all([loadImage('/brand/festora-mark-512.png'), loadImage('/brand/festora-wordmark.png')]);

  const faces = {
    front: { color: canvas(), mat: canvas() },
    back: { color: canvas(), mat: canvas() },
  };
  drawFront(faces.front.color.getContext('2d')!, 'color', fonts, mark, wordmark, registerUrl);
  drawFront(faces.front.mat.getContext('2d')!, 'mat', fonts, mark, wordmark, registerUrl);
  drawBack(faces.back.color.getContext('2d')!, 'color', fonts, mark);
  drawBack(faces.back.mat.getContext('2d')!, 'mat', fonts, mark);
  return faces;
}
