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
    // 更新浮动文字
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= deltaTime * 1.5;
      ft.offsetY -= deltaTime * 100;
      ft.alpha = Math.max(0, ft.life);
      
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 更新屏幕红闪
    if (this.flashAlpha > 0) {
      this.flashAlpha -= deltaTime * 3;
      if (this.flashAlpha < 0) {
        this.flashAlpha = 0;
      }
    }

    // 更新震动
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
    // 渲染屏幕红闪
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 0, 0, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // 渲染浮动文字
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
    this.menuAnimation = 0;
    this.menuTargetAnimation = 1;
    
    const isMobile = this.width < 768;
    const buttonWidth = isMobile ? 220 : 260;
    const buttonHeight = isMobile ? 56 : 64;
    const buttonSpacing = isMobile ? 16 : 20;
    const centerX = this.width / 2;
    const startY = this.height * 0.55;
    
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
        id: 'instructions',
        text: '游戏规则',
        x: centerX - buttonWidth / 2,
        y: startY + buttonHeight + buttonSpacing,
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
        y: startY + (buttonHeight + buttonSpacing) * 2,
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
    console.log('Game buttons initialized:', this.buttons);
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
    // 如果排行榜打开，不处理点击（由排行榜管理器处理）
    if (this.showRank) {
      return false;
    }

    for (const button of this.buttons) {
      if (x >= button.x && x <= button.x + button.width &&
          y >= button.y && y <= button.y + button.height) {
        button.action();
        return true;
      }
    }
    
    if (this.showInstructions) {
      this.showInstructions = false;
      return true;
    }
    
    return false;
  }

  onStartGame() {
    this.currentLevel = 1;
    if (this.onGameStart) {
      this.onGameStart(this.levelConfig[this.currentLevel].count, this.currentLevel);
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
      this.onGameStart(this.levelConfig[this.currentLevel].count, this.currentLevel);
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
    const scale = 0.8 + 0.2 * alpha;
    
    ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * alpha})`;
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? Math.min(320, this.width - 32) : 400;
    const modalHeight = isMobile ? 260 : 280;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-this.width / 2, -this.height / 2);

    ctx.fillStyle = '#FFFFFF';
    this.roundRect(ctx, modalX, modalY, modalWidth, modalHeight, isMobile ? 16 : 20);
    ctx.fill();

    ctx.fillStyle = '#0C4A6E';
    ctx.font = `bold ${isMobile ? 22 : 24}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.modalTitle, this.width / 2, modalY + 50);

    ctx.fillStyle = '#475569';
    ctx.font = `${isMobile ? 15 : 16}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    
    const messageLines = this.modalMessage.split('\n');
    const lineHeight = isMobile ? 22 : 24;
    const messageY = modalY + 100 - (messageLines.length - 1) * lineHeight / 2;
    
    for (let i = 0; i < messageLines.length; i++) {
      ctx.fillText(messageLines[i], this.width / 2, messageY + i * lineHeight);
    }

    const buttonWidth = isMobile ? 100 : 120;
    const buttonHeight = isMobile ? 40 : 45;
    const buttonSpacing = isMobile ? 12 : 20;
    const totalButtonWidth = buttonWidth * this.modalButtons.length + buttonSpacing * (this.modalButtons.length - 1);
    const startX = (this.width - totalButtonWidth) / 2;
    const buttonY = modalY + (isMobile ? 190 : 200);

    for (let i = 0; i < this.modalButtons.length; i++) {
      const button = this.modalButtons[i];
      const bx = startX + i * (buttonWidth + buttonSpacing);
      
      ctx.fillStyle = button.color;
      this.roundRect(ctx, bx, buttonY, buttonWidth, buttonHeight, isMobile ? 8 : 10);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isMobile ? 14 : 15}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(button.text, bx + buttonWidth / 2, buttonY + buttonHeight / 2);
    }

    ctx.restore();
  }

  render(ctx, gameState, currentNumber, totalNumbers, timeLeft = 5.0, deltaTime = 0.016) {
    this.updateEffects(deltaTime);
    this.updateMenuAnimation(deltaTime);

    if (this.showInstructions) {
      this.renderInstructions(ctx);
      this.renderEffects(ctx);
      return;
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
    ctx.fillText('找回消失的专注，从找到第一个1开始...', this.width / 2, titleY + titleSize * 0.7);

    this.renderFeatureCards(ctx, isMobile);
    
    ctx.restore();
  }

  renderMenuBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#0F172A');
    gradient.addColorStop(0.5, '#1E1B4B');
    gradient.addColorStop(1, '#312E81');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    this.renderStars(ctx);
    this.renderFloatingShapes(ctx);
  }

  renderStars(ctx) {
    const time = Date.now() * 0.001;
    const stars = [
      { x: 0.1, y: 0.1, size: 2, phase: 0 },
      { x: 0.85, y: 0.15, size: 3, phase: 1 },
      { x: 0.2, y: 0.35, size: 2, phase: 2 },
      { x: 0.9, y: 0.4, size: 2, phase: 0.5 },
      { x: 0.05, y: 0.6, size: 2, phase: 1.5 },
      { x: 0.95, y: 0.7, size: 3, phase: 2.5 },
      { x: 0.15, y: 0.85, size: 2, phase: 3 },
      { x: 0.8, y: 0.9, size: 2, phase: 0.8 },
    ];

    stars.forEach(star => {
      const x = star.x * this.width;
      const y = star.y * this.height;
      const twinkle = 0.5 + 0.5 * Math.sin(time * 2 + star.phase);
      
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 200, ${0.3 + twinkle * 0.4})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, star.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 200, ${0.1 * twinkle})`;
      ctx.fill();
    });

    const crossStars = [
      { x: 0.88, y: 0.28, size: 8 },
      { x: 0.12, y: 0.55, size: 6 },
    ];

    crossStars.forEach(star => {
      const x = star.x * this.width;
      const y = star.y * this.height;
      const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + star.x * 10);
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time * 0.5);
      
      ctx.beginPath();
      ctx.moveTo(0, -star.size);
      ctx.lineTo(1, -1);
      ctx.lineTo(star.size, 0);
      ctx.lineTo(1, 1);
      ctx.lineTo(0, star.size);
      ctx.lineTo(-1, 1);
      ctx.lineTo(-star.size, 0);
      ctx.lineTo(-1, -1);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 220, 100, ${0.6 + twinkle * 0.3})`;
      ctx.fill();
      
      ctx.restore();
    });
  }

  renderFloatingShapes(ctx) {
    const time = Date.now() * 0.001;
    
    const shapes = [
      { x: 0.05, y: 0.08, size: 30, color: 'rgba(139, 92, 246, 0.3)', type: 'circle' },
      { x: 0.92, y: 0.12, size: 40, color: 'rgba(59, 130, 246, 0.25)', type: 'circle' },
      { x: 0.08, y: 0.75, size: 50, color: 'rgba(236, 72, 153, 0.2)', type: 'circle' },
      { x: 0.9, y: 0.82, size: 35, color: 'rgba(34, 211, 238, 0.25)', type: 'triangle' },
    ];

    shapes.forEach((shape, index) => {
      const x = shape.x * this.width;
      const y = shape.y * this.height + Math.sin(time + index) * 10;
      
      ctx.save();
      ctx.translate(x, y);
      
      if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
        ctx.fillStyle = shape.color;
        ctx.fill();
      } else if (shape.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -shape.size);
        ctx.lineTo(shape.size * 0.866, shape.size * 0.5);
        ctx.lineTo(-shape.size * 0.866, shape.size * 0.5);
        ctx.closePath();
        ctx.fillStyle = shape.color;
        ctx.fill();
      }
      
      ctx.restore();
    });
  }

  renderTitleWithRibbon(ctx, x, y, size) {
    const title = '数一数';
    
    ctx.save();
    
    ctx.font = `bold ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textMetrics = ctx.measureText(title);
    const textWidth = textMetrics.width;
    const ribbonWidth = textWidth + size * 1.2;
    const ribbonHeight = size * 0.5;
    
    const ribbonY = y + size * 0.1;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.roundRect(ctx, x - ribbonWidth / 2, ribbonY - ribbonHeight / 2, ribbonWidth, ribbonHeight, 4);
    ctx.fill();
    
    const tailSize = size * 0.25;
    ctx.beginPath();
    ctx.moveTo(x - ribbonWidth / 2, ribbonY - ribbonHeight / 2);
    ctx.lineTo(x - ribbonWidth / 2 - tailSize, ribbonY - ribbonHeight / 2 - tailSize * 0.5);
    ctx.lineTo(x - ribbonWidth / 2 - tailSize, ribbonY + ribbonHeight / 2 + tailSize * 0.5);
    ctx.lineTo(x - ribbonWidth / 2, ribbonY + ribbonHeight / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + ribbonWidth / 2, ribbonY - ribbonHeight / 2);
    ctx.lineTo(x + ribbonWidth / 2 + tailSize, ribbonY - ribbonHeight / 2 - tailSize * 0.5);
    ctx.lineTo(x + ribbonWidth / 2 + tailSize, ribbonY + ribbonHeight / 2 + tailSize * 0.5);
    ctx.lineTo(x + ribbonWidth / 2, ribbonY + ribbonHeight / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#1E1B4B';
    ctx.font = `bold ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
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

    features.forEach((feature, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const delay = index * 0.1;
      const cardAlpha = Math.min(1, Math.max(0, (this.menuAnimation - delay) * 2));
      
      ctx.save();
      ctx.globalAlpha = cardAlpha;
      
      const cardGradient = ctx.createLinearGradient(x, cardY, x, cardY + cardHeight);
      cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      cardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.fillStyle = cardGradient;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      
      this.roundRect(ctx, x, cardY, cardWidth, cardHeight, isMobile ? 12 : 16);
      ctx.fill();
      ctx.stroke();
      
      const iconSize = isMobile ? 32 : 40;
      ctx.font = `${iconSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = feature.color;
      ctx.fillText(feature.icon, x + cardWidth / 2, cardY + cardHeight * 0.4);
      
      ctx.font = `bold ${isMobile ? 13 : 15}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillText(feature.text, x + cardWidth / 2, cardY + cardHeight * 0.75);
      
      ctx.restore();
    });
  }

  renderParticles(ctx) {
    const particleCount = 20;
    const time = Date.now() * 0.001;

    for (let i = 0; i < particleCount; i++) {
      const x = ((i * 137.5 + this.particleOffset) % this.width);
      const y = ((i * 89.3 + Math.sin(time + i) * 50) % this.height);
      const size = 2 + Math.sin(time * 2 + i) * 1;
      const alpha = 0.1 + Math.sin(time + i * 0.5) * 0.05;

      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
      ctx.fill();
    }
  }

  renderGameUI(ctx, gameState, currentNumber, totalNumbers, timeLeft) {
    const isMobile = this.width < 768;
    const headerHeight = isMobile ? 70 : 80;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, headerHeight);
    gradient.addColorStop(0, '#0EA5E9');
    gradient.addColorStop(1, '#38BDF8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, headerHeight);

    const headerButtonSize = isMobile ? 50 : 60;
    const headerButtonSpacing = isMobile ? 8 : 10;
    const headerButtonY = isMobile ? 15 : 20;
    const headerButtonStartX = isMobile ? 8 : 10;

    this.headerButtons = [
      {
        id: 'menu',
        text: '返回',
        x: headerButtonStartX,
        y: headerButtonY,
        width: headerButtonSize,
        height: headerButtonSize - 20,
        color: 'rgba(255, 255, 255, 0.2)',
        hoverColor: 'rgba(255, 255, 255, 0.35)',
        action: () => this.onBackToMenu()
      },
      {
        id: 'reset',
        text: '重试',
        x: headerButtonStartX + headerButtonSize + headerButtonSpacing,
        y: headerButtonY,
        width: headerButtonSize,
        height: headerButtonSize - 20,
        color: 'rgba(255, 255, 255, 0.2)',
        hoverColor: 'rgba(255, 255, 255, 0.35)',
        action: () => this.onResetGame()
      }
    ];

    this.headerButtons.forEach(button => {
      const isHovered = this.isPointInButton(this.mouseX, this.mouseY, button);
      const isClicked = this.clickedButton === button.id;
      
      ctx.fillStyle = isHovered ? button.hoverColor : button.color;
      if (isClicked) {
        ctx.globalAlpha = 0.7;
      }
      
      this.roundRect(ctx, button.x, button.y, button.width, button.height, isMobile ? 6 : 8);
      ctx.fill();
      
      ctx.globalAlpha = 1;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${isMobile ? 16 : 18}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    });

    const progressBarWidth = isMobile ? 160 : 200;
    const progressBarHeight = isMobile ? 10 : 12;
    const progressBarX = (this.width - progressBarWidth) / 2;
    const progressBarY = isMobile ? 20 : 24;
    const progress = (currentNumber - 1) / totalNumbers;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    this.roundRect(ctx, progressBarX, progressBarY, progressBarWidth, progressBarHeight, isMobile ? 5 : 6);
    ctx.fill();

    const fillWidth = progressBarWidth * progress;
    if (fillWidth > 0) {
      ctx.fillStyle = '#F97316';
      this.roundRect(ctx, progressBarX, progressBarY, fillWidth, progressBarHeight, isMobile ? 5 : 6);
      ctx.fill();
    }

    ctx.font = `bold ${isMobile ? 22 : 26}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    
    if (timeLeft <= 5.0) {
      ctx.fillStyle = '#EF4444';
    } else if (timeLeft <= 10.0) {
      ctx.fillStyle = '#F97316';
    } else {
      ctx.fillStyle = '#FFFFFF';
    }
    
    ctx.textAlign = 'center';
    ctx.fillText(`${timeLeft.toFixed(1)}s`, this.width / 2, isMobile ? 55 : 65);
  }

  renderInstructions(ctx) {
    const isMobile = this.width < 768;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? Math.min(320, this.width - 32) : 400;
    const modalHeight = isMobile ? 380 : 420;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    ctx.fillStyle = '#FFFFFF';
    this.roundRect(ctx, modalX, modalY, modalWidth, modalHeight, isMobile ? 16 : 20);
    ctx.fill();

    ctx.fillStyle = '#0C4A6E';
    ctx.font = `bold ${isMobile ? 24 : 28}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏规则', this.width / 2, modalY + 50);

    ctx.font = `${isMobile ? 16 : 18}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = '#334155';
    
    const instructions = [
      { icon: '🔢', text: '按顺序点击数字，直到100为止' },
      { icon: '⏱️', text: '点对加时5秒，点错减5秒' },
      { icon: '⚠️', text: '倒计时归零则通关失败' }
    ];

    let y = modalY + 100;
    for (const instruction of instructions) {
      ctx.textAlign = 'center';
      ctx.fillText(instruction.icon, this.width / 2, y);
      ctx.fillText(instruction.text, this.width / 2, y + 24);
      y += isMobile ? 60 : 70;
    }

    ctx.fillStyle = '#64748B';
    ctx.font = `${isMobile ? 14 : 16}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText('点击任意处返回', this.width / 2, modalY + modalHeight - 40);
  }

  renderButtons(ctx) {
    const isMobile = this.width < 768;
    
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      const isHovered = this.hoveredButton === button.id;
      const isClicked = this.clickedButton === button.id;
      
      let gradientColors = button.gradientColors;
      let shadowBlur = 0;
      let shadowColor = button.shadowColor || 'rgba(0, 0, 0, 0.3)';
      let scale = 1;
      let alpha = 1;
      
      const delay = i * 0.08;
      alpha = Math.min(1, Math.max(0, (this.menuAnimation - delay) * 3));
      
      if (isHovered) {
        gradientColors = button.hoverGradientColors || gradientColors;
        shadowBlur = 25;
        scale = 1.03;
      }
      if (isClicked) {
        scale = 0.97;
        shadowBlur = 10;
      }
      
      const centerX = button.x + button.width / 2;
      const centerY = button.y + button.height / 2;
      const scaledWidth = button.width * scale;
      const scaledHeight = button.height * scale;
      const scaledX = centerX - scaledWidth / 2;
      const scaledY = centerY - scaledHeight / 2;
      const borderRadius = isMobile ? 28 : 32;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      if (shadowBlur > 0) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetY = isClicked ? 2 : 6;
      }
      
      const gradient = ctx.createLinearGradient(scaledX, scaledY, scaledX, scaledY + scaledHeight);
      gradient.addColorStop(0, gradientColors[0]);
      gradient.addColorStop(1, gradientColors[1]);
      ctx.fillStyle = gradient;
      
      this.roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, borderRadius);
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      const highlightGradient = ctx.createLinearGradient(scaledX, scaledY, scaledX, scaledY + scaledHeight * 0.5);
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      this.roundRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight * 0.5, borderRadius);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
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

  handleClick(x, y) {
    console.log('handleClick called:', { x, y, showInstructions: this.showInstructions, showModal: this.showModal });
    
    if (this.showInstructions) {
      this.showInstructions = false;
      console.log('Instructions closed');
      return true;
    }
    
    const allButtons = [...this.buttons];
    if (this.showModal) {
      allButtons.push(...this.modalButtons);
    }
    
    if (this.headerButtons) {
      allButtons.push(...this.headerButtons);
    }
    
    console.log('Checking buttons:', allButtons.length);
    
    for (const button of allButtons) {
      if (this.isPointInButton(x, y, button)) {
        console.log('Button clicked:', button.id);
        this.clickedButton = button.id;
        this.clickAnimation = 1;
        setTimeout(() => {
          this.clickedButton = null;
          this.clickAnimation = 0;
          if (button.action) {
            console.log('Executing button action:', button.id);
            button.action();
          }
        }, 150);
        return true;
      }
    }
    
    console.log('No button clicked');
    return false;
  }

  handleModalClick(x, y) {
    if (!this.showModal) return false;
    if (this.modalTargetAnimation === 0) return false;
    
    const modalWidth = Math.min(400, this.width - 40);
    const modalHeight = 280;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;
    
    const buttonWidth = 120;
    const buttonHeight = 45;
    const buttonSpacing = 20;
    const totalButtonWidth = buttonWidth * this.modalButtons.length + buttonSpacing * (this.modalButtons.length - 1);
    const startX = (this.width - totalButtonWidth) / 2;
    const buttonY = modalY + 200;
    
    for (let i = 0; i < this.modalButtons.length; i++) {
      const button = this.modalButtons[i];
      const bx = startX + i * (buttonWidth + buttonSpacing);
      
      if (x >= bx && x <= bx + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        if (this.onPlayClickSound) {
          this.onPlayClickSound();
        }
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
}
