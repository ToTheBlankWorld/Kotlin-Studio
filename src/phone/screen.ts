import type { AppState } from '../store';
import { ACCENTS } from '../store';

export const SW = 640;
export const SH = 1408;

const C = {
  bg: '#0a0b10',
  bgAlt: '#0d0f15',
  surface: '#151821',
  surface2: '#1c2029',
  line: 'rgba(255,255,255,0.07)',
  text: '#eef0f5',
  text2: '#98a0b0',
  text3: '#5f6779',
  accent: '#7f52ff',
  cyan: '#41d4ff',
  green: '#5fd8a4',
  ember: '#ff8a3d',
};

const SANS = 'Geist, system-ui, sans-serif';
const MONO = 'Geist Mono, ui-monospace, monospace';

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/* ------------------------------------------------------------------ */
/* primitives                                                          */
/* ------------------------------------------------------------------ */

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function fillRR(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string | CanvasGradient,
) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function text(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = 'left',
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function vGrad(_ctx: CanvasRenderingContext2D, _x: number, y: number, h: number, stops: [number, string][]) {
  const g = _ctx.createLinearGradient(0, y, 0, y + h);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

function hGrad(ctx: CanvasRenderingContext2D, x: number, w: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

/** The Kotlin K mark: gradient tile + white K. */
export function drawKMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, radius: number) {
  ctx.save();
  rr(ctx, x, y, size, size, radius);
  const g = ctx.createLinearGradient(x, y, x + size, y + size);
  g.addColorStop(0, '#e44857');
  g.addColorStop(0.42, '#c711e1');
  g.addColorStop(0.78, '#7f52ff');
  g.addColorStop(1, '#5a3bff');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.clip();

  const s = size;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + s * 0.2, y, s * 0.2, s);
  ctx.beginPath();
  ctx.moveTo(x + s * 0.4, y + s * 0.5);
  ctx.lineTo(x + s * 0.99, y);
  ctx.lineTo(x + s * 0.99, y + s * 0.3);
  ctx.lineTo(x + s * 0.4, y + s * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.4, y + s * 0.5);
  ctx.lineTo(x + s * 0.99, y + s);
  ctx.lineTo(x + s * 0.99, y + s * 0.7);
  ctx.lineTo(x + s * 0.4, y + s * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function statusBar(ctx: CanvasRenderingContext2D, fg = C.text) {
  const now = new Date();
  const hh = now.getHours() % 12 || 12;
  const mm = String(now.getMinutes()).padStart(2, '0');
  text(ctx, `${hh}:${mm}`, 44, 42, `600 26px ${MONO}`, fg, 'left');

  const right = 596;
  // battery
  ctx.strokeStyle = fg;
  ctx.lineWidth = 2.5;
  rr(ctx, right - 44, 24, 40, 20, 5);
  ctx.stroke();
  ctx.fillStyle = fg;
  ctx.fillRect(right - 40, 28, 26, 12);
  ctx.fillRect(right - 3, 29, 3, 10);
  // wifi
  ctx.beginPath();
  ctx.arc(right - 64, 44, 17, Math.PI * 1.16, Math.PI * 1.84);
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(right - 64, 44, 8, Math.PI * 1.16, Math.PI * 1.84);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(right - 64, 45, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = fg;
  ctx.fill();
  // signal
  for (let i = 0; i < 4; i++) {
    const h = 5 + i * 5;
    ctx.fillRect(right - 106 + i * 8, 44 - h, 5.5, h);
  }
}

function cardStroke(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  rr(ctx, x, y, w, h, r);
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function bottomNav(ctx: CanvasRenderingContext2D, tab: AppState['tab'], y: number) {
  ctx.fillStyle = 'rgba(8,9,13,0.92)';
  ctx.fillRect(0, y, SW, SH - y);
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, y + 0.75);
  ctx.lineTo(SW, y + 0.75);
  ctx.stroke();

  const items: { id: AppState['tab']; label: string }[] = [
    { id: 'builds', label: 'Builds' },
    { id: 'insights', label: 'Insights' },
    { id: 'run', label: 'Run' },
  ];
  const cy = y + 56;

  items.forEach((it, i) => {
    const cx = (SW / 3) * (i + 0.5);
    const active = tab === it.id;
    const col = active ? C.accent : C.text3;

    if (active) fillRR(ctx, cx - 46, y + 12, 92, 4, 2, C.accent);

    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = 3;
    if (it.id === 'builds') {
      rr(ctx, cx - 14, cy - 15, 28, 20, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy - 9);
      ctx.lineTo(cx + 14, cy - 9);
      ctx.moveTo(cx - 6, cy + 5);
      ctx.lineTo(cx + 6, cy + 5);
      ctx.stroke();
    } else if (it.id === 'insights') {
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy + 8);
      ctx.lineTo(cx - 14, cy - 4);
      ctx.lineTo(cx - 3, cy - 4);
      ctx.lineTo(cx - 3, cy + 8);
      ctx.moveTo(cx + 3, cy + 8);
      ctx.lineTo(cx + 3, cy - 16);
      ctx.lineTo(cx + 14, cy - 16);
      ctx.lineTo(cx + 14, cy + 8);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 14);
      ctx.lineTo(cx + 13, cy);
      ctx.lineTo(cx - 10, cy + 14);
      ctx.closePath();
      ctx.fill();
    }

    text(ctx, it.label, cx, y + 104, `${active ? 600 : 500} 21px ${SANS}`, active ? C.text : C.text3, 'center');
  });
}

/* ------------------------------------------------------------------ */
/* tab contents                                                       */
/* ------------------------------------------------------------------ */

const CHART = [9.4, 8.6, 11.2, 7.4, 6.9, 6.3, 5.8];

function smoothPath(pts: { x: number; y: number }[]) {
  const p = new Path2D();
  p.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const cx = (a.x + b.x) / 2;
    p.bezierCurveTo(cx, a.y, cx, b.y, b.x, b.y);
  }
  return p;
}

function drawBuilds(ctx: CanvasRenderingContext2D, s: AppState, local: number) {
  const PAD = 36;
  const W = SW - PAD * 2;

  // ---- hero status card
  const hy = 206;
  const hg = vGrad(ctx, 0, hy, 170, [
    [0, '#181b27'],
    [1, '#101219'],
  ]);
  fillRR(ctx, PAD, hy, W, 170, 26, hg);
  rr(ctx, PAD, hy, W, 170, 26);
  ctx.strokeStyle = hGrad(ctx, PAD, W, [
    [0, 'rgba(127,82,255,0.65)'],
    [0.5, 'rgba(199,17,225,0.4)'],
    [1, 'rgba(65,212,255,0.35)'],
  ]);
  ctx.lineWidth = 1.6;
  ctx.stroke();

  const ok = s.build === 'success' || s.build === 'installed';
  const col = ok ? C.green : C.ember;
  ctx.beginPath();
  ctx.arc(PAD + 56, hy + 56, 25, 0, Math.PI * 2);
  ctx.fillStyle = ok ? 'rgba(95,216,164,0.14)' : 'rgba(255,138,61,0.14)';
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (ok) {
    ctx.moveTo(PAD + 45, hy + 56);
    ctx.lineTo(PAD + 53, hy + 64);
    ctx.lineTo(PAD + 68, hy + 47);
  } else {
    ctx.moveTo(PAD + 56, hy + 45);
    ctx.lineTo(PAD + 56, hy + 58);
    ctx.moveTo(PAD + 56, hy + 66);
    ctx.lineTo(PAD + 56, hy + 66.5);
  }
  ctx.stroke();
  ctx.lineCap = 'butt';

  const headline = ok ? 'BUILD SUCCESSFUL' : 'BUILD RUNNING';
  text(ctx, headline, PAD + 100, hy + 50, `600 25px ${MONO}`, ok ? '#8ff0c6' : '#ffc79b', 'left');
  text(ctx, 'app-debug.apk  ·  4.2 MB  ·  Kotlin 2.1', PAD + 100, hy + 86, `400 21px ${MONO}`, C.text2, 'left');

  const chips = ['assembleDebug', '31 tasks', '6s'];
  let cx = PAD + 32;
  for (const c of chips) {
    ctx.font = `500 19px ${MONO}`;
    const cw = ctx.measureText(c).width + 28;
    fillRR(ctx, cx, hy + 112, cw, 38, 19, 'rgba(255,255,255,0.05)');
    text(ctx, c, cx + 14, hy + 137, `500 19px ${MONO}`, C.text2, 'left');
    cx += cw + 12;
  }

  // ---- chart card
  const cy = 396;
  const ch = 280;
  fillRR(ctx, PAD, cy, W, ch, 26, C.surface);
  cardStroke(ctx, PAD, cy, W, ch, 26);
  text(ctx, 'Build time', PAD + 28, cy + 46, `600 27px ${SANS}`, C.text, 'left');
  text(ctx, 'last 7 builds', PAD + W - 28, cy + 46, `500 19px ${MONO}`, C.text3, 'right');

  const gx0 = PAD + 34;
  const gx1 = PAD + W - 34;
  const gy0 = cy + 92;
  const gy1 = cy + 214;
  const max = 12;
  const pts = CHART.map((v, i) => ({
    x: gx0 + ((gx1 - gx0) * i) / (CHART.length - 1),
    y: gy1 - (v / max) * (gy1 - gy0),
  }));

  const reveal = Math.min(1, Math.max(0, local / 0.9));
  const path = smoothPath(pts);

  ctx.save();
  ctx.beginPath();
  ctx.rect(gx0 - 6, gy0 - 10, (gx1 - gx0 + 12) * reveal, (gy1 - gy0) + 40);
  ctx.clip();

  const area = new Path2D(path);
  area.lineTo(pts[pts.length - 1].x, gy1 + 4);
  area.lineTo(pts[0].x, gy1 + 4);
  area.closePath();
  const ag = ctx.createLinearGradient(0, gy0, 0, gy1);
  ag.addColorStop(0, 'rgba(127,82,255,0.42)');
  ag.addColorStop(1, 'rgba(127,82,255,0)');
  ctx.fillStyle = ag;
  ctx.fill(area);

  ctx.strokeStyle = '#9d7bff';
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.stroke(path);
  ctx.restore();

  pts.forEach((p, i) => {
    const last = i === pts.length - 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, last ? 7 : 4.5, 0, Math.PI * 2);
    ctx.fillStyle = last ? C.cyan : '#0d0f15';
    ctx.fill();
    ctx.strokeStyle = last ? C.cyan : '#9d7bff';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  ['Mon', 'Thu', 'Sun'].forEach((l, i) => {
    const x = gx0 + ((gx1 - gx0) * i) / 2;
    text(ctx, l, x, cy + 250, `500 18px ${MONO}`, C.text3, i === 0 ? 'left' : i === 2 ? 'right' : 'center');
  });

  // ---- tiles
  const ty = 696;
  const tw = (W - 20) / 2;
  const tiles = [
    { label: 'Coverage', value: '87%', bar: 0.87 },
    { label: 'Tests', value: '214', bar: 1 },
  ];
  tiles.forEach((t, i) => {
    const x = PAD + i * (tw + 20);
    fillRR(ctx, x, ty, tw, 140, 24, C.surface);
    cardStroke(ctx, x, ty, tw, 140, 24);
    text(ctx, t.label, x + 24, ty + 40, `500 19px ${MONO}`, C.text3, 'left');
    text(ctx, t.value, x + 24, ty + 96, `600 46px ${SANS}`, C.text, 'left');
    fillRR(ctx, x + 24, ty + 112, tw - 48, 7, 4, 'rgba(255,255,255,0.08)');
    const bw = (tw - 48) * Math.min(1, t.bar * Math.min(1, local / 0.8));
    if (bw > 1) fillRR(ctx, x + 24, ty + 112, bw, 7, 4, i === 0 ? C.accent : C.green);
  });

  // ---- recent list
  const ly = 876;
  text(ctx, 'Recent builds', PAD + 4, ly, `600 26px ${SANS}`, C.text, 'left');
  text(ctx, 'View all', PAD + W - 4, ly, `500 19px ${MONO}`, C.accent, 'right');

  const rows = [
    { name: 'feature/login', time: '2 min ago', dur: '12.4s', col: C.green },
    { name: 'fix/offline-sync', time: '1 h ago', dur: '5.1s', col: C.green },
    { name: 'chore/dependencies', time: 'yesterday', dur: '8.7s', col: C.ember },
  ];
  rows.forEach((r, i) => {
    const y = ly + 22 + i * 78;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, y + 0.5);
    ctx.lineTo(PAD + W, y + 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(PAD + 12, y + 40, 6, 0, Math.PI * 2);
    ctx.fillStyle = r.col;
    ctx.fill();
    text(ctx, r.name, PAD + 34, y + 34, `500 22px ${MONO}`, C.text, 'left');
    text(ctx, r.time, PAD + 34, y + 60, `400 18px ${SANS}`, C.text3, 'left');
    text(ctx, r.dur, PAD + W, y + 48, `500 20px ${MONO}`, C.text2, 'right');
  });

  // ---- FAB
  const fy = 1168;
  ctx.save();
  ctx.shadowColor = 'rgba(127,82,255,0.55)';
  ctx.shadowBlur = 26;
  fillRR(ctx, SW - 118, fy, 84, 84, 28, hGrad(ctx, SW - 118, 84, [[0, '#8a5cff'], [1, '#6a3df0']]));
  ctx.restore();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(SW - 86, fy + 26);
  ctx.lineTo(SW - 54, fy + 42);
  ctx.lineTo(SW - 86, fy + 58);
  ctx.closePath();
  ctx.fill();
}

function drawInsights(ctx: CanvasRenderingContext2D, _s: AppState, local: number) {
  const PAD = 36;
  const W = SW - PAD * 2;

  const cy = 206;
  const ch = 330;
  fillRR(ctx, PAD, cy, W, ch, 26, C.surface);
  cardStroke(ctx, PAD, cy, W, ch, 26);
  text(ctx, 'Weekly builds', PAD + 28, cy + 48, `600 27px ${SANS}`, C.text, 'left');
  text(ctx, '128 runs', PAD + W - 28, cy + 48, `500 19px ${MONO}`, C.text3, 'right');

  const bars = [42, 68, 55, 88, 74, 96, 61, 80];
  const bx0 = PAD + 34;
  const bw = 44;
  const gap = (W - 68 - bars.length * bw) / (bars.length - 1);
  const baseY = cy + 288;
  bars.forEach((v, i) => {
    const x = bx0 + i * (bw + gap);
    const t = Math.min(1, Math.max(0, (local - i * 0.05) / 0.6));
    const h = (v / 100) * 190 * (1 - Math.pow(1 - t, 3));
    const g = ctx.createLinearGradient(0, baseY - h, 0, baseY);
    g.addColorStop(0, i === bars.length - 2 ? C.cyan : 'rgba(127,82,255,0.95)');
    g.addColorStop(1, 'rgba(127,82,255,0.18)');
    fillRR(ctx, x, baseY - h, bw, Math.max(4, h), 10, g);
  });
  ctx.strokeStyle = C.line;
  ctx.beginPath();
  ctx.moveTo(bx0 - 8, baseY + 0.5);
  ctx.lineTo(PAD + W - 26, baseY + 0.5);
  ctx.stroke();

  const ty = 562;
  const tw = (W - 20) / 2;
  const tiles = [
    { label: 'Crash-free', value: '99.4%', col: C.green },
    { label: 'Cold start', value: '380 ms', col: C.cyan },
  ];
  tiles.forEach((t, i) => {
    const x = PAD + i * (tw + 20);
    fillRR(ctx, x, ty, tw, 132, 24, C.surface);
    cardStroke(ctx, x, ty, tw, 132, 24);
    text(ctx, t.label, x + 24, ty + 42, `500 19px ${MONO}`, C.text3, 'left');
    text(ctx, t.value, x + 24, ty + 100, `600 40px ${SANS}`, t.col, 'left');
  });

  const ry = 726;
  const rh = 320;
  fillRR(ctx, PAD, ry, W, rh, 26, C.surface);
  cardStroke(ctx, PAD, ry, W, rh, 26);
  text(ctx, 'APK contents', PAD + 28, ry + 48, `600 27px ${SANS}`, C.text, 'left');
  text(ctx, '4.2 MB', PAD + W - 28, ry + 48, `500 19px ${MONO}`, C.text3, 'right');

  const legend = [
    { k: 'classes.dex', v: 1.8, c: C.accent },
    { k: 'resources.arsc', v: 0.9, c: C.cyan },
    { k: 'lib/**.so', v: 0.7, c: C.ember },
    { k: 'other', v: 0.8, c: '#3d4351' },
  ];
  const total = legend.reduce((a, b) => a + b.v, 0);
  let acc = 0;
  const cxx = PAD + 96;
  const cyy = ry + 178;
  legend.forEach((l, i) => {
    const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += l.v;
    const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const t = Math.min(1, Math.max(0, (local - 0.2 - i * 0.06) / 0.5));
    ctx.beginPath();
    ctx.arc(cxx, cyy, 76, a0, a0 + (a1 - a0) * t);
    ctx.strokeStyle = l.c;
    ctx.lineWidth = 26;
    ctx.stroke();
  });
  text(ctx, '4.2', cxx, cyy + 4, `600 38px ${SANS}`, C.text, 'center');
  text(ctx, 'MB', cxx, cyy + 32, `500 17px ${MONO}`, C.text3, 'center');

  legend.forEach((l, i) => {
    const y = ry + 118 + i * 46;
    ctx.beginPath();
    ctx.arc(PAD + 216, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = l.c;
    ctx.fill();
    text(ctx, l.k, PAD + 236, y + 7, `500 20px ${MONO}`, C.text2, 'left');
    text(ctx, `${l.v.toFixed(1)} MB`, PAD + W - 28, y + 7, `500 20px ${MONO}`, C.text3, 'right');
  });

  const ny = 1076;
  fillRR(ctx, PAD, ny, W, 128, 24, 'rgba(127,82,255,0.1)');
  rr(ctx, PAD, ny, W, 128, 24);
  ctx.strokeStyle = 'rgba(127,82,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, 'Baseline profile installed', PAD + 26, ny + 52, `600 23px ${SANS}`, C.text, 'left');
  text(ctx, 'Startup time −31% on first launch', PAD + 26, ny + 90, `400 20px ${MONO}`, C.text2, 'left');
}

function drawRun(ctx: CanvasRenderingContext2D, s: AppState, local: number) {
  const PAD = 36;
  const W = SW - PAD * 2;

  const cxx = SW / 2;
  const cyy = 460;
  const R = 148;
  const p = s.runPhase === 'idle' ? 0 : s.runProgress;
  const done = s.runPhase === 'done';

  ctx.beginPath();
  ctx.arc(cxx, cyy, R, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 22;
  ctx.stroke();

  if (s.runPhase !== 'idle') {
    const start = -Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cxx, cyy, R, start, start + Math.PI * 2 * p);
    ctx.strokeStyle = done ? C.green : hGrad(ctx, cxx - R, R * 2, [[0, C.cyan], [1, C.accent]]);
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';
  }

  ctx.beginPath();
  ctx.arc(cxx, cyy, R - 34, 0, Math.PI * 2);
  ctx.fillStyle = C.surface;
  ctx.fill();
  rr(ctx, cxx - R + 6, cyy - R + 6, R * 2 - 12, R * 2 - 12, 140);
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (done) {
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cxx - 44, cyy);
    ctx.lineTo(cxx - 12, cyy + 32);
    ctx.lineTo(cxx + 50, cyy - 36);
    ctx.stroke();
    ctx.lineCap = 'butt';
    text(ctx, 'BUILD SUCCESSFUL', cxx, cyy + 96, `600 25px ${MONO}`, '#8ff0c6', 'center');
    text(ctx, 'in 6s · 31 tasks', cxx, cyy + 130, `400 20px ${MONO}`, C.text3, 'center');
  } else if (s.runPhase === 'running') {
    text(ctx, `${Math.round(p * 100)}%`, cxx, cyy + 18, `600 62px ${SANS}`, C.text, 'center');
    text(ctx, 'assembling apk', cxx, cyy + 56, `500 19px ${MONO}`, C.text3, 'center');
  } else {
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.moveTo(cxx - 24, cyy - 34);
    ctx.lineTo(cxx + 36, cyy);
    ctx.lineTo(cxx - 24, cyy + 34);
    ctx.closePath();
    ctx.fill();
    text(ctx, 'Tap to run', cxx, cyy + 96, `600 25px ${SANS}`, C.text, 'center');
    text(ctx, './gradlew assembleDebug', cxx, cyy + 130, `400 20px ${MONO}`, C.text3, 'center');
  }

  const ly = 664;
  const lh = 420;
  fillRR(ctx, PAD, ly, W, lh, 24, '#0b0d13');
  cardStroke(ctx, PAD, ly, W, lh, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(PAD + 1, ly + 54, W - 2, 1);
  ctx.beginPath();
  ctx.arc(PAD + 26, ly + 27, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ff5f57';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(PAD + 46, ly + 27, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#febc2e';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(PAD + 66, ly + 27, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#28c840';
  ctx.fill();
  text(ctx, 'gradle — kotlin-studio', PAD + 96, ly + 34, `500 19px ${MONO}`, C.text3, 'left');

  const logs = [
    '> Task :app:compileDebugKotlin',
    '> Task :app:mergeDebugResources',
    '> Task :app:processDebugManifest',
    '> Task :app:dexBuilderDebug',
    '> Task :app:packageDebug',
    '',
    'BUILD SUCCESSFUL in 6s',
    '31 actionable tasks: 31 executed',
  ];
  const shown = s.runPhase === 'idle' ? 0 : Math.ceil(logs.length * Math.min(1, s.runProgress / 0.95));
  logs.slice(0, shown).forEach((l, i) => {
    const isOk = l.startsWith('BUILD');
    text(
      ctx,
      l || ' ',
      PAD + 22,
      ly + 96 + i * 40,
      `400 20px ${MONO}`,
      isOk ? '#8ff0c6' : l.startsWith('> Task') ? '#7e879b' : C.text2,
      'left',
    );
  });
  if (s.runPhase === 'running') {
    const cxx2 = PAD + 22 + ctx.measureText('>').width + 8;
    const blink = Math.floor(local * 2) % 2 === 0;
    if (blink) {
      ctx.fillStyle = C.accent;
      ctx.fillRect(Math.min(cxx2 + 40, PAD + W - 24), ly + 84, 12, 24);
    }
  }
}

/* ------------------------------------------------------------------ */
/* other modes                                                        */
/* ------------------------------------------------------------------ */

function drawLauncher(ctx: CanvasRenderingContext2D, local: number) {
  const g = ctx.createLinearGradient(0, 0, SW, SH);
  g.addColorStop(0, '#16121f');
  g.addColorStop(0.5, '#0d1018');
  g.addColorStop(1, '#101724');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SW, SH);

  const blob = (x: number, y: number, r: number, c: string, a: number) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, c.replace('A', String(a)));
    rg.addColorStop(1, c.replace('A', '0'));
    ctx.fillStyle = rg;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  blob(140, 260, 320, 'rgba(127,82,255,A)', 0.55);
  blob(520, 980, 340, 'rgba(65,212,255,A)', 0.3);
  blob(430, 420, 240, 'rgba(199,17,225,A)', 0.28);

  statusBar(ctx, '#ffffff');

  const dockY = SH - 250;
  fillRR(ctx, 46, dockY, SW - 92, 168, 44, 'rgba(255,255,255,0.07)');

  const icons = [
    { x: 128, label: 'Phone', kind: 0 },
    { x: 252, label: 'Messages', kind: 1 },
    { x: 376, label: 'Camera', kind: 2 },
    { x: 500, label: 'Files', kind: 3 },
  ];
  icons.forEach((it) => {
    const y = dockY + 34;
    fillRR(ctx, it.x - 34, y, 68, 68, 20, 'rgba(255,255,255,0.13)');
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 3;
    if (it.kind === 0) {
      ctx.beginPath();
      ctx.arc(it.x, y + 34, 17, 0, Math.PI * 2);
      ctx.stroke();
    } else if (it.kind === 1) {
      rr(ctx, it.x - 17, y + 22, 34, 24, 8);
      ctx.stroke();
    } else if (it.kind === 2) {
      rr(ctx, it.x - 18, y + 22, 36, 26, 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(it.x, y + 35, 7, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      rr(ctx, it.x - 15, y + 22, 30, 28, 6);
      ctx.stroke();
    }
    text(ctx, it.label, it.x, y + 100, `500 17px ${SANS}`, 'rgba(255,255,255,0.62)', 'center');
  });

  // our new app icon
  const ix = SW / 2 - 56;
  const iy = 380;
  const appear = Math.min(1, Math.max(0, local / 0.6));
  const eased = 1 - Math.pow(1 - appear, 3);
  ctx.save();
  ctx.globalAlpha = eased;
  ctx.translate(SW / 2, iy + 56);
  ctx.scale(0.7 + eased * 0.3, 0.7 + eased * 0.3);
  ctx.translate(-SW / 2, -(iy + 56));
  drawKMark(ctx, ix, iy, 112, 30);
  ctx.restore();
  text(ctx, 'Kotlin Studio', SW / 2, iy + 160, `500 22px ${SANS}`, 'rgba(255,255,255,0.9)', 'center');

  const pulse = (Math.sin(local * 3) + 1) / 2;
  ctx.beginPath();
  ctx.arc(SW / 2, iy + 56, 74 + pulse * 10, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(127,82,255,${0.5 - pulse * 0.4})`;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawInstall(ctx: CanvasRenderingContext2D, s: AppState, local: number) {
  drawLauncher(ctx, local);
  ctx.fillStyle = 'rgba(5,6,9,0.94)';
  ctx.fillRect(0, 0, SW, SH);

  const p = s.progress;
  const done = p >= 1;

  drawKMark(ctx, SW / 2 - 64, 380, 128, 34);
  text(ctx, 'Kotlin Studio', SW / 2, 566, `600 32px ${SANS}`, C.text, 'center');
  text(ctx, 'com.example.kotlinstudio', SW / 2, 600, `400 19px ${MONO}`, C.text3, 'center');

  const bx = 76;
  const bw = SW - 152;
  const by = 700;
  fillRR(ctx, bx, by, bw, 14, 7, 'rgba(255,255,255,0.09)');
  const w = bw * Math.min(1, p);
  if (w > 14) fillRR(ctx, bx, by, w, 14, 7, hGrad(ctx, bx, bw, [[0, C.accent], [1, C.cyan]]));

  if (!done) {
    text(ctx, 'Installing…', SW / 2, by + 74, `500 27px ${SANS}`, C.text2, 'center');
    text(ctx, `${Math.round(p * 100)}%`, SW / 2, by + 116, `500 22px ${MONO}`, C.text3, 'center');
  } else {
    text(ctx, 'App installed', SW / 2, by + 74, `600 28px ${SANS}`, C.green, 'center');
    fillRR(ctx, bx, by + 108, bw, 74, 37, hGrad(ctx, bx, bw, [[0, '#8a5cff'], [1, '#6a3df0']]));
    text(ctx, 'Open', SW / 2, by + 156, `600 26px ${SANS}`, '#fff', 'center');
  }

  text(ctx, 'Verified by Play Protect', SW / 2, SH - 120, `400 19px ${MONO}`, C.text3, 'center');
}

function drawCompose(ctx: CanvasRenderingContext2D, s: AppState, local: number) {
  const dark = s.compose.dark;
  const accent = ACCENTS[s.compose.accent % ACCENTS.length];
  ctx.fillStyle = dark ? '#0c0e14' : '#f4f5f8';
  ctx.fillRect(0, 0, SW, SH);
  const fg = dark ? '#eef0f5' : '#15171d';
  const sub = dark ? '#8b93a3' : '#5c6373';
  const surface = dark ? '#171a23' : '#ffffff';
  const lineC = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  statusBar(ctx, fg);

  // top app bar
  ctx.strokeStyle = fg;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(58, 96);
  ctx.lineTo(42, 110);
  ctx.lineTo(58, 124);
  ctx.stroke();
  ctx.lineCap = 'butt';
  text(ctx, 'Greeting', 92, 122, `500 30px ${SANS}`, fg, 'left');
  ctx.strokeStyle = sub;
  ctx.lineWidth = 2.5;
  rr(ctx, SW - 82, 92, 36, 36, 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(SW - 64, 110, 5, 0, Math.PI * 2);
  ctx.fillStyle = sub;
  ctx.fill();

  ctx.strokeStyle = lineC;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 164);
  ctx.lineTo(SW, 164);
  ctx.stroke();

  // content card
  const enter = Math.min(1, Math.max(0, local / 0.45));
  const eased = 1 - Math.pow(1 - enter, 3);
  ctx.save();
  ctx.globalAlpha = eased;
  ctx.translate(0, (1 - eased) * 26);

  const cx = 40;
  const cw = SW - 80;
  fillRR(ctx, cx, 220, cw, 300, 32, surface);
  ctx.strokeStyle = lineC;
  ctx.lineWidth = 1.5;
  rr(ctx, cx, 220, cw, 300, 32);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + 56, 286, 26, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.globalAlpha = eased * 0.2;
  ctx.fill();
  ctx.globalAlpha = eased;
  text(ctx, s.compose.text.slice(0, 1).toUpperCase(), cx + 56, 296, `600 30px ${SANS}`, accent, 'center');

  text(ctx, `Hello, ${s.compose.text}!`, cx + 40, 388, `600 46px ${SANS}`, fg, 'left');
  text(ctx, 'Rendered by @Composable Greeting()', cx + 40, 430, `400 21px ${MONO}`, sub, 'left');

  if (s.compose.button) {
    fillRR(ctx, cx + 40, 452, 220, 66, 33, accent);
    text(ctx, 'Say hello', cx + 150, 494, `600 25px ${SANS}`, '#fff', 'center');
  }
  ctx.restore();

  // second card — list
  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, (local - 0.15) / 0.4));
  fillRR(ctx, cx, 556, cw, 260, 32, surface);
  ctx.strokeStyle = lineC;
  rr(ctx, cx, 556, cw, 260, 32);
  ctx.stroke();
  ['Build', 'Preview', 'Deploy'].forEach((label, i) => {
    const y = 556 + 74 + i * 72;
    ctx.beginPath();
    ctx.arc(cx + 46, y, 16, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.stroke();
    text(ctx, label, cx + 84, y + 9, `500 26px ${SANS}`, fg, 'left');
    if (i < 2) {
      ctx.strokeStyle = lineC;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 46, y + 36);
      ctx.lineTo(cx + cw - 46, y + 36);
      ctx.stroke();
    }
  });
  ctx.restore();

  // snackbar
  const snack = Math.min(1, Math.max(0, (local - 0.4) / 0.35));
  if (snack > 0) {
    ctx.globalAlpha = snack;
    fillRR(ctx, 40, SH - 300, SW - 80, 78, 20, dark ? '#262a35' : '#2b2f3a');
    text(ctx, 'State changed → recomposed', 68, SH - 254, `500 22px ${MONO}`, '#dfe3ec', 'left');
    text(ctx, 'UNDO', SW - 68, SH - 254, `600 21px ${SANS}`, accent, 'right');
    ctx.globalAlpha = 1;
  }

  text(ctx, dark ? 'Theme.Dark' : 'Theme.Light', SW / 2, SH - 140, `500 20px ${MONO}`, sub, 'center');
}

/* ------------------------------------------------------------------ */
/* public API                                                         */
/* ------------------------------------------------------------------ */

let modeSig = '';
let entry = 0;
let clockMin = -1;

function signature(s: AppState) {
  return [s.screen, s.tab, s.runPhase, s.compose.text, s.compose.button, s.compose.dark, s.compose.accent, s.compose.pulse, s.build].join('|');
}

/** Updates the mode-entry clock. Returns seconds since entry + whether the mode changed. */
export function screenTiming(s: AppState, now: number): { local: number; changed: boolean } {
  const sig = signature(s);
  const minute = new Date().getMinutes();
  let changed = false;
  if (sig !== modeSig) {
    entry = now;
    modeSig = sig;
    changed = true;
  }
  if (minute !== clockMin) {
    clockMin = minute;
    changed = changed || false;
  }
  return { local: (now - entry) / 1000, changed };
}

export function getHotspots(s: AppState): Hotspot[] {
  const NAV_Y = 1256;
  if (s.screen === 'app') {
    const spots: Hotspot[] = [
      { id: 'tab:builds', x: 0, y: NAV_Y, w: SW / 3, h: SH - NAV_Y },
      { id: 'tab:insights', x: SW / 3, y: NAV_Y, w: SW / 3, h: SH - NAV_Y },
      { id: 'tab:run', x: (SW / 3) * 2, y: NAV_Y, w: SW / 3, h: SH - NAV_Y },
      { id: 'fab', x: SW - 130, y: 1150, w: 110, h: 110 },
    ];
    if (s.tab === 'run') {
      spots.push({ id: 'run', x: SW / 2 - 170, y: 290, w: 340, h: 340 });
    }
    return spots;
  }
  if (s.screen === 'install' && s.progress >= 1) {
    return [{ id: 'open', x: 76, y: 808, w: SW - 152, h: 74 }];
  }
  if (s.screen === 'launcher') {
    return [{ id: 'open-app', x: SW / 2 - 90, y: 350, w: 180, h: 220 }];
  }
  if (s.screen === 'compose') {
    const out: Hotspot[] = [];
    if (s.compose.button) out.push({ id: 'compose-btn', x: 80, y: 452, w: 220, h: 66 });
    out.push({ id: 'compose-bar', x: 0, y: 70, w: SW, h: 100 });
    return out;
  }
  return [];
}

export interface DrawResult {
  animate: boolean;
  ambient: boolean;
}

export function drawPhoneScreen(
  ctx: CanvasRenderingContext2D,
  s: AppState,
  now: number,
  opts: { active: boolean; reduced: boolean },
): DrawResult {
  const { local } = screenTiming(s, now);

  ctx.save();
  ctx.clearRect(0, 0, SW, SH);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, SW, SH);

  if (s.screen !== 'off') {
    switch (s.screen) {
      case 'launcher':
        drawLauncher(ctx, local);
        break;
      case 'install':
        drawInstall(ctx, s, local);
        break;
      case 'compose':
        drawCompose(ctx, s, local);
        break;
      default:
        // status bar + header shared by app tabs
        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, SW, SH);
        statusBar(ctx);
        text(ctx, 'Kotlin Studio', 36, 140, `600 42px ${SANS}`, C.text, 'left');
        text(ctx, 'app-debug  ·  Kotlin 2.1  ·  minSdk 26', 36, 176, `400 20px ${MONO}`, C.text3, 'left');
        drawKMark(ctx, SW - 96, 100, 60, 18);
        if (s.tab === 'builds') drawBuilds(ctx, s, local);
        else if (s.tab === 'insights') drawInsights(ctx, s, local);
        else drawRun(ctx, s, local);
        bottomNav(ctx, s.tab, 1256);
    }
  }

  ctx.restore();

  const ambient =
    opts.active &&
    !opts.reduced &&
    (s.screen === 'launcher' || (s.screen === 'app' && local < 3) || (s.screen === 'install' && s.progress < 1));

  return { animate: entranceActive(local, s), ambient };
}

function entranceActive(local: number, s: AppState) {
  if (local > 3) return false;
  if (s.screen === 'app' || s.screen === 'compose' || s.screen === 'launcher') return true;
  return s.screen === 'install' && s.progress < 1;
}
