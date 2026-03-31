// Linear interpolation
export function lerp(start, end, t) { return start + (end - start) * t; }

// Easing functions
export function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
export function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
}
export function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

// Spring physics for smooth animations
export function springUpdate(current, target, velocity, stiffness = 0.15, damping = 0.8) {
  const force = (target - current) * stiffness;
  const newVelocity = (velocity + force) * damping;
  const newValue = current + newVelocity;
  const settled = Math.abs(newValue - target) < 0.001 && Math.abs(newVelocity) < 0.001;
  return { value: settled ? target : newValue, velocity: newVelocity, settled };
}

// Clamp utility
export function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
