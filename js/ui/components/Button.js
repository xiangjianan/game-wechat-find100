import { roundRect, drawIcon, lightenColor } from '../helpers/drawing.js';
import { getColorScheme } from '../../constants/colors.js';

export class ButtonRenderer {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  draw(ctx, button, isHovered, isPressed, alpha) {
    if (button.type === 'card') {
      this.drawCard(ctx, button, isHovered, isPressed, alpha);
    } else {
      this.drawPrimary(ctx, button, isHovered, isPressed, alpha);
    }
  }

  drawPrimary(ctx, button, isHovered, isPressed, alpha = 1) {
    const isMobile = this.width < 768;

    let scale = 1;
    if (isPressed) {
      scale = 0.95;
    } else if (isHovered) {
      scale = 1.01;
    }

    const centerX = button.x + button.width / 2;
    const centerY = button.y + button.height / 2;
    const scaledWidth = button.width * scale;
    const scaledHeight = button.height * scale;
    const scaledX = centerX - scaledWidth / 2;
    const scaledY = centerY - scaledHeight / 2;
    const radius = 22;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Vibrant glow shadow
    const isGlowing = isHovered || isPressed;
    ctx.shadowColor = isGlowing ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.3)';
    ctx.shadowBlur = isGlowing ? 32 : 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = isGlowing ? 8 : 4;

    // Vibrant gradient
    const gradient = ctx.createLinearGradient(scaledX, scaledY, scaledX + scaledWidth, scaledY + scaledHeight);
    const startColor = isPressed ? lightenColor(button.color || '#6366F1', 0.08) : (button.color || '#6366F1');
    const endColor = isPressed ? lightenColor(button.colorEnd || '#8B5CF6', 0.08) : (button.colorEnd || '#8B5CF6');
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    ctx.fillStyle = gradient;
    roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, radius);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowColor = 'transparent';

    // Top gloss
    const shineGradient = ctx.createLinearGradient(scaledX, scaledY, scaledX, scaledY + scaledHeight * 0.5);
    shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shineGradient;
    ctx.fillRect(scaledX + 1, scaledY + 1, scaledWidth - 2, scaledHeight * 0.55);

    // Bottom edge glow
    const bottomShine = ctx.createLinearGradient(scaledX, scaledY + scaledHeight * 0.7, scaledX, scaledY + scaledHeight);
    bottomShine.addColorStop(0, 'rgba(255, 255, 255, 0)');
    bottomShine.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
    ctx.fillStyle = bottomShine;
    ctx.fillRect(scaledX + 1, scaledY + scaledHeight * 0.7, scaledWidth - 2, scaledHeight * 0.3 - 1);

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${isMobile ? 18 : 20}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (button.icon === 'play') {
      const textWidth = ctx.measureText(button.text).width;
      const textX = centerX - 12;
      const iconX = centerX + textWidth / 2 + 10;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;

      ctx.fillText(button.text, textX, centerY);

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = 'transparent';

      ctx.beginPath();
      ctx.moveTo(iconX, centerY - 8);
      ctx.lineTo(iconX + 13, centerY);
      ctx.lineTo(iconX, centerY + 8);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
    } else {
      ctx.fillText(button.text, centerX, centerY);
    }

    ctx.restore();
  }

  drawCard(ctx, button, isHovered, isPressed, alpha = 1) {
    const isMobile = this.width < 768;
    const isWideCard = button.width > button.height * 2;

    let scale = 1;
    if (isPressed) {
      scale = 0.95;
    } else if (isHovered) {
      scale = 1.02;
    }

    const scaledWidth = button.width * scale;
    const scaledHeight = button.height * scale;
    const scaledX = button.x + (button.width - scaledWidth) / 2;
    const scaledY = button.y + (button.height - scaledHeight) / 2;
    const radius = 20;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Card shadow with theme-colored glow on hover
    if (isHovered || isPressed) {
      ctx.shadowColor = button.cardHoverGlow || 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
    }

    // Card background
    ctx.fillStyle = button.cardBg || 'rgba(255, 255, 255, 0.9)';
    roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, radius);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = 'transparent';

    // Gloss effect - subtle top shine using fillRect (safe)
    const cardShine = ctx.createLinearGradient(scaledX, scaledY, scaledX, scaledY + scaledHeight * 0.4);
    cardShine.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    cardShine.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    cardShine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = cardShine;
    ctx.fillRect(scaledX + 1, scaledY + 1, scaledWidth - 2, scaledHeight * 0.4);

    // Colored border
    ctx.strokeStyle = button.cardBorder || 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, radius);
    ctx.stroke();

    // Wide card: horizontal layout (icon left, text center)
    if (isWideCard) {
      const iconSize = isMobile ? 32 : 36;
      const iconX = scaledX + (isMobile ? 14 : 18);
      const iconY = scaledY + (scaledHeight - iconSize) / 2;

      ctx.fillStyle = button.iconBg || '#F3F4F6';
      roundRect(ctx, iconX, iconY, iconSize, iconSize, iconSize / 2);
      ctx.fill();

      ctx.fillStyle = button.iconColor || '#8B5CF6';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const iconCenterX = iconX + iconSize / 2;
      const iconCenterY = iconY + iconSize / 2;

      drawIcon(ctx, button.icon, iconCenterX, iconCenterY, isMobile, button.iconColor);

      ctx.fillStyle = '#0F172A';
      ctx.font = `600 ${isMobile ? 15 : 17}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, scaledX + scaledWidth / 2 + iconSize / 4, scaledY + scaledHeight / 2);

      ctx.restore();
      return;
    }

    // Square card: vertical layout (icon top, text bottom)
    const iconSize = isMobile ? 40 : 48;
    const iconX = scaledX + (scaledWidth - iconSize) / 2;
    const iconY = scaledY + (isMobile ? 16 : 18);

    ctx.fillStyle = button.iconBg || '#F3F4F6';
    roundRect(ctx, iconX, iconY, iconSize, iconSize, iconSize / 2);
    ctx.fill();

    // Draw icon
    ctx.fillStyle = button.iconColor || '#6366F1';
    ctx.font = `bold ${isMobile ? 20 : 24}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const iconCenterX = iconX + iconSize / 2;
    const iconCenterY = iconY + iconSize / 2;

    drawIcon(ctx, button.icon, iconCenterX, iconCenterY, isMobile, button.iconColor);

    // Title - centered below icon (square card vertical layout)
    const textY = iconY + iconSize + (isMobile ? 14 : 16);
    ctx.fillStyle = '#0F172A';
    ctx.font = `600 ${isMobile ? 14 : 16}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.text, scaledX + scaledWidth / 2, textY);

    // Subtitle - centered below title
    if (button.subtitle) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = `${isMobile ? 11 : 12}px Arial, sans-serif`;
      ctx.fillText(button.subtitle, scaledX + scaledWidth / 2, textY + (isMobile ? 16 : 18));
    }

    ctx.restore();
  }
}
