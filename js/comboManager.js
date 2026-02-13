export default class ComboManager {
  constructor() {
    this.comboCount = 0;
    this.maxCombo = 0;
    this.comboTimer = null;
    this.comboTimeLimit = 2000;
    this.lastComboLevel = null;
    this.comboMultiplier = 1.0;
    this.onComboUpdate = null;
    this.onComboBreak = null;
    this.onComboLevelUp = null;
    
    this.comboLevels = [
      { threshold: 5, name: '火热', color: '#FF6B35', vibration: 'light' },
      { threshold: 10, name: '燃烧', color: '#FF4500', vibration: 'medium' },
      { threshold: 15, name: '狂暴', color: '#FF0000', vibration: 'heavy' },
      { threshold: 20, name: '无敌', color: '#FFD700', vibration: 'heavy' }
    ];
  }

  onCorrectClick() {
    this.comboCount++;
    this.resetComboTimer();
    
    if (this.comboCount > this.maxCombo) {
      this.maxCombo = this.comboCount;
    }

    const level = this.getCurrentComboLevel();
    if (level && level !== this.lastComboLevel) {
      this.lastComboLevel = level;
      
      if (this.onComboLevelUp) {
        this.onComboLevelUp(level, this.comboCount);
      }
    }

    this.comboMultiplier = this.calculateMultiplier();

    if (this.onComboUpdate) {
      this.onComboUpdate(this.comboCount, level);
    }

    return level;
  }

  calculateMultiplier() {
    if (this.comboCount < 5) return 1.0;
    return 1.0 + (this.comboCount - 4) * 0.1;
  }

  getTimeBonus() {
    if (this.comboCount < 5) return 0;
    return this.comboCount;
  }

  onWrongClick() {
    this.breakCombo();
  }

  resetComboTimer() {
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
    }
    this.comboTimer = setTimeout(() => {
      this.breakCombo();
    }, this.comboTimeLimit);
  }

  breakCombo() {
    if (this.comboCount > 0) {
      if (this.onComboBreak) {
        this.onComboBreak(this.comboCount, this.lastComboLevel);
      }
    }
    
    this.comboCount = 0;
    this.lastComboLevel = null;
    this.comboMultiplier = 1.0;
    
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
      this.comboTimer = null;
    }

    if (this.onComboUpdate) {
      this.onComboUpdate(0, null);
    }
  }

  getCurrentComboLevel() {
    return this.comboLevels.slice().reverse().find(level => 
      this.comboCount >= level.threshold
    );
  }

  getNextLevel() {
    const currentLevel = this.getCurrentComboLevel();
    if (!currentLevel) {
      return this.comboLevels[0];
    }
    
    const currentIndex = this.comboLevels.indexOf(currentLevel);
    if (currentIndex < this.comboLevels.length - 1) {
      return this.comboLevels[currentIndex + 1];
    }
    
    return null;
  }

  getProgressToNextLevel() {
    const nextLevel = this.getNextLevel();
    if (!nextLevel) {
      return 1.0;
    }
    
    const currentLevel = this.getCurrentComboLevel();
    const startThreshold = currentLevel ? currentLevel.threshold : 0;
    const progress = (this.comboCount - startThreshold) / (nextLevel.threshold - startThreshold);
    
    return Math.min(1.0, Math.max(0.0, progress));
  }

  getComboCount() {
    return this.comboCount;
  }

  getMaxCombo() {
    return this.maxCombo;
  }

  getMultiplier() {
    return this.comboMultiplier;
  }

  isActive() {
    return this.comboCount > 0;
  }

  reset() {
    this.breakCombo();
    this.maxCombo = 0;
  }

  setTimeLimit(ms) {
    this.comboTimeLimit = ms;
  }

  getComboColor() {
    const level = this.getCurrentComboLevel();
    return level ? level.color : '#FFFFFF';
  }

  getVibrationIntensity() {
    const level = this.getCurrentComboLevel();
    if (!level) return null;
    return level.vibration;
  }
}
