export default class UI {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buttons = [];
    this.showInstructions = false;
    this.showCompletion = false;
    this.completionTime = 0;
    this.difficulty = 'normal';
    this.polygonCount = 10;
  }

  initMenu() {
    this.buttons = [
      {
        id: 'start',
        text: '开始游戏',
        x: this.width / 2 - 80,
        y: this.height / 2 - 50,
        width: 160,
        height: 50,
        color: '#4CAF50',
        hoverColor: '#45a049',
        action: () => this.onStartGame()
      },
      {
        id: 'instructions',
        text: '游戏说明',
        x: this.width / 2 - 80,
        y: this.height / 2 + 20,
        width: 160,
        height: 50,
        color: '#2196F3',
        hoverColor: '#0b7dda',
        action: () => this.onShowInstructions()
      },
      {
        id: 'difficulty',
        text: '难度: 普通',
        x: this.width / 2 - 80,
        y: this.height / 2 + 90,
        width: 160,
        height: 50,
        color: '#FF9800',
        hoverColor: '#e68a00',
        action: () => this.onChangeDifficulty()
      }
    ];
  }

  initGame() {
    this.buttons = [
      {
        id: 'reset',
        text: '重新开始',
        x: this.width / 2 - 80,
        y: this.height - 80,
        width: 160,
        height: 50,
        color: '#f44336',
        hoverColor: '#da190b',
        action: () => this.onResetGame()
      },
      {
        id: 'menu',
        text: '返回菜单',
        x: this.width / 2 - 80,
        y: this.height - 140,
        width: 160,
        height: 50,
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
    this.buttons = [
      {
        id: 'playAgain',
        text: '再玩一次',
        x: this.width / 2 - 80,
        y: this.height / 2 + 50,
        width: 160,
        height: 50,
        color: '#4CAF50',
        hoverColor: '#45a049',
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
      this.onGameStart(this.polygonCount, this.difficulty);
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

  onChangeDifficulty() {
    const difficulties = ['easy', 'normal', 'hard'];
    const currentIndex = difficulties.indexOf(this.difficulty);
    this.difficulty = difficulties[(currentIndex + 1) % difficulties.length];
    
    const difficultyText = {
      'easy': '简单 (10个)',
      'normal': '普通 (25个)',
      'hard': '困难 (50个)'
    };
    
    this.buttons[2].text = `难度: ${difficultyText[this.difficulty]}`;
    
    const counts = { 'easy': 10, 'normal': 25, 'hard': 50 };
    this.polygonCount = counts[this.difficulty];
  }

  onPlayAgain() {
    this.showCompletion = false;
    if (this.onGameStart) {
      this.onGameStart(this.polygonCount, this.difficulty);
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
    ctx.fillText(`当前: ${currentNumber}`, 20, 30);

    ctx.textAlign = 'center';
    ctx.fillText(`进度: ${currentNumber - 1}/${totalNumbers}`, this.width / 2, 30);

    ctx.textAlign = 'right';
    ctx.fillText(`目标: ${totalNumbers}`, this.width - 20, 30);

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
      '1. 游戏开始后会显示多个不规则图形',
      '2. 每个图形都有一个数字标识',
      '3. 按照数字从小到大的顺序点击图形',
      '4. 点击正确会有高亮反馈并增加时间',
      '5. 点击错误会有震动效果并扣除时间',
      '6. 时间耗尽则游戏失败',
      '7. 按顺序点击完所有数字即可通关',
      '',
      '点击任意处返回'
    ];

    let y = this.height / 3;
    for (const instruction of instructions) {
      ctx.fillText(instruction, this.width / 2, y);
      y += 35;
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
    for (const button of this.buttons) {
      ctx.fillStyle = button.color;
      ctx.fillRect(button.x, button.y, button.width, button.height);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }
  }
}
