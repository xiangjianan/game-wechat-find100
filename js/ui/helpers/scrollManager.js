export class ScrollManager {
  constructor(options = {}) {
    this.offset = options.initialOffset || 0;
    this.velocity = 0;
    this.friction = options.friction || 0.95;
    this.minVelocity = options.minVelocity || 0.5;
    this.maxOffset = options.maxOffset || 0;

    this.touchStartY = 0;
    this.lastTouchY = 0;
    this.isTouching = false;
    this.lastScrollDelta = 0;
    this.lastScrollTime = 0;
  }

  setMaxOffset(max) {
    this.maxOffset = Math.max(0, max);
  }

  handleTouchStart(y) {
    this.touchStartY = y;
    this.lastTouchY = y;
    this.isTouching = true;
    this.velocity = 0;
    this.lastScrollTime = Date.now();
  }

  handleTouchMove(y) {
    if (!this.isTouching) return;
    const delta = this.lastTouchY - y;
    const now = Date.now();
    const timeDelta = now - this.lastScrollTime;

    if (timeDelta > 0) {
      this.lastScrollDelta = delta / timeDelta;
    }

    this.offset = Math.max(0, Math.min(this.maxOffset, this.offset + delta));
    this.lastTouchY = y;
    this.lastScrollTime = now;
  }

  handleTouchEnd() {
    this.isTouching = false;
    this.velocity = this.lastScrollDelta * 16; // ~60fps
  }

  handleWheel(deltaY) {
    this.offset = Math.max(0, Math.min(this.maxOffset, this.offset + deltaY));
  }

  update(deltaTime) {
    if (this.isTouching) return;

    if (Math.abs(this.velocity) > this.minVelocity) {
      this.offset += this.velocity * deltaTime * 60;
      this.velocity *= this.friction;
      this.offset = Math.max(0, Math.min(this.maxOffset, this.offset));
    } else {
      this.velocity = 0;
    }
  }
}
