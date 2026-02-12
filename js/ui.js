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
  }

  roundRect(ctx, x, y, width, height, radius) {
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
      ctx.font = 'bold 32px Arial';
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
    const buttonWidth = isMobile ? 220 : 260;
    const buttonHeight = isMobile ? 56 : 64;
    const buttonSpacing = isMobile ? 16 : 20;
    const centerX = this.width / 2;
    const startY = this.height * 0.45;
    
    const modeButtonWidth = buttonWidth;
    const modeButtonHeight = buttonHeight;
    
    this.buttons = [
      {
        id: 'start',
        text: '开始游戏',
        x: centerX - buttonWidth / 2,
        y: startY,
        width: buttonWidth,
        height: buttonHeight,
        gradientColors: ['#F97316', '#EF4444'],
        hoverGradientColors: ['#FB923C', '#F87171'],
        shadowColor: 'rgba(249, 115, 22, 0.5)',
        action: () => this.onStartGame()
      },
      {
        id: 'toggleMode',
        text: this.gameMode === 'timed' ? '限时模式' : '自由模式',
        x: centerX - modeButtonWidth / 2,
        y: startY + buttonHeight + buttonSpacing,
        width: modeButtonWidth,
        height: modeButtonHeight,
        gradientColors: this.gameMode === 'timed' ? ['#F97316', '#EA580C'] : ['#10B981', '#059669'],
        hoverGradientColors: this.gameMode === 'timed' ? ['#FB923C', '#F87171'] : ['#34D399', '#10B981'],
        shadowColor: this.gameMode === 'timed' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(16, 185, 129, 0.5)',
        action: () => this.onToggleMode()
      },
      {
        id: 'instructions',
        text: '游戏规则',
        x: centerX - buttonWidth / 2,
        y: startY + (buttonHeight + buttonSpacing) * 2,
        width: buttonWidth,
        height: buttonHeight,
        gradientColors: ['#0EA5E9', '#3B82F6'],
        hoverGradientColors: ['#38BDF8', '#60A5FA'],
        shadowColor: 'rgba(14, 165, 233, 0.5)',
        action: () => this.onShowInstructions()
      },
      {
        id: 'rank',
        text: '排行榜',
        x: centerX - buttonWidth / 2,
        y: startY + (buttonHeight + buttonSpacing) * 3,
        width: buttonWidth,
        height: buttonHeight,
        gradientColors: ['#A855F7', '#EC4899'],
        hoverGradientColors: ['#C084FC', '#F472B6'],
        shadowColor: 'rgba(168, 85, 247, 0.5)',
        action: () => this.onOpenRank()
      }
    ];
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
    const buttonWidth = isMobile ? 100 : 120;
    const buttonHeight = isMobile ? 48 : 56;
    const buttonSpacing = isMobile ? 12 : 16;
    
    let buttonCount = hasNextLevel ? 3 : 2;
    const totalWidth = buttonWidth * buttonCount + buttonSpacing * (buttonCount - 1);
    const startX = (this.width - totalWidth) / 2;
    const buttonY = this.height / 2 + 80;
    
    this.buttons = [
      {
        id: 'playAgain',
        text: '再玩一次',
        x: startX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#F97316',
        hoverColor: '#EA580C',
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
        color: '#0EA5E9',
        hoverColor: '#0284C7',
        action: () => this.onNextLevel()
      });
    }
    
    this.buttons.push({
      id: 'menu',
      text: '返回菜单',
      x: startX + buttonWidth * (hasNextLevel ? 2 : 1) + buttonSpacing * (hasNextLevel ? 2 : 1),
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      color: 'rgba(255, 255, 255, 0.2)',
      hoverColor: 'rgba(255, 255, 255, 0.35)',
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
    const buttonWidth = isMobile ? 140 : 160;
    const buttonHeight = isMobile ? 48 : 56;
    const buttonSpacing = isMobile ? 12 : 16;
    
    this.buttons = [
      {
        id: 'tryAgain',
        text: '再试一次',
        x: this.width / 2 - buttonWidth / 2,
        y: this.height / 2 + 50,
        width: buttonWidth,
        height: buttonHeight,
        color: '#F97316',
        hoverColor: '#EA580C',
        action: () => this.onPlayAgain()
      },
      {
        id: 'menu',
        text: '返回菜单',
        x: this.width / 2 - buttonWidth / 2,
        y: this.height / 2 + 50 + buttonHeight + buttonSpacing,
        width: buttonWidth,
        height: buttonHeight,
        color: 'rgba(255, 255, 255, 0.2)',
        hoverColor: 'rgba(255, 255, 255, 0.35)',
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
    const isMobile = this.width < 768;
    const alpha = this.modalAnimation;
    const scale = 0.85 + 0.15 * alpha;
    
    ctx.fillStyle = `rgba(15, 23, 42, ${0.85 * alpha})`;
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? Math.min(340, this.width - 40) : 420;
    const modalHeight = this.modalType === 'gameComplete' ? (isMobile ? 420 : 480) : (isMobile ? 380 : 420);
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-this.width / 2, -this.height / 2);

    this.renderModalBackground(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);

    if (this.modalType === 'gameComplete') {
      this.renderCompletionContent(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    } else if (this.modalType === 'gameFailed') {
      this.renderFailureContent(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    } else {
      this.renderDefaultModalContent(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    }

    ctx.restore();
  }

  renderModalBackground(ctx, x, y, width, height, isMobile) {
    const borderRadius = isMobile ? 24 : 32;
    
    const bgGradient = ctx.createLinearGradient(x, y, x, y + height);
    bgGradient.addColorStop(0, 'rgba(49, 46, 129, 0.95)');
    bgGradient.addColorStop(0.5, 'rgba(30, 27, 75, 0.98)');
    bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    
    ctx.fillStyle = bgGradient;
    this.roundRect(ctx, x, y, width, height, borderRadius);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, width, height, borderRadius);
    ctx.stroke();
    
    const innerGradient = ctx.createLinearGradient(x + 4, y + 4, x + 4, y + height - 8);
    innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
    ctx.fillStyle = innerGradient;
    this.roundRect(ctx, x + 4, y + 4, width - 8, height - 8, borderRadius - 4);
    ctx.fill();
  }

  renderCompletionContent(ctx, x, y, width, height, isMobile) {
    const centerX = x + width / 2;
    const time = Date.now() * 0.001;
    
    this.renderTrophy(ctx, centerX, y + (isMobile ? 50 : 60), isMobile ? 50 : 60, time);
    
    ctx.fillStyle = '#FBBF24';
    ctx.font = `bold ${isMobile ? 28 : 36}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('恭喜通关！', centerX, y + (isMobile ? 110 : 130));
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    const messageLines = this.modalMessage.split('\n');
    let timeValue = '';
    
    messageLines.forEach(line => {
      if (line.includes('完成时间')) {
        timeValue = line.replace('完成时间:', '').trim();
      }
    });
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = `${isMobile ? 14 : 16}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('本次得分', centerX, y + (isMobile ? 145 : 170));
    
    ctx.fillStyle = '#FBBF24';
    ctx.font = `bold ${isMobile ? 36 : 48}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(timeValue || '0.00秒', centerX, y + (isMobile ? 180 : 215));
    
    this.renderStars(ctx, centerX, y + (isMobile ? 215 : 260), isMobile ? 20 : 25, 5, time);
    
    this.renderModalButtons(ctx, x, y + height - (isMobile ? 140 : 160), width, isMobile);
  }

  renderFailureContent(ctx, x, y, width, height, isMobile) {
    const centerX = x + width / 2;
    const time = Date.now() * 0.001;
    
    this.renderRetryIcon(ctx, centerX, y + (isMobile ? 40 : 50), isMobile ? 35 : 45, time);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isMobile ? 26 : 32}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('再接再厉！', centerX, y + (isMobile ? 90 : 110));
    
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
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = `${isMobile ? 14 : 16}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    
    let textY = y + (isMobile ? 125 : 150);
    if (progressText) {
      ctx.fillText(progressText, centerX, textY);
      textY += isMobile ? 24 : 28;
    }
    if (timeText) {
      ctx.fillText(timeText, centerX, textY);
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `${isMobile ? 15 : 17}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('别放弃，再试一次！', centerX, y + (isMobile ? 190 : 220));
    
    this.renderModalButtons(ctx, x, y + height - (isMobile ? 130 : 150), width, isMobile);
  }

  renderDefaultModalContent(ctx, x, y, width, height, isMobile) {
    const centerX = x + width / 2;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isMobile ? 22 : 26}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.modalTitle, centerX, y + (isMobile ? 50 : 60));
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `${isMobile ? 15 : 17}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    
    const messageLines = this.modalMessage.split('\n');
    const lineHeight = isMobile ? 24 : 28;
    const messageY = y + (isMobile ? 90 : 100);
    
    messageLines.forEach((line, index) => {
      ctx.fillText(line, centerX, messageY + index * lineHeight);
    });
    
    this.renderModalButtons(ctx, x, y + height - (isMobile ? 100 : 110), width, isMobile);
  }

  renderTrophy(ctx, x, y, size, time) {
    const bounce = Math.sin(time * 3) * 3;
    const trophyY = y + bounce;
    
    ctx.save();
    
    const cupWidth = size * 1.2;
    const cupHeight = size * 0.9;
    
    const goldGradient = ctx.createLinearGradient(x - cupWidth/2, trophyY - cupHeight/2, x + cupWidth/2, trophyY + cupHeight/2);
    goldGradient.addColorStop(0, '#FFD700');
    goldGradient.addColorStop(0.3, '#FFA500');
    goldGradient.addColorStop(0.7, '#FFD700');
    goldGradient.addColorStop(1, '#B8860B');
    
    ctx.fillStyle = goldGradient;
    ctx.beginPath();
    ctx.moveTo(x - cupWidth/2, trophyY - cupHeight/3);
    ctx.quadraticCurveTo(x - cupWidth/2, trophyY - cupHeight/2, x - cupWidth/3, trophyY - cupHeight/2);
    ctx.lineTo(x + cupWidth/3, trophyY - cupHeight/2);
    ctx.quadraticCurveTo(x + cupWidth/2, trophyY - cupHeight/2, x + cupWidth/2, trophyY - cupHeight/3);
    ctx.quadraticCurveTo(x + cupWidth/2, trophyY + cupHeight/3, x + cupWidth/4, trophyY + cupHeight/3);
    ctx.lineTo(x + cupWidth/5, trophyY + cupHeight/2);
    ctx.lineTo(x - cupWidth/5, trophyY + cupHeight/2);
    ctx.lineTo(x - cupWidth/4, trophyY + cupHeight/3);
    ctx.quadraticCurveTo(x - cupWidth/2, trophyY + cupHeight/3, x - cupWidth/2, trophyY - cupHeight/3);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - size/8, trophyY + cupHeight/2, size/4, size/6);
    
    ctx.fillStyle = goldGradient;
    ctx.beginPath();
    ctx.ellipse(x, trophyY + cupHeight/2 + size/6, size/6, size/10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    this.renderSparkles(ctx, x, trophyY, size, time);
    
    ctx.restore();
  }

  renderRetryIcon(ctx, x, y, size, time) {
    const rotate = time * 2;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.6, -Math.PI/2, Math.PI * 1.2);
    ctx.stroke();
    
    const arrowX = Math.cos(Math.PI * 1.2) * size * 0.6;
    const arrowY = Math.sin(Math.PI * 1.2) * size * 0.6;
    
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 8, arrowY - 6);
    ctx.lineTo(arrowX - 8, arrowY + 6);
    ctx.closePath();
    ctx.fillStyle = '#60A5FA';
    ctx.fill();
    
    ctx.restore();
  }

  renderStars(ctx, x, y, starSize, count, time) {
    const spacing = starSize * 1.8;
    const startX = x - (count - 1) * spacing / 2;
    
    for (let i = 0; i < count; i++) {
      const starX = startX + i * spacing;
      const twinkle = 0.8 + 0.2 * Math.sin(time * 4 + i);
      
      ctx.save();
      ctx.translate(starX, y);
      ctx.scale(twinkle, twinkle);
      
      const starGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, starSize);
      starGradient.addColorStop(0, '#FFD700');
      starGradient.addColorStop(0.5, '#FFA500');
      starGradient.addColorStop(1, '#FF8C00');
      
      ctx.fillStyle = starGradient;
      this.drawStar(ctx, 0, 0, 5, starSize, starSize * 0.4);
      ctx.fill();
      
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();
    }
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  renderSparkles(ctx, x, y, size, time) {
    const sparkles = [
      { angle: 0, distance: size * 1.3, size: 4 },
      { angle: Math.PI / 3, distance: size * 1.2, size: 3 },
      { angle: Math.PI * 2 / 3, distance: size * 1.4, size: 5 },
      { angle: Math.PI, distance: size * 1.2, size: 3 },
      { angle: Math.PI * 4 / 3, distance: size * 1.3, size: 4 },
      { angle: Math.PI * 5 / 3, distance: size * 1.1, size: 3 },
    ];
    
    sparkles.forEach((sparkle, index) => {
      const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + index);
      const sx = x + Math.cos(sparkle.angle + time * 0.5) * sparkle.distance;
      const sy = y + Math.sin(sparkle.angle + time * 0.5) * sparkle.distance * 0.3;
      
      ctx.fillStyle = `rgba(255, 215, 0, ${twinkle})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sparkle.size * twinkle, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderModalButtons(ctx, x, y, width, isMobile) {
    const buttonWidth = isMobile ? 200 : 240;
    const buttonHeight = isMobile ? 44 : 52;
    const buttonSpacing = isMobile ? 12 : 16;
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
      
      let scale = 1;
      if (isHovered) scale = 1.03;
      if (isClicked) scale = 0.97;
      
      const scaledWidth = buttonWidth * scale;
      const scaledHeight = buttonHeight * scale;
      const scaledX = centerX - scaledWidth / 2;
      const scaledY = buttonY + (buttonHeight - scaledHeight) / 2;
      
      ctx.save();
      
      let gradientColors;
      let shadowColor;
      
      if (button.id === 'nextLevel' || button.id === 'restart') {
        gradientColors = ['#22C55E', '#16A34A'];
        shadowColor = 'rgba(34, 197, 94, 0.4)';
      } else if (button.id === 'playAgain' || button.id === 'tryAgain') {
        gradientColors = ['#F97316', '#EA580C'];
        shadowColor = 'rgba(249, 115, 22, 0.4)';
      } else {
        gradientColors = ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'];
        shadowColor = 'rgba(255, 255, 255, 0.1)';
      }
      
      if (isHovered) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 4;
      }
      
      const gradient = ctx.createLinearGradient(scaledX, scaledY, scaledX, scaledY + scaledHeight);
      gradient.addColorStop(0, gradientColors[0]);
      gradient.addColorStop(1, gradientColors[1]);
      ctx.fillStyle = gradient;
      
      this.roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, buttonHeight / 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.shadowOffsetY = 0;
      
      if (button.id !== 'menu') {
        const highlightGradient = ctx.createLinearGradient(scaledX, scaledY, scaledX, scaledY + scaledHeight * 0.5);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        this.roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight * 0.5, buttonHeight / 2);
        ctx.fill();
      }
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, buttonHeight / 2);
      ctx.stroke();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isMobile ? 16 : 18}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, centerX, scaledY + scaledHeight / 2);
      
      ctx.restore();
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
    const isMobile = this.width < 768;

    this.renderMenuBackground(ctx);

    this.particleOffset += 0.5;
    this.renderParticles(ctx);

    const titleY = isMobile ? this.height * 0.18 : this.height * 0.15;
    const titleSize = isMobile ? 56 : 72;
    const subtitleSize = isMobile ? 14 : 16;

    ctx.save();
    ctx.globalAlpha = Math.min(1, this.menuAnimation * 1.5);

    this.renderTitleWithRibbon(ctx, this.width / 2, titleY, titleSize);

    ctx.font = `${subtitleSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('找回消失的专注，从找到第一个1开始...', this.width / 2, titleY + titleSize * 0.9);

    this.renderFeatureCards(ctx, isMobile);
    
    ctx.restore();
  }

  renderMenuBackground(ctx) {
    ctx.fillStyle = '#1E1B4B';
    ctx.fillRect(0, 0, this.width, this.height);

    this.renderStars(ctx);
  }

  renderStars(ctx) {
    const stars = [
      { x: 0.1, y: 0.1, size: 2 },
      { x: 0.85, y: 0.15, size: 3 },
      { x: 0.2, y: 0.35, size: 2 },
      { x: 0.9, y: 0.4, size: 2 },
      { x: 0.05, y: 0.6, size: 2 },
      { x: 0.95, y: 0.7, size: 3 },
      { x: 0.15, y: 0.85, size: 2 },
      { x: 0.8, y: 0.9, size: 2 },
    ];

    ctx.fillStyle = 'rgba(255, 255, 200, 0.5)';
    
    stars.forEach(star => {
      const x = (star.x * this.width) | 0;
      const y = (star.y * this.height) | 0;
      
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderTitleWithRibbon(ctx, x, y, size) {
    const title = '数一数噻';
    
    ctx.save();
    
    ctx.font = `bold ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(title, x, y);
    
    ctx.restore();
  }

  renderFeatureCards(ctx, isMobile) {
    const features = [
      { icon: '⚡', text: '快速反应', color: '#FBBF24' },
      { icon: '🎯', text: '精准点击', color: '#F472B6' },
      { icon: '🏆', text: '挑战极限', color: '#60A5FA' }
    ];

    const cardWidth = isMobile ? 85 : 110;
    const cardHeight = isMobile ? 100 : 130;
    const cardSpacing = isMobile ? 12 : 20;
    const totalWidth = cardWidth * 3 + cardSpacing * 2;
    const startX = (this.width - totalWidth) / 2;
    const cardY = isMobile ? this.height * 0.32 : this.height * 0.28;
    const borderRadius = isMobile ? 12 : 16;

    const iconSize = isMobile ? 32 : 40;
    const textSize = isMobile ? 13 : 15;

    features.forEach((feature, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const delay = index * 0.1;
      const cardAlpha = Math.min(1, Math.max(0, (this.menuAnimation - delay) * 2));
      
      if (cardAlpha <= 0) return;
      
      ctx.save();
      ctx.globalAlpha = cardAlpha;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.roundRect(ctx, x, cardY, cardWidth, cardHeight, borderRadius);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, x, cardY, cardWidth, cardHeight, borderRadius);
      ctx.stroke();
      
      ctx.font = `${iconSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = feature.color;
      ctx.fillText(feature.icon, x + cardWidth / 2, cardY + cardHeight * 0.4);
      
      ctx.font = `bold ${textSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillText(feature.text, x + cardWidth / 2, cardY + cardHeight * 0.75);
      
      ctx.restore();
    });
  }

  renderParticles(ctx) {
    const particleCount = 12;
    const time = Date.now() * 0.0005;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    
    for (let i = 0; i < particleCount; i++) {
      const x = ((i * 137 + this.particleOffset) | 0) % this.width;
      const y = ((i * 89 + ((time + i) * 30 | 0)) | 0) % this.height;
      const size = 2;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderGameUI(ctx, gameState, currentNumber, totalNumbers, timeLeft) {
    const isMobile = this.width < 768;
    const headerHeight = isMobile ? 110 : 130;
    const topSafeArea = isMobile ? 44 : 0;
    const footerHeight = isMobile ? 50 : 60;
    const bottomSafeArea = isMobile ? 34 : 0;
    
    this.renderHeader(ctx, headerHeight, topSafeArea, isMobile, timeLeft, currentNumber, totalNumbers);
    
    this.renderFooter(ctx, footerHeight, bottomSafeArea, isMobile, currentNumber, totalNumbers);
  }

  renderHeader(ctx, headerHeight, topSafeArea, isMobile, timeLeft, currentNumber, totalNumbers) {
    const gradient = ctx.createLinearGradient(0, 0, 0, headerHeight);
    gradient.addColorStop(0, '#0F172A');
    gradient.addColorStop(0.5, '#1E1B4B');
    gradient.addColorStop(1, '#312E81');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, headerHeight);
    
    const borderGradient = ctx.createLinearGradient(0, headerHeight - 2, this.width, headerHeight - 2);
    borderGradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
    borderGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');
    borderGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = borderGradient;
    ctx.fillRect(0, headerHeight - 2, this.width, 2);

    const buttonSize = isMobile ? 44 : 52;
    const buttonSpacing = isMobile ? 12 : 16;
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
        gradientColors: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
        hoverGradientColors: ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)'],
        shadowColor: 'rgba(255, 255, 255, 0.1)',
        action: () => this.onBackToMenu()
      },
      {
        id: 'reset',
        text: '↻',
        x: buttonStartX + buttonSize + buttonSpacing,
        y: buttonY,
        width: buttonSize,
        height: buttonSize,
        gradientColors: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
        hoverGradientColors: ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)'],
        shadowColor: 'rgba(255, 255, 255, 0.1)',
        action: () => this.onResetGame()
      }
    ];

    ctx.font = `bold ${isMobile ? 20 : 24}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
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
      
      ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)';
      this.roundRect(ctx, scaledX, scaledY, scaledSize, scaledSize, (buttonSize / 4) | 0);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, scaledX, scaledY, scaledSize, scaledSize, (buttonSize / 4) | 0);
      ctx.stroke();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(button.text, scaledX + (scaledSize / 2) | 0, scaledY + (scaledSize / 2) | 0);
    });

    if (this.gameMode === 'timed') {
      const centerX = this.width / 2;
      const timerY = buttonY + buttonSize / 2;
      const timerFontSize = isMobile ? 24 : 32;
      
      let timerColor;
      if (timeLeft <= 5.0) {
        timerColor = '#EF4444';
      } else if (timeLeft <= 10.0) {
        timerColor = '#F59E0B';
      } else {
        timerColor = '#FFFFFF';
      }
      
      ctx.font = `bold ${timerFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = timerColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${timeLeft.toFixed(1)}s`, centerX, timerY);
    }
  }

  renderFooter(ctx, footerHeight, bottomSafeArea, isMobile, currentNumber, totalNumbers) {
    const footerY = this.height - footerHeight;
    const centerX = this.width / 2;
    
    const gradient = ctx.createLinearGradient(0, footerY, 0, this.height);
    gradient.addColorStop(0, '#312E81');
    gradient.addColorStop(0.5, '#1E1B4B');
    gradient.addColorStop(1, '#0F172A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, footerY, this.width, footerHeight);
    
    const borderGradient = ctx.createLinearGradient(0, footerY, this.width, footerY);
    borderGradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
    borderGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');
    borderGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    ctx.fillStyle = borderGradient;
    ctx.fillRect(0, footerY, this.width, 2);
    
    const progressBarWidth = isMobile ? 200 : 280;
    const progressBarHeight = isMobile ? 12 : 14;
    const progressBarY = footerY + (footerHeight - progressBarHeight) / 2;
    const progress = (currentNumber - 1) / totalNumbers;
    const progressRadius = (progressBarHeight / 2) | 0;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.roundRect(ctx, (centerX - progressBarWidth / 2) | 0, progressBarY, progressBarWidth, progressBarHeight, progressRadius);
    ctx.fill();

    const fillWidth = (progressBarWidth * progress) | 0;
    if (fillWidth > 0) {
      ctx.fillStyle = '#8B5CF6';
      this.roundRect(ctx, (centerX - progressBarWidth / 2) | 0, progressBarY, fillWidth, progressBarHeight, progressRadius);
      ctx.fill();
    }
  }

  renderInstructions(ctx) {
    const isMobile = this.width < 768;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? Math.min(340, this.width - 40) : 460;
    const modalHeight = isMobile ? 420 : 480;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;
    const borderRadius = isMobile ? 24 : 32;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 10;

    ctx.fillStyle = 'rgba(30, 27, 75, 0.98)';
    this.roundRect(ctx, modalX, modalY, modalWidth, modalHeight, borderRadius);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, modalX, modalY, modalWidth, modalHeight, borderRadius);
    ctx.stroke();

    const titleY = modalY + (isMobile ? 50 : 60);
    ctx.fillStyle = '#FBBF24';
    ctx.font = `bold ${isMobile ? 26 : 32}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏规则', this.width / 2, titleY);

    const titleWidth = ctx.measureText('游戏规则').width;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.width / 2 - titleWidth / 2 - 20, titleY + 20);
    ctx.lineTo(this.width / 2 + titleWidth / 2 + 20, titleY + 20);
    ctx.stroke();

    const instructions = this.instructionsData || this.getInstructionsData();
    if (!this.instructionsData) {
      this.instructionsData = instructions;
    }
    
    this.renderInstructionsContent(ctx, instructions, modalX, modalY, modalHeight, isMobile);
  }

  getInstructionsData() {
    if (this.gameMode === 'timed') {
      return [
        { icon: '🔢', text: '按顺序点击数字，直到100为止', color: '#60A5FA' },
        { icon: '⏰', text: '点对加时5秒，点错减5秒', color: '#34D399' },
        { icon: '❌', text: '倒计时归零则通关失败', color: '#F87171' }
      ];
    } else {
      return [
        { icon: '🔢', text: '按顺序点击数字，直到100为止', color: '#60A5FA' },
        { icon: '🔁', text: '无时间限制，自由探索', color: '#34D399' },
        { icon: '✨', text: '享受轻松的游戏体验', color: '#F87171' }
      ];
    }
  }

  renderInstructionsContent(ctx, instructions, modalX, modalY, modalHeight, isMobile) {
    const contentStartY = modalY + (isMobile ? 110 : 130);
    const lineHeight = isMobile ? 70 : 80;

    ctx.textBaseline = 'middle';

    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];
      const y = contentStartY + i * lineHeight;

      const iconSize = isMobile ? 44 : 52;
      const iconX = modalX + (isMobile ? 30 : 40);
      const iconY = y;

      ctx.beginPath();
      ctx.arc(iconX + iconSize / 2, iconY, iconSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
      ctx.strokeStyle = instruction.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = `${isMobile ? 22 : 26}px Arial`;
      ctx.fillStyle = instruction.color;
      ctx.textAlign = 'center';
      ctx.fillText(instruction.icon, iconX + iconSize / 2, iconY);

      ctx.font = `${isMobile ? 15 : 17}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.textAlign = 'left';
      ctx.fillText(instruction.text, iconX + iconSize + (isMobile ? 15 : 20), y);
    }

    const buttonWidth = isMobile ? 160 : 200;
    const buttonHeight = isMobile ? 44 : 52;
    const buttonX = (this.width - buttonWidth) / 2;
    const buttonY = modalY + modalHeight - (isMobile ? 80 : 90);

    ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
    this.roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, (buttonHeight / 2) | 0);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, (buttonHeight / 2) | 0);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isMobile ? 15 : 17}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('知道了', this.width / 2, buttonY + buttonHeight / 2);
  }

  renderButtons(ctx) {
    const isMobile = this.width < 768;
    
    const colors = {
      start: ['#F97316', '#EA580C'],
      startHover: ['#FB923C', '#F87171'],
      instructions: ['#0EA5E9', '#3B82F6'],
      instructionsHover: ['#38BDF8', '#60A5FA'],
      rank: ['#A855F7', '#EC4899'],
      rankHover: ['#C084FC', '#F472B6'],
      toggleMode: this.gameMode === 'timed' ? ['#F97316', '#EA580C'] : ['#10B981', '#059669'],
      toggleModeHover: this.gameMode === 'timed' ? ['#FB923C', '#F87171'] : ['#34D399', '#10B981']
    };
    
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      const isHovered = this.hoveredButton === button.id;
      const isClicked = this.clickedButton === button.id;
      
      let scale = 1;
      
      const delay = i * 0.08;
      const alpha = Math.min(1, Math.max(0, (this.menuAnimation - delay) * 3));
      
      if (isHovered) scale = 1.03;
      if (isClicked) scale = 0.97;
      
      const centerX = button.x + button.width / 2;
      const centerY = button.y + button.height / 2;
      const scaledWidth = button.width * scale;
      const scaledHeight = button.height * scale;
      const scaledX = centerX - scaledWidth / 2;
      const scaledY = centerY - scaledHeight / 2;
      const borderRadius = isMobile ? 28 : 32;
      
      let btnColors;
      switch(button.id) {
        case 'start': btnColors = isHovered ? colors.startHover : colors.start; break;
        case 'instructions': btnColors = isHovered ? colors.instructionsHover : colors.instructions; break;
        case 'rank': btnColors = isHovered ? colors.rankHover : colors.rank; break;
        case 'toggleMode': btnColors = isHovered ? colors.toggleModeHover : colors.toggleMode; break;
        default: btnColors = colors.start;
      }
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      ctx.fillStyle = btnColors[0];
      this.roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, borderRadius);
      ctx.fill();
      
      if (!isClicked) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        this.roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight * 0.4, borderRadius);
        ctx.fill();
      }
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, borderRadius);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isMobile ? 20 : 24}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, centerX, centerY);
      
      ctx.restore();
    }
  }

  darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.floor(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.floor(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.floor(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
