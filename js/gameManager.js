import LineDividerGenerator from './lineDividerGenerator';

export default class GameManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.generator = new LineDividerGenerator(width, height);
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
    
    this.timeLeft = 5.0;
    this.initialTime = 5.0;
    this.timeBonus = 5.0;
    this.timerInterval = null;
    this.clickCount = 0;
    this.errorCount = 0;
    this.gameMode = 'timed';
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
    this.timeLeft = this.initialTime;
    this.clickCount = 0;
    this.errorCount = 0;
    
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
    polygon.isClicked = true;
    polygon.highlight();
    
    setTimeout(() => {
      polygon.resetHighlight();
    }, 200);

    this.currentNumber++;
    this.clickCount++;
    
    if (this.gameMode === 'timed') {
      this.timeLeft += this.timeBonus;
    }

    if (this.currentNumber > this.totalNumbers) {
      this.handleGameComplete();
    }
    
    if (this.onCorrectClick) {
      const center = polygon.getCenter();
      this.onCorrectClick(center);
    }
  }

  handleWrongClick(polygon) {
    polygon.shake();
    this.errorCount++;
    this.clickCount++;
    
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
  }

  update() {
    for (const polygon of this.polygons) {
      polygon.update();
    }
  }

  render(ctx) {
    for (const polygon of this.polygons) {
      polygon.render(ctx);
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
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 100);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimer() {
    this.timeLeft -= 0.1;
    
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.stopTimer();
      this.gameState = 'failed';
      
      if (this.onGameFailed) {
        this.onGameFailed();
      }
    }
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
}
