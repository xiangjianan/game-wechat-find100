import LineDividerGenerator from './lineDividerGenerator';
import ComboManager from './comboManager';

export default class GameManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.generator = new LineDividerGenerator(width, height);
    this.comboManager = new ComboManager();
    this.polygons = [];
    this.currentNumber = 1;
    this.totalNumbers = 0;
    this.gameState = 'menu';
    this.startTime = 0;
    this.endTime = 0;
    this.currentLevel = 1;
    this.polygonCount = 10;
    this.onGameComplete = null;
    this.onError = null;
    this.onCorrectClick = null;
    this.onComboUpdate = null;
    this.onComboLevelUp = null;
    this.onComboBreak = null;
    
    this.timeLeft = 5.0;
    this.initialTime = 5.0;
    this.timeBonus = 5.0;
    this.timerInterval = null;
    this.clickCount = 0;
    this.errorCount = 0;
    this.gameMode = 'timed';
    
    this.hintCount = 0;
    this.hintedPolygon = null;
    this.onHintUsed = null;
    this.itemManager = null;
    this.skillManager = null;
    this.eagleEyeTimeoutId = null;

    this.setupComboCallbacks();
  }

  setupComboCallbacks() {
    this.comboManager.onComboUpdate = (count, level) => {
      if (this.gameMode === 'timed' && count >= 5) {
        const isUnlocked = this.skillManager && this.skillManager.isUnlocked('combo_boost');
        const timeReward = isUnlocked ? count + 5 : 5;
        this.timeLeft += timeReward;
      }
      
      const coinBonus = this.skillManager ? this.skillManager.getComboCoinBonus() : 0;
      if (coinBonus > 0 && count >= 5) {
        this.coinManager.addCoins(coinBonus, 'combo');
      }
      
      if (this.onComboUpdate) {
        this.onComboUpdate(count, level);
      }
    };
    
    this.comboManager.onComboLevelUp = (level, count) => {
      if (this.onComboLevelUp) {
        this.onComboLevelUp(level, count);
      }
    };
    
    this.comboManager.onComboBreak = (count, level) => {
      if (this.onComboBreak) {
        this.onComboBreak(count, level);
      }
    };
  }

  initGame(count, level = 1, gameMode = 'timed') {
    this.polygonCount = count;
    this.currentLevel = level;
    this.gameMode = gameMode;
    this.polygons = this.generator.generatePolygons(count, 'normal');
    this.currentNumber = 1;
    this.totalNumbers = count;
    this.gameState = 'playing';
    this.startTime = Date.now();
    this.timeLeft = this.initialTime + (this.skillManager ? this.skillManager.getInitialTimeBonus() : 0);
    this.clickCount = 0;
    this.errorCount = 0;
    this.hintCount = this.itemManager ? this.itemManager.getItemCount('hint') : 0;
    this.hintedPolygon = null;
    
    if (this.gameMode === 'timed') {
      this.startTimer();
    }
  }

  handleClick(x, y) {
    if (this.gameState !== 'playing') return;

    for (const polygon of this.polygons) {
      if (!polygon.isClicked && polygon.containsPoint({ x, y })) {
        if (polygon.number === this.currentNumber) {
          this.handleCorrectClick(polygon);
        } else {
          this.handleWrongClick(polygon);
        }
        return;
      }
    }
  }

  handleCorrectClick(polygon) {
    // 如果当前多边形有鹰眼高亮，立即取消并清除定时器
    if (polygon.isEagleEyeHighlighted) {
      polygon.setEagleEyeHighlight(false);
      if (this.eagleEyeTimeoutId) {
        clearTimeout(this.eagleEyeTimeoutId);
        this.eagleEyeTimeoutId = null;
      }
    }

    polygon.isClicked = true;
    polygon.highlight();

    setTimeout(() => {
      polygon.resetHighlight();
    }, 200);

    if (this.hintedPolygon === polygon) {
      this.clearHint();
    }

    this.currentNumber++;
    this.clickCount++;

    // 鹰眼技能：3秒后高亮下一个数字
    if (this.skillManager && this.skillManager.isUnlocked('eagle_eye') && this.currentNumber <= this.totalNumbers) {
      const nextPolygon = this.polygons.find(p => p.number === this.currentNumber);
      if (nextPolygon) {
        // 清除之前的定时器
        if (this.eagleEyeTimeoutId) {
          clearTimeout(this.eagleEyeTimeoutId);
          this.eagleEyeTimeoutId = null;
        }

        // 3秒后高亮下一个数字
        this.eagleEyeTimeoutId = setTimeout(() => {
          nextPolygon.setEagleEyeHighlight(true);
          this.eagleEyeTimeoutId = null;
        }, 3000);
      }
    }

    const comboLevel = this.comboManager.onCorrectClick();
    const comboCount = this.comboManager.getComboCount();

    if (this.gameMode === 'timed') {
      if (comboCount >= 5) {
        // 连击时不再加基础时间，时间奖励由 onComboUpdate 处理
      } else {
        const timeBonusSkill = this.skillManager ? this.skillManager.getTimeBonusPerClick() : 0;
        this.timeLeft += this.timeBonus + timeBonusSkill;
      }
    }

    if (this.currentNumber > this.totalNumbers) {
      this.handleGameComplete();
    }

    if (this.onCorrectClick) {
      const center = polygon.getCenter();
      this.onCorrectClick(center, comboLevel);
    }
  }

  handleWrongClick(polygon) {
    polygon.shake();
    this.errorCount++;
    this.clickCount++;
    
    this.comboManager.onWrongClick();
    
    if (this.gameMode === 'timed') {
      this.timeLeft -= this.timeBonus;
      if (this.timeLeft < 0) {
        this.timeLeft = 0;
      }
    }
    
    if (this.onError) {
      const center = polygon.getCenter();
      this.onError(center);
    }
  }

  handleGameComplete() {
    this.stopTimer();
    this.gameState = 'completed';
    this.endTime = Date.now();
    const completionTime = (this.endTime - this.startTime) / 1000;
    
    if (this.onGameComplete) {
      this.onGameComplete(completionTime);
    }
  }

  hasNextLevel() {
    return this.currentLevel < 2;
  }

  reset() {
    this.stopTimer();
    this.polygons = [];
    this.currentNumber = 1;
    this.gameState = 'menu';
    this.startTime = 0;
    this.endTime = 0;
    this.timeLeft = this.initialTime;
    this.clickCount = 0;
    this.errorCount = 0;
    this.comboManager.reset();
    this.hintCount = this.itemManager ? this.itemManager.getItemCount('hint') : 0;
    this.hintedPolygon = null;
  }

  getComboCount() {
    return this.comboManager.getComboCount();
  }

  getComboMultiplier() {
    return this.comboManager.getMultiplier();
  }

  getMaxCombo() {
    return this.comboManager.getMaxCombo();
  }

  getComboLevel() {
    return this.comboManager.getCurrentComboLevel();
  }

  setItemManager(itemManager) {
    this.itemManager = itemManager;
  }

  setSkillManager(skillManager) {
    this.skillManager = skillManager;
  }

  setCoinManager(coinManager) {
    this.coinManager = coinManager;
  }

  update(_deltaTime) {
    for (const polygon of this.polygons) {
      polygon.update();
    }
    
    // 注意：倒计时由 setInterval 在 updateTimer() 中管理
    // 不在此处重复扣减，避免双倍计时问题
    // 仅检查是否超时（用于处理边界情况）
    if (this.gameMode === 'timed' && this.gameState === 'playing' && !this.isPaused) {
      if (this.timeLeft <= 0 && this.gameState !== 'failed') {
        this.handleTimeUp();
      }
    }
  }

  handleTimeUp() {
    this.stopTimer();
    this.gameState = 'failed';
    if (this.onGameFailed) {
      this.onGameFailed();
    }
  }

  render(ctx) {
    for (const polygon of this.polygons) {
      polygon.renderShape(ctx);
    }
    
    for (const polygon of this.polygons) {
      polygon.renderText(ctx);
    }
  }

  getCompletionTime() {
    if (this.startTime === 0) return 0;
    const endTime = this.gameState === 'completed' ? this.endTime : Date.now();
    return (endTime - this.startTime) / 1000;
  }

  getProgress() {
    return this.currentNumber - 1;
  }

  getTotalProgress() {
    return this.totalNumbers;
  }

  startTimer() {
    this.stopTimer();
    this.timerStartTime = Date.now();
    this.timerLastUpdate = this.timerStartTime;
    this.isPaused = false;
    
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 100);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isPaused = false;
  }

  updateTimer() {
    const now = Date.now();
    const elapsed = (now - this.timerLastUpdate) / 1000;
    this.timerLastUpdate = now;
    
    this.timeLeft = Math.max(0, this.timeLeft - elapsed);
    
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.stopTimer();
      this.gameState = 'failed';
      
      if (this.onGameFailed) {
        this.onGameFailed();
      }
    }
  }

  pauseTimer() {
    if (this.gameState !== 'playing' || this.isPaused) return false;
    this.isPaused = true;
    this.pauseStartTime = Date.now();
    this.stopTimer();
    return true;
  }

  resumeTimer() {
    if (!this.isPaused) return false;
    this.isPaused = false;
    this.timerLastUpdate = Date.now();
    this.startTimer();
    return true;
  }

  togglePause() {
    if (this.isPaused) {
      return this.resumeTimer();
    } else {
      return this.pauseTimer();
    }
  }

  isTimerPaused() {
    return this.isPaused;
  }

  getTimeLeft() {
    return this.timeLeft;
  }

  getClickCount() {
    return this.clickCount;
  }

  getErrorCount() {
    return this.errorCount;
  }

  getGameMode() {
    return this.gameMode;
  }

  setGameMode(mode) {
    this.gameMode = mode;
  }

  isTimedMode() {
    return this.gameMode === 'timed';
  }

  setItemManager(itemManager) {
    this.itemManager = itemManager;
  }

  useHint() {
    if (this.gameState !== 'playing') return false;
    if (!this.itemManager || !this.itemManager.hasItem('hint', 1)) return false;
    if (this.currentNumber > this.totalNumbers) return false;

    this.clearHint();

    const targetPolygon = this.polygons.find(p => p.number === this.currentNumber && !p.isClicked);
    if (!targetPolygon) return false;

    this.itemManager.useItem('hint', 1);
    this.hintCount = this.itemManager.getItemCount('hint');
    this.hintedPolygon = targetPolygon;
    targetPolygon.setHintHighlight(true);

    if (this.onHintUsed) {
      this.onHintUsed(this.hintCount);
    }

    return true;
  }

  clearHint() {
    if (this.hintedPolygon) {
      this.hintedPolygon.setHintHighlight(false);
      this.hintedPolygon = null;
    }
  }

  getHintCount() {
    return this.hintCount;
  }
}
