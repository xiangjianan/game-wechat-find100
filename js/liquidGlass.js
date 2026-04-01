import { getCanvas, getContext, getDevicePixelRatio } from './render';

// ─── Offscreen Canvas Pool ───────────────────────────────────────────
// Reuse offscreen canvases to avoid GC pressure

const canvasPool = [];
const MAX_POOL = 4;

function acquireCanvas(w, h) {
  const dpr = getDevicePixelRatio();
  const pw = Math.ceil(w * dpr);
  const ph = Math.ceil(h * dpr);

  for (let i = 0; i < canvasPool.length; i++) {
    const c = canvasPool[i];
    if (c.width >= pw && c.height >= ph) {
      canvasPool.splice(i, 1);
      c.width = pw;
      c.height = ph;
      const cCtx = c.getContext('2d');
      cCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { canvas: c, ctx: cCtx };
    }
  }

  const c = document.createElement('canvas');
  c.width = pw;
  c.height = ph;
  const cCtx = c.getContext('2d');
  cCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { canvas: c, ctx: cCtx };
}

function releaseCanvas(entry) {
  if (canvasPool.length < MAX_POOL) {
    canvasPool.push(entry.canvas);
  }
}

// ─── Backdrop Blur ───────────────────────────────────────────────────
// Captures the region behind a glass panel and draws it blurred,
// simulating the backdrop-filter: blur() effect.

export function drawBackdropBlur(ctx, x, y, width, height, options = {}) {
  const radius = options.radius || 0;
  const blurPx = options.blur || 12;
  const saturation = options.saturation || 140;
  const mainCanvas = getCanvas();
  const dpr = getDevicePixelRatio();

  // Acquire an offscreen canvas sized to the panel region
  const off = acquireCanvas(width + 2, height + 2);

  // Copy the background region from main canvas
  off.ctx.clearRect(0, 0, width + 2, height + 2);
  off.ctx.save();
  off.ctx.setTransform(1, 0, 0, 1, 0, 0);
  off.ctx.drawImage(
    mainCanvas,
    x * dpr, y * dpr, width * dpr, height * dpr,
    0, 0, width * dpr, height * dpr
  );
  off.ctx.restore();

  // Apply blur filter and saturation boost
  try {
    off.ctx.filter = `blur(${blurPx}px) saturate(${saturation}%)`;
    off.ctx.save();
    off.ctx.setTransform(1, 0, 0, 1, 0, 0);
    off.ctx.drawImage(off.canvas, 0, 0);
    off.ctx.restore();
    off.ctx.filter = 'none';
  } catch (e) {
    // Filter not supported — skip blur
  }

  // Draw blurred backdrop clipped to rounded rect
  ctx.save();
  if (radius > 0) {
    roundRect(ctx, x, y, width, height, radius);
    ctx.clip();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(off.canvas, 0, 0, off.canvas.width, off.canvas.height, x * dpr, y * dpr, width * dpr, height * dpr);
  ctx.restore();

  // Update the main ctx transform back
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  releaseCanvas(off);
}

// ─── Chromatic Aberration ────────────────────────────────────────────
// Simulates RGB channel separation at glass edges by drawing
// color-tinted offset passes.

export function drawChromaticAberration(ctx, x, y, width, height, options = {}) {
  const radius = options.radius || 16;
  const intensity = options.intensity || 2;
  const alpha = options.alpha || 0.15;

  ctx.save();

  // Red channel — offset left/up
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = `rgba(255, 80, 80, ${alpha})`;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x - intensity * 0.5, y - intensity * 0.5, width + intensity, height + intensity, radius);
  ctx.stroke();

  // Blue channel — offset right/down
  ctx.strokeStyle = `rgba(80, 120, 255, ${alpha})`;
  roundRect(ctx, x + intensity * 0.5, y + intensity * 0.5, width - intensity, height - intensity, Math.max(0, radius - intensity));
  ctx.stroke();

  ctx.restore();
}

// ─── Specular Highlight ──────────────────────────────────────────────
// Draws a radial gradient highlight that follows the mouse/touch position,
// simulating light reflection on the glass surface.

export function drawSpecularHighlight(ctx, x, y, width, height, mouseX, mouseY, options = {}) {
  const radius = options.radius || 16;
  const intensity = options.intensity || 0.35;

  // Map mouse position to local highlight position
  const localX = Math.max(x, Math.min(x + width, mouseX));
  const localY = Math.max(y, Math.min(y + height, mouseY));

  // Normalize to 0-1 within the panel
  const nx = (localX - x) / width;
  const ny = (localY - y) / height;

  // Highlight center follows mouse but stays within bounds
  const hlX = x + nx * width;
  const hlY = y + ny * height;
  const hlRadius = Math.max(width, height) * 0.7;

  ctx.save();
  roundRect(ctx, x, y, width, height, radius);
  ctx.clip();

  // Radial specular gradient
  const grad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, hlRadius);
  grad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
  grad.addColorStop(0.3, `rgba(255, 255, 255, ${intensity * 0.3})`);
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, width, height);

  ctx.restore();
}

// ─── Edge Refraction Glow ────────────────────────────────────────────
// Simulates light bending at glass edges by drawing inner glow
// gradients concentrated near the border (SDF-like falloff).

export function drawEdgeRefraction(ctx, x, y, width, height, options = {}) {
  const radius = options.radius || 16;
  const glowSize = options.glowSize || 8;
  const color = options.color || 'rgba(255, 255, 255, 0.5)';
  const innerColor = options.innerColor || 'rgba(255, 255, 255, 0)';

  ctx.save();

  // Top edge glow
  const topGrad = ctx.createLinearGradient(x, y, x, y + glowSize);
  topGrad.addColorStop(0, color);
  topGrad.addColorStop(1, innerColor);
  ctx.fillStyle = topGrad;
  roundRect(ctx, x, y, width, glowSize + 2, radius);
  ctx.fill();

  // Bottom edge glow (subtler)
  const bottomGrad = ctx.createLinearGradient(x, y + height, x, y + height - glowSize * 0.6);
  bottomGrad.addColorStop(0, `rgba(255, 255, 255, 0.15)`);
  bottomGrad.addColorStop(1, innerColor);
  ctx.fillStyle = bottomGrad;
  roundRect(ctx, x, y + height - glowSize * 0.6 - 2, width, glowSize * 0.6 + 2, radius);
  ctx.fill();

  // Left edge glow
  const leftGrad = ctx.createLinearGradient(x, y, x + glowSize * 0.5, y);
  leftGrad.addColorStop(0, `rgba(255, 255, 255, 0.3)`);
  leftGrad.addColorStop(1, innerColor);
  ctx.fillStyle = leftGrad;
  roundRect(ctx, x, y, glowSize * 0.5 + 2, height, radius);
  ctx.fill();

  ctx.restore();
}

// ─── Glass Border with Light Response ────────────────────────────────
// Draws a border that simulates mix-blend-mode: overlay by making
// the top/left edges brighter (catching light) and bottom/right edges
// subtler (in shadow).

export function drawGlassBorder(ctx, x, y, width, height, options = {}) {
  const radius = options.radius || 16;
  const borderWidth = options.width || 1;

  ctx.save();

  // Main border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = borderWidth;
  roundRect(ctx, x + 0.5, y + 0.5, width - 1, height - 1, radius);
  ctx.stroke();

  // Inner subtle border (double-border glass effect)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 0.5;
  roundRect(ctx, x + 3, y + 3, width - 6, height - 6, Math.max(0, radius - 2));
  ctx.stroke();

  // Top edge highlight (brightest — catches light)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y + 0.5);
  ctx.lineTo(x + width - r, y + 0.5);
  ctx.stroke();

  // Left edge highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + 0.5, y + r);
  ctx.lineTo(x + 0.5, y + height - r);
  ctx.stroke();

  ctx.restore();
}

// ─── Spring Physics ──────────────────────────────────────────────────
// Lightweight spring animation for elastic directional scaling.

export class Spring {
  constructor(stiffness = 300, damping = 20) {
    this.stiffness = stiffness;
    this.damping = damping;
    this.value = 0;
    this.velocity = 0;
    this.target = 0;
  }

  setTarget(target) {
    this.target = target;
  }

  update(deltaTime) {
    const force = (this.target - this.value) * this.stiffness;
    const dampingForce = -this.velocity * this.damping;
    this.velocity += (force + dampingForce) * deltaTime;
    this.value += this.velocity * deltaTime;

    // Snap if close enough
    if (Math.abs(this.value - this.target) < 0.001 && Math.abs(this.velocity) < 0.001) {
      this.value = this.target;
      this.velocity = 0;
    }
    return this.value;
  }
}

// ─── Elastic Transform ───────────────────────────────────────────────
// Computes directional scale toward mouse position, inspired by the
// liquid-glass-react calculateDirectionalScale.

export function computeElasticScale(centerX, centerY, width, height, mouseX, mouseY, elasticity = 0.15) {
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const nx = dx / (width * 0.5);
  const ny = dy / (height * 0.5);

  const activationZone = 200;
  const edgeDistX = Math.max(0, Math.abs(dx) - width * 0.5);
  const edgeDistY = Math.max(0, Math.abs(dy) - height * 0.5);
  const edgeDistance = Math.sqrt(edgeDistX * edgeDistX + edgeDistY * edgeDistY);

  if (edgeDistance > activationZone) return { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 };

  const fadeIn = 1 - edgeDistance / activationZone;
  const stretch = elasticity * fadeIn;

  const scaleX = 1 + Math.abs(nx) * stretch * 0.3 - Math.abs(ny) * stretch * 0.15;
  const scaleY = 1 + Math.abs(ny) * stretch * 0.3 - Math.abs(nx) * stretch * 0.15;

  return {
    scaleX: Math.max(0.92, Math.min(1.08, scaleX)),
    scaleY: Math.max(0.92, Math.min(1.08, scaleY)),
    translateX: dx * stretch * 0.05,
    translateY: dy * stretch * 0.05
  };
}

// ─── Draw Liquid Glass Panel (Composite) ─────────────────────────────
// All-in-one method that combines backdrop blur, specular highlight,
// edge refraction, chromatic aberration, and glass border.

export function drawLiquidGlassPanel(ctx, x, y, width, height, options = {}) {
  const radius = options.radius !== undefined ? options.radius : 16;
  const alpha = options.alpha !== undefined ? options.alpha : 0.5;
  const mouseX = options.mouseX || 0;
  const mouseY = options.mouseY || 0;
  const blur = options.blur !== undefined ? options.blur : 10;
  const saturation = options.saturation || 140;
  const aberration = options.aberration !== undefined ? options.aberration : 1.5;
  const hasShadow = options.shadow !== false;
  const noBorder = options.noBorder || false;

  ctx.save();

  // 1. Soft diffused shadow
  if (hasShadow) {
    ctx.shadowColor = 'rgba(99, 102, 241, 0.08)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
  }

  // 2. Backdrop blur — capture and blur the region behind the panel
  drawBackdropBlur(ctx, x, y, width, height, { radius, blur, saturation });

  // 3. Semi-transparent glass fill
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  roundRect(ctx, x, y, width, height, radius);
  ctx.fill();

  // 4. Inner gradient for glass depth
  const shineGrad = ctx.createLinearGradient(x, y, x, y + height);
  shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  shineGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)');
  shineGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.0)');
  shineGrad.addColorStop(1, 'rgba(0, 0, 0, 0.03)');
  ctx.fillStyle = shineGrad;
  roundRect(ctx, x, y, width, height, radius);
  ctx.fill();

  // 5. Specular highlight (mouse-reactive)
  drawSpecularHighlight(ctx, x, y, width, height, mouseX, mouseY, { radius, intensity: 0.2 });

  // 6. Edge refraction glow
  drawEdgeRefraction(ctx, x, y, width, height, { radius, glowSize: 6 });

  // 7. Chromatic aberration at edges
  if (aberration > 0) {
    drawChromaticAberration(ctx, x, y, width, height, { radius, intensity: aberration, alpha: 0.08 });
  }

  // 8. Glass border
  if (!noBorder) {
    drawGlassBorder(ctx, x, y, width, height, { radius });
  }

  ctx.restore();
}

// ─── Rounded Rect Helper ─────────────────────────────────────────────

function roundRect(ctx, x, y, width, height, radius) {
  if (radius === 0) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.closePath();
    return;
  }
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
