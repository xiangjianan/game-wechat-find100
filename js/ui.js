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

  initMenu() {
    const buttonWidth = 280;
    const buttonHeight = 80;
    const buttonSpacing = 30;
    const verticalSpacing = 20;
    const centerX = this.width / 2;
    const startY = this.height / 2 - 60;
    
    this.buttons = [
      {
        id: 'start',
        text: '开始游戏',
        x: centerX - buttonWidth / 2,
        y: startY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#4CAF50',
        hoverColor: '#45a049',
        action: () => this.onStartGame()
      },
      {
        id: 'instructions',
        text: '游戏规则',
        x: centerX - buttonWidth / 2,
        y: startY + buttonHeight + verticalSpacing,
        width: buttonWidth,
        height: buttonHeight,
        color: '#2196F3',
        hoverColor: '#0b7dda',
        action: () => this.onShowInstructions()
      }
    ];
    
    console.log('Menu buttons initialized:', this.buttons);
  }

  initGame() {
    this.buttons = [];
    console.log('Game buttons initialized:', this.buttons);
  }

  initCompletion(time) {
    this.showCompletion = true;
    this.completionTime = time;
    this.showFailure = false;
    
    const hasNextLevel = this.currentLevel < this.totalLevels;
    const buttonWidth = 60;
    const buttonHeight = 60;
    const buttonSpacing = 20;
    
    let buttonCount = hasNextLevel ? 3 : 2;
    const totalWidth = buttonWidth * buttonCount + buttonSpacing * (buttonCount - 1);
    const startX = (this.width - totalWidth) / 2;
    const buttonY = this.height / 2 + 80;
    
    this.buttons = [
      {
        id: 'playAgain',
        text: '🔄',
        x: startX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#4CAF50',
        hoverColor: '#45a049',
        action: () => this.onPlayAgain()
      }
    ];
    
    if (hasNextLevel) {
      this.buttons.push({
        id: 'nextLevel',
        text: '➡️',
        x: startX + buttonWidth + buttonSpacing,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#2196F3',
        hoverColor: '#0b7dda',
        action: () => this.onNextLevel()
      });
    }
    
    this.buttons.push({
      id: 'menu',
      text: '返回',
      x: startX + buttonWidth * (hasNextLevel ? 2 : 1) + buttonSpacing * (hasNextLevel ? 2 : 1),
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      color: '#9E9E9E',
      hoverColor: '#757575',
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
    this.buttons = [
      {
        id: 'tryAgain',
        text: '再试一次',
        x: this.width / 2 - 80,
        y: this.height / 2 + 50,
        width: 160,
        height: 50,
        color: '#FF6B6B',
        hoverColor: '#FF5252',
        action: () => this.onPlayAgain()
      },
      {
        id: 'menu',
        text: '返回菜单',
        x: this.width / 2 - 80,
        y: this.height / 2 + 120,
        width: 160,
        height: 50,
        color: '#9E9E9E',
        hoverColor: '#757575',
        action: () => this.onBackToMenu()
      }
    ];
  }

  handleClick(x, y) {
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
    const alpha = this.modalAnimation;
    const scale = 0.8 + 0.2 * alpha;
    
    ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * alpha})`;
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = Math.min(400, this.width - 40);
    const modalHeight = 280;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-this.width / 2, -this.height / 2);

    ctx.fillStyle = '#FFFFFF';
    this.roundRect(ctx, modalX, modalY, modalWidth, modalHeight, 15);
    ctx.fill();

    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.modalTitle, this.width / 2, modalY + 50);

    ctx.fillStyle = '#7F8C8D';
    ctx.font = '16px Arial';
    
    const messageLines = this.modalMessage.split('\n');
    const lineHeight = 24;
    const messageY = modalY + 100 - (messageLines.length - 1) * lineHeight / 2;
    
    for (let i = 0; i < messageLines.length; i++) {
      ctx.fillText(messageLines[i], this.width / 2, messageY + i * lineHeight);
    }

    const buttonWidth = 120;
    const buttonHeight = 45;
    const buttonSpacing = 20;
    const totalButtonWidth = buttonWidth * this.modalButtons.length + buttonSpacing * (this.modalButtons.length - 1);
    const startX = (this.width - totalButtonWidth) / 2;
    const buttonY = modalY + 200;

    for (let i = 0; i < this.modalButtons.length; i++) {
      const button = this.modalButtons[i];
      const bx = startX + i * (buttonWidth + buttonSpacing);
      
      ctx.fillStyle = button.color;
      this.roundRect(ctx, bx, buttonY, buttonWidth, buttonHeight, 8);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(button.text, bx + buttonWidth / 2, buttonY + buttonHeight / 2);
    }

    ctx.restore();
  }

  render(ctx, gameState, currentNumber, totalNumbers, timeLeft = 5.0) {
    if (this.showInstructions) {
      this.renderInstructions(ctx);
      return;
    }

    if (this.showCompletion) {
      this.renderCompletion(ctx);
      return;
    }

    if (gameState === 'menu') {
      this.renderMenu(ctx);
    } else if (gameState === 'playing' || gameState === 'completed') {
      this.renderGameUI(ctx, gameState, currentNumber, totalNumbers, timeLeft);
    }

    this.renderButtons(ctx);
    
    if (this.showModal) {
      this.renderModal(ctx);
    }
  }

  renderMenu(ctx) {
    // 天蓝渐变背景，旋转45度（从左上到右下）
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('数一数', this.width / 2, this.height / 4);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#BDC3C7';
    ctx.fillText('', this.width / 2, this.height / 4 + 50);
  }

  renderGameUI(ctx, gameState, currentNumber, totalNumbers, timeLeft) {
    // 天蓝色渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, 80);
    gradient.addColorStop(0, '#17b7f6');
    gradient.addColorStop(1, '#469df5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, 80);

    const headerButtonSize = 60;
    const headerButtonSpacing = 10;
    const headerButtonY = 20;
    const headerButtonStartX = 10;

    this.headerButtons = [
      {
        id: 'menu',
        text: '返回',
        x: headerButtonStartX,
        y: headerButtonY,
        width: headerButtonSize,
        height: headerButtonSize - 20,
        color: '#9E9E9E',
        hoverColor: '#757575',
        action: () => this.onBackToMenu()
      },
      {
        id: 'reset',
        text: '重试',
        x: headerButtonStartX + headerButtonSize + headerButtonSpacing,
        y: headerButtonY,
        width: headerButtonSize,
        height: headerButtonSize - 20,
        color: '#f44336',
        hoverColor: '#da190b',
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
      
      this.roundRect(ctx, button.x, button.y, button.width, button.height, 8);
      ctx.fill();
      
      ctx.globalAlpha = 1;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    });

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    // ctx.fillText(`${this.levelConfig[this.currentLevel].name}`, 110, 30);

    ctx.textAlign = 'center';
    ctx.fillText(`进度: ${currentNumber - 1}/${totalNumbers}`, this.width / 2, 30);

    ctx.textAlign = 'right';

    ctx.font = 'bold 24px Arial';
    
    if (timeLeft <= 2.0) {
      ctx.fillStyle = '#FF0000';
    } else if (timeLeft <= 3.0) {
      ctx.fillStyle = '#FFA500';
    } else {
      ctx.fillStyle = '#FF6B6B';
    }
    
    ctx.textAlign = 'center';
    ctx.fillText(`${timeLeft.toFixed(0)}s`, this.width / 2, 65);

    this.headerButtons.forEach(button => {
      const isHovered = this.isPointInButton(this.mouseX, this.mouseY, button);
      const isClicked = this.clickedButton === button.id;
      
      ctx.fillStyle = isHovered ? button.hoverColor : button.color;
      if (isClicked) {
        ctx.globalAlpha = 0.7;
      }
      
      this.roundRect(ctx, button.x, button.y, button.width, button.height, 8);
      ctx.fill();
      
      ctx.globalAlpha = 1;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    });
  }

  renderInstructions(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏规则', this.width / 2, this.height / 4);

    ctx.font = '18px Arial';
    const instructions = [
      '1. 按顺序点击数字，直到100为止',
      '2. 点对加时5秒，点错减5秒',
      '3. 倒计时归零则通关失败',
      '',
      '点击任意处返回'
    ];

    let y = this.height / 3;
    for (const instruction of instructions) {
      ctx.fillText(instruction, this.width / 2, y);
      y += 28;
    }
  }

  renderCompletion(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.showFailure) {
      ctx.fillStyle = '#FF6B6B';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('😢 游戏失败！', this.width / 2, this.height / 3);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.fillText(`完成进度: ${this.failureProgress}/${this.failureTotal}`, this.width / 2, this.height / 2 - 20);
      ctx.fillText(`用时: ${this.failureTime.toFixed(2)}秒`, this.width / 2, this.height / 2 + 20);
    } else {
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎉 恭喜通关！', this.width / 2, this.height / 3);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.fillText(`完成时间: ${this.completionTime.toFixed(2)}秒`, this.width / 2, this.height / 2);
    }
  }

  renderButtons(ctx) {
    const buttonLabels = {
      'start': '',
      'level': '关卡',
      'instructions': '',
      'reset': '重置',
      'menu': '菜单',
      'playAgain': '再玩',
      'nextLevel': '下一关'
    };
    
    for (const button of this.buttons) {
      const isHovered = this.hoveredButton === button.id;
      const isClicked = this.clickedButton === button.id;
      
      let fillColor = button.color;
      if (isHovered) {
        fillColor = button.hoverColor;
      }
      if (isClicked) {
        fillColor = this.darkenColor(fillColor, 0.2);
      }
      
      ctx.fillStyle = fillColor;
      this.roundRect(ctx, button.x, button.y, button.width, button.height, 15);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
      
      if (buttonLabels[button.id]) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(buttonLabels[button.id], button.x + button.width / 2, button.y + button.height + 12);
      }
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
