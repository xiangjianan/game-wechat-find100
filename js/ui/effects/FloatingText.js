import { getColorScheme } from '../../constants/colors.js';

export default class FloatingTextManager {
  constructor() {
    this.texts = [];
  }

  show(x, y, text, color, source = null) {
    this.texts.push({
      x,
      y,
      text,
      color,
      source,
      alpha: 1,
      offsetY: 0,
      startTime: Date.now(),
      duration: 2000,
      life: 1.0
    });
  }

  update(deltaTime) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const ft = this.texts[i];
      ft.life -= deltaTime * 1.5;
      ft.offsetY -= deltaTime * 100;
      ft.alpha = Math.max(0, ft.life);

      if (ft.life <= 0) {
        this.texts.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (const ft of this.texts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;

      // Use larger font for error/time penalty texts
      const isErrorText = ft.color === '#FF4444' && ft.text.includes('秒');
      if (isErrorText) {
        ctx.font = 'bold 24px "Arial Black", Arial, sans-serif';
      } else {
        ctx.font = 'bold 20px "Arial Black", Arial, sans-serif';
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ft.text, ft.x, ft.y + ft.offsetY);
      ctx.restore();
    }
  }

  clear() {
    this.texts = [];
  }
}
