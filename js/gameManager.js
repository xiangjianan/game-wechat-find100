import PolygonGenerator from './polygonGenerator';

export default class GameManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.generator = new PolygonGenerator(width, height);
    this.polygons = [];
    this.currentNumber = 1;
    this.totalNumbers = 0;
    this.gameState = 'menu';
    this.startTime = 0;
    this.endTime = 0;
    this.difficulty = 'normal';
    this.polygonCount = 10;
    this.onGameComplete = null;
    this.onError = null;
  }

  initGame(count, difficulty = 'normal') {
    this.polygonCount = count;
    this.difficulty = difficulty;
    this.polygons = this.generator.generatePolygons(count, difficulty);
    this.currentNumber = 1;
    this.totalNumbers = count;
    this.gameState = 'playing';
    this.startTime = Date.now();
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

    if (this.currentNumber > this.totalNumbers) {
      this.handleGameComplete();
    }
    
    if (this.onCorrectClick) {
      this.onCorrectClick();
    }
  }

  handleWrongClick(polygon) {
    polygon.shake();
    
    if (this.onError) {
      this.onError();
    }
  }

  handleGameComplete() {
    this.gameState = 'completed';
    this.endTime = Date.now();
    const completionTime = (this.endTime - this.startTime) / 1000;
    
    if (this.onGameComplete) {
      this.onGameComplete(completionTime);
    }
  }

  reset() {
    this.polygons = [];
    this.currentNumber = 1;
    this.gameState = 'menu';
    this.startTime = 0;
    this.endTime = 0;
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
}
