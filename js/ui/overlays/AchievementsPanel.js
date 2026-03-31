import { roundRect } from '../helpers/drawing.js';
import { getColorScheme } from '../../constants/colors.js';
import { ScrollManager } from '../helpers/scrollManager.js';

function lightenColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export class AchievementsPanel {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this._visible = false;
    this.achievementsData = null;

    this.scroll = new ScrollManager({
      friction: 0.95,
      minVelocity: 0.5
    });

    this.hoveredButton = null;
    this.clickedButton = null;
    this.onPlayClickSound = null;
    this.onClose = null;
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

  setAchievementsData(data) {
    this.achievementsData = data;
  }

  show() {
    this._visible = true;
    this.scroll.offset = 0;
    this.scroll.velocity = 0;
  }

  hide() {
    this._visible = false;
    this.scroll.offset = 0;
    this.scroll.velocity = 0;
    if (this.onClose) {
      this.onClose();
    }
  }

  isVisible() {
    return this._visible;
  }

  update(deltaTime) {
    if (!this._visible) return;
    this.scroll.update(deltaTime);
  }

  render(ctx) {
    if (!this._visible) return;

    const scheme = this.getScheme();
    const isMobile = this.width < 768;

    ctx.fillStyle = `rgba(0, 0, 0, 0.8)`;
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? this.width - 20 : Math.min(500, this.width - 40);
    const modalHeight = isMobile ? this.height - 60 : this.height - 80;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    this._drawBrutalismRect(ctx, modalX, modalY, modalWidth, modalHeight, scheme.cardBg, {
      shadowOffset: 10,
      borderWidth: 5
    });

    const titleY = modalY + (isMobile ? 40 : 50);
    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 28 : 34}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('成就', this.width / 2, titleY);

    const titleWidth = ctx.measureText('成就').width;
    ctx.strokeStyle = scheme.buttonSuccess;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.width / 2 - titleWidth / 2 - 20, titleY + 25);
    ctx.lineTo(this.width / 2 + titleWidth / 2 + 20, titleY + 25);
    ctx.stroke();

    if (this.achievementsData) {
      this.renderAchievementsList(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    }

    // Close button
    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const buttonY = modalY + modalHeight - (isMobile ? 70 : 80);

    const isHovered = this.hoveredButton === 'achievements_close';
    const isClicked = this.clickedButton === 'achievements_close';

    let fillColor = scheme.buttonPrimary;
    if (isHovered) {
      fillColor = lightenColor(scheme.buttonPrimary, 0.15);
    }

    let scale = 1;
    if (isHovered) scale = 1.02;
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
    ctx.fillText('返回', this.width / 2, scaledY + scaledHeight / 2);
  }

  renderAchievementsList(ctx, modalX, modalY, modalWidth, modalHeight, isMobile) {
    const scheme = this.getScheme();
    const achievements = this.achievementsData;

    if (!achievements || achievements.length === 0) return;

    const listStartY = modalY + (isMobile ? 90 : 110);
    const listEndY = modalY + modalHeight - (isMobile ? 90 : 100);
    const listHeight = listEndY - listStartY;
    const itemHeight = isMobile ? 70 : 80;
    const itemPadding = isMobile ? 8 : 10;
    const itemWidth = modalWidth - (isMobile ? 20 : 30);
    const itemX = modalX + (isMobile ? 10 : 15);

    const totalHeight = achievements.length * (itemHeight + itemPadding);
    const maxScroll = Math.max(0, totalHeight - listHeight);
    this.scroll.setMaxOffset(maxScroll);

    ctx.save();
    ctx.beginPath();
    ctx.rect(modalX, listStartY, modalWidth, listHeight);
    ctx.clip();

    achievements.forEach((achievement, index) => {
      const itemY = listStartY + index * (itemHeight + itemPadding) - this.scroll.offset;

      if (itemY + itemHeight < listStartY || itemY > listEndY) return;

      const isHidden = achievement.hidden && !achievement.unlocked;
      const bgColor = achievement.unlocked ? scheme.buttonSuccess : scheme.cardBg;
      const alpha = achievement.unlocked ? 1 : 0.6;

      ctx.save();
      ctx.globalAlpha = alpha;

      this._drawBrutalismRect(ctx, itemX, itemY, itemWidth, itemHeight, bgColor, {
        shadowOffset: achievement.unlocked ? 4 : 2,
        borderWidth: achievement.unlocked ? 3 : 2
      });

      ctx.font = `bold ${isMobile ? 28 : 32}px Arial, sans-serif`;
      ctx.fillStyle = achievement.unlocked ? scheme.textLight : scheme.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(isHidden ? '❓' : achievement.icon, itemX + (isMobile ? 12 : 15), itemY + itemHeight / 2);

      ctx.font = `bold ${isMobile ? 16 : 18}px "Arial Black", Arial, sans-serif`;
      ctx.fillText(isHidden ? '？？？' : achievement.name, itemX + (isMobile ? 55 : 65), itemY + (isMobile ? 22 : 25));

      if (!isHidden) {
        ctx.font = `${isMobile ? 12 : 14}px Arial, sans-serif`;
        ctx.fillStyle = achievement.unlocked ? scheme.textLight : scheme.text;
        ctx.globalAlpha = achievement.unlocked ? 0.9 : 0.5;
        ctx.fillText(achievement.description, itemX + (isMobile ? 55 : 65), itemY + (isMobile ? 45 : 50));
      } else {
        ctx.font = `${isMobile ? 12 : 14}px Arial, sans-serif`;
        ctx.fillStyle = scheme.text;
        ctx.globalAlpha = 0.5;
        ctx.fillText('完成神秘挑战解锁', itemX + (isMobile ? 55 : 65), itemY + (isMobile ? 45 : 50));
      }

      if (!achievement.unlocked && achievement.progress !== undefined && achievement.target !== undefined && !isHidden) {
        const progressText = `${achievement.progress}/${achievement.target}`;
        ctx.font = `bold ${isMobile ? 12 : 14}px Arial, sans-serif`;
        ctx.fillStyle = scheme.accent;
        ctx.globalAlpha = 1;
        ctx.textAlign = 'right';
        ctx.fillText(progressText, itemX + itemWidth - (isMobile ? 12 : 15), itemY + (isMobile ? 45 : 50));
      }

      if (achievement.unlocked && achievement.reward) {
        const rewardText = `+${achievement.reward.amount}金币`;
        ctx.font = `bold ${isMobile ? 12 : 14}px Arial, sans-serif`;
        ctx.fillStyle = scheme.textLight;
        ctx.globalAlpha = 0.8;
        ctx.textAlign = 'right';
        ctx.fillText(rewardText, itemX + itemWidth - (isMobile ? 12 : 15), itemY + (isMobile ? 45 : 50));
      }

      ctx.restore();
    });

    ctx.restore();

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const progressText = `已解锁: ${unlockedCount}/${totalCount}`;

    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 14 : 16}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(progressText, this.width / 2, modalY + (isMobile ? 70 : 85));
  }

  handleClick(x, y) {
    if (!this._visible) return false;

    const isMobile = this.width < 768;
    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const modalWidth = isMobile ? this.width - 20 : Math.min(500, this.width - 40);
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const modalY = (this.height - modalHeight) / 2;
    const buttonX = (this.width - buttonWidth) / 2;
    const buttonY = modalY + modalHeight - (isMobile ? 70 : 80);

    if (x >= buttonX && x <= buttonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight) {
      this.clickedButton = 'achievements_close';
      if (this.onPlayClickSound) {
        this.onPlayClickSound();
      }
      setTimeout(() => {
        this.clickedButton = null;
        this.hide();
        this.hoveredButton = null;
      }, 150);
      return true;
    }
    return true;
  }

  handleTouchStart(y) {
    if (!this._visible) return;
    this.scroll.handleTouchStart(y);
  }

  handleTouchMove(y) {
    if (!this._visible || !this.scroll.isTouching) return;

    const isMobile = this.width < 768;
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const listStartY = (this.height - modalHeight) / 2 + (isMobile ? 90 : 110);
    const listEndY = (this.height - modalHeight) / 2 + modalHeight - (isMobile ? 90 : 100);

    if (y >= listStartY && y <= listEndY) {
      const prevY = this.scroll.lastTouchY;
      const delta = prevY - y;
      this.scroll.lastTouchY = y;

      this.scroll.offset = Math.max(0, this.scroll.offset + delta);

      const now = Date.now();
      const deltaTime = now - this.scroll.lastScrollTime;
      this.scroll.lastScrollTime = now;

      if (deltaTime > 0) {
        this.scroll.lastScrollDelta = delta / deltaTime;
        this.scroll.velocity = delta / deltaTime * 16;
      }
    }
  }

  handleTouchEnd() {
    this.scroll.handleTouchEnd();
  }

  handleWheel(deltaY) {
    if (!this._visible) return;
    this.scroll.handleWheel(deltaY);
  }
}
