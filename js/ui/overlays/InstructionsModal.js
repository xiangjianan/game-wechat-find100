import { roundRect } from '../helpers/drawing.js';
import { getColorScheme } from '../../constants/colors.js';

function lightenColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export class InstructionsModal {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this._visible = false;
    this.animation = 0;
    this.breathTime = 0;

    this.hoveredButton = null;
    this.clickedButton = null;
    this.onPlayClickSound = null;
    this.onConfirm = null;
  }

  getScheme() {
    return getColorScheme();
  }

  _drawBrutalismRect(ctx, x, y, width, height, fillColor, options = {}) {
    const scheme = this.getScheme();
    const radius = options.radius !== undefined ? options.radius : 12;

    if (options.shadowOffset > 0) {
      ctx.shadowColor = scheme.shadow;
      ctx.shadowBlur = options.shadowOffset * 2;
      ctx.shadowOffsetY = options.shadowOffset;
    }

    ctx.fillStyle = fillColor;
    roundRect(ctx, x, y, width, height, radius);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = 'transparent';

    if (options.borderWidth > 0) {
      ctx.strokeStyle = scheme.glassBorder;
      ctx.lineWidth = options.borderWidth;
      roundRect(ctx, x, y, width, height, radius);
      ctx.stroke();
    }
  }

  show() {
    this._visible = true;
    this.animation = 0;
    this.breathTime = 0;
  }

  hide() {
    this._visible = false;
  }

  isVisible() {
    return this._visible;
  }

  setVisible(v) {
    this._visible = v;
    if (v) {
      this.animation = 0;
      this.breathTime = 0;
    }
  }

  update(deltaTime) {
    if (this._visible && this.animation < 1) {
      this.animation = Math.min(1, this.animation + deltaTime * 5);
    }
    this.breathTime += deltaTime;
  }

  render(ctx) {
    if (!this._visible) return;

    const scheme = this.getScheme();
    const isMobile = this.width < 768;

    ctx.fillStyle = `rgba(0, 0, 0, 0.7)`;
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? Math.min(360, this.width - 40) : 480;
    const modalHeight = isMobile ? 480 : 540;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    this._drawBrutalismRect(ctx, modalX, modalY, modalWidth, modalHeight, scheme.cardBg, {
      shadowOffset: 10,
      borderWidth: 5
    });

    // Title "游戏规则" with colored underline
    const titleY = modalY + (isMobile ? 50 : 60);
    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 28 : 34}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏规则', this.width / 2, titleY);

    const titleWidth = ctx.measureText('游戏规则').width;
    ctx.strokeStyle = scheme.buttonPrimary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.width / 2 - titleWidth / 2 - 20, titleY + 25);
    ctx.lineTo(this.width / 2 + titleWidth / 2 + 20, titleY + 25);
    ctx.stroke();

    // 3 numbered rule items
    const ruleStartY = titleY + 55;
    const ruleLineHeight = isMobile ? 55 : 65;
    const rulePadding = isMobile ? 20 : 30;

    const rules = [
      {
        num: '1',
        title: '按顺序点击数字',
        desc: '从 1 开始，依次点击屏幕上的数字'
      },
      {
        num: '2',
        title: '限时模式规则',
        desc: '答对 +5秒，点错 -5秒'
      },
      {
        num: '3',
        title: '连击加分',
        desc: '连续答对获得连击奖励'
      }
    ];

    rules.forEach((rule, index) => {
      const ruleY = ruleStartY + index * ruleLineHeight;
      const numSize = isMobile ? 28 : 32;
      const numX = modalX + rulePadding;
      const numCenterX = numX + numSize / 2;
      const numCenterY = ruleY + numSize / 2;

      // Number circle
      ctx.fillStyle = scheme.buttonPrimary;
      ctx.beginPath();
      ctx.arc(numCenterX, numCenterY, numSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = scheme.textLight;
      ctx.font = `bold ${isMobile ? 16 : 18}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rule.num, numCenterX, numCenterY);

      // Rule title
      const textX = numX + numSize + (isMobile ? 12 : 16);
      ctx.fillStyle = scheme.text;
      ctx.font = `bold ${isMobile ? 16 : 18}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(rule.title, textX, ruleY + 2);

      // Rule description
      ctx.fillStyle = scheme.textSecondary;
      ctx.font = `${isMobile ? 12 : 14}px Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      if (rule.num === '2') {
        // Highlight penalty in red for rule 2
        const descY = ruleY + (isMobile ? 22 : 26);
        const parts = rule.desc.split('点错');
        ctx.fillStyle = scheme.textSecondary;
        ctx.fillText(parts[0], textX, descY);
        const part0Width = ctx.measureText(parts[0]).width;
        ctx.fillStyle = '#EF4444';
        ctx.fillText('点错', textX + part0Width, descY);
        const penaltyWidth = ctx.measureText('点错').width;
        ctx.fillStyle = scheme.textSecondary;
        ctx.fillText(parts[1], textX + part0Width + penaltyWidth, descY);
      } else {
        ctx.fillText(rule.desc, textX, ruleY + (isMobile ? 22 : 26));
      }
    });

    // Two mode cards side by side
    const modesY = ruleStartY + rules.length * ruleLineHeight + (isMobile ? 15 : 20);
    const modeGap = isMobile ? 12 : 16;
    const modePadding = isMobile ? 20 : 30;
    const modeWidth = (modalWidth - modePadding * 2 - modeGap) / 2;
    const modeHeight = isMobile ? 80 : 100;
    const leftModeX = modalX + modePadding;
    const rightModeX = leftModeX + modeWidth + modeGap;

    const modes = [
      { title: '限时模式', desc: '答对 +5秒，点错 -5秒', color: scheme.buttonPrimary, x: leftModeX },
      { title: '自由模式', desc: '无时间限制，自由探索', color: scheme.accent, x: rightModeX }
    ];

    modes.forEach(mode => {
      this._drawBrutalismRect(ctx, mode.x, modesY, modeWidth, modeHeight, mode.color, {
        shadowOffset: 4,
        borderWidth: 3
      });

      ctx.font = `bold ${isMobile ? 20 : 24}px "Arial Black", Arial, sans-serif`;
      ctx.fillStyle = scheme.textLight;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mode.title, mode.x + modeWidth / 2, modesY + modeHeight * 0.4);

      ctx.font = `bold ${isMobile ? 12 : 14}px Arial, sans-serif`;
      ctx.fillStyle = scheme.textLight;
      ctx.fillText(mode.desc, mode.x + modeWidth / 2, modesY + modeHeight * 0.7);
    });

    // "知道了" confirmation button with breathing animation
    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const buttonX = (this.width - buttonWidth) / 2;
    const buttonY = modalY + modalHeight - (isMobile ? 80 : 90);

    const isHovered = this.hoveredButton === 'instructions_ok';
    const isClicked = this.clickedButton === 'instructions_ok';

    const breathScale = 1 + Math.sin(this.breathTime * 2) * 0.015;

    let fillColor = scheme.buttonPrimary;
    if (isHovered) {
      fillColor = lightenColor(scheme.buttonPrimary, 0.15);
    }

    let scale = breathScale;
    if (isHovered) scale = breathScale * 1.02;
    if (isClicked) scale = 0.95;

    const scaledWidth = buttonWidth * scale;
    const scaledHeight = buttonHeight * scale;
    const scaledX = (this.width - scaledWidth) / 2;
    const scaledY = buttonY + (buttonHeight - scaledHeight) / 2;

    const shadowOffset = isClicked ? 2 : (isHovered ? 8 : 6);
    this._drawBrutalismRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, fillColor, {
      shadowOffset: shadowOffset,
      borderWidth: 4
    });

    ctx.fillStyle = scheme.textLight;
    ctx.font = `bold ${isMobile ? 18 : 20}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('知道了', this.width / 2, scaledY + scaledHeight / 2);
  }

  handleClick(x, y) {
    if (!this._visible) return false;

    const isMobile = this.width < 768;
    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const modalWidth = isMobile ? Math.min(360, this.width - 40) : 480;
    const modalHeight = isMobile ? 480 : 540;
    const modalY = (this.height - modalHeight) / 2;
    const buttonX = (this.width - buttonWidth) / 2;
    const buttonY = modalY + modalHeight - (isMobile ? 80 : 90);

    if (x >= buttonX && x <= buttonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight) {
      this.clickedButton = 'instructions_ok';
      if (this.onPlayClickSound) {
        this.onPlayClickSound();
      }
      setTimeout(() => {
        this.clickedButton = null;
        this._visible = false;
        this.hoveredButton = null;
        if (this.onConfirm) {
          this.onConfirm();
        }
      }, 150);
      return true;
    }
    return true;
  }
}
