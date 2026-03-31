import { getColorScheme } from '../../constants/colors.js';
import { roundRect, drawBrutalismRect } from '../helpers/drawing.js';

export default class ComboDisplay {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.comboData = {
      count: 0,
      level: null,
      animation: 0,
      scale: 1,
      glowIntensity: 0,
      breakAnimation: 0
    };
    this.comboParticles = [];
  }

  updateCombo(count, level) {
    const previousCount = this.comboData.count;
    const previousLevel = this.comboData.level;

    this.comboData.count = count;
    this.comboData.level = level;

    if (count > 0) {
      this.comboData.animation = Math.min(1, this.comboData.animation + 0.1);
      this.comboData.scale = 1.2;
      this.comboData.glowIntensity = level ? 1 : 0.5;

      if (count >= 5 && count !== previousCount) {
        this._createComboParticles(level, count);
        this.comboData.scale = 1.4;
      }
    } else {
      this.comboData.animation = Math.max(0, this.comboData.animation - 0.1);
      this.comboData.glowIntensity = 0;
    }

    if (level && level !== previousLevel) {
      this.onFlashScreen(level.color, 0.3);
    }
  }

  onComboLevelUp(level, count) {
    this.comboData.scale = 1.6;
    this._createComboParticles(level, count);
    this.onFlashScreen(level.color, 0.4);
  }

  onComboBreak(count, level) {
    this.comboData.breakAnimation = 1;
    this.comboData.count = 0;
    this.comboData.level = null;
  }

  onFlashScreen(color, intensity) {
    // External callback, set by the orchestrator
    if (typeof this._onFlashScreen === 'function') {
      this._onFlashScreen(color, intensity);
    }
  }

  triggerHintButtonAnimation() {
    // Noop - managed by GameHUD
  }

  _createComboParticles(level, count) {
    const particleCount = Math.min(count || 5, 15);
    const color = level ? level.color : '#FFD700';

    const maxParticles = 50;
    if (this.comboParticles.length >= maxParticles) {
      this.comboParticles.splice(0, particleCount);
    }

    for (let i = 0; i < particleCount; i++) {
      this.comboParticles.push({
        x: this.width / 2 + (Math.random() - 0.5) * 100,
        y: this.height / 3 + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12 - 3,
        size: Math.random() * 10 + 5,
        color: color,
        alpha: 1,
        life: 1
      });
    }
  }

  update(deltaTime) {
    if (this.comboData.scale > 1) {
      this.comboData.scale = Math.max(1, this.comboData.scale - deltaTime * 2);
    }

    if (this.comboData.breakAnimation > 0) {
      this.comboData.breakAnimation = Math.max(0, this.comboData.breakAnimation - deltaTime * 3);
    }

    for (let i = this.comboParticles.length - 1; i >= 0; i--) {
      const particle = this.comboParticles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.3;
      particle.life -= deltaTime * 2;
      particle.alpha = particle.life;

      if (particle.life <= 0) {
        this.comboParticles.splice(i, 1);
      }
    }
  }

  render(ctx, gameState) {
    const count = this.comboData.count;
    if (count < 2) return;

    const scheme = getColorScheme();
    const isMobile = this.width < 768;
    const centerX = this.width / 2;
    const centerY = this._getComboCenterY(isMobile);
    const level = this.comboData.level;
    const color = level ? level.color : scheme.accent;
    const scale = this.comboData.scale;

    if (count >= 5) {
      // Full combo display with escalating colors and particles
      this._renderFullCombo(ctx, scheme, isMobile, centerX, centerY, level, color, scale);
    } else {
      // Subtle pill for 2-4 combo
      this._renderSubtlePill(ctx, scheme, isMobile, centerX, centerY, color);
    }
  }

  _getComboCenterY(isMobile) {
    const topSafeArea = Math.max(44, isMobile ? 44 : 0);
    const headerHeight = isMobile ? Math.max(100, topSafeArea + 56) : 120;
    return headerHeight + (isMobile ? 20 : 24);
  }

  _renderSubtlePill(ctx, scheme, isMobile, centerX, centerY, color) {
    ctx.save();
    ctx.globalAlpha = 0.75;

    const boxWidth = isMobile ? 60 : 72;
    const boxHeight = isMobile ? 22 : 26;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;

    drawBrutalismRect(ctx, scheme, boxX, boxY, boxWidth, boxHeight, color, {
      shadowOffset: 2,
      borderWidth: 1
    });

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isMobile ? 11 : 13}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.comboData.count}连击`, centerX, centerY);

    ctx.restore();
  }

  _renderFullCombo(ctx, scheme, isMobile, centerX, centerY, level, color, scale) {
    ctx.save();
    ctx.globalAlpha = 0.85;

    if (this.comboData.glowIntensity > 0) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12 * this.comboData.glowIntensity;
    }

    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    const boxWidth = isMobile ? 80 : 100;
    const boxHeight = isMobile ? 28 : 32;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;

    drawBrutalismRect(ctx, scheme, boxX, boxY, boxWidth, boxHeight, color, {
      shadowOffset: 3,
      borderWidth: 2
    });

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isMobile ? 13 : 15}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (level) {
      ctx.fillText(`${this.comboData.count}连击·${level.name}`, centerX, centerY);
    } else {
      ctx.fillText(`${this.comboData.count}连击`, centerX, centerY);
    }

    ctx.restore();

    this._renderComboParticles(ctx);

    if (this.comboData.breakAnimation > 0) {
      this._renderComboBreakEffect(ctx);
    }
  }

  _renderComboParticles(ctx) {
    for (const particle of this.comboParticles) {
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _renderComboBreakEffect(ctx) {
    const alpha = this.comboData.breakAnimation;
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
}
