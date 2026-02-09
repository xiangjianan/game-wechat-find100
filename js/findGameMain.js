import { SCREEN_WIDTH, SCREEN_HEIGHT } from './render';
import GameManager from './gameManager';
import UI from './ui';
import SoundManager from './soundManager';

const ctx = canvas.getContext('2d');

export default class FindGameMain {
  constructor() {
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
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.handleInput(x, y);
    });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleInput(x, y);
    });
  }

  setupUICallbacks() {
    this.ui.onGameStart = (count, difficulty) => {
      this.startGame(count, difficulty);
    };

    this.ui.onGameReset = () => {
      this.resetGame();
    };

    this.ui.onBackToMenu = () => {
      this.backToMenu();
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
    if (this.ui.handleClick(x, y)) {
      return;
    }

    if (this.gameManager.gameState === 'playing') {
      this.gameManager.handleClick(x, y);
    }
  }

  startGame(count, difficulty) {
    this.gameManager.initGame(count, difficulty);
    this.ui.initGame();
  }

  resetGame() {
    const count = this.gameManager.polygonCount;
    const difficulty = this.gameManager.difficulty;
    this.gameManager.initGame(count, difficulty);
  }

  backToMenu() {
    this.gameManager.reset();
    this.ui.initMenu();
  }

  handleGameComplete(time) {
    this.soundManager.playComplete();
    this.saveGameProgress(time);
    this.ui.initCompletion(time);
  }

  handleGameFailed() {
    this.soundManager.playError();
    this.ui.initFailure(
      this.gameManager.getProgress(),
      this.gameManager.getTotalProgress(),
      this.gameManager.getCompletionTime()
    );
  }

  update() {
    this.gameManager.update();
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
    try {
      const progress = {
        bestTime: time,
        difficulty: this.gameManager.difficulty,
        polygonCount: this.gameManager.polygonCount,
        timestamp: Date.now()
      };
      
      const savedProgress = wx.getStorageSync('gameProgress') || {};
      const key = `${this.gameManager.difficulty}_${this.gameManager.polygonCount}`;
      
      if (!savedProgress[key] || time < savedProgress[key].bestTime) {
        savedProgress[key] = progress;
        wx.setStorageSync('gameProgress', savedProgress);
      }
    } catch (e) {
      console.log('Save game progress failed:', e);
    }
  }

  loadGameProgress() {
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
