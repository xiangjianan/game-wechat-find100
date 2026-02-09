import { SCREEN_WIDTH, SCREEN_HEIGHT } from './render';
import GameManager from './gameManager';
import UI from './ui';
import SoundManager from './soundManager';

let canvas;
let ctx;

export default class FindGameMain {
  constructor() {
    canvas = GameGlobal.canvas;
    ctx = canvas.getContext('2d');
    
    if (!canvas || !ctx) {
      console.error('Canvas or context not available');
      return;
    }
    
    this.gameManager = new GameManager(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.ui = new UI(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.soundManager = new SoundManager();
    this.aniId = 0;
    
    this.soundManager.init();
    this.loadGameProgress();
    
    this.setupEventListeners();
    this.setupUICallbacks();
    
    this.ui.initMenu();
    this.startLoop();
  }

  setupEventListeners() {
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }
    
    if (typeof canvas.addEventListener !== 'function') {
      console.error('Canvas does not have addEventListener method');
      return;
    }
    
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.ui.updateMousePosition(x, y);
      this.handleInput(x, y);
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.ui.updateMousePosition(x, y);
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.ui.updateMousePosition(x, y);
    });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleInput(x, y);
    });
  }

  setupUICallbacks() {
    this.ui.onGameStart = (count, level) => {
      this.startGame(count, level);
    };

    this.ui.onGameReset = () => {
      this.resetGame();
    };

    this.ui.onBackToMenu = () => {
      this.backToMenu();
    };
    
    this.ui.onNextLevel = (level) => {
      this.startNextLevel(level);
    };
    
    this.gameManager.onGameComplete = (time) => {
      this.handleGameComplete(time);
    };
    
    this.gameManager.onGameFailed = () => {
      this.handleGameFailed();
    };
    
    this.gameManager.onError = () => {
      this.soundManager.playError();
    };
    
    this.gameManager.onCorrectClick = () => {
      this.soundManager.playClick();
    };
  }

  handleInput(x, y) {
    if (this.ui.showModal) {
      this.ui.handleModalClick(x, y);
      return;
    }

    if (this.ui.handleClick(x, y)) {
      return;
    }

    if (this.gameManager.gameState === 'playing') {
      this.gameManager.handleClick(x, y);
    }
  }

  startGame(count, level) {
    this.ui.currentLevel = level;
    this.gameManager.initGame(count, level);
    this.ui.initGame();
  }

  startNextLevel(level) {
    this.ui.currentLevel = level;
    this.startGame(this.ui.levelConfig[level].count, level);
  }

  resetGame() {
    const count = this.gameManager.polygonCount;
    const level = this.gameManager.currentLevel;
    this.gameManager.initGame(count, level);
  }

  backToMenu() {
    this.gameManager.reset();
    this.ui.initMenu();
  }

  handleGameComplete(time) {
    this.soundManager.playComplete();
    this.saveGameProgress(time);
    
    if (this.ui.shouldAutoAdvance()) {
      this.ui.showModalDialog(
        'levelComplete',
        '🎉 恭喜通关！',
        `完成时间: ${time.toFixed(2)}秒`,
        [
          {
            id: 'nextLevel',
            text: '进入下一关',
            color: '#4CAF50',
            hoverColor: '#45a049',
            action: () => {
              this.ui.hideModal();
              this.startNextLevel(2);
            }
          }
        ]
      );
    } else {
      this.ui.showModalDialog(
        'gameComplete',
        '🎉 恭喜通关！',
        `完成时间: ${time.toFixed(2)}秒`,
        [
          {
            id: 'playAgain',
            text: '再玩一次',
            color: '#4CAF50',
            hoverColor: '#45a049',
            action: () => {
              this.ui.hideModal();
              this.ui.initCompletion(time);
            }
          },
          {
            id: 'menu',
            text: '返回菜单',
            color: '#9E9E9E',
            hoverColor: '#757575',
            action: () => {
              this.ui.hideModal();
              this.backToMenu();
            }
          }
        ]
      );
    }
  }

  handleGameFailed() {
    this.soundManager.playError();
    this.ui.showModalDialog(
      'gameFailed',
      '😢 游戏失败！',
      `完成进度: ${this.gameManager.getProgress()}/${this.gameManager.getTotalProgress()}\n用时: ${this.gameManager.getCompletionTime().toFixed(2)}秒`,
      [
        {
          id: 'restart',
          text: '重新开始',
          color: '#4CAF50',
          hoverColor: '#45a049',
          action: () => {
            this.ui.hideModal();
            this.resetGame();
          }
        },
        {
          id: 'menu',
          text: '返回主界面',
          color: '#9E9E9E',
          hoverColor: '#757575',
          action: () => {
            this.ui.hideModal();
            this.backToMenu();
          }
        }
      ]
    );
  }

  update() {
    this.gameManager.update();
    this.ui.updateModalAnimation(0.016);
  }

  render() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (this.gameManager.gameState === 'playing' || this.gameManager.gameState === 'completed') {
      this.gameManager.render(ctx);
    }

    this.ui.render(
      ctx,
      this.gameManager.gameState,
      this.gameManager.currentNumber,
      this.gameManager.totalNumbers,
      this.gameManager.getTimeLeft()
    );
  }

  loop() {
    this.update();
    this.render();
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }

  startLoop() {
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }

  saveGameProgress(time) {
    if (typeof wx === 'undefined' || !wx.setStorageSync) {
      console.log('wx API not available, skipping save');
      return;
    }
    
    try {
      const progress = {
        bestTime: time,
        level: this.gameManager.currentLevel,
        polygonCount: this.gameManager.polygonCount,
        timestamp: Date.now()
      };
      
      const savedProgress = wx.getStorageSync('gameProgress') || {};
      const key = `level_${this.gameManager.currentLevel}`;
      
      if (!savedProgress[key] || time < savedProgress[key].bestTime) {
        savedProgress[key] = progress;
        wx.setStorageSync('gameProgress', savedProgress);
      }
    } catch (e) {
      console.log('Save game progress failed:', e);
    }
  }

  loadGameProgress() {
    if (typeof wx === 'undefined' || !wx.getStorageSync) {
      console.log('wx API not available, skipping load');
      return;
    }
    
    try {
      const savedProgress = wx.getStorageSync('gameProgress');
      if (savedProgress) {
        console.log('Loaded game progress:', savedProgress);
      }
    } catch (e) {
      console.log('Load game progress failed:', e);
    }
  }

  getBestTime(difficulty, count) {
    try {
      const savedProgress = wx.getStorageSync('gameProgress');
      if (savedProgress) {
        const key = `${difficulty}_${count}`;
        return savedProgress[key] ? savedProgress[key].bestTime : null;
      }
    } catch (e) {
      console.log('Get best time failed:', e);
    }
    return null;
  }
}
