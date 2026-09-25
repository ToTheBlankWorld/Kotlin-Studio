import * as THREE from 'three';

export const PHONE = {
  w: 0.74,
  h: 1.56,
  d: 0.086,
  r: 0.12,
  bezel: 0.028,
};

export function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const x = -w / 2;
  const y = -h / 2;
  const rad = Math.min(r, w / 2, h / 2);
  const s = new THREE.Shape();
  s.moveTo(x + rad, y);
  s.lineTo(x + w - rad, y);
  s.absarc(x + w - rad, y + rad, rad, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - rad);
  s.absarc(x + w - rad, y + h - rad, rad, 0, Math.PI / 2, false);
  s.lineTo(x + rad, y + h);
  s.absarc(x + rad, y + h - rad, rad, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + rad);
  s.absarc(x + rad, y + rad, rad, Math.PI, Math.PI * 1.5, false);
  s.closePath();
  return s;
}

/**
 * A rounded slab: rounded rectangle profile extruded with a bevel, normalised
 * so the final bounding box matches the requested width/height/depth exactly.
 */
export function slabGeometry(w: number, h: number, d: number, r: number, bevel = 0.012) {
  const b = Math.min(bevel, d / 2 - 0.001, w / 2 - 0.001, h / 2 - 0.001);
  const shape = roundedRectShape(w - 2 * b, h - 2 * b, Math.max(0.0005, r - b));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, d - 2 * b),
    bevelEnabled: b > 0.0006,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 3,
    curveSegments: 16,
    steps: 1,
  });
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const sz = d / Math.max(0.0001, bb.max.z - bb.min.z);
  geo.scale(1, 1, sz);
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

export function roundedPlane(w: number, h: number, r: number) {
  const shape = roundedRectShape(w, h, r);
  const geo = new THREE.ShapeGeometry(shape, 24);
  // normalise uvs to 0..1
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + w / 2) / w;
    uv[i * 2 + 1] = (pos.getY(i) + h / 2) / h;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

/** Equirectangular studio environment: soft light strips on a dark stage. */
export function createStudioCanvas(w = 1024, h = 512): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#1b1f2a');
  bg.addColorStop(0.45, '#0c0e13');
  bg.addColorStop(1, '#040406');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const strip = (
    cx: number,
    cy: number,
    rw: number,
    rh: number,
    color: string,
    alpha: number,
  ) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rw, rh));
    g.addColorStop(0, color);
    g.addColorStop(0.45, color.replace('rgb', 'rgba').replace(')', `,${alpha * 0.55})`));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rw / Math.max(rw, rh), rh / Math.max(rw, rh));
    ctx.translate(-cx, -cy);
    ctx.fillStyle = g;
    ctx.fillRect(cx - rw, cy - rh, rw * 2, rh * 2);
    ctx.restore();
    void alpha;
  };

  // key softbox (front-top)
  strip(w * 0.3, h * 0.2, 260, 120, 'rgb(255,255,255)', 1);
  // fill
  strip(w * 0.72, h * 0.3, 300, 150, 'rgb(214,224,255)', 0.75);
  // purple rim
  strip(w * 0.9, h * 0.55, 220, 260, 'rgb(150,110,255)', 0.8);
  // warm rim
  strip(w * 0.08, h * 0.6, 200, 240, 'rgb(255,150,90)', 0.5);
  // floor bounce
  strip(w * 0.5, h * 0.92, 420, 120, 'rgb(90,110,180)', 0.4);

  return c;
}

/** Soft radial sprite used for the halo behind the phone. */
export function createGlowTexture(size = 256, color = '160,120,255'): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${color},0.55)`);
  g.addColorStop(0.4, `rgba(${color},0.18)`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

/** Round soft dot for the particle field. */
export function createDotTexture(size = 64): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}
