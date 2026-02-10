export default class Polygon {
  constructor(vertices, number, color) {
    this.vertices = vertices;
    this.number = number;
    this.color = color;
    this.originalColor = color;
    this.isClicked = false;
    this.isHighlighted = false;
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

    // 未点击的图形显示白色背景，已点击的图形显示绿色背景
    if (this.isClicked) {
      ctx.fillStyle = '#4CAF50';
    } else {
      ctx.fillStyle = this.isHighlighted ? '#FFD700' : '#FFFFFF';
    }
    ctx.fill();

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.stroke();

    // 根据数字位数动态调整字体大小
    const baseFontSize = Math.max(12, Math.min(24, Math.sqrt(this.getArea()) / 4));
    const digitCount = this.number.toString().length;
    // 1位数: 100%, 2位数: 90%, 3位数: 80%
    const digitMultiplier = digitCount === 1 ? 1.0 : digitCount === 2 ? 0.9 : 0.8;
    const fontSize = baseFontSize * digitMultiplier;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    // 未点击的图形显示彩色文字，已点击的图形显示白色文字
    if (this.isClicked) {
      ctx.fillStyle = '#FFFFFF';
    } else {
      // 根据数字生成彩色文字，使用预定义颜色数组确保兼容性
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8B739', '#52BE80',
        '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C', '#F39C12',
        '#D35400', '#2ECC71', '#34495E', '#E67E22', '#16A085'
      ];
      const colorIndex = (this.number - 1) % colors.length;
      ctx.fillStyle = colors[colorIndex];
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.number.toString(), center.x, center.y);

    ctx.restore();
  }
}
