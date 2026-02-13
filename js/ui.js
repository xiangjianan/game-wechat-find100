import { COLORS, getColorScheme, BRUTALISM_STYLES } from './constants/colors';

export default class UI {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buttons = [];
    this.showInstructions = false;
    this.showCompletion = false;
    this.completionTime = 0;
    this.currentLevel = 1;
    this.totalLevels = 2;
    this.levelConfig = {
      1: { count: 10, name: '第一关' },
      2: { count: 100, name: '第二关' }
    };
    
    this.showModal = false;
    this.modalType = null;
    this.modalTitle = '';
    this.modalMessage = '';
    this.modalButtons = [];
    this.modalAnimation = 0;
    this.modalTargetAnimation = 1;
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.hoveredButton = null;
    this.clickedButton = null;
    this.clickAnimation = 0;
    this.onPlayClickSound = null;
    
    this.floatingTexts = [];
    this.flashAlpha = 0;
    this.flashTargetAlpha = 0;
    this.shakeOffset = { x: 0, y: 0 };
    this.shakeTime = 0;

    this.showRank = false;
    this.onOpenRank = null;
    this.onCloseRank = null;

    this.menuAnimation = 0;
    this.menuTargetAnimation = 1;
    this.particleOffset = 0;
    
    this.gameMode = 'timed';
    this.showModeSelector = false;
    this.instructionsData = null;
    this.headerButtons = null;
    
    this.modeSwitcher = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      animation: 0,
      targetAnimation: 1,
      hoveredSegment: null,
      clickedSegment: null
    };
    
    this.achievementNotifications = [];
    this.achievementNotificationDuration = 3000;
    
    this.showAchievements = false;
    this.achievementsData = null;
    this.achievementScrollOffset = 0;
    this.touchStartY = 0;
    this.lastTouchY = 0;
    this.isTouching = false;
    
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

  getScheme() {
    return getColorScheme();
  }

  roundRect(ctx, x, y, width, height, radius) {
    if (radius === 0) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  }

  drawBrutalismRect(ctx, x, y, width, height, fillColor, options = {}) {
    const scheme = this.getScheme();
    const borderWidth = options.borderWidth !== undefined ? options.borderWidth : BRUTALISM_STYLES.borderWidth;
    const shadowOffset = options.shadowOffset !== undefined ? options.shadowOffset : BRUTALISM_STYLES.shadowOffset;
    const borderColor = options.borderColor || scheme.border;
    const shadowColor = options.shadowColor || scheme.shadow;
    const radius = options.radius !== undefined ? options.radius : 0;
    
    if (shadowOffset > 0) {
      ctx.fillStyle = shadowColor;
      this.roundRect(ctx, x + shadowOffset, y + shadowOffset, width, height, radius);
      ctx.fill();
    }
    
    ctx.fillStyle = fillColor;
    this.roundRect(ctx, x, y, width, height, radius);
    ctx.fill();
    
    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      this.roundRect(ctx, x, y, width, height, radius);
      ctx.stroke();
    }
  }

  drawBrutalismButton(ctx, button, isHovered, isClicked, alpha = 1) {
    const scheme = this.getScheme();
    const isMobile = this.width < 768;
    
    let scale = 1;
    if (isClicked) scale = 0.95;
    else if (isHovered) scale = 1.02;
    
    const centerX = button.x + button.width / 2;
    const centerY = button.y + button.height / 2;
    const scaledWidth = button.width * scale;
    const scaledHeight = button.height * scale;
    const scaledX = centerX - scaledWidth / 2;
    const scaledY = centerY - scaledHeight / 2;
    
    let fillColor = button.color || scheme.buttonPrimary;
    if (isHovered && button.hoverColor) {
      fillColor = button.hoverColor;
    }
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    const shadowOffset = isClicked ? 2 : (isHovered ? 8 : 6);
    this.drawBrutalismRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, fillColor, {
      shadowOffset: shadowOffset,
      borderWidth: 4
    });
    
    ctx.fillStyle = scheme.textLight;
    ctx.font = `bold ${isMobile ? 18 : 22}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.text, centerX, centerY);
    
    ctx.restore();
  }

  drawModeSwitcher(ctx, x, y, width, height) {
    const scheme = this.getScheme();
    const isMobile = this.width < 768;
    
    this.modeSwitcher.x = x;
    this.modeSwitcher.y = y;
    this.modeSwitcher.width = width;
    this.modeSwitcher.height = height;
    
    const segmentWidth = width / 2;
    const borderWidth = 4;
    const shadowOffset = 6;
    
    ctx.fillStyle = scheme.shadow;
    this.roundRect(ctx, x + shadowOffset, y + shadowOffset, width, height, 0);
    ctx.fill();
    
    ctx.fillStyle = scheme.cardBg;
    ctx.fillRect(x, y, width, height);
    
    ctx.strokeStyle = scheme.border;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(x, y, width, height);
    
    const isTimedActive = this.gameMode === 'timed';
    const isTimedClicked = this.modeSwitcher.clickedSegment === 'timed';
    const isUntimedClicked = this.modeSwitcher.clickedSegment === 'untimed';
    
    if (isTimedActive) {
      let offsetX = 0;
      let offsetY = 0;
      if (isTimedClicked) {
        offsetX = 2;
        offsetY = 2;
      }
      
      ctx.fillStyle = scheme.shadow;
      ctx.fillRect(x + borderWidth + offsetX + 2, y + borderWidth + offsetY + 2, segmentWidth - borderWidth * 2, height - borderWidth * 2);
      
      ctx.fillStyle = scheme.buttonPrimary;
      ctx.fillRect(x + borderWidth + offsetX, y + borderWidth + offsetY, segmentWidth - borderWidth * 2, height - borderWidth * 2);
    } else {
      let offsetX = 0;
      let offsetY = 0;
      if (isUntimedClicked) {
        offsetX = 2;
        offsetY = 2;
      }
      
      ctx.fillStyle = scheme.shadow;
      ctx.fillRect(x + segmentWidth + borderWidth + offsetX + 2, y + borderWidth + offsetY + 2, segmentWidth - borderWidth * 2, height - borderWidth * 2);
      
      ctx.fillStyle = scheme.accent;
      ctx.fillRect(x + segmentWidth + borderWidth + offsetX, y + borderWidth + offsetY, segmentWidth - borderWidth * 2, height - borderWidth * 2);
    }
    
    ctx.strokeStyle = scheme.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + segmentWidth, y);
    ctx.lineTo(x + segmentWidth, y + height);
    ctx.stroke();
    
    const fontSize = isMobile ? 16 : 18;
    ctx.font = `bold ${fontSize}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (isTimedActive) {
      ctx.fillStyle = scheme.textLight;
    } else {
      ctx.fillStyle = scheme.text;
    }
    ctx.fillText(`限时模式`, x + segmentWidth / 2, y + height / 2);
    
    if (!isTimedActive) {
      ctx.fillStyle = scheme.textLight;
    } else {
      ctx.fillStyle = scheme.text;
    }
    ctx.fillText(`自由模式`, x + segmentWidth + segmentWidth / 2, y + height / 2);
  }

  isPointInModeSwitcher(x, y) {
    const ms = this.modeSwitcher;
    if (ms.width === 0) return null;
    
    if (x >= ms.x && x <= ms.x + ms.width && y >= ms.y && y <= ms.y + ms.height) {
      const segmentWidth = ms.width / 2;
      if (x < ms.x + segmentWidth) {
        return 'timed';
      } else {
        return 'untimed';
      }
    }
    return null;
  }

  handleModeSwitcherClick(x, y) {
    const segment = this.isPointInModeSwitcher(x, y);
    if (segment && segment !== this.gameMode) {
      this.modeSwitcher.clickedSegment = segment;
      if (this.onPlayClickSound) {
        this.onPlayClickSound();
      }
      setTimeout(() => {
        this.modeSwitcher.clickedSegment = null;
        this.onSelectMode(segment);
      }, 100);
      return true;
    }
    return false;
  }

  updateModeSwitcherHover(x, y) {
    this.modeSwitcher.hoveredSegment = this.isPointInModeSwitcher(x, y);
  }

  showFloatingText(x, y, text, color) {
    this.floatingTexts.push({
      x, y, text, color,
      alpha: 1,
      offsetY: 0,
      life: 1.0
    });
  }

  triggerFlash() {
    this.flashAlpha = 0.5;
  }

  triggerShake() {
    this.shakeTime = 10;
  }

  showAchievementNotification(achievements) {
    if (!achievements || achievements.length === 0) return;
    
    achievements.forEach((achievement, index) => {
      this.achievementNotifications.push({
        achievement,
        startTime: Date.now() + index * 500,
        animation: 0,
        targetAnimation: 1
      });
    });
  }

  updateAchievementNotifications(deltaTime) {
    const now = Date.now();
    
    for (let i = this.achievementNotifications.length - 1; i >= 0; i--) {
      const notification = this.achievementNotifications[i];
      
      if (now < notification.startTime) continue;
      
      const elapsed = now - notification.startTime;
      
      if (elapsed < 300) {
        notification.animation = Math.min(1, notification.animation + deltaTime * 5);
      } else if (elapsed > this.achievementNotificationDuration - 300) {
        notification.animation = Math.max(0, notification.animation - deltaTime * 5);
      }
      
      if (elapsed > this.achievementNotificationDuration) {
        this.achievementNotifications.splice(i, 1);
      }
    }
  }

  renderAchievementNotifications(ctx) {
    const scheme = this.getScheme();
    const isMobile = this.width < 768;
    
    for (const notification of this.achievementNotifications) {
      if (notification.animation <= 0) continue;
      
      const achievement = notification.achievement;
      const alpha = notification.animation;
      
      const notificationWidth = isMobile ? 280 : 320;
      const notificationHeight = isMobile ? 80 : 90;
      const notificationX = (this.width - notificationWidth) / 2;
      const notificationY = isMobile ? 100 : 120;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      const slideOffset = (1 - notification.animation) * 50;
      const actualY = notificationY - slideOffset;
      
      this.drawBrutalismRect(ctx, notificationX, actualY, notificationWidth, notificationHeight, scheme.buttonSuccess, {
        shadowOffset: 8,
        borderWidth: 4
      });
      
      ctx.fillStyle = scheme.textLight;
      ctx.font = `bold ${isMobile ? 14 : 16}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('成就解锁!', this.width / 2, actualY + (isMobile ? 20 : 25));
      
      ctx.font = `bold ${isMobile ? 28 : 32}px Arial, sans-serif`;
      ctx.fillText(achievement.icon, this.width / 2, actualY + (isMobile ? 50 : 55));
      
      ctx.font = `bold ${isMobile ? 16 : 18}px "Arial Black", Arial, sans-serif`;
      ctx.fillText(achievement.name, this.width / 2, actualY + notificationHeight - (isMobile ? 15 : 18));
      
      ctx.restore();
    }
  }

  updateEffects(deltaTime) {
    this.updateComboEffects(deltaTime);
    
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= deltaTime * 1.5;
      ft.offsetY -= deltaTime * 100;
      ft.alpha = Math.max(0, ft.life);
      
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    if (this.flashAlpha > 0) {
      this.flashAlpha -= deltaTime * 3;
      if (this.flashAlpha < 0) {
        this.flashAlpha = 0;
      }
    }

    if (this.shakeTime > 0) {
      this.shakeOffset.x = (Math.random() - 0.5) * 20;
      this.shakeOffset.y = (Math.random() - 0.5) * 20;
      this.shakeTime -= deltaTime * 60;
      if (this.shakeTime < 0) {
        this.shakeTime = 0;
        this.shakeOffset = { x: 0, y: 0 };
      }
    }
  }

  renderEffects(ctx) {
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 0, 0, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 32px "Arial Black", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ft.text, ft.x, ft.y + ft.offsetY);
      ctx.restore();
    }
  }

  initMenu() {
    this.showCompletion = false;
    this.showFailure = false;
    this.showModal = false;
    this.modalAnimation = 0;
    this.modalTargetAnimation = 0;
    this.menuAnimation = 0;
    this.menuTargetAnimation = 1;
    this.showAchievements = false;
    
    const isMobile = this.width < 768;
    const buttonWidth = isMobile ? 240 : 280;
    const buttonHeight = isMobile ? 60 : 70;
    const buttonSpacing = isMobile ? 20 : 24;
    const centerX = this.width / 2;
    const startY = this.height * 0.42;
    
    this.buttons = [
      {
        id: 'start',
        text: '开始游戏',
        x: centerX - buttonWidth / 2,
        y: startY,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().accent,
        action: () => this.onStartGame()
      },
      {
        id: 'instructions',
        text: '游戏规则',
        x: centerX - buttonWidth / 2,
        y: startY + buttonHeight + buttonSpacing,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().buttonPrimary,
        action: () => this.onShowInstructions()
      },
      {
        id: 'rank',
        text: '排行榜',
        x: centerX - buttonWidth / 2,
        y: startY + (buttonHeight + buttonSpacing) * 2,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().danger,
        action: () => this.onOpenRank()
      },
      {
        id: 'achievements',
        text: '成就',
        x: centerX - buttonWidth / 2,
        y: startY + (buttonHeight + buttonSpacing) * 3,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().buttonSecondary,
        hoverColor: this.lightenColor(this.getScheme().buttonSecondary, 0.15),
        action: () => this.onOpenAchievements()
      }
    ];
  }

  lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount));
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount));
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  initGame() {
    this.showCompletion = false;
    this.showFailure = false;
    this.buttons = [];
    this.modeSwitcher.x = 0;
    this.modeSwitcher.y = 0;
    this.modeSwitcher.width = 0;
    this.modeSwitcher.height = 0;
  }

  initCompletion(time) {
    this.showCompletion = true;
    this.completionTime = time;
    this.showFailure = false;
    
    const isMobile = this.width < 768;
    const hasNextLevel = this.currentLevel < this.totalLevels;
    const buttonWidth = isMobile ? 120 : 140;
    const buttonHeight = isMobile ? 50 : 60;
    const buttonSpacing = isMobile ? 16 : 20;
    
    let buttonCount = hasNextLevel ? 3 : 2;
    const totalWidth = buttonWidth * buttonCount + buttonSpacing * (buttonCount - 1);
    const startX = (this.width - totalWidth) / 2;
    const buttonY = this.height / 2 + 80;
    
    this.buttons = [
      {
        id: 'playAgain',
        text: '再来',
        x: startX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().buttonPrimary,
        hoverColor: this.lightenColor(this.getScheme().buttonPrimary, 0.15),
        action: () => this.onPlayAgain()
      }
    ];
    
    if (hasNextLevel) {
      this.buttons.push({
        id: 'nextLevel',
        text: '下一关',
        x: startX + buttonWidth + buttonSpacing,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().buttonSuccess,
        hoverColor: this.lightenColor(this.getScheme().buttonSuccess, 0.15),
        action: () => this.onNextLevel()
      });
    }
    
    this.buttons.push({
      id: 'menu',
      text: '菜单',
      x: startX + buttonWidth * (hasNextLevel ? 2 : 1) + buttonSpacing * (hasNextLevel ? 2 : 1),
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      color: this.getScheme().cardBg,
      hoverColor: this.getScheme().accent,
      action: () => this.onBackToMenu()
    });
  }

  shouldAutoAdvance() {
    return this.currentLevel === 1;
  }

  initFailure(progress, total, time) {
    this.showCompletion = true;
    this.showFailure = true;
    this.failureProgress = progress;
    this.failureTotal = total;
    this.failureTime = time;
    
    const isMobile = this.width < 768;
    const buttonWidth = isMobile ? 160 : 180;
    const buttonHeight = isMobile ? 50 : 60;
    const buttonSpacing = isMobile ? 16 : 20;
    
    this.buttons = [
      {
        id: 'tryAgain',
        text: '再试一次',
        x: this.width / 2 - buttonWidth / 2,
        y: this.height / 2 + 50,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().buttonPrimary,
        hoverColor: this.lightenColor(this.getScheme().buttonPrimary, 0.15),
        action: () => this.onPlayAgain()
      },
      {
        id: 'menu',
        text: '返回菜单',
        x: this.width / 2 - buttonWidth / 2,
        y: this.height / 2 + 50 + buttonHeight + buttonSpacing,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().cardBg,
        hoverColor: this.getScheme().accent,
        action: () => this.onBackToMenu()
      }
    ];
  }

  handleClick(x, y) {
    if (this.showRank) {
      return false;
    }

    if (this.showAchievements) {
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
        this.clickAnimation = 1;
        if (this.onPlayClickSound) {
          this.onPlayClickSound();
        }
        setTimeout(() => {
          this.clickedButton = null;
          this.clickAnimation = 0;
          this.onCloseAchievements();
          this.hoveredButton = null;
        }, 150);
        return true;
      }
      return true;
    }

    if (this.showInstructions) {
      const isMobile = this.width < 768;
      const buttonWidth = isMobile ? 180 : 220;
      const buttonHeight = isMobile ? 48 : 56;
      const modalWidth = isMobile ? Math.min(360, this.width - 40) : 480;
      const modalHeight = isMobile ? 420 : 480;
      const modalX = (this.width - modalWidth) / 2;
      const modalY = (this.height - modalHeight) / 2;
      const buttonX = (this.width - buttonWidth) / 2;
      const buttonY = modalY + modalHeight - (isMobile ? 80 : 90);

      if (x >= buttonX && x <= buttonX + buttonWidth &&
          y >= buttonY && y <= buttonY + buttonHeight) {
        this.clickedButton = 'instructions_ok';
        this.clickAnimation = 1;
        if (this.onPlayClickSound) {
          this.onPlayClickSound();
        }
        setTimeout(() => {
          this.clickedButton = null;
          this.clickAnimation = 0;
          this.showInstructions = false;
          this.hoveredButton = null;
        }, 150);
        return true;
      }
      return true;
    }
    
    if (this.showModal && this.modalButtons.length > 0) {
      const alpha = this.modalAnimation;
      const scale = 0.85 + 0.15 * alpha;
      const localX = (x - this.width / 2) / scale + this.width / 2;
      const localY = (y - this.height / 2) / scale + this.height / 2;
      
      for (const button of this.modalButtons) {
        if (button.x !== undefined && 
            localX >= button.x && localX <= button.x + button.width &&
            localY >= button.y && localY <= button.y + button.height) {
          this.clickedButton = button.id;
          this.clickAnimation = 1;
          if (this.onPlayClickSound) {
            this.onPlayClickSound();
          }
          setTimeout(() => {
            this.clickedButton = null;
            this.clickAnimation = 0;
            if (button.action) {
              button.action();
            }
          }, 150);
          return true;
        }
      }
    }
    
    if (this.handleModeSwitcherClick(x, y)) {
      return true;
    }
    
    const allButtons = [...this.buttons];
    if (this.headerButtons) {
      allButtons.push(...this.headerButtons);
    }
    
    for (const button of allButtons) {
      if (this.isPointInButton(x, y, button)) {
        this.clickedButton = button.id;
        this.clickAnimation = 1;
        if (this.onPlayClickSound) {
          this.onPlayClickSound();
        }
        setTimeout(() => {
          this.clickedButton = null;
          this.clickAnimation = 0;
          if (button.action) {
            button.action();
          }
        }, 150);
        return true;
      }
    }
    
    return false;
  }

  onStartGame() {
    this.currentLevel = 1;
    if (this.onGameStart) {
      this.onGameStart(this.levelConfig[this.currentLevel].count, this.currentLevel, this.gameMode);
    }
  }

  onResetGame() {
    if (this.onGameReset) {
      this.onGameReset();
    }
  }

  onBackToMenu() {
    this.showCompletion = false;
    if (this.onBackToMenu) {
      this.onBackToMenu();
    }
  }

  onShowInstructions() {
    this.showInstructions = true;
  }

  onChangeLevel() {
    this.currentLevel = (this.currentLevel % this.totalLevels) + 1;
  }

  onPlayAgain() {
    this.showCompletion = false;
    if (this.onGameStart) {
      this.onGameStart(this.levelConfig[this.currentLevel].count, this.currentLevel, this.gameMode);
    }
  }

  onNextLevel() {
    this.showCompletion = false;
    this.currentLevel++;
    if (this.onNextLevel) {
      this.onNextLevel(this.currentLevel);
    }
  }

  onOpenRank() {
    if (this.onOpenRank) {
      this.onOpenRank();
    }
  }
  
  onOpenAchievements() {
    this.showAchievements = true;
    this.achievementScrollOffset = 0;
    if (this.onAchievementsOpen) {
      this.onAchievementsOpen();
    }
  }
  
  onCloseAchievements() {
    this.showAchievements = false;
    if (this.onAchievementsClose) {
      this.onAchievementsClose();
    }
  }

  onSelectMode(mode) {
    this.gameMode = mode;
    this.instructionsData = null;
    this.refreshMenuButtons();
    if (this.onModeChange) {
      this.onModeChange(mode);
    }
  }

  refreshMenuButtons() {
    const isMobile = this.width < 768;
    const buttonWidth = isMobile ? 240 : 280;
    const buttonHeight = isMobile ? 60 : 70;
    const buttonSpacing = isMobile ? 20 : 24;
    const centerX = this.width / 2;
    const startY = this.height * 0.42;
    
    this.buttons = [
      {
        id: 'start',
        text: '开始游戏',
        x: centerX - buttonWidth / 2,
        y: startY,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().accent,
        action: () => this.onStartGame()
      },
      {
        id: 'instructions',
        text: '游戏规则',
        x: centerX - buttonWidth / 2,
        y: startY + buttonHeight + buttonSpacing,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().buttonPrimary,
        action: () => this.onShowInstructions()
      },
      {
        id: 'rank',
        text: '排行榜',
        x: centerX - buttonWidth / 2,
        y: startY + (buttonHeight + buttonSpacing) * 2,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().danger,
        action: () => this.onOpenRank()
      },
      {
        id: 'achievements',
        text: '成就',
        x: centerX - buttonWidth / 2,
        y: startY + (buttonHeight + buttonSpacing) * 3,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().buttonSecondary,
        hoverColor: this.lightenColor(this.getScheme().buttonSecondary, 0.15),
        action: () => this.onOpenAchievements()
      }
    ];
  }

  onToggleMode() {
    const newMode = this.gameMode === 'timed' ? 'untimed' : 'timed';
    this.onSelectMode(newMode);
  }

  setGameMode(mode) {
    this.gameMode = mode;
    this.instructionsData = null;
  }

  getGameMode() {
    return this.gameMode;
  }

  showRankView() {
    this.showRank = true;
    this.buttons = [];
  }

  hideRankView() {
    this.showRank = false;
    this.initMenu();
  }

  showModalDialog(type, title, message, buttons) {
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalButtons = buttons;
    this.showModal = true;
    this.modalAnimation = 0;
    this.modalTargetAnimation = 1;
  }

  hideModal() {
    this.modalTargetAnimation = 0;
  }

  updateModalAnimation(deltaTime) {
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

  renderModal(ctx) {
    const scheme = this.getScheme();
    const isMobile = this.width < 768;
    const alpha = this.modalAnimation;
    const scale = 0.85 + 0.15 * alpha;
    
    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? Math.min(360, this.width - 40) : 440;
    const hasScoreInMessage = this.modalMessage && this.modalMessage.includes('得分');
    let modalHeight;
    
    if (this.modalType === 'gameComplete') {
      modalHeight = isMobile ? 420 : 480;
    } else if (this.modalType === 'gameFailed') {
      modalHeight = hasScoreInMessage ? (isMobile ? 480 : 540) : (isMobile ? 380 : 420);
    } else {
      modalHeight = isMobile ? 380 : 420;
    }
    
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-this.width / 2, -this.height / 2);

    this.drawBrutalismRect(ctx, modalX, modalY, modalWidth, modalHeight, scheme.cardBg, {
      shadowOffset: 10,
      borderWidth: 5
    });

    if (this.modalType === 'gameComplete') {
      this.renderCompletionContent(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    } else if (this.modalType === 'gameFailed') {
      this.renderFailureContent(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    } else {
      this.renderDefaultModalContent(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    }

    ctx.restore();
  }

  renderCompletionContent(ctx, x, y, width, height, isMobile) {
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
    let scoreValue = '';
    
    messageLines.forEach(line => {
      if (line.includes('完成时间')) {
        timeValue = line.replace('完成时间:', '').trim();
      }
      if (line.includes('得分')) {
        scoreValue = line.replace('得分:', '').trim();
      }
    });
    
    const hasScore = scoreValue && scoreValue !== '';
    
    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 16 : 18}px Arial, sans-serif`;
    
    if (hasScore) {
      ctx.fillText('完成时间', centerX, y + (isMobile ? 155 : 180));
    } else {
      ctx.fillText('完成时间', centerX, y + (isMobile ? 175 : 210));
    }
    
    const timeBoxWidth = isMobile ? 160 : 200;
    const timeBoxHeight = isMobile ? 40 : 48;
    const timeBoxX = centerX - timeBoxWidth / 2;
    let timeBoxY;
    
    if (hasScore) {
      timeBoxY = y + (isMobile ? 175 : 200);
    } else {
      timeBoxY = y + (isMobile ? 195 : 230);
    }
    
    this.drawBrutalismRect(ctx, timeBoxX, timeBoxY, timeBoxWidth, timeBoxHeight, scheme.buttonPrimary, {
      shadowOffset: 4,
      borderWidth: 3
    });
    
    ctx.fillStyle = scheme.textLight;
    ctx.font = `bold ${isMobile ? 20 : 24}px "Arial Black", Arial, sans-serif`;
    ctx.fillText(timeValue || '0.00秒', centerX, timeBoxY + timeBoxHeight / 2);
    
    if (hasScore) {
      ctx.fillStyle = scheme.text;
      ctx.font = `bold ${isMobile ? 16 : 18}px Arial, sans-serif`;
      ctx.fillText('得分', centerX, y + (isMobile ? 235 : 270));
      
      const scoreBoxWidth = isMobile ? 160 : 200;
      const scoreBoxHeight = isMobile ? 40 : 48;
      const scoreBoxX = centerX - scoreBoxWidth / 2;
      const scoreBoxY = y + (isMobile ? 255 : 290);
      
      this.drawBrutalismRect(ctx, scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight, scheme.accent, {
        shadowOffset: 4,
        borderWidth: 3
      });
      
      ctx.fillStyle = scheme.textLight;
      ctx.font = `bold ${isMobile ? 20 : 24}px "Arial Black", Arial, sans-serif`;
      ctx.fillText(scoreValue, centerX, scoreBoxY + scoreBoxHeight / 2);
    }
    
    this.renderModalButtons(ctx, x, y + height - (isMobile ? 140 : 160), width, isMobile);
  }

  renderFailureContent(ctx, x, y, width, height, isMobile) {
    const scheme = this.getScheme();
    const centerX = x + width / 2;
    
    ctx.fillStyle = scheme.danger;
    ctx.font = `bold ${isMobile ? 40 : 48}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✕', centerX, y + (isMobile ? 40 : 50));
    
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
      
      this.drawBrutalismRect(ctx, scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight, scheme.accent, {
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
    
    this.renderModalButtons(ctx, x, y + height - (isMobile ? 130 : 150), width, isMobile);
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
    
    this.renderModalButtons(ctx, x, y + height - (isMobile ? 100 : 110), width, isMobile);
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
      } else if (button.id === 'playAgain' || button.id === 'tryAgain') {
        fillColor = scheme.buttonPrimary;
      } else {
        fillColor = scheme.cardBg;
      }
      
      if (isHovered) {
        fillColor = this.lightenColor(fillColor, 0.15);
      }
      
      let scale = 1;
      if (isHovered) scale = 1.02;
      if (isClicked) scale = 0.95;
      
      const scaledWidth = buttonWidth * scale;
      const scaledHeight = buttonHeight * scale;
      const scaledX = centerX - scaledWidth / 2;
      const scaledY = buttonY + (buttonHeight - scaledHeight) / 2;
      
      const shadowOffset = isClicked ? 2 : (isHovered ? 8 : 6);
      this.drawBrutalismRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, fillColor, {
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

  render(ctx, gameState, currentNumber, totalNumbers, timeLeft = 5.0, deltaTime = 0.016) {
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    this.updateEffects(deltaTime);
    this.updateMenuAnimation(deltaTime);
    this.updateAchievementNotifications(deltaTime);

    if (this.showAchievements) {
      this.renderMenu(ctx);
      this.renderAchievements(ctx);
      this.renderEffects(ctx);
      this.renderAchievementNotifications(ctx);
      return;
    }

    if (this.showInstructions) {
      this.renderInstructions(ctx);
      this.renderEffects(ctx);
      this.renderAchievementNotifications(ctx);
      return;
    }

    if (gameState !== 'menu') {
      this.hoveredButton = null;
    }

    if (gameState === 'menu') {
      this.renderMenu(ctx);
    } else if (gameState === 'playing' || gameState === 'completed' || gameState === 'failed') {
      this.renderGameUI(ctx, gameState, currentNumber, totalNumbers, timeLeft);
    }

    this.renderButtons(ctx);
    
    if (gameState === 'playing') {
      this.renderComboDisplay(ctx);
    }
    
    if (this.showModal) {
      this.renderModal(ctx);
    }

    this.renderEffects(ctx);
    this.renderAchievementNotifications(ctx);
  }

  updateMenuAnimation(deltaTime) {
    if (this.menuAnimation < this.menuTargetAnimation) {
      this.menuAnimation += deltaTime * 4;
      if (this.menuAnimation > this.menuTargetAnimation) {
        this.menuAnimation = this.menuTargetAnimation;
      }
    } else if (this.menuAnimation > this.menuTargetAnimation) {
      this.menuAnimation -= deltaTime * 4;
      if (this.menuAnimation < this.menuTargetAnimation) {
        this.menuAnimation = this.menuTargetAnimation;
      }
    }
  }

  renderMenu(ctx) {
    const scheme = this.getScheme();
    const isMobile = this.width < 768;

    ctx.fillStyle = scheme.background;
    ctx.fillRect(0, 0, this.width, this.height);
    
    this.renderBrutalismPattern(ctx);

    const titleY = isMobile ? this.height * 0.18 : this.height * 0.15;
    const titleSize = isMobile ? 64 : 84;
    const subtitleSize = isMobile ? 15 : 18;

    ctx.save();
    ctx.globalAlpha = Math.min(1, this.menuAnimation * 1.5);

    this.renderBrutalismTitle(ctx, this.width / 2, titleY, titleSize);

    const sloganY = titleY + (isMobile ? 110 : 140);
    ctx.font = `bold ${subtitleSize}px Arial, sans-serif`;
    ctx.fillStyle = scheme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('找回消失的专注，从找到第一个 1 开始...', this.width / 2, sloganY);
    
    ctx.restore();
    
    const switcherWidth = isMobile ? 260 : 300;
    const switcherHeight = isMobile ? 44 : 50;
    const switcherX = (this.width - switcherWidth) / 2;
    const switcherY = sloganY + (isMobile ? 35 : 45);
    
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.menuAnimation * 2);
    this.drawModeSwitcher(ctx, switcherX, switcherY, switcherWidth, switcherHeight);
    ctx.restore();
  }

  renderBrutalismPattern(ctx) {
    const scheme = this.getScheme();
    const gridSize = 40;
    
    ctx.strokeStyle = scheme.border;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.05;
    
    for (let x = 0; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  }

  renderBrutalismTitle(ctx, x, y, size) {
    const scheme = this.getScheme();
    const title = '数一数噻';
    
    ctx.save();
    
    ctx.font = `bold ${size}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textWidth = ctx.measureText(title).width;
    const paddingX = 40;
    const paddingY = 25;
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = size + paddingY * 2;
    const boxX = x - boxWidth / 2;
    const boxY = y - boxHeight / 2;
    
    ctx.fillStyle = scheme.shadow;
    ctx.fillRect(boxX + 12, boxY + 12, boxWidth, boxHeight);
    
    ctx.fillStyle = scheme.buttonPrimary;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    ctx.fillStyle = scheme.border;
    ctx.fillRect(boxX, boxY, boxWidth, 6);
    ctx.fillRect(boxX, boxY + boxHeight - 6, boxWidth, 6);
    ctx.fillRect(boxX, boxY, 6, boxHeight);
    ctx.fillRect(boxX + boxWidth - 6, boxY, 6, boxHeight);
    
    ctx.fillStyle = scheme.textLight;
    ctx.fillText(title, x, y);
    
    ctx.restore();
  }

  renderGameUI(ctx, gameState, currentNumber, totalNumbers, timeLeft) {
    const isMobile = this.width < 768;
    const headerHeight = isMobile ? 100 : 120;
    const topSafeArea = isMobile ? 44 : 0;
    const footerHeight = isMobile ? 50 : 60;
    const bottomSafeArea = isMobile ? 34 : 0;
    
    this.renderHeader(ctx, headerHeight, topSafeArea, isMobile, timeLeft, currentNumber, totalNumbers);
    
    this.renderFooter(ctx, footerHeight, bottomSafeArea, isMobile, currentNumber, totalNumbers);
  }

  renderHeader(ctx, headerHeight, topSafeArea, isMobile, timeLeft, currentNumber, totalNumbers) {
    const scheme = this.getScheme();
    
    ctx.fillStyle = scheme.background;
    ctx.fillRect(0, 0, this.width, headerHeight);
    
    ctx.fillStyle = scheme.border;
    ctx.fillRect(0, headerHeight - 4, this.width, 4);

    const buttonSize = isMobile ? 48 : 56;
    const buttonSpacing = isMobile ? 14 : 18;
    const contentStartY = topSafeArea;
    const contentHeight = headerHeight - topSafeArea;
    const buttonY = contentStartY + (contentHeight - buttonSize) / 2;
    const buttonStartX = isMobile ? 16 : 24;

    this.headerButtons = [
      {
        id: 'menu',
        text: '←',
        x: buttonStartX,
        y: buttonY,
        width: buttonSize,
        height: buttonSize,
        color: scheme.cardBg,
        hoverColor: scheme.buttonSecondary,
        action: () => this.onBackToMenu()
      },
      {
        id: 'reset',
        text: '↻',
        x: buttonStartX + buttonSize + buttonSpacing,
        y: buttonY,
        width: buttonSize,
        height: buttonSize,
        color: scheme.cardBg,
        hoverColor: scheme.buttonPrimary,
        action: () => this.onResetGame()
      }
    ];

    ctx.font = `bold ${isMobile ? 20 : 24}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    this.headerButtons.forEach(button => {
      const isHovered = this.isPointInButton(this.mouseX, this.mouseY, button);
      const isClicked = this.clickedButton === button.id;
      
      let scale = 1;
      if (isHovered) scale = 1.05;
      if (isClicked) scale = 0.95;
      
      const scaledSize = (buttonSize * scale) | 0;
      const scaledX = (button.x + (buttonSize - scaledSize) / 2) | 0;
      const scaledY = (button.y + (buttonSize - scaledSize) / 2) | 0;
      
      let fillColor = button.color;
      if (isHovered) fillColor = button.hoverColor;
      
      const shadowOffset = isClicked ? 2 : (isHovered ? 6 : 4);
      this.drawBrutalismRect(ctx, scaledX, scaledY, scaledSize, scaledSize, fillColor, {
        shadowOffset: shadowOffset,
        borderWidth: 3
      });
      
      ctx.fillStyle = isHovered ? scheme.textLight : scheme.text;
      ctx.fillText(button.text, scaledX + (scaledSize / 2) | 0, scaledY + (scaledSize / 2) | 0);
    });

    if (this.gameMode === 'timed') {
      const centerX = this.width / 2;
      const timerY = buttonY + buttonSize / 2;
      const timerFontSize = isMobile ? 28 : 36;
      
      let timerColor;
      let timerBgColor;
      if (timeLeft <= 5.0) {
        timerColor = scheme.textLight;
        timerBgColor = scheme.danger;
      } else if (timeLeft <= 10.0) {
        timerColor = scheme.textLight;
        timerBgColor = scheme.accent;
      } else {
        timerColor = scheme.textLight;
        timerBgColor = scheme.buttonPrimary;
      }
      
      const timerWidth = isMobile ? 100 : 120;
      const timerHeight = isMobile ? 44 : 52;
      const timerX = centerX - timerWidth / 2;
      const timerBoxY = timerY - timerHeight / 2;
      
      this.drawBrutalismRect(ctx, timerX, timerBoxY, timerWidth, timerHeight, timerBgColor, {
        shadowOffset: 4,
        borderWidth: 3
      });
      
      ctx.font = `bold ${timerFontSize}px "Arial Black", Arial, sans-serif`;
      ctx.fillStyle = timerColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${timeLeft.toFixed(1)}s`, centerX, timerY);
    }
  }

  renderFooter(ctx, footerHeight, bottomSafeArea, isMobile, currentNumber, totalNumbers) {
    const scheme = this.getScheme();
    const footerY = this.height - footerHeight;
    const centerX = this.width / 2;
    
    ctx.fillStyle = scheme.background;
    ctx.fillRect(0, footerY, this.width, footerHeight);
    
    ctx.fillStyle = scheme.border;
    ctx.fillRect(0, footerY, this.width, 4);
    
    const progressBarWidth = isMobile ? 220 : 300;
    const progressBarHeight = isMobile ? 28 : 34;
    const progressBarY = footerY + (footerHeight - progressBarHeight) / 2;
    const progress = (currentNumber - 1) / totalNumbers;

    this.drawBrutalismRect(ctx, centerX - progressBarWidth / 2, progressBarY, progressBarWidth, progressBarHeight, scheme.cardBg, {
      shadowOffset: 4,
      borderWidth: 3
    });

    const fillWidth = (progressBarWidth * progress) | 0;
    if (fillWidth > 0) {
      ctx.fillStyle = scheme.buttonPrimary;
      ctx.fillRect(centerX - progressBarWidth / 2 + 3, progressBarY + 3, fillWidth - 6, progressBarHeight - 6);
    }
    
    ctx.font = `bold ${isMobile ? 14 : 16}px "Arial Black", Arial, sans-serif`;
    ctx.fillStyle = scheme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${currentNumber - 1}/${totalNumbers}`, centerX, progressBarY + progressBarHeight / 2);
  }

  renderInstructions(ctx) {
    const scheme = this.getScheme();
    const isMobile = this.width < 768;

    ctx.fillStyle = `rgba(0, 0, 0, 0.7)`;
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? Math.min(360, this.width - 40) : 480;
    const modalHeight = isMobile ? 380 : 420;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    this.drawBrutalismRect(ctx, modalX, modalY, modalWidth, modalHeight, scheme.cardBg, {
      shadowOffset: 10,
      borderWidth: 5
    });

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

    const instructions = this.instructionsData || this.getInstructionsData();
    if (!this.instructionsData) {
      this.instructionsData = instructions;
    }

    this.renderInstructionsContent(ctx, instructions, modalX, modalY, modalHeight, isMobile);
  }

  getInstructionsData() {
    const scheme = this.getScheme();
    return {
      common: {
        text: '从数字 1 开始，按顺序点击屏幕上的所有图形'
      },
      timed: {
        title: '限时模式',
        color: scheme.buttonPrimary,
        desc: '点对加时5s，点错减时-5s'
      },
      free: {
        title: '自由模式',
        color: scheme.accent,
        desc: '无时间限制，自由探索'
      }
    };
  }

  renderInstructionsContent(ctx, instructions, modalX, modalY, modalHeight, isMobile) {
    const scheme = this.getScheme();

    const commonY = modalY + (isMobile ? 100 : 120);
    ctx.font = `bold ${isMobile ? 16 : 18}px Arial, sans-serif`;
    ctx.fillStyle = scheme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(instructions.common.text, this.width / 2, commonY);

    const modeY = commonY + (isMobile ? 60 : 80);
    const modeWidth = (this.width - modalX * 2 - (isMobile ? 20 : 40)) / 2;
    const modeHeight = isMobile ? 80 : 100;
    const leftModeX = modalX + (isMobile ? 10 : 20);
    const rightModeX = leftModeX + modeWidth + (isMobile ? 20 : 40);

    const modes = [
      { key: 'timed', x: leftModeX },
      { key: 'free', x: rightModeX }
    ];

    modes.forEach(mode => {
      const modeData = instructions[mode.key];

      this.drawBrutalismRect(ctx, mode.x, modeY, modeWidth, modeHeight, modeData.color, {
        shadowOffset: 4,
        borderWidth: 3
      });

      ctx.font = `bold ${isMobile ? 20 : 24}px "Arial Black", Arial, sans-serif`;
      ctx.fillStyle = scheme.textLight;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(modeData.title, mode.x + modeWidth / 2, modeY + modeHeight * 0.4);

      ctx.font = `bold ${isMobile ? 12 : 14}px Arial, sans-serif`;
      ctx.fillStyle = scheme.textLight;
      ctx.fillText(modeData.desc, mode.x + modeWidth / 2, modeY + modeHeight * 0.7);
    });

    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const buttonX = (this.width - buttonWidth) / 2;
    const buttonY = modalY + modalHeight - (isMobile ? 80 : 90);

    const isHovered = this.hoveredButton === 'instructions_ok';
    const isClicked = this.clickedButton === 'instructions_ok';

    let fillColor = scheme.buttonPrimary;
    if (isHovered) {
      fillColor = this.lightenColor(scheme.buttonPrimary, 0.15);
    }

    let scale = 1;
    if (isHovered) scale = 1.02;
    if (isClicked) scale = 0.95;

    const scaledWidth = buttonWidth * scale;
    const scaledHeight = buttonHeight * scale;
    const scaledX = (this.width - scaledWidth) / 2;
    const scaledY = buttonY + (buttonHeight - scaledHeight) / 2;

    const shadowOffset = isClicked ? 2 : (isHovered ? 8 : 6);
    this.drawBrutalismRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, fillColor, {
      shadowOffset: shadowOffset,
      borderWidth: 4
    });

    ctx.fillStyle = scheme.textLight;
    ctx.font = `bold ${isMobile ? 18 : 20}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('知道了', this.width / 2, scaledY + scaledHeight / 2);
  }

  renderAchievements(ctx) {
    const scheme = this.getScheme();
    const isMobile = this.width < 768;

    ctx.fillStyle = `rgba(0, 0, 0, 0.8)`;
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? this.width - 20 : Math.min(500, this.width - 40);
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    this.drawBrutalismRect(ctx, modalX, modalY, modalWidth, modalHeight, scheme.cardBg, {
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

    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const buttonX = (this.width - buttonWidth) / 2;
    const buttonY = modalY + modalHeight - (isMobile ? 70 : 80);

    const isHovered = this.hoveredButton === 'achievements_close';
    const isClicked = this.clickedButton === 'achievements_close';

    let fillColor = scheme.buttonPrimary;
    if (isHovered) {
      fillColor = this.lightenColor(scheme.buttonPrimary, 0.15);
    }

    let scale = 1;
    if (isHovered) scale = 1.02;
    if (isClicked) scale = 0.95;

    const scaledWidth = buttonWidth * scale;
    const scaledHeight = buttonHeight * scale;
    const scaledX = (this.width - scaledWidth) / 2;
    const scaledY = buttonY + (buttonHeight - scaledHeight) / 2;

    const shadowOffset = isClicked ? 2 : (isHovered ? 8 : 6);
    this.drawBrutalismRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, fillColor, {
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

    ctx.save();
    ctx.beginPath();
    ctx.rect(modalX, listStartY, modalWidth, listHeight);
    ctx.clip();

    const totalHeight = achievements.length * (itemHeight + itemPadding);
    const maxScroll = Math.max(0, totalHeight - listHeight);
    this.achievementScrollOffset = Math.max(0, Math.min(this.achievementScrollOffset, maxScroll));

    achievements.forEach((achievement, index) => {
      const itemY = listStartY + index * (itemHeight + itemPadding) - this.achievementScrollOffset;
      
      if (itemY + itemHeight < listStartY || itemY > listEndY) return;

      const bgColor = achievement.unlocked ? scheme.buttonSuccess : scheme.cardBg;
      const alpha = achievement.unlocked ? 1 : 0.6;

      ctx.save();
      ctx.globalAlpha = alpha;

      this.drawBrutalismRect(ctx, itemX, itemY, itemWidth, itemHeight, bgColor, {
        shadowOffset: achievement.unlocked ? 4 : 2,
        borderWidth: achievement.unlocked ? 3 : 2
      });

      ctx.font = `bold ${isMobile ? 28 : 32}px Arial, sans-serif`;
      ctx.fillStyle = achievement.unlocked ? scheme.textLight : scheme.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(achievement.icon, itemX + (isMobile ? 12 : 15), itemY + itemHeight / 2);

      ctx.font = `bold ${isMobile ? 16 : 18}px "Arial Black", Arial, sans-serif`;
      ctx.fillText(achievement.name, itemX + (isMobile ? 55 : 65), itemY + (isMobile ? 22 : 25));

      ctx.font = `${isMobile ? 12 : 14}px Arial, sans-serif`;
      ctx.fillStyle = achievement.unlocked ? scheme.textLight : scheme.text;
      ctx.globalAlpha = achievement.unlocked ? 0.9 : 0.5;
      ctx.fillText(achievement.description, itemX + (isMobile ? 55 : 65), itemY + (isMobile ? 45 : 50));

      if (!achievement.unlocked && achievement.progress !== undefined && achievement.target !== undefined) {
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

  handleAchievementsScroll(deltaY) {
    if (!this.showAchievements) return;
    
    this.achievementScrollOffset += deltaY;
  }

  handleTouchStart(y) {
    if (!this.showAchievements) return;
    this.touchStartY = y;
    this.lastTouchY = y;
    this.isTouching = true;
  }

  handleTouchMove(y) {
    if (!this.showAchievements || !this.isTouching) return;
    
    const deltaY = this.lastTouchY - y;
    this.lastTouchY = y;
    
    const isMobile = this.width < 768;
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const listStartY = (this.height - modalHeight) / 2 + (isMobile ? 90 : 110);
    const listEndY = (this.height - modalHeight) / 2 + modalHeight - (isMobile ? 90 : 100);
    
    if (y >= listStartY && y <= listEndY) {
      this.achievementScrollOffset += deltaY;
    }
  }

  handleTouchEnd() {
    this.isTouching = false;
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
        this.createComboParticles(level, count);
        this.comboData.scale = 1.4;
      }
    } else {
      this.comboData.animation = Math.max(0, this.comboData.animation - 0.1);
      this.comboData.glowIntensity = 0;
    }
    
    if (level && level !== previousLevel) {
      this.flashScreen(level.color, 0.3);
    }
  }

  onComboLevelUp(level, count) {
    this.comboData.scale = 1.6;
    this.createComboParticles(level, count);
    this.flashScreen(level.color, 0.4);
  }

  onComboBreak(count, level) {
    this.comboData.breakAnimation = 1;
    this.comboData.count = 0;
    this.comboData.level = null;
  }

  createComboParticles(level, count) {
    const particleCount = Math.min(count || 5, 20);
    const color = level ? level.color : '#FFD700';
    
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

  updateComboEffects(deltaTime) {
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

  renderComboDisplay(ctx) {
    if (this.comboData.count < 5) return;
    
    const scheme = this.getScheme();
    const isMobile = this.width < 768;
    const centerX = this.width / 2;
    const centerY = isMobile ? 80 : 100;
    
    const level = this.comboData.level;
    const color = level ? level.color : scheme.accent;
    const scale = this.comboData.scale;
    
    ctx.save();
    
    if (this.comboData.glowIntensity > 0) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 20 * this.comboData.glowIntensity;
    }
    
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    
    const boxWidth = isMobile ? 120 : 150;
    const boxHeight = isMobile ? 50 : 60;
    const boxX = centerX - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;
    
    this.drawBrutalismRect(ctx, boxX, boxY, boxWidth, boxHeight, color, {
      shadowOffset: 4,
      borderWidth: 3
    });
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isMobile ? 24 : 28}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.comboData.count}连击`, centerX, centerY - (isMobile ? 5 : 8));
    
    if (level) {
      ctx.font = `bold ${isMobile ? 12 : 14}px Arial, sans-serif`;
      ctx.fillText(level.name, centerX, centerY + (isMobile ? 15 : 18));
    }
    
    ctx.restore();
    
    this.renderComboParticles(ctx);
    
    if (this.comboData.breakAnimation > 0) {
      this.renderComboBreakEffect(ctx);
    }
  }

  renderComboParticles(ctx) {
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

  renderComboBreakEffect(ctx) {
    const alpha = this.comboData.breakAnimation;
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  flashScreen(color, intensity) {
    this.flashAlpha = intensity;
    this.flashColor = color;
  }

  renderButtons(ctx) {
    const isMobile = this.width < 768;
    
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      const isHovered = this.hoveredButton === button.id;
      const isClicked = this.clickedButton === button.id;
      
      const delay = i * 0.08;
      const alpha = Math.min(1, Math.max(0, (this.menuAnimation - delay) * 3));
      
      if (alpha <= 0) continue;
      
      this.drawBrutalismButton(ctx, button, isHovered, isClicked, alpha);
    }
  }

  updateMousePosition(x, y) {
    this.mouseX = x;
    this.mouseY = y;
    this.updateModeSwitcherHover(x, y);
    this.updateHoveredButton();
  }

  updateHoveredButton() {
    this.hoveredButton = null;
    
    const allButtons = [...this.buttons];
    if (this.showModal) {
      allButtons.push(...this.modalButtons);
    }
    
    if (this.headerButtons) {
      allButtons.push(...this.headerButtons);
    }
    
    if (this.showAchievements) {
      const isMobile = this.width < 768;
      const buttonWidth = isMobile ? 180 : 220;
      const buttonHeight = isMobile ? 48 : 56;
      const modalWidth = isMobile ? this.width - 20 : Math.min(500, this.width - 40);
      const modalHeight = isMobile ? this.height - 80 : this.height - 100;
      const modalY = (this.height - modalHeight) / 2;
      const buttonX = (this.width - buttonWidth) / 2;
      const buttonY = modalY + modalHeight - (isMobile ? 70 : 80);

      if (this.mouseX >= buttonX && this.mouseX <= buttonX + buttonWidth &&
          this.mouseY >= buttonY && this.mouseY <= buttonY + buttonHeight) {
        this.hoveredButton = 'achievements_close';
      }
      return;
    }
    
    if (this.showInstructions) {
      const isMobile = this.width < 768;
      const buttonWidth = isMobile ? 180 : 220;
      const buttonHeight = isMobile ? 48 : 56;
      const modalWidth = isMobile ? Math.min(360, this.width - 40) : 480;
      const modalHeight = isMobile ? 420 : 480;
      const modalX = (this.width - modalWidth) / 2;
      const modalY = (this.height - modalHeight) / 2;
      const buttonX = (this.width - buttonWidth) / 2;
      const buttonY = modalY + modalHeight - (isMobile ? 80 : 90);

      if (this.mouseX >= buttonX && this.mouseX <= buttonX + buttonWidth &&
          this.mouseY >= buttonY && this.mouseY <= buttonY + buttonHeight) {
        this.hoveredButton = 'instructions_ok';
      }
    }
    
    if (!this.hoveredButton) {
      for (const button of allButtons) {
        if (this.isPointInButton(this.mouseX, this.mouseY, button)) {
          this.hoveredButton = button.id;
          break;
        }
      }
    }
  }

  isPointInButton(x, y, button) {
    return x >= button.x && x <= button.x + button.width &&
           y >= button.y && y <= button.y + button.height;
  }
}
