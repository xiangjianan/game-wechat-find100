import { SCREEN_WIDTH, SCREEN_HEIGHT, getContext, getCanvas } from './render';
import GameManager from './gameManager';
import UI from './ui';
import SoundManager from './soundManager';
import RankManager from './rankManager';
import VibrationManager from './vibrationManager';
import AchievementManager from './achievementManager';
import CoinManager from './coinManager';
import ItemManager from './itemManager';
import ShopManager from './shopManager';
import SkillManager from './skillManager';
import { CacheManager } from './cacheManager';
import { getColorScheme } from './constants/colors';

// 性能监控工具 - 兼容微信小程序环境
class PerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.lastFpsTime = this.now();
    this.fps = 60;
    this.frameTime = 16.67;
    this.lastFrameTime = this.now();
    this.enabled = false;
    this.isSupported = this.checkSupport();
  }

  checkSupport() {
    return typeof performance !== 'undefined' && typeof performance.now === 'function';
  }

  now() {
    if (this.isSupported) {
      return performance.now();
    }
    return Date.now();
  }

  start() {
    this.enabled = true;
  }

  stop() {
    this.enabled = false;
  }

  update() {
    if (!this.enabled || !this.isSupported) return;

    const now = this.now();
    this.frameCount++;
    this.frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    if (now - this.lastFpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTime = now;

      // 低帧率警告
      if (this.fps < 30) {
        console.warn(`[Performance] Low FPS detected: ${this.fps}`);
      }

      // 内存监控
      if (performance.memory) {
        const usedHeap = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        const totalHeap = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
        if (performance.memory.usedJSHeapSize > 100 * 1048576) {
          console.warn(`[Performance] High memory usage: ${usedHeap}MB / ${totalHeap}MB`);
        }
      }
    }
  }

  getStats() {
    return {
      fps: this.fps,
      frameTime: this.frameTime.toFixed(2),
      memory: (this.isSupported && performance.memory) ? {
        used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
        total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2)
      } : null
    };
  }
}

const perfMonitor = new PerformanceMonitor();

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
    this.vibrationManager = new VibrationManager();
    this.achievementManager = new AchievementManager();
    this.coinManager = new CoinManager();
    this.itemManager = new ItemManager();
    this.shopManager = new ShopManager();
    this.skillManager = new SkillManager();
    this.aniId = 0;
    
    this.soundManager.init();
    CacheManager.init();
    this.rankManager.init();
    this.vibrationManager.checkSupport();
    this.achievementManager.loadProgress();
    this.coinManager.init();
    this.itemManager.init();
    this.shopManager.init(this.coinManager, this.itemManager);
    
    this.gameManager.setItemManager(this.itemManager);
    this.gameManager.setSkillManager(this.skillManager);
    this.gameManager.setCoinManager(this.coinManager);
    this.skillManager.setCoinManager(this.coinManager);
    this.achievementManager.setCoinManager(this.coinManager);
    
    this.loadGameProgress();
    
    const savedMode = this.loadGameMode();
    this.ui.setGameMode(savedMode);
    this.gameManager.setGameMode(savedMode);
    
    this.ui.setCoins(this.coinManager.getCoins());
    
    this.setupEventListeners();
    this.setupUICallbacks();
    this.setupLifecycleListeners();
    
    this.ui.initMenu();
    
    this.loop = this.loop.bind(this);
    this.startLoop();
  }

  setupLifecycleListeners() {
    if (typeof wx !== 'undefined') {
      wx.onHide(() => {
        if (this.gameManager.gameState === 'playing') {
          this.gameManager.pauseTimer();
          this.saveGameState();
        }
      });
      
      wx.onShow(() => {
        if (this.gameManager.isTimerPaused()) {
          this.showResumeDialog();
        }
      });
    }
  }

  saveGameState() {
    if (typeof wx === 'undefined' || !wx.setStorageSync) return;
    
    try {
      const state = {
        gameState: this.gameManager.gameState,
        timeLeft: this.gameManager.timeLeft,
        currentNumber: this.gameManager.currentNumber,
        totalNumbers: this.gameManager.totalNumbers,
        currentLevel: this.gameManager.currentLevel,
        gameMode: this.gameManager.gameMode,
        pausedAt: Date.now()
      };
      wx.setStorageSync('savedGameState', JSON.stringify(state));
    } catch (e) {
      // Silent fail
    }
  }

  loadGameState() {
    if (typeof wx === 'undefined' || !wx.getStorageSync) return null;
    
    try {
      const saved = wx.getStorageSync('savedGameState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Silent fail
    }
    return null;
  }

  clearSavedGameState() {
    if (typeof wx === 'undefined' || !wx.removeStorageSync) return;
    
    try {
      wx.removeStorageSync('savedGameState');
    } catch (e) {
      // Silent fail
    }
  }

  showResumeDialog() {
    this.ui.showModalDialog(
      'resume',
      '游戏暂停',
      '是否继续上次的游戏？',
      [
        {
          id: 'resume',
          text: '继续游戏',
          action: () => {
            this.ui.hideModal();
            this.gameManager.resumeTimer();
          }
        },
        {
          id: 'restart',
          text: '重新开始',
          action: () => {
            this.ui.hideModal();
            this.clearSavedGameState();
            this.resetGame();
          }
        }
      ]
    );
  }

  setupEventListeners() {
    const handleTouchStart = (res) => {
      try {
        if (!res.touches || res.touches.length === 0) return;

        const touch = res.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;

        this.ui.updateMousePosition(x, y);

        if (this.ui.showSkills) {
          this.ui.handleSkillsTouchStart(y);
          this.handleInput(x, y);
        } else if (this.ui.showShop) {
          this.ui.handleShopTouchStart(y);
          this.handleInput(x, y);
        } else {
          this.ui.handleTouchStart(y);
          this.handleInput(x, y);
        }
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

        if (this.ui.showSkills) {
          this.ui.handleSkillsTouchMove(y);
        } else if (this.ui.showShop) {
          this.ui.handleShopTouchMove(y);
        } else {
          this.ui.handleTouchMove(y);
        }
      } catch (error) {
        // 静默处理错误
      }
    };

    const handleTouchEnd = (res) => {
      try {
        if (this.ui.showSkills) {
          this.ui.handleSkillsTouchEnd();
        } else if (this.ui.showShop) {
          this.ui.handleShopTouchEnd();
        } else {
          this.ui.handleTouchEnd();
        }
      } catch (error) {
        // 静默处理错误
      }
    };
    
    if (typeof wx !== 'undefined' && typeof wx.onTouchStart === 'function') {
      wx.onTouchStart(handleTouchStart);
      wx.onTouchMove(handleTouchMove);
      wx.onTouchEnd(handleTouchEnd);
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

          if (this.ui.showSkills) {
            this.ui.handleSkillsTouchStart(y);
            this.handleInput(x, y);
          } else if (this.ui.showShop) {
            this.ui.handleShopTouchStart(y);
            this.handleInput(x, y);
          } else {
            this.ui.handleTouchStart(y);
            this.handleInput(x, y);
          }
        } catch (error) {
          // 静默处理错误
        }
      };
      
      const handleTouchMoveEvent = (e) => {
        try {
          e.preventDefault();
          e.stopPropagation();
          if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.ui.updateMousePosition(x, y);
            
            if (this.ui.showSkills) {
              this.ui.handleSkillsTouchMove(y);
            } else {
              this.ui.handleTouchMove(y);
            }
          }
        } catch (error) {
          // 静默处理错误
        }
      };
      
      const handleTouchEndEvent = (e) => {
        try {
          if (this.ui.showSkills) {
            this.ui.handleSkillsTouchEnd();
          } else {
            this.ui.handleTouchEnd();
          }
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
      
      const handleWheel = (e) => {
        try {
          if (this.ui.showShop) {
            e.preventDefault();
            this.ui.handleShopScroll(e.deltaY);
          } else if (this.ui.showSkills) {
            e.preventDefault();
            this.ui.handleSkillsScroll(e.deltaY);
          } else if (this.ui.showAchievements) {
            e.preventDefault();
            this.ui.handleAchievementsScroll(e.deltaY);
          }
        } catch (error) {
          console.error('Wheel error:', error);
        }
      };
      
      canvas.addEventListener('touchstart', handleTouch, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMoveEvent, { passive: false });
      canvas.addEventListener('touchend', handleTouchEndEvent, { passive: false });
      canvas.addEventListener('mousemove', handleMouse);
      canvas.addEventListener('click', handleMouse);
      canvas.addEventListener('wheel', handleWheel, { passive: false });
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
    
    this.ui.onAchievementsOpen = () => {
      this.openAchievements();
    };

    this.ui.onAchievementsClose = () => {
      this.closeAchievements();
    };
    
    this.ui.onModeChange = (mode) => {
      this.saveGameMode(mode);
    };
    
    this.ui.onOpenShop = () => {
      this.openShop();
    };
    
    this.ui.onShopBuy = (product) => {
      this.handleShopBuy(product);
    };
    
    this.ui.onOpenSkills = () => {
      this.openSkills();
    };
    
    this.ui.onSkillUnlock = (skillId) => {
      this.handleSkillUnlock(skillId);
    };
    
    this.ui.onTogglePause = () => {
      const paused = this.gameManager.togglePause();
      this.ui.isPaused = paused;
    };
    
    this.coinManager.onCoinChanged = (coins, amount, type) => {
      this.ui.setCoins(coins);
    };
    
    this.itemManager.onItemChanged = (itemId, count, type) => {
      if (itemId === 'hint' && this.gameManager) {
        this.gameManager.hintCount = count;
        this.ui.setHintCount(count);
      }
    };
    
    this.gameManager.onGameComplete = (time) => {
      this.handleGameComplete(time);
    };
    
    this.gameManager.onGameFailed = () => {
      this.handleGameFailed();
    };
    
    this.gameManager.onError = (center) => {
      this.soundManager.playError();
      this.vibrationManager.vibrateError();
      if (this.gameManager.isTimedMode()) {
        this.ui.showFloatingText(center.x, center.y, '-5秒', '#FF4444');
      } else {
        this.ui.showFloatingText(center.x, center.y, '错误', '#FF4444');
      }
    };
    
    this.gameManager.onCorrectClick = (center, comboLevel) => {
      this.soundManager.playClick();
      this.vibrationManager.vibrateCorrect();
      
      const comboCount = this.gameManager.getComboCount();
      if (comboLevel) {
        this.vibrationManager.vibrateCombo(comboLevel.vibration);
      }
      
      if (this.gameManager.isTimedMode()) {
        if (comboCount >= 5) {
          this.ui.showFloatingText(center.x, center.y, `+${comboCount}秒`, '#44FF44');
        } else {
          this.ui.showFloatingText(center.x, center.y, '+5秒', '#44FF44');
        }
      } else {
        if (comboCount >= 5) {
          this.ui.showFloatingText(center.x, center.y, `正确 ${comboCount}连击`, '#44FF44');
        } else {
          this.ui.showFloatingText(center.x, center.y, '正确', '#44FF44');
        }
      }
    };
    
    this.gameManager.onComboUpdate = (count, level) => {
      this.ui.updateCombo(count, level);
      
      const comboThresholds = [5, 10, 20];
      if (comboThresholds.includes(count) && this.gameManager.currentLevel === 2) {
        const unlockedAchievements = this.achievementManager.checkAchievement('combo', {
          count: count,
          level: this.gameManager.currentLevel
        });
        
        if (unlockedAchievements.length > 0) {
          this.ui.showAchievementNotification(unlockedAchievements);
        }
      }
    };
    
    this.gameManager.onComboLevelUp = (level, count) => {
      this.ui.onComboLevelUp(level, count);
      this.vibrationManager.vibrateCombo(level.vibration);
    };
    
    this.gameManager.onComboBreak = (count, level) => {
      this.ui.onComboBreak(count, level);
    };

    this.ui.onUseHint = () => {
      this.useHint();
    };

    this.gameManager.onHintUsed = (count) => {
      this.ui.setHintCount(count);
      this.ui.triggerHintButtonAnimation();
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
    this.ui.setHintCount(this.gameManager.getHintCount());
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
    
    const isLevel2 = this.gameManager.currentLevel === 2;
    const hasNextLevel = this.gameManager.hasNextLevel();
    let score = 0;
    
    if (isLevel2) {
      score = this.rankManager.calculateScore(
        this.gameManager.totalNumbers,
        time
      );
      
      this.rankManager.uploadScore(
        time, 
        this.gameManager.currentLevel, 
        this.gameManager.totalNumbers
      );
    }
    
    const achievementData = {
      level: this.gameManager.currentLevel,
      time: time,
      errors: this.gameManager.getErrorCount(),
      totalNumbers: this.gameManager.totalNumbers,
      mode: this.gameManager.getGameMode()
    };
    
    const unlockedAchievements = [
      ...this.achievementManager.checkAchievement('level_complete', achievementData),
      ...this.achievementManager.checkAchievement('game_complete', achievementData)
    ];
    
    if (unlockedAchievements.length > 0) {
      this.ui.showAchievementNotification(unlockedAchievements);
    }
    
    let message;
    if (isLevel2) {
      message = `完成时间: ${time.toFixed(2)}秒\n得分: ${score}`;
    } else {
      message = `完成时间: ${time.toFixed(2)}秒`;
    }
    
    const buttons = [
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
    ];
    
    if (hasNextLevel) {
      buttons.unshift({
        id: 'nextLevel',
        text: '下一关',
        action: () => {
          this.ui.hideModal();
          this.startNextLevel(2);
        }
      });
    }
    
    setTimeout(() => {
      this.ui.showModalDialog(
        'gameComplete',
        '恭喜通关！',
        message,
        buttons
      );
    }, 500);
  }

  handleGameFailed() {
    this.soundManager.playError();
    
    const isLevel2 = this.gameManager.currentLevel === 2;
    
    if (isLevel2) {
      const progress = this.gameManager.getProgress();
      const time = this.gameManager.getCompletionTime();
      const score = this.rankManager.calculateScore(progress, time);
      
      this.rankManager.uploadScore(
        time, 
        this.gameManager.currentLevel, 
        progress
      );
      
      this.achievementManager.checkAchievement('game_fail', {
        level: this.gameManager.currentLevel,
        progress: progress,
        total: this.gameManager.getTotalProgress(),
        score: score
      });
    } else {
      this.achievementManager.checkAchievement('game_fail', {
        level: this.gameManager.currentLevel,
        progress: this.gameManager.getProgress(),
        total: this.gameManager.getTotalProgress()
      });
    }
    
    let failMessage;
    if (isLevel2) {
      const progress = this.gameManager.getProgress();
      const time = this.gameManager.getCompletionTime();
      const score = this.rankManager.calculateScore(progress, time);
      failMessage = `完成进度: ${progress}/${this.gameManager.getTotalProgress()}\n用时: ${time.toFixed(2)}秒\n得分: ${score}`;
    } else {
      failMessage = `完成进度: ${this.gameManager.getProgress()}/${this.gameManager.getTotalProgress()}\n用时: ${this.gameManager.getCompletionTime().toFixed(2)}秒`;
    }
    
    this.ui.showModalDialog(
      'gameFailed',
      '再接再厉！',
      failMessage,
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

  update(deltaTime) {
    this.gameManager.update(deltaTime);
    this.ui.updateModalAnimation(deltaTime);
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
    
    // 更新性能监控
    perfMonitor.update();
    
    this.update(deltaTime);
    this.render(deltaTime);
    this.aniId = requestAnimationFrame(this.loop);
  }

  startLoop() {
    this.lastFrameTime = Date.now();
    this.aniId = requestAnimationFrame(this.loop);
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
    const opened = this.rankManager.open(() => {
      this.ui.hideRankView();
    });
    if (opened !== false) {
      this.ui.showRankView();
    }
  }

  closeRank() {
    this.rankManager.close();
    this.ui.hideRankView();
  }

  openAchievements() {
    this.ui.achievementsData = this.achievementManager.getAllAchievements();
  }

  closeAchievements() {
    this.ui.showAchievements = false;
  }

  useHint() {
    this.gameManager.useHint();
  }

  openShop() {
    this.ui.shopProducts = this.shopManager.getAllProducts();
    this.ui.showShop = true;
  }

  handleShopBuy(product) {
    const result = this.shopManager.buy(product.id);
    
    if (result.success) {
      this.soundManager.playClick();
      this.ui.showFloatingText(this.ui.width / 2, this.ui.height / 2, `+${result.itemsAdded} 💡`, '#44FF44');
    } else {
      this.soundManager.playError();
      if (result.reason === 'not_enough_coins') {
        this.ui.showFloatingText(this.ui.width / 2, this.ui.height / 2, '金币不足!', '#FF4444');
      }
    }
  }

  openSkills() {
    this.ui.skillsData = this.skillManager.getSkillProgress();
    this.ui.skillScrollOffset = 0;
    this.ui.skillScrollVelocity = 0;
    this.ui.skillIsTouching = false;
    this.ui.showSkills = true;
  }

  handleSkillUnlock(skillId) {
    const skill = this.skillManager.getSkill(skillId);
    if (!skill) return;

    const result = this.skillManager.unlockSkill(skillId);

    if (result) {
      this.soundManager.playClick();
      this.ui.showFloatingText(this.ui.width / 2, this.ui.height / 2, `解锁 ${skill.name}!`, '#9C27B0', 'skills');
      this.ui.skillsData = this.skillManager.getSkillProgress();
    } else {
      this.soundManager.playError();
      this.ui.showFloatingText(this.ui.width / 2, this.ui.height / 2, '金币不足!', '#FF4444', 'skills');
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
      // 静默处理错误
    }
    return null;
  }
}
