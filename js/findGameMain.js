import { SCREEN_WIDTH, SCREEN_HEIGHT, getContext, getCanvas } from './render';
import GameManager from './gameManager';
import UI from './ui';
import SoundManager from './soundManager';
import RankManager from './rankManager';

let canvas;
let ctx;

export default class FindGameMain {
  constructor() {
    canvas = getCanvas();
    ctx = getContext();
    
    if (!canvas || !ctx) {
      console.error('Canvas or context not available');
      return;
    }
    
    this.gameManager = new GameManager(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.ui = new UI(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.soundManager = new SoundManager();
    this.rankManager = new RankManager();
    this.aniId = 0;
    
    this.soundManager.init();
    this.rankManager.init();
    this.loadGameProgress();
    
    this.setupEventListeners();
    this.setupUICallbacks();
    
    this.ui.initMenu();
    this.startLoop();
  }

  setupEventListeners() {
    console.log('Setting up event listeners');
    
    const handleTouchStart = (res) => {
      try {
        if (!res.touches || res.touches.length === 0) {
          console.warn('No touch data available');
          return;
        }
        
        const touch = res.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        
        this.ui.updateMousePosition(x, y);
        this.handleInput(x, y);
        
        console.log('Touch start handled:', { x, y });
      } catch (error) {
        console.error('Error handling touch start:', error);
      }
    };
    
    const handleTouchMove = (res) => {
      try {
        if (!res.touches || res.touches.length === 0) {
          return;
        }
        
        const touch = res.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        this.ui.updateMousePosition(x, y);
      } catch (error) {
        console.error('Error handling touch move:', error);
      }
    };
    
    const handleTouchEnd = (res) => {
      try {
        console.log('Touch end handled');
      } catch (error) {
        console.error('Error handling touch end:', error);
      }
    };
    
    const handleTouchCancel = (res) => {
      try {
        console.log('Touch cancel handled');
      } catch (error) {
        console.error('Error handling touch cancel:', error);
      }
    };
    
    if (typeof wx !== 'undefined' && typeof wx.onTouchStart === 'function') {
      try {
        wx.onTouchStart(handleTouchStart);
        console.log('wx.onTouchStart listener added');
      } catch (error) {
        console.error('Failed to add wx.onTouchStart listener:', error);
      }
      
      try {
        wx.onTouchMove(handleTouchMove);
        console.log('wx.onTouchMove listener added');
      } catch (error) {
        console.error('Failed to add wx.onTouchMove listener:', error);
      }
      
      try {
        wx.onTouchEnd(handleTouchEnd);
        console.log('wx.onTouchEnd listener added');
      } catch (error) {
        console.error('Failed to add wx.onTouchEnd listener:', error);
      }
      
      try {
        wx.onTouchCancel(handleTouchCancel);
        console.log('wx.onTouchCancel listener added');
      } catch (error) {
        console.error('Failed to add wx.onTouchCancel listener:', error);
      }
    } else {
      console.log('wx API not available, using canvas event listeners');
      
      if (!canvas) {
        console.error('Canvas not available');
        return;
      }
      
      if (typeof canvas.addEventListener !== 'function') {
        console.error('Canvas does not have addEventListener method');
        console.error('Canvas type:', typeof canvas);
        console.error('Canvas object:', canvas);
        return;
      }
      
      const handleTouch = (e) => {
        try {
          e.preventDefault();
          e.stopPropagation();
          
          if (!e.touches || e.touches.length === 0) {
            console.warn('No touch data available');
            return;
          }
          
          const touch = e.touches[0];
          const rect = canvas.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          
          this.ui.updateMousePosition(x, y);
          this.handleInput(x, y);
          
          console.log('Touch event handled:', { x, y, type: e.type });
        } catch (error) {
          console.error('Error handling touch event:', error);
        }
      };
      
      const handleMouse = (e) => {
        try {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          this.ui.updateMousePosition(x, y);
          
          if (e.type === 'click') {
            this.handleInput(x, y);
          }
          
          console.log('Mouse event handled:', { x, y, type: e.type });
        } catch (error) {
          console.error('Error handling mouse event:', error);
        }
      };
      
      try {
        canvas.addEventListener('touchstart', handleTouch, { passive: false });
        console.log('canvas touchstart listener added');
      } catch (error) {
        console.error('Failed to add canvas touchstart listener:', error);
      }
      
      try {
        canvas.addEventListener('touchmove', (e) => {
          try {
            e.preventDefault();
            e.stopPropagation();
            
            if (!e.touches || e.touches.length === 0) {
              return;
            }
            
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.ui.updateMousePosition(x, y);
          } catch (error) {
            console.error('Error handling touchmove:', error);
          }
        }, { passive: false });
        console.log('canvas touchmove listener added');
      } catch (error) {
        console.error('Failed to add canvas touchmove listener:', error);
      }
      
      try {
        canvas.addEventListener('touchend', (e) => {
          try {
            e.preventDefault();
            e.stopPropagation();
          } catch (error) {
            console.error('Error handling touchend:', error);
          }
        }, { passive: false });
        console.log('canvas touchend listener added');
      } catch (error) {
        console.error('Failed to add canvas touchend listener:', error);
      }
      
      try {
        canvas.addEventListener('mousemove', handleMouse);
        console.log('canvas mousemove listener added');
      } catch (error) {
        console.error('Failed to add canvas mousemove listener:', error);
      }
      
      try {
        canvas.addEventListener('click', handleMouse);
        console.log('canvas click listener added');
      } catch (error) {
        console.error('Failed to add canvas click listener:', error);
      }
    }
    
    console.log('Event listeners setup complete');
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

    this.ui.onPlayClickSound = () => {
      this.soundManager.playClick();
    };

    this.ui.onOpenRank = () => {
      this.openRank();
    };

    this.ui.onCloseRank = () => {
      this.closeRank();
    };
    
    this.gameManager.onGameComplete = (time) => {
      this.handleGameComplete(time);
    };
    
    this.gameManager.onGameFailed = () => {
      this.handleGameFailed();
    };
    
    this.gameManager.onError = (center) => {
      this.soundManager.playError();
      this.ui.showFloatingText(center.x, center.y, '-5秒', '#FF4444');
    };
    
    this.gameManager.onCorrectClick = (center) => {
      this.soundManager.playClick();
      this.ui.showFloatingText(center.x, center.y, '+5秒', '#44FF44');
    };
  }

  handleInput(x, y) {
    if (this.ui.showModal) {
      this.ui.handleModalClick(x, y);
      return;
    }

    // 处理排行榜点击
    if (this.rankManager.isRankOpen()) {
      this.rankManager.handleClick(x, y, SCREEN_WIDTH, SCREEN_HEIGHT);
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
    
    // 上传分数到排行榜
    this.rankManager.uploadScore(time, this.gameManager.currentLevel);
    
    if (this.ui.shouldAutoAdvance()) {
      this.ui.showModalDialog(
        'levelComplete',
        '🎉 恭喜过关！',
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
              const level = this.gameManager.currentLevel;
              const count = this.ui.levelConfig[level].count;
              this.startGame(count, level);
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

  render(deltaTime = 0.016) {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (this.gameManager.gameState === 'playing' || this.gameManager.gameState === 'completed' || this.gameManager.gameState === 'failed') {
      this.gameManager.render(ctx);
    }

    this.ui.render(
      ctx,
      this.gameManager.gameState,
      this.gameManager.currentNumber,
      this.gameManager.totalNumbers,
      this.gameManager.getTimeLeft(),
      deltaTime
    );

    // 渲染排行榜
    if (this.rankManager.isRankOpen()) {
      this.rankManager.render(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
  }

  loop() {
    const now = Date.now();
    const deltaTime = this.lastFrameTime ? (now - this.lastFrameTime) / 1000 : 0.016;
    this.lastFrameTime = now;
    
    this.update();
    this.render(deltaTime);
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

  openRank() {
    this.rankManager.open(() => {
      this.ui.hideRank();
    });
    this.ui.showRank();
  }

  closeRank() {
    this.rankManager.close();
    this.ui.hideRank();
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
