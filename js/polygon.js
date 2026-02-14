import { COLORS, getColorScheme, BRUTALISM_STYLES } from './constants/colors';

export default class Polygon {
  static get NUMBER_COLORS() {
    return getColorScheme().numberColors;
  }
  
  static get STATE_COLORS() {
    const scheme = getColorScheme();
    return {
      default: scheme.cardBg,
      clicked: scheme.buttonSuccess,
      highlighted: scheme.accent,
      error: scheme.danger,
      border: scheme.border,
      textClicked: scheme.textLight,
      textDefault: scheme.text
    };
  }

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
    this.isHinted = false;
    this.hintPulse = 0;
    this.hintGlowIntensity = 0;
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
    this.targetScale = 1.08;
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

  setHintHighlight(enabled) {
    this.isHinted = enabled;
    if (enabled) {
      this.hintPulse = 0;
      this.hintGlowIntensity = 0;
    }
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

    if (this.isHinted) {
      this.hintPulse += 0.08;
      this.hintGlowIntensity = 0.5 + Math.sin(this.hintPulse) * 0.5;
    } else {
      this.hintPulse = 0;
      this.hintGlowIntensity = 0;
    }
  }

  getTransform() {
    const center = this.getCenter();
    return {
      x: center.x + this.shakeOffset.x,
      y: center.y + this.shakeOffset.y,
      scale: this.scale
    };
  }

  renderShape(ctx) {
    const scheme = getColorScheme();
    const stateColors = Polygon.STATE_COLORS;
    
    ctx.save();
    
    const center = this.getCenter();
    ctx.translate(center.x + this.shakeOffset.x, center.y + this.shakeOffset.y);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-center.x, -center.y);

    if (this.isHinted) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 25 * this.hintGlowIntensity;
    }

    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (let i = 1; i < this.vertices.length; i++) {
      ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    ctx.closePath();

    let fillColor;
    if (this.isClicked) {
      fillColor = stateColors.clicked;
    } else if (this.isHinted) {
      const intensity = this.hintGlowIntensity;
      fillColor = this.interpolateColor('#FFD700', '#FFA500', intensity);
    } else if (this.isHighlighted) {
      fillColor = stateColors.highlighted;
    } else {
      fillColor = scheme.cardBg;
    }
    
    ctx.fillStyle = fillColor;
    ctx.fill();

    if (this.isError) {
      ctx.fillStyle = `rgba(239, 68, 68, ${this.errorAlpha})`;
      ctx.fill();
    }

    ctx.strokeStyle = scheme.border;
    ctx.lineWidth = this.isHinted ? 4 : 2;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.stroke();

    if (this.isHinted) {
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + this.hintGlowIntensity * 0.5})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  }

  interpolateColor(color1, color2, factor) {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  renderText(ctx) {
    const scheme = getColorScheme();
    const stateColors = Polygon.STATE_COLORS;
    
    ctx.save();
    
    const center = this.getCenter();
    ctx.translate(center.x + this.shakeOffset.x, center.y + this.shakeOffset.y);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-center.x, -center.y);

    const baseFontSize = Math.max(16, Math.min(28, Math.sqrt(this.getArea()) / 3.2));
    const digitCount = this.number.toString().length;
    const digitMultiplier = digitCount === 1 ? 1.0 : digitCount === 2 ? 0.8 : 0.65;
    const fontSize = baseFontSize * digitMultiplier;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const text = this.number.toString();
    
    if (!this.isClicked) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      const shadowOffset = 1;
      ctx.fillText(text, center.x - shadowOffset, center.y - shadowOffset);
      ctx.fillText(text, center.x + shadowOffset, center.y - shadowOffset);
      ctx.fillText(text, center.x - shadowOffset, center.y + shadowOffset);
      ctx.fillText(text, center.x + shadowOffset, center.y + shadowOffset);
    }
    
    if (this.isClicked) {
      ctx.fillStyle = stateColors.textClicked;
    } else {
      const colorIndex = (this.number - 1) % scheme.numberColors.length;
      ctx.fillStyle = scheme.numberColors[colorIndex];
    }
    ctx.fillText(text, center.x, center.y);

    ctx.restore();
  }

  render(ctx) {
    this.renderShape(ctx);
    this.renderText(ctx);
  }
}
