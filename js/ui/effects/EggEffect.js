import { getColorScheme } from '../../constants/colors.js';
import { drawBrutalismRect } from '../helpers/drawing.js';

export default class EggEffectManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.eggTriggered = false;
    this.eggTriggerTime = 0;
    this.eggTriggerDuration = 5.0;
    this.eggCloseButton = null;
  }

  trigger() {
    this.eggTriggered = true;
    this.eggTriggerTime = 0;
  }

  isActive() {
    return this.eggTriggered;
  }

  getCloseButtonBounds() {
    return this.eggCloseButton;
  }

  close() {
    this.eggTriggered = false;
    this.eggTriggerTime = 0;
    this.eggCloseButton = null;
  }

  update(deltaTime) {
    if (!this.eggTriggered) return;

    this.eggTriggerTime += deltaTime;
  }

  render(ctx) {
    if (!this.eggTriggered) return;

    const scheme = getColorScheme();
    const isMobile = this.width < 768;
    const t = this.eggTriggerTime;

    let alpha = Math.min(1, this.eggTriggerTime / 0.3);

    ctx.save();
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Soft full-screen glow using game theme colors
    const glowAlpha = alpha * 0.25 * (0.8 + Math.sin(t * 3) * 0.2);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(this.width, this.height) * 0.6);
    gradient.addColorStop(0, `rgba(99, 102, 241, ${glowAlpha})`);
    gradient.addColorStop(0.4, `rgba(139, 92, 246, ${glowAlpha * 0.5})`);
    gradient.addColorStop(1, `rgba(99, 102, 241, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Orbiting particles expanding from center, using theme colors
    const particleCount = 16;
    for (let i = 0; i < particleCount; i++) {
      const baseAngle = (i / particleCount) * Math.PI * 2;
      const angle = baseAngle + t * 0.8;
      const expandPhase = Math.min(1, this.eggTriggerTime / 0.3);
      const radius = 30 + expandPhase * (60 + i * 3) + Math.sin(t * 2 + i) * 15;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const size = (2 + Math.sin(t * 4 + i * 1.5) * 1) * alpha;
      const particleAlpha = alpha * (0.5 + Math.sin(t * 3 + i) * 0.3);

      ctx.globalAlpha = particleAlpha;
      ctx.fillStyle = i % 3 === 0 ? scheme.accent : (i % 3 === 1 ? scheme.secondary : '#FFD700');
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
      ctx.fill();
    }

    // Center card
    ctx.globalAlpha = alpha;
    const cardWidth = isMobile ? 260 : 320;
    const cardHeight = isMobile ? 170 : 190;
    const cardX = centerX - cardWidth / 2;
    const cardY = centerY - cardHeight / 2;

    // Card background
    drawBrutalismRect(ctx, scheme, cardX, cardY, cardWidth, cardHeight, scheme.cardBg, {
      shadowOffset: 6,
      borderWidth: 3
    });

    // Top color bar
    const barColors = [scheme.primary, scheme.secondary, scheme.accent];
    const barWidth = cardWidth / 3;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = barColors[i];
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillRect(cardX + 3 + i * barWidth, cardY + 3, barWidth, 4);
    }

    ctx.globalAlpha = alpha;

    // Title
    ctx.fillStyle = scheme.primary;
    ctx.font = `bold ${isMobile ? 16 : 20}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('你发现了隐藏彩蛋！', centerX, cardY + cardHeight * 0.16);

    // Body text
    ctx.fillStyle = scheme.text;
    ctx.font = `${isMobile ? 11 : 13}px Arial, sans-serif`;
    ctx.fillText('感谢你花时间游玩这个小游戏', centerX, cardY + cardHeight * 0.34);

    // Developer signature
    ctx.fillStyle = scheme.textSecondary;
    ctx.font = `${isMobile ? 10 : 12}px Arial, sans-serif`;
    ctx.fillText('—— xiangjianan', centerX, cardY + cardHeight * 0.50);

    // Reward text
    ctx.fillStyle = scheme.buttonSuccess;
    ctx.font = `bold ${isMobile ? 14 : 18}px "Arial Black", Arial, sans-serif`;
    ctx.fillText('+100,000 coins', centerX, cardY + cardHeight * 0.65);

    // Close button
    const closeBtnWidth = isMobile ? 120 : 140;
    const closeBtnHeight = isMobile ? 32 : 36;
    const closeBtnX = centerX - closeBtnWidth / 2;
    const closeBtnY = cardY + cardHeight - closeBtnHeight - 12;
    drawBrutalismRect(ctx, scheme, closeBtnX, closeBtnY, closeBtnWidth, closeBtnHeight, scheme.primary, {
      shadowOffset: 3,
      borderWidth: 2
    });
    this.eggCloseButton = { x: closeBtnX, y: closeBtnY, width: closeBtnWidth, height: closeBtnHeight };
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isMobile ? 13 : 15}px Arial, sans-serif`;
    ctx.fillText('我知道了', centerX, closeBtnY + closeBtnHeight / 2);

    ctx.restore();
  }
}
