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
  }

  initMenu() {
    const buttonWidth = 60;
    const buttonHeight = 60;
    const buttonSpacing = 20;
    const totalWidth = buttonWidth * 3 + buttonSpacing * 2;
    const startX = (this.width - totalWidth) / 2;
    const buttonY = this.height / 2 - 30;
    
    this.buttons = [
      {
        id: 'start',
        text: '▶️',
        x: startX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#4CAF50',
        hoverColor: '#45a049',
        action: () => this.onStartGame()
      },
      {
        id: 'level',
        text: '🎯',
        x: startX + buttonWidth + buttonSpacing,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#FF9800',
        hoverColor: '#e68a00',
        action: () => this.onChangeLevel()
      },
      {
        id: 'instructions',
        text: '❓',
        x: startX + (buttonWidth + buttonSpacing) * 2,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#2196F3',
        hoverColor: '#0b7dda',
        action: () => this.onShowInstructions()
      }
    ];
  }

  initGame() {
    const buttonWidth = 60;
    const buttonHeight = 60;
    const buttonSpacing = 20;
    const totalWidth = buttonWidth * 2 + buttonSpacing;
    const startX = (this.width - totalWidth) / 2;
    const buttonY = this.height - 80;
    
    this.buttons = [
      {
        id: 'reset',
        text: '🔄',
        x: startX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#f44336',
        hoverColor: '#da190b',
        action: () => this.onResetGame()
      },
      {
        id: 'menu',
        text: '🏠',
        x: startX + buttonWidth + buttonSpacing,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        color: '#9E9E9E',
        hoverColor: '#757575',
        action: () => this.onBackToMenu()
      }
    ];
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
      text: '🏠',
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
  }

  renderMenu(ctx) {
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('数字点击游戏', this.width / 2, this.height / 4);

    ctx.font = '20px Arial';
    ctx.fillStyle = '#BDC3C7';
    ctx.fillText('按顺序点击数字', this.width / 2, this.height / 4 + 50);
  }

  renderGameUI(ctx, gameState, currentNumber, totalNumbers, timeLeft) {
    ctx.fillStyle = '#34495E';
    ctx.fillRect(0, 0, this.width, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.levelConfig[this.currentLevel].name}`, 20, 30);

    ctx.textAlign = 'center';
    ctx.fillText(`当前: ${currentNumber}`, this.width / 2, 30);

    ctx.textAlign = 'right';
    ctx.fillText(`进度: ${currentNumber - 1}/${totalNumbers}`, this.width - 20, 30);

    ctx.font = 'bold 28px Arial';
    
    if (timeLeft <= 2.0) {
      ctx.fillStyle = '#FF0000';
    } else if (timeLeft <= 3.0) {
      ctx.fillStyle = '#FFA500';
    } else {
      ctx.fillStyle = '#FF6B6B';
    }
    
    ctx.textAlign = 'center';
    ctx.fillText(`⏱️ ${timeLeft.toFixed(1)}s`, this.width / 2, 65);
  }

  renderInstructions(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏说明', this.width / 2, this.height / 4);

    ctx.font = '20px Arial';
    const instructions = [
      '1. 游戏共有两个关卡',
      '2. 第一关：10个图形',
      '3. 第二关：100个图形',
      '4. 每个图形都有一个数字标识',
      '5. 按照数字从小到大的顺序点击图形',
      '6. 点击正确会有高亮反馈并增加时间',
      '7. 点击错误会有震动效果并扣除时间',
      '8. 时间耗尽则游戏失败',
      '9. 第一关通关后会自动进入第二关',
      '10. 第二关通关后显示最终成绩',
      '',
      '按钮说明：',
      '▶️ 开始游戏  🎯 切换关卡  ❓ 游戏说明',
      '🔄 重新开始  🏠 返回菜单  ➡️ 下一关',
      '',
      '点击任意处返回'
    ];

    let y = this.height / 3;
    for (const instruction of instructions) {
      ctx.fillText(instruction, this.width / 2, y);
      y += 30;
    }
  }

  renderCompletion(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.showFailure) {
      ctx.fillStyle = '#FF6B6B';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('😢 游戏失败！', this.width / 2, this.height / 3);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.fillText(`完成进度: ${this.failureProgress}/${this.failureTotal}`, this.width / 2, this.height / 2 - 20);
      ctx.fillText(`用时: ${this.failureTime.toFixed(2)}秒`, this.width / 2, this.height / 2 + 20);
    } else if (this.shouldAutoAdvance()) {
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎉 第一关通关！', this.width / 2, this.height / 3);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '28px Arial';
      ctx.fillText(`完成时间: ${this.completionTime.toFixed(2)}秒`, this.width / 2, this.height / 2 - 30);
      
      ctx.font = '24px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.fillText('即将进入第二关...', this.width / 2, this.height / 2 + 30);
    } else {
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎉 恭喜通关！', this.width / 2, this.height / 3);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '28px Arial';
      ctx.fillText(`完成时间: ${this.completionTime.toFixed(2)}秒`, this.width / 2, this.height / 2);
    }
  }

  renderButtons(ctx) {
    const buttonLabels = {
      'start': '开始',
      'level': '关卡',
      'instructions': '说明',
      'reset': '重置',
      'menu': '菜单',
      'playAgain': '再玩',
      'nextLevel': '下一关'
    };
    
    for (const button of this.buttons) {
      ctx.fillStyle = button.color;
      ctx.fillRect(button.x, button.y, button.width, button.height);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px Arial';
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
}
