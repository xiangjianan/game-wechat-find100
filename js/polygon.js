import { COLORS } from './constants/colors';

export default class Polygon {
  static NUMBER_COLORS = COLORS.NUMBER_COLORS;
  static STATE_COLORS = COLORS.STATE_COLORS;

  constructor(vertices, number, color) {
    this.vertices = vertices;
    this.number = number;
    this.color = color;
    this.originalColor = color;
    this.isClicked = false;
    this.isHighlighted = false;
    this.isError = false;
    this.errorAlpha = 0;
    this.scale = 1;
    this.targetScale = 1;
    this.shakeOffset = { x: 0, y: 0 };
    this.shakeTime = 0;
  }

  getCenter() {
    let x = 0, y = 0;
    for (const vertex of this.vertices) {
      x += vertex.x;
      y += vertex.y;
    }
    return { x: x / this.vertices.length, y: y / this.vertices.length };
  }

  getArea() {
    let area = 0;
    const n = this.vertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += this.vertices[i].x * this.vertices[j].y;
      area -= this.vertices[j].x * this.vertices[i].y;
    }
    return Math.abs(area / 2);
  }

  containsPoint(point) {
    let inside = false;
    const n = this.vertices.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = this.vertices[i].x, yi = this.vertices[i].y;
      const xj = this.vertices[j].x, yj = this.vertices[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  highlight() {
    this.isHighlighted = true;
    this.targetScale = 1.1;
  }

  resetHighlight() {
    this.isHighlighted = false;
    this.targetScale = 1;
  }

  shake() {
    this.shakeTime = 10;
    this.isError = true;
    this.errorAlpha = 0.8;
  }

  update() {
    this.scale += (this.targetScale - this.scale) * 0.2;
    
    if (this.shakeTime > 0) {
      this.shakeOffset.x = (Math.random() - 0.5) * 10;
      this.shakeOffset.y = (Math.random() - 0.5) * 10;
      this.shakeTime--;
    } else {
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
    }

    if (this.isError) {
      this.errorAlpha -= 0.05;
      if (this.errorAlpha <= 0) {
        this.errorAlpha = 0;
        this.isError = false;
      }
    }
  }

  render(ctx) {
    ctx.save();
    
    const center = this.getCenter();
    ctx.translate(center.x + this.shakeOffset.x, center.y + this.shakeOffset.y);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-center.x, -center.y);

    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.closePath();

    if (this.isClicked) {
      ctx.fillStyle = Polygon.STATE_COLORS.clicked;
    } else {
      ctx.fillStyle = this.isHighlighted ? Polygon.STATE_COLORS.highlighted : Polygon.STATE_COLORS.default;
    }
    ctx.fill();

    if (this.isError) {
      ctx.fillStyle = `rgba(239, 68, 68, ${this.errorAlpha})`;
      ctx.fill();
    }

    ctx.strokeStyle = Polygon.STATE_COLORS.border;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    const baseFontSize = Math.max(14, Math.min(26, Math.sqrt(this.getArea()) / 3.5));
    const digitCount = this.number.toString().length;
    const digitMultiplier = digitCount === 1 ? 1.0 : digitCount === 2 ? 0.85 : 0.7;
    const fontSize = baseFontSize * digitMultiplier;
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    
    if (this.isClicked) {
      ctx.fillStyle = Polygon.STATE_COLORS.textClicked;
    } else {
      const colorIndex = (this.number - 1) % Polygon.NUMBER_COLORS.length;
      ctx.fillStyle = Polygon.NUMBER_COLORS[colorIndex];
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.number.toString(), center.x, center.y);

    ctx.restore();
  }
}
