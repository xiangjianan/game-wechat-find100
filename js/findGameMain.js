import { SCREEN_WIDTH, SCREEN_HEIGHT, getContext, getCanvas } from './render';
import GameManager from './gameManager';
import UI from './ui';
import SoundManager from './soundManager';
import RankManager from './rankManager';
import { getColorScheme } from './constants/colors';

let canvas;
let ctx;

export default class FindGameMain {
  constructor() {
    canvas = getCanvas();
    ctx = getContext();
    
    if (!canvas || !ctx) {
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
    
    const savedMode = this.loadGameMode();
    this.ui.setGameMode(savedMode);
    this.gameManager.setGameMode(savedMode);
    
    this.setupEventListeners();
    this.setupUICallbacks();
    
    this.ui.initMenu();
    this.startLoop();
  }

  setupEventListeners() {
    const handleTouchStart = (res) => {
      try {
        if (!res.touches || res.touches.length === 0) return;
        
        const touch = res.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        
        this.ui.updateMousePosition(x, y);
        this.handleInput(x, y);
      } catch (error) {
        // 静默处理错误
      }
    };
    
    const handleTouchMove = (res) => {
      try {
        if (!res.touches || res.touches.length === 0) return;
        
        const touch = res.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        this.ui.updateMousePosition(x, y);
      } catch (error) {
        // 静默处理错误
      }
    };
    
    if (typeof wx !== 'undefined' && typeof wx.onTouchStart === 'function') {
      wx.onTouchStart(handleTouchStart);
      wx.onTouchMove(handleTouchMove);
    } else {
      if (!canvas || typeof canvas.addEventListener !== 'function') return;
      
      const handleTouch = (e) => {
        try {
          e.preventDefault();
          e.stopPropagation();
          
          if (!e.touches || e.touches.length === 0) return;
          
          const touch = e.touches[0];
          const rect = canvas.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          
          this.ui.updateMousePosition(x, y);
          this.handleInput(x, y);
        } catch (error) {
          // 静默处理错误
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
        } catch (error) {
          // 静默处理错误
        }
      };
      
      canvas.addEventListener('touchstart', handleTouch, { passive: false });
      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.touches && e.touches.length > 0) {
          const touch = e.touches[0];
          const rect = canvas.getBoundingClientRect();
          this.ui.updateMousePosition(touch.clientX - rect.left, touch.clientY - rect.top);
        }
      }, { passive: false });
      canvas.addEventListener('mousemove', handleMouse);
      canvas.addEventListener('click', handleMouse);
    }
  }

  setupUICallbacks() {
    this.ui.onGameStart = (count, level, gameMode) => {
      this.startGame(count, level, gameMode);
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

    this.rankManager.onPlayClickSound = () => {
      this.soundManager.playClick();
    };

    this.ui.onOpenRank = () => {
      this.openRank();
    };

    this.ui.onCloseRank = () => {
      this.closeRank();
    };
    
    this.ui.onModeChange = (mode) => {
      this.saveGameMode(mode);
    };
    
    this.gameManager.onGameComplete = (time) => {
      this.handleGameComplete(time);
    };
    
    this.gameManager.onGameFailed = () => {
      this.handleGameFailed();
    };
    
    this.gameManager.onError = (center) => {
      this.soundManager.playError();
      if (this.gameManager.isTimedMode()) {
        this.ui.showFloatingText(center.x, center.y, '-5秒', '#FF4444');
      } else {
        this.ui.showFloatingText(center.x, center.y, '错误', '#FF4444');
      }
    };
    
    this.gameManager.onCorrectClick = (center) => {
      this.soundManager.playClick();
      if (this.gameManager.isTimedMode()) {
        this.ui.showFloatingText(center.x, center.y, '+5秒', '#44FF44');
      } else {
        this.ui.showFloatingText(center.x, center.y, '正确', '#44FF44');
      }
    };
  }

  handleInput(x, y) {
    if (this.ui.showModal) {
      if (this.ui.handleClick(x, y)) return;
      return;
    }

    if (this.rankManager.isRankOpen()) {
      this.rankManager.handleClick(x, y, SCREEN_WIDTH, SCREEN_HEIGHT);
      return;
    }

    if (this.ui.handleClick(x, y)) return;

    if (this.gameManager.gameState === 'playing') {
      this.gameManager.handleClick(x, y);
    }
  }

  startGame(count, level, gameMode = null) {
    this.ui.currentLevel = level;
    const mode = gameMode || this.ui.getGameMode();
    this.gameManager.initGame(count, level, mode);
    this.ui.initGame();
  }

  startNextLevel(level) {
    this.ui.currentLevel = level;
    const mode = this.ui.getGameMode();
    this.startGame(this.ui.levelConfig[level].count, level, mode);
  }

  resetGame() {
    const count = this.gameManager.polygonCount;
    const level = this.gameManager.currentLevel;
    const mode = this.ui.getGameMode();
    this.gameManager.initGame(count, level, mode);
  }

  backToMenu() {
    this.gameManager.reset();
    this.ui.initMenu();
  }

  handleGameComplete(time) {
    this.soundManager.playComplete();
    this.saveGameProgress(time);
    
    this.rankManager.uploadScore(time, this.gameManager.currentLevel);
    
    if (this.ui.shouldAutoAdvance()) {
      this.ui.showModalDialog(
        'gameComplete',
        '恭喜通关！',
        `完成时间: ${time.toFixed(2)}秒`,
        [
          {
            id: 'nextLevel',
            text: '下一关',
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
        '恭喜通关！',
        `完成时间: ${time.toFixed(2)}秒`,
        [
          {
            id: 'nextLevel',
            text: '下一关',
            action: () => {
              this.ui.hideModal();
              const level = this.gameManager.currentLevel;
              const count = this.ui.levelConfig[level].count;
              this.startGame(count, level);
            }
          },
          {
            id: 'playAgain',
            text: '再玩一次',
            action: () => {
              this.ui.hideModal();
              const level = this.gameManager.currentLevel;
              const count = this.ui.levelConfig[level].count;
              this.startGame(count, level);
            }
          },
          {
            id: 'menu',
            text: '返回首页',
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
      '再接再厉！',
      `完成进度: ${this.gameManager.getProgress()}/${this.gameManager.getTotalProgress()}\n用时: ${this.gameManager.getCompletionTime().toFixed(2)}秒`,
      [
        {
          id: 'tryAgain',
          text: '再试一次',
          action: () => {
            this.ui.hideModal();
            this.resetGame();
          }
        },
        {
          id: 'menu',
          text: '返回首页',
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

  renderGameBackground(ctx) {
    const scheme = getColorScheme();
    
    ctx.fillStyle = scheme.background;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    ctx.strokeStyle = scheme.border;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.03;
    const gridSize = 50;
    
    for (let x = 0; x < SCREEN_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, SCREEN_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = 0; y < SCREEN_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(SCREEN_WIDTH, y);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  }

  render(deltaTime = 0.016) {
    this.renderGameBackground(ctx);

    if (this.gameManager.gameState === 'playing' || this.gameManager.gameState === 'completed' || this.gameManager.gameState === 'failed') {
      this.gameManager.render(ctx);
    }

    if (this.rankManager.isRankOpen()) {
      this.rankManager.render(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    this.ui.render(
      ctx,
      this.gameManager.gameState,
      this.gameManager.currentNumber,
      this.gameManager.totalNumbers,
      this.gameManager.getTimeLeft(),
      deltaTime
    );
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
    if (typeof wx === 'undefined' || !wx.setStorageSync) return;
    
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
      // 静默处理错误
    }
  }

  loadGameProgress() {
    if (typeof wx === 'undefined' || !wx.getStorageSync) return;
    
    try {
      const savedProgress = wx.getStorageSync('gameProgress');
      // 加载进度但不打印日志
    } catch (e) {
      // 静默处理错误
    }
  }

  saveGameMode(mode) {
    if (typeof wx === 'undefined' || !wx.setStorageSync) return;
    
    try {
      wx.setStorageSync('gameMode', mode);
    } catch (e) {
      // 静默处理错误
    }
  }

  loadGameMode() {
    if (typeof wx === 'undefined' || !wx.getStorageSync) return 'timed';
    
    try {
      const savedMode = wx.getStorageSync('gameMode');
      if (savedMode && (savedMode === 'timed' || savedMode === 'untimed')) {
        return savedMode;
      }
    } catch (e) {
      // 静默处理错误
    }
    
    return 'timed';
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
      // 静默处理错误
    }
    return null;
  }
}
