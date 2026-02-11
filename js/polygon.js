export default class Polygon {
  // 统一的数字色彩规范 - 基于色轮理论的和谐配色
  // 使用饱和度适中、明度一致的颜色，确保视觉舒适度
  static NUMBER_COLORS = [
    '#3B82F6', // 蓝色 - 信任、稳定
    '#8B5CF6', // 紫色 - 创意、智慧
    '#EC4899', // 粉色 - 活力、热情
    '#F59E0B', // 橙色 - 温暖、积极
    '#10B981', // 绿色 - 成长、和谐
    '#06B6D4', // 青色 - 清新、冷静
    '#6366F1', // 靛蓝 - 深度、专注
    '#F97316', // 深橙 - 能量、动力
    '#14B8A6', // 蓝绿 - 平衡、恢复
    '#A855F7', // 紫罗兰 - 灵性、想象
  ];

  // 状态颜色规范
  static STATE_COLORS = {
    default: '#F8FAFC',      // 柔和白
    clicked: '#10B981',      // 柔和绿
    highlighted: '#F59E0B',  // 柔和橙
    error: '#EF4444',        // 柔和红
    border: '#64748B',       // 中灰蓝
    textClicked: '#FFFFFF',  // 白色文字
  };

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

    // 更新错误状态
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

    // 使用状态颜色规范
    if (this.isClicked) {
      ctx.fillStyle = Polygon.STATE_COLORS.clicked;
    } else {
      ctx.fillStyle = this.isHighlighted ? Polygon.STATE_COLORS.highlighted : Polygon.STATE_COLORS.default;
    }
    ctx.fill();

    // 错误状态显示红色覆盖
    if (this.isError) {
      ctx.fillStyle = `rgba(239, 68, 68, ${this.errorAlpha})`;
      ctx.fill();
    }

    // 边框使用柔和的中灰蓝色
    ctx.strokeStyle = Polygon.STATE_COLORS.border;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 根据数字位数动态调整字体大小
    const baseFontSize = Math.max(14, Math.min(26, Math.sqrt(this.getArea()) / 3.5));
    const digitCount = this.number.toString().length;
    // 1位数: 100%, 2位数: 85%, 3位数: 70%
    const digitMultiplier = digitCount === 1 ? 1.0 : digitCount === 2 ? 0.85 : 0.7;
    const fontSize = baseFontSize * digitMultiplier;
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    
    // 使用统一的数字色彩规范
    if (this.isClicked) {
      ctx.fillStyle = Polygon.STATE_COLORS.textClicked;
    } else {
      // 使用预定义的统一色彩规范
      const colorIndex = (this.number - 1) % Polygon.NUMBER_COLORS.length;
      ctx.fillStyle = Polygon.NUMBER_COLORS[colorIndex];
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.number.toString(), center.x, center.y);

    ctx.restore();
  }
}
