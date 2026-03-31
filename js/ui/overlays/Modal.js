import { roundRect } from '../helpers/drawing.js';
import { getColorScheme } from '../../constants/colors.js';

function lightenColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export class ModalManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.showModal = false;
    this.modalType = null;
    this.modalTitle = '';
    this.modalMessage = '';
    this.modalButtons = [];
    this.modalAnimation = 0;
    this.modalTargetAnimation = 1;
    this.modalSoundPlayed = false;

    this.hoveredButton = null;
    this.clickedButton = null;
    this.onPlayClickSound = null;
    this.soundManager = null;
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

  show(type, title, message, buttons) {
    this.showModal = true;
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalButtons = buttons;
    this.modalAnimation = 0;
    this.modalTargetAnimation = 1;
    this.modalSoundPlayed = false;
  }

  hide() {
    this.modalTargetAnimation = 0;
  }

  update(deltaTime) {
    if (this.showModal) {
      if (this.modalAnimation < this.modalTargetAnimation) {
        this.modalAnimation += deltaTime * 5;
        if (this.modalAnimation > this.modalTargetAnimation) {
          this.modalAnimation = this.modalTargetAnimation;
        }
      } else if (this.modalAnimation > this.modalTargetAnimation) {
        this.modalAnimation -= deltaTime * 5;
        if (this.modalAnimation < this.modalTargetAnimation) {
          this.modalAnimation = this.modalTargetAnimation;
        }
      }

      if (this.modalAnimation <= 0 && this.modalTargetAnimation === 0) {
        this.showModal = false;
      }
    }
  }

  isOpen() {
    return this.showModal;
  }

  render(ctx) {
    const scheme = this.getScheme();
    const isMobile = this.width < 768;
    const alpha = this.modalAnimation;
    const scale = 0.85 + 0.15 * alpha;

    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? Math.min(360, this.width - 40) : 440;
    const hasScoreInMessage = this.modalMessage && this.modalMessage.includes('得分');
    const buttonCount = this.modalButtons ? this.modalButtons.length : 0;
    const extraButtonHeight = Math.max(0, buttonCount - 2) * (isMobile ? 62 : 74);
    let modalHeight;

    if (this.modalType === 'gameComplete') {
      modalHeight = (isMobile ? 400 : 460) + extraButtonHeight;
    } else if (this.modalType === 'gameFailed') {
      modalHeight = (hasScoreInMessage ? (isMobile ? 480 : 540) : (isMobile ? 380 : 420)) + extraButtonHeight;
    } else if (this.modalType === 'resetConfirm') {
      modalHeight = isMobile ? 580 : 650;
    } else {
      modalHeight = (isMobile ? 280 : 310) + extraButtonHeight;
    }

    const maxModalHeight = this.height - 40;
    if (modalHeight > maxModalHeight) modalHeight = maxModalHeight;

    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-this.width / 2, -this.height / 2);

    this._drawBrutalismRect(ctx, modalX, modalY, modalWidth, modalHeight, scheme.cardBg, {
      shadowOffset: 10,
      borderWidth: 5
    });

    if (this.modalType === 'gameComplete') {
      this.renderCompletionContent(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    } else if (this.modalType === 'gameFailed') {
      this.renderFailureContent(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    } else if (this.modalType === 'resetConfirm') {
      this.renderResetConfirmContent(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    } else {
      this.renderDefaultModalContent(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    }

    ctx.restore();
  }

  renderCompletionContent(ctx, x, y, width, height, isMobile) {
    if (!this.modalSoundPlayed && this.soundManager) {
      this.soundManager.playComplete();
      this.modalSoundPlayed = true;
    }
    const scheme = this.getScheme();
    const centerX = x + width / 2;

    ctx.fillStyle = scheme.buttonSuccess;
    ctx.font = `bold ${isMobile ? 48 : 56}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', centerX, y + (isMobile ? 50 : 60));

    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 32 : 40}px "Arial Black", Arial, sans-serif`;
    ctx.fillText('通关成功!', centerX, y + (isMobile ? 110 : 130));

    const messageLines = this.modalMessage.split('\n');
    let timeValue = '';

    messageLines.forEach(line => {
      if (line.includes('完成时间')) {
        timeValue = line.replace('完成时间:', '').trim();
      }
    });

    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 16 : 18}px Arial, sans-serif`;
    ctx.fillText('完成时间', centerX, y + (isMobile ? 175 : 210));

    const timeBoxWidth = isMobile ? 160 : 200;
    const timeBoxHeight = isMobile ? 40 : 48;
    const timeBoxX = centerX - timeBoxWidth / 2;
    const timeBoxY = y + (isMobile ? 195 : 230);

    this._drawBrutalismRect(ctx, timeBoxX, timeBoxY, timeBoxWidth, timeBoxHeight, scheme.buttonPrimary, {
      shadowOffset: 4,
      borderWidth: 3
    });

    ctx.fillStyle = scheme.textLight;
    ctx.font = `bold ${isMobile ? 20 : 24}px "Arial Black", Arial, sans-serif`;
    ctx.fillText(timeValue || '0.00秒', centerX, timeBoxY + timeBoxHeight / 2);

    const btnCount = this.modalButtons ? this.modalButtons.length : 0;
    const extraBtnH = Math.max(0, btnCount - 2) * (isMobile ? 62 : 74);
    this.renderModalButtons(ctx, x, y + height - (isMobile ? 130 : 150) - extraBtnH, width, isMobile);
  }

  renderFailureContent(ctx, x, y, width, height, isMobile) {
    const scheme = this.getScheme();
    const centerX = x + width / 2;

    ctx.fillStyle = scheme.danger;
    ctx.font = `bold ${isMobile ? 40 : 48}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('😅', centerX, y + (isMobile ? 40 : 50));

    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 28 : 34}px "Arial Black", Arial, sans-serif`;
    ctx.fillText('再接再厉!', centerX, y + (isMobile ? 95 : 115));

    const messageLines = this.modalMessage.split('\n');
    let progressText = '';
    let timeText = '';
    let scoreText = '';

    messageLines.forEach(line => {
      if (line.includes('完成进度')) {
        progressText = line;
      }
      if (line.includes('用时')) {
        timeText = line;
      }
      if (line.includes('得分')) {
        scoreText = line.replace('得分:', '').trim();
      }
    });

    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 16 : 18}px Arial, sans-serif`;

    let textY = y + (isMobile ? 140 : 165);
    if (progressText) {
      ctx.fillText(progressText, centerX, textY);
      textY += isMobile ? 28 : 32;
    }
    if (timeText) {
      ctx.fillText(timeText, centerX, textY);
      textY += isMobile ? 28 : 32;
    }

    if (scoreText) {
      ctx.fillText('得分', centerX, textY);
      textY += isMobile ? 25 : 30;

      const scoreBoxWidth = isMobile ? 120 : 150;
      const scoreBoxHeight = isMobile ? 36 : 44;
      const scoreBoxX = centerX - scoreBoxWidth / 2;
      const scoreBoxY = textY;

      this._drawBrutalismRect(ctx, scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight, scheme.accent, {
        shadowOffset: 4,
        borderWidth: 3
      });

      ctx.fillStyle = scheme.textLight;
      ctx.font = `bold ${isMobile ? 18 : 22}px "Arial Black", Arial, sans-serif`;
      ctx.fillText(scoreText, centerX, scoreBoxY + scoreBoxHeight / 2);

      textY += scoreBoxHeight + (isMobile ? 15 : 20);
    }

    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 16 : 18}px Arial, sans-serif`;
    ctx.fillText('别放弃，再试一次!', centerX, textY + (isMobile ? 10 : 15));

    const failBtnCount = this.modalButtons ? this.modalButtons.length : 0;
    const failExtraH = Math.max(0, failBtnCount - 2) * (isMobile ? 62 : 74);
    this.renderModalButtons(ctx, x, y + height - (isMobile ? 130 : 150) - failExtraH, width, isMobile);
  }

  renderResetConfirmContent(ctx, x, y, width, height, isMobile) {
    const scheme = this.getScheme();
    const centerX = x + width / 2;

    ctx.fillStyle = '#FF6B6B';
    ctx.font = `bold ${isMobile ? 48 : 56}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠', centerX, y + (isMobile ? 50 : 60));

    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 32 : 40}px "Arial Black", Arial, sans-serif`;
    ctx.fillText('重置游戏数据', centerX, y + (isMobile ? 110 : 130));

    const messageLines = this.modalMessage.split('\n');
    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 16 : 18}px Arial, sans-serif`;
    const lineHeight = isMobile ? 26 : 30;
    const messageY = y + (isMobile ? 170 : 200);

    messageLines.forEach((line, index) => {
      ctx.fillText(line, centerX, messageY + index * lineHeight);
    });

    const buttonsY = messageY + messageLines.length * lineHeight + (isMobile ? 40 : 50);
    this.renderModalButtons(ctx, x, buttonsY, width, isMobile);
  }

  renderDefaultModalContent(ctx, x, y, width, height, isMobile) {
    const scheme = this.getScheme();
    const centerX = x + width / 2;

    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 24 : 28}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.modalTitle, centerX, y + (isMobile ? 50 : 60));

    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 16 : 18}px Arial, sans-serif`;

    const messageLines = this.modalMessage.split('\n');
    const lineHeight = isMobile ? 26 : 30;
    const messageY = y + (isMobile ? 100 : 110);

    messageLines.forEach((line, index) => {
      ctx.fillText(line, centerX, messageY + index * lineHeight);
    });

    const defBtnCount = this.modalButtons ? this.modalButtons.length : 0;
    const defExtraH = Math.max(0, defBtnCount - 2) * (isMobile ? 62 : 74);
    this.renderModalButtons(ctx, x, y + height - (isMobile ? 130 : 150) - defExtraH, width, isMobile);
  }

  renderModalButtons(ctx, x, y, width, isMobile) {
    const scheme = this.getScheme();
    const buttonWidth = isMobile ? 200 : 240;
    const buttonHeight = isMobile ? 48 : 56;
    const buttonSpacing = isMobile ? 14 : 18;
    const centerX = x + width / 2;

    this.modalButtons.forEach((button, index) => {
      const buttonY = y + index * (buttonHeight + buttonSpacing);
      const buttonX = centerX - buttonWidth / 2;

      button.x = buttonX;
      button.y = buttonY;
      button.width = buttonWidth;
      button.height = buttonHeight;

      const isHovered = this.hoveredButton === button.id;
      const isClicked = this.clickedButton === button.id;

      let fillColor;
      if (button.id === 'nextLevel' || button.id === 'restart') {
        fillColor = scheme.buttonSuccess;
      } else if (button.id === 'playAgain' || button.id === 'tryAgain' || button.id === 'resume') {
        fillColor = scheme.buttonPrimary;
      } else if (button.id === 'confirm') {
        fillColor = button.color || '#FF6B6B';
      } else if (button.id === 'cancel') {
        fillColor = '#888888';
      } else {
        fillColor = scheme.cardBg;
      }

      if (isHovered) {
        fillColor = lightenColor(fillColor, 0.15);
      }

      let scale = 1;
      if (isHovered) scale = 1.02;
      if (isClicked) scale = 0.95;

      const scaledWidth = buttonWidth * scale;
      const scaledHeight = buttonHeight * scale;
      const scaledX = centerX - scaledWidth / 2;
      const scaledY = buttonY + (buttonHeight - scaledHeight) / 2;

      const shadowOffset = isClicked ? 2 : (isHovered ? 8 : 6);
      this._drawBrutalismRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, fillColor, {
        shadowOffset: shadowOffset,
        borderWidth: 4
      });

      ctx.fillStyle = button.id === 'menu' ? scheme.text : scheme.textLight;
      ctx.font = `bold ${isMobile ? 18 : 20}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, centerX, scaledY + scaledHeight / 2);
    });
  }

  handleClick(x, y) {
    if (!this.showModal) return false;
    if (!this.modalButtons || this.modalButtons.length === 0) {
      return false;
    }

    for (const button of this.modalButtons) {
      if (x >= button.x && x <= button.x + button.width &&
          y >= button.y && y <= button.y + button.height) {
        this.clickedButton = button.id;
        if (this.onPlayClickSound) {
          this.onPlayClickSound();
        }
        setTimeout(() => {
          this.clickedButton = null;
          if (button.action) {
            button.action();
          }
        }, 150);
        return true;
      }
    }

    return false;
  }
}
