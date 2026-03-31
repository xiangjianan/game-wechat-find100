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

export class SkillsPanel {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this._visible = false;
    this.skillsData = null;
    this.coins = 0;

    this.scroll = new ScrollManager({
      friction: 0.95,
      minVelocity: 0.5
    });

    this.hoveredButton = null;
    this.clickedButton = null;
    this.onPlayClickSound = null;
    this.onSkillUnlock = null;
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

  setSkillsData(data) {
    this.skillsData = data;
  }

  setCoins(coins) {
    this.coins = coins;
  }

  show() {
    this._visible = true;
    this.scroll.offset = 0;
    this.scroll.velocity = 0;
  }

  hide() {
    this._visible = false;
    this.skillsData = null;
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

  _limitScroll() {
    if (!this.skillsData) return;

    const isMobile = this.width < 768;
    const itemHeight = isMobile ? 85 : 100;
    const categoryHeaderHeight = isMobile ? 35 : 45;
    const itemPadding = isMobile ? 10 : 12;
    const categorySpacing = isMobile ? 20 : 25;

    let totalHeight = 0;
    let categoryCount = 0;
    for (const [, skills] of this.skillsData) {
      totalHeight += categoryHeaderHeight;
      totalHeight += skills.length * (itemHeight + itemPadding);
      categoryCount++;
    }
    totalHeight += (categoryCount - 1) * categorySpacing;

    const modalHeight = isMobile ? this.height - 60 : this.height - 80;
    const listStartY = (this.height - modalHeight) / 2 + (isMobile ? 90 : 110);
    const listEndY = (this.height - modalHeight) / 2 + modalHeight - (isMobile ? 140 : 160);
    const listHeight = listEndY - listStartY;

    const maxScroll = Math.max(0, totalHeight - listHeight);
    this.scroll.setMaxOffset(maxScroll);
  }

  render(ctx) {
    if (!this._visible) return;

    const scheme = this.getScheme();
    const isMobile = this.width < 768;

    if (!this.skillsData) {
      ctx.fillStyle = `rgba(0, 0, 0, 0.8)`;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.fillStyle = scheme.text;
      ctx.font = `bold ${isMobile ? 20 : 24}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('加载中...', this.width / 2, this.height / 2);
      return;
    }

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
    ctx.fillText('技能', this.width / 2, titleY);

    const titleWidth = ctx.measureText('技能').width;
    ctx.strokeStyle = '#9C27B0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.width / 2 - titleWidth / 2 - 20, titleY + 25);
    ctx.lineTo(this.width / 2 + titleWidth / 2 + 20, titleY + 25);
    ctx.stroke();

    if (this.skillsData) {
      this.renderSkillsCategories(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    }

    // Close button
    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const buttonY = modalY + modalHeight - (isMobile ? 70 : 80);

    const isHovered = this.hoveredButton === 'skills_close';
    const isClicked = this.clickedButton === 'skills_close';

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

    const coinsY = buttonY - (isMobile ? 20 : 25);
    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 16 : 18}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`💰 金币: ${this.coins}`, this.width / 2, coinsY);
  }

  renderSkillsCategories(ctx, modalX, modalY, modalWidth, modalHeight, isMobile) {
    const scheme = this.getScheme();
    const listStartY = modalY + (isMobile ? 90 : 110);
    const listEndY = modalY + modalHeight - (isMobile ? 140 : 160);

    const categoryNames = {
      'time': '时间技能',
      'combo': '连击技能',
      'assist': '辅助技能'
    };

    let currentY = listStartY - this.scroll.offset;

    for (const [category, skills] of this.skillsData) {
      const categoryHeaderHeight = isMobile ? 35 : 45;

      if (currentY + categoryHeaderHeight > listStartY && currentY < listEndY) {
        ctx.fillStyle = scheme.text;
        ctx.font = `bold ${isMobile ? 20 : 24}px "Arial Black", Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(categoryNames[category] || category, modalX + (isMobile ? 15 : 20), currentY);
      }

      currentY += categoryHeaderHeight;

      const itemHeight = isMobile ? 85 : 100;
      const itemPadding = isMobile ? 10 : 12;

      for (const skill of skills) {
        if (currentY > listEndY) break;

        if (currentY + itemHeight < listStartY) {
          currentY += itemHeight + itemPadding;
          continue;
        }

        const itemWidth = modalWidth - (isMobile ? 30 : 40);
        const itemX = modalX + (isMobile ? 15 : 20);

        const bgColor = scheme.cardBg;

        this._drawBrutalismRect(ctx, itemX, currentY, itemWidth, itemHeight, bgColor, {
          shadowOffset: 2,
          borderWidth: 2
        });

        ctx.font = `bold ${isMobile ? 32 : 40}px Arial, sans-serif`;
        ctx.fillStyle = skill.isUnlocked ? '#4CAF50' : scheme.text;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(skill.icon || '⭐', itemX + (isMobile ? 12 : 15), currentY + itemHeight / 2);

        ctx.font = `bold ${isMobile ? 16 : 18}px "Arial Black", Arial, sans-serif`;
        ctx.fillStyle = scheme.text;
        ctx.fillText(skill.name, itemX + (isMobile ? 50 : 60), currentY + (isMobile ? 20 : 25));

        ctx.font = `${isMobile ? 11 : 13}px Arial, sans-serif`;
        ctx.fillText(skill.description, itemX + (isMobile ? 50 : 60), currentY + (isMobile ? 45 : 50));

        const costText = skill.isUnlocked ? '' : `💰 ${(skill.cost !== undefined && skill.cost !== null) ? skill.cost.toString() : '???'}`;
        ctx.font = `bold ${isMobile ? 12 : 14}px "Arial Black", Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(costText, itemX + (isMobile ? 50 : 60), currentY + (isMobile ? 70 : 78));

        const unlockButtonWidth = isMobile ? 50 : 70;
        const unlockButtonHeight = isMobile ? 28 : 36;
        const unlockButtonX = itemX + itemWidth - unlockButtonWidth - (isMobile ? 10 : 15);
        const unlockButtonY = currentY + (itemHeight - unlockButtonHeight) / 2;

        const isUnlockButtonHovered = this.hoveredButton === `skill_unlock_${skill.id}`;
        const isUnlockButtonClicked = this.clickedButton === `skill_unlock_${skill.id}`;

        if (skill.isUnlocked) {
          ctx.fillStyle = '#4CAF50';
          ctx.font = `bold ${isMobile ? 12 : 14}px "Arial Black", Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('已解锁', unlockButtonX + unlockButtonWidth / 2, unlockButtonY + unlockButtonHeight / 2);
        } else if (skill.canUnlock) {
          let unlockButtonColor = '#9C27B0';
          if (isUnlockButtonHovered) {
            unlockButtonColor = lightenColor('#9C27B0', 0.15);
          }

          let unlockButtonScale = 1;
          if (isUnlockButtonHovered) unlockButtonScale = 1.02;
          if (isUnlockButtonClicked) unlockButtonScale = 0.95;

          const scaledUnlockWidth = unlockButtonWidth * unlockButtonScale;
          const scaledUnlockHeight = unlockButtonHeight * unlockButtonScale;
          const scaledUnlockX = unlockButtonX + (unlockButtonWidth - scaledUnlockWidth) / 2;
          const scaledUnlockY = unlockButtonY + (unlockButtonHeight - scaledUnlockHeight) / 2;

          const unlockShadowOffset = isUnlockButtonClicked ? 2 : (isUnlockButtonHovered ? 6 : 4);
          this._drawBrutalismRect(ctx, scaledUnlockX, scaledUnlockY, scaledUnlockWidth, scaledUnlockHeight, unlockButtonColor, {
            shadowOffset: unlockShadowOffset,
            borderWidth: 3
          });

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold ${isMobile ? 12 : 14}px "Arial Black", Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('解锁', scaledUnlockX + scaledUnlockWidth / 2, scaledUnlockY + scaledUnlockHeight / 2);
        } else {
          this._drawBrutalismRect(ctx, unlockButtonX, unlockButtonY, unlockButtonWidth, unlockButtonHeight, '#CCCCCC', {
            shadowOffset: 2,
            borderWidth: 2
          });

          ctx.fillStyle = '#666666';
          ctx.font = `bold ${isMobile ? 10 : 12}px "Arial Black", Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          let unlockReason = '金币不足';
          if (skill.prerequisite) {
            const prerequisiteSkill = this.skillsData.get(skill.category)?.find(s => s.id === skill.prerequisite);
            if (prerequisiteSkill && !prerequisiteSkill.isUnlocked) {
              unlockReason = '需前置';
            }
          }
          ctx.fillText(unlockReason, unlockButtonX + unlockButtonWidth / 2, unlockButtonY + unlockButtonHeight / 2);
        }

        currentY += itemHeight + itemPadding;
      }

      currentY += (isMobile ? 20 : 25);
    }
  }

  handleClick(x, y) {
    if (!this._visible) return false;

    const isMobile = this.width < 768;
    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const modalY = (this.height - modalHeight) / 2;
    const modalWidth = isMobile ? this.width - 20 : Math.min(500, this.width - 40);
    const modalX = (this.width - modalWidth) / 2;
    const buttonX = (this.width - buttonWidth) / 2;
    const buttonY = modalY + modalHeight - (isMobile ? 70 : 80);

    // Close button
    if (x >= buttonX && x <= buttonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight) {
      this.clickedButton = 'skills_close';
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

    // Skill unlock buttons
    if (this.skillsData) {
      const listStartY = modalY + (isMobile ? 90 : 110);
      const listEndY = modalY + modalHeight - (isMobile ? 140 : 160);
      const categoryHeaderHeight = isMobile ? 35 : 45;
      const itemHeight = isMobile ? 85 : 100;
      const itemPadding = isMobile ? 10 : 12;
      const categorySpacing = isMobile ? 20 : 25;

      if (y >= listStartY && y <= listEndY) {
        let currentY = listStartY - this.scroll.offset;

        for (const [, skills] of this.skillsData) {
          currentY += categoryHeaderHeight;

          for (const skill of skills) {
            if (currentY > listEndY) break;

            if (currentY + itemHeight < listStartY) {
              currentY += itemHeight + itemPadding;
              continue;
            }

            const itemWidth = modalWidth - (isMobile ? 30 : 40);
            const itemX = modalX + (isMobile ? 15 : 20);

            const unlockButtonWidth = isMobile ? 50 : 70;
            const unlockButtonHeight = isMobile ? 28 : 36;
            const unlockButtonX = itemX + itemWidth - unlockButtonWidth - (isMobile ? 10 : 15);
            const unlockButtonY = currentY + (itemHeight - unlockButtonHeight) / 2;

            if (y >= unlockButtonY && y <= unlockButtonY + unlockButtonHeight &&
                x >= unlockButtonX && x <= unlockButtonX + unlockButtonWidth) {
              if (skill.canUnlock && !skill.isUnlocked) {
                this.clickedButton = `skill_unlock_${skill.id}`;
                setTimeout(() => {
                  this.clickedButton = null;
                  if (this.onSkillUnlock) {
                    this.onSkillUnlock(skill.id);
                  }
                }, 150);
                return true;
              }
            }

            currentY += itemHeight + itemPadding;
          }

          currentY += categorySpacing;
        }
      }
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
    const modalHeight = isMobile ? this.height - 60 : this.height - 80;
    const listStartY = (this.height - modalHeight) / 2 + (isMobile ? 90 : 110);
    const listEndY = (this.height - modalHeight) / 2 + modalHeight - (isMobile ? 140 : 160);

    const prevY = this.scroll.lastTouchY;
    const delta = prevY - y;
    this.scroll.lastTouchY = y;

    this.scroll.offset = Math.max(0, this.scroll.offset + delta);
    this._limitScroll();

    const now = Date.now();
    const deltaTime = now - this.scroll.lastScrollTime;
    this.scroll.lastScrollTime = now;

    if (deltaTime > 0) {
      this.scroll.lastScrollDelta = delta / deltaTime;
      this.scroll.velocity = delta / deltaTime * 16;
    }
  }

  handleTouchEnd() {
    this.scroll.handleTouchEnd();
  }

  handleWheel(deltaY) {
    if (!this._visible) return;
    this.scroll.handleWheel(deltaY);
    this._limitScroll();
  }
}
