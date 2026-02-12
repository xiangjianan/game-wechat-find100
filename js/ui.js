import { COLORS, COLOR_SCHEMES, setColorScheme, getColorScheme, getAllColorSchemes, BRUTALISM_STYLES } from './constants/colors';

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
    
    this.currentColorScheme = getColorScheme();
    this.showColorSchemeSelector = false;
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

  updateEffects(deltaTime) {
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
        color: this.getScheme().buttonPrimary,
        hoverColor: this.lightenColor(this.getScheme().buttonPrimary, 0.15),
        action: () => this.onStartGame()
      },
      {
        id: 'toggleMode',
        text: this.gameMode === 'timed' ? '限时模式' : '自由模式',
        x: centerX - buttonWidth / 2,
        y: startY + buttonHeight + buttonSpacing,
        width: buttonWidth,
        height: buttonHeight,
        color: this.gameMode === 'timed' ? this.getScheme().buttonPrimary : this.getScheme().buttonSuccess,
        hoverColor: this.gameMode === 'timed' ? this.lightenColor(this.getScheme().buttonPrimary, 0.15) : this.lightenColor(this.getScheme().buttonSuccess, 0.15),
        action: () => this.onToggleMode()
      },
      {
        id: 'colorScheme',
        text: `主题: ${this.getScheme().name}`,
        x: centerX - buttonWidth / 2,
        y: startY + (buttonHeight + buttonSpacing) * 2,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().buttonSecondary,
        hoverColor: this.lightenColor(this.getScheme().buttonSecondary, 0.15),
        action: () => this.onCycleColorScheme()
      },
      {
        id: 'instructions',
        text: '游戏规则',
        x: centerX - buttonWidth / 2,
        y: startY + (buttonHeight + buttonSpacing) * 3,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().accent,
        hoverColor: this.lightenColor(this.getScheme().accent, 0.15),
        action: () => this.onShowInstructions()
      },
      {
        id: 'rank',
        text: '排行榜',
        x: centerX - buttonWidth / 2,
        y: startY + (buttonHeight + buttonSpacing) * 4,
        width: buttonWidth,
        height: buttonHeight,
        color: this.getScheme().danger,
        hoverColor: this.lightenColor(this.getScheme().danger, 0.15),
        action: () => this.onOpenRank()
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

  onCycleColorScheme() {
    const schemes = getAllColorSchemes();
    const currentIndex = schemes.findIndex(s => s.id === this.getScheme().id);
    const nextIndex = (currentIndex + 1) % schemes.length;
    setColorScheme(schemes[nextIndex].id);
    this.currentColorScheme = schemes[nextIndex];
    this.initMenu();
    if (this.onColorSchemeChange) {
      this.onColorSchemeChange(schemes[nextIndex].id);
    }
  }

  initGame() {
    this.showCompletion = false;
    this.showFailure = false;
    this.buttons = [];
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

    if (this.showInstructions) {
      this.showInstructions = false;
      this.hoveredButton = null;
      this.clickedButton = null;
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
    
    const allButtons = [...this.buttons];
    if (this.headerButtons) {
      allButtons.push(...this.headerButtons);
    }
    
    for (const button of allButtons) {
      if (this.isPointInButton(x, y, button)) {
        this.clickedButton = button.id;
        this.clickAnimation = 1;
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

  onSelectMode(mode) {
    this.gameMode = mode;
    this.instructionsData = null;
    this.initMenu();
    if (this.onModeChange) {
      this.onModeChange(mode);
    }
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

  showRank() {
    this.showRank = true;
    this.buttons = [];
  }

  hideRank() {
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
    const modalHeight = this.modalType === 'gameComplete' ? (isMobile ? 420 : 480) : (isMobile ? 380 : 420);
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
    
    messageLines.forEach(line => {
      if (line.includes('完成时间')) {
        timeValue = line.replace('完成时间:', '').trim();
      }
    });
    
    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 16 : 18}px Arial, sans-serif`;
    ctx.fillText('完成时间', centerX, y + (isMobile ? 160 : 190));
    
    const timeBoxWidth = isMobile ? 180 : 220;
    const timeBoxHeight = isMobile ? 50 : 60;
    const timeBoxX = centerX - timeBoxWidth / 2;
    const timeBoxY = y + (isMobile ? 180 : 210);
    
    this.drawBrutalismRect(ctx, timeBoxX, timeBoxY, timeBoxWidth, timeBoxHeight, scheme.buttonPrimary, {
      shadowOffset: 4,
      borderWidth: 3
    });
    
    ctx.fillStyle = scheme.textLight;
    ctx.font = `bold ${isMobile ? 24 : 28}px "Arial Black", Arial, sans-serif`;
    ctx.fillText(timeValue || '0.00秒', centerX, timeBoxY + timeBoxHeight / 2);
    
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
    
    messageLines.forEach(line => {
      if (line.includes('完成进度')) {
        progressText = line;
      }
      if (line.includes('用时')) {
        timeText = line;
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
    }
    
    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 16 : 18}px Arial, sans-serif`;
    ctx.fillText('别放弃，再试一次!', centerX, y + (isMobile ? 210 : 240));
    
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

    if (this.showInstructions) {
      this.renderInstructions(ctx);
      this.renderEffects(ctx);
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
    
    if (this.showModal) {
      this.renderModal(ctx);
    }

    this.renderEffects(ctx);
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

    const titleY = isMobile ? this.height * 0.16 : this.height * 0.13;
    const titleSize = isMobile ? 52 : 68;
    const subtitleSize = isMobile ? 14 : 16;

    ctx.save();
    ctx.globalAlpha = Math.min(1, this.menuAnimation * 1.5);

    this.renderBrutalismTitle(ctx, this.width / 2, titleY, titleSize);

    ctx.font = `bold ${subtitleSize}px Arial, sans-serif`;
    ctx.fillStyle = scheme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('找回消失的专注，从找到第一个1开始...', this.width / 2, titleY + titleSize * 0.85);

    this.renderFeatureCards(ctx, isMobile);
    
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
    const padding = 20;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = size * 1.3;
    const boxX = x - boxWidth / 2;
    const boxY = y - boxHeight / 2;
    
    this.drawBrutalismRect(ctx, boxX, boxY, boxWidth, boxHeight, scheme.buttonPrimary, {
      shadowOffset: 8,
      borderWidth: 5
    });
    
    ctx.fillStyle = scheme.textLight;
    ctx.fillText(title, x, y);
    
    ctx.restore();
  }

  renderFeatureCards(ctx, isMobile) {
    const scheme = this.getScheme();
    const features = [
      { icon: '⚡', text: '快速反应' },
      { icon: '🎯', text: '精准点击' },
      { icon: '🏆', text: '挑战极限' }
    ];

    const cardWidth = isMobile ? 90 : 120;
    const cardHeight = isMobile ? 90 : 110;
    const cardSpacing = isMobile ? 14 : 20;
    const totalWidth = cardWidth * 3 + cardSpacing * 2;
    const startX = (this.width - totalWidth) / 2;
    const cardY = isMobile ? this.height * 0.30 : this.height * 0.26;

    const iconSize = isMobile ? 28 : 36;
    const textSize = isMobile ? 13 : 15;

    features.forEach((feature, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const delay = index * 0.1;
      const cardAlpha = Math.min(1, Math.max(0, (this.menuAnimation - delay) * 2));
      
      if (cardAlpha <= 0) return;
      
      ctx.save();
      ctx.globalAlpha = cardAlpha;
      
      const colors = [scheme.buttonPrimary, scheme.buttonSecondary, scheme.buttonSuccess];
      this.drawBrutalismRect(ctx, x, cardY, cardWidth, cardHeight, colors[index], {
        shadowOffset: 6,
        borderWidth: 4
      });
      
      ctx.font = `${iconSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = scheme.textLight;
      ctx.fillText(feature.icon, x + cardWidth / 2, cardY + cardHeight * 0.38);
      
      ctx.font = `bold ${textSize}px Arial, sans-serif`;
      ctx.fillStyle = scheme.textLight;
      ctx.fillText(feature.text, x + cardWidth / 2, cardY + cardHeight * 0.72);
      
      ctx.restore();
    });
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
    const modalHeight = isMobile ? 420 : 480;
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
    if (this.gameMode === 'timed') {
      return [
        { icon: '1', text: '按顺序点击数字，直到100为止', color: scheme.buttonPrimary },
        { icon: '2', text: '点对加时5秒，点错减5秒', color: scheme.buttonSuccess },
        { icon: '3', text: '倒计时归零则通关失败', color: scheme.danger }
      ];
    } else {
      return [
        { icon: '1', text: '按顺序点击数字，直到100为止', color: scheme.buttonPrimary },
        { icon: '2', text: '无时间限制，自由探索', color: scheme.buttonSuccess },
        { icon: '3', text: '享受轻松的游戏体验', color: scheme.accent }
      ];
    }
  }

  renderInstructionsContent(ctx, instructions, modalX, modalY, modalHeight, isMobile) {
    const scheme = this.getScheme();
    const contentStartY = modalY + (isMobile ? 110 : 130);
    const lineHeight = isMobile ? 75 : 85;

    ctx.textBaseline = 'middle';

    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];
      const y = contentStartY + i * lineHeight;

      const iconSize = isMobile ? 48 : 56;
      const iconX = modalX + (isMobile ? 30 : 40);
      const iconY = y;

      this.drawBrutalismRect(ctx, iconX, iconY - iconSize / 2, iconSize, iconSize, instruction.color, {
        shadowOffset: 4,
        borderWidth: 3
      });

      ctx.font = `bold ${isMobile ? 22 : 26}px "Arial Black", Arial, sans-serif`;
      ctx.fillStyle = scheme.textLight;
      ctx.textAlign = 'center';
      ctx.fillText(instruction.icon, iconX + iconSize / 2, iconY);

      ctx.font = `bold ${isMobile ? 15 : 17}px Arial, sans-serif`;
      ctx.fillStyle = scheme.text;
      ctx.textAlign = 'left';
      ctx.fillText(instruction.text, iconX + iconSize + (isMobile ? 15 : 20), y);
    }

    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const buttonX = (this.width - buttonWidth) / 2;
    const buttonY = modalY + modalHeight - (isMobile ? 80 : 90);

    this.drawBrutalismRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, scheme.buttonPrimary, {
      shadowOffset: 6,
      borderWidth: 4
    });

    ctx.fillStyle = scheme.textLight;
    ctx.font = `bold ${isMobile ? 18 : 20}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('知道了', this.width / 2, buttonY + buttonHeight / 2);
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
    
    for (const button of allButtons) {
      if (this.isPointInButton(this.mouseX, this.mouseY, button)) {
        this.hoveredButton = button.id;
        break;
      }
    }
  }

  isPointInButton(x, y, button) {
    return x >= button.x && x <= button.x + button.width &&
           y >= button.y && y <= button.y + button.height;
  }
}
