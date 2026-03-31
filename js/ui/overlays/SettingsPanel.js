import { getColorScheme } from '../../constants/colors';
import { roundRect, from '../helpers/drawing';

export default class SettingsPanel {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.visible = false;
    this.hoveredToggle = null;
    this.pressedToggle = null;
    this.settings = { soundEnabled: true, vibrationEnabled: true, darkMode: 'auto' };
    this.onClose = null;
    this.onSettingChange = null;
    this.onPlayClickSound = null;
  }

  setSettings(settings) { this.settings = { ...this.settings, ...settings }; }
  show() { this.visible = true; }
  hide() { this.visible = false; }
  isVisible() { return this.visible; }

  render(ctx) {
    const scheme = getColorScheme();
    const isMobile = this.width < 768;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? this.width - 20 : Math.min(420, this.width - 40);
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    ctx.save();
    ctx.shadowColor = scheme.shadow;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = scheme.cardBg;
    roundRect(ctx, modalX, modalY, modalWidth, modalHeight, 16);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = scheme.border;
    ctx.lineWidth = 2;
    roundRect(ctx, modalX, modalY, modalWidth, modalHeight, 16);
    ctx.stroke();

    const titleY = modalY + (isMobile ? 40 : 50);
    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 24 : 28}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u8BBE\u7F6E\u7F6E', this.width / 2, titleY);

    const toggleStartY = modalY + (isMobile ? 90 : 110);
    const toggleSpacing = isMobile ? 70 : 80;
    const toggleLabels = [
      { key: 'soundEnabled', label: '\u97F3\u54CD\u6548\u6551', icon: '\uD83C\uDD0A' },
      { key: 'vibrationEnabled', label: '\u9F00\u52A8\u52A8', icon: '\uD83D\uDCA1' },
      { key: 'darkMode', label: '\u6DF1\u8272\u6A21\u5F0F', icon: '\uD83C\uDF78', isCycle: true, options: ['auto', 'light', 'dark'] }
    ];

    toggleLabels.forEach((item, idx) => {
      const y = toggleStartY + idx * toggleSpacing;
      const padding = isMobile ? 16 : 24;
      const labelX = modalX + padding;
      const toggleWidth = isMobile ? 50 : 56;
      const toggleHeight = isMobile ? 28 : 32;
      const toggleX = modalX + modalWidth - padding - toggleWidth;
      const toggleY = y - toggleHeight / 2;

      ctx.fillStyle = scheme.text;
      ctx.font = `600 ${isMobile ? 16 : 18}px Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${item.icon} ${item.label}`, labelX, y);

      if (item.isCycle) {
        const value = this.settings[item.key];
        const displayText = value === 'auto' ? '\u81EA\u52A8' : value === 'dark' ? '\u6697\u8272' : '\u4EAE\u4EAE';
        const btnWidth = isMobile ? 80 : 100;
        const btnHeight = toggleHeight;
        const btnX = toggleX - btnWidth - 10;
        const btnY = toggleY;

        const isHovered = this.hoveredToggle === item.key;
        let bgColor = isHovered ? scheme.buttonPrimary : scheme.cardBgSolid;
        ctx.save();
        ctx.shadowColor = scheme.shadow;
        ctx.shadowBlur = isHovered ? 8 : 4;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = bgColor;
        roundRect(ctx, btnX, btnY, btnWidth, btnHeight, 8);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = isHovered ? '#FFFFFF' : scheme.text;
        ctx.font = `600 ${isMobile ? 13 : 15}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(displayText, btnX + btnWidth / 2, btnY + btnHeight / 2);
      } else {
        const isOn = this.settings[item.key];
        const trackWidth = toggleWidth - 4;
        const trackHeight = toggleHeight - 4;
        const trackX = toggleX + 2;
        const trackY = toggleY + 2;
        const thumbSize = trackHeight;

        ctx.fillStyle = isOn ? scheme.buttonPrimary : '#CBD5E1';
        roundRect(ctx, trackX, trackY, trackWidth, trackHeight, trackHeight / 2);
        ctx.fill();

        const thumbX = isOn ? trackX + trackWidth - thumbSize - 2 : trackX + 2;
        const thumbY = trackY + 2;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(thumbX + thumbSize / 2, thumbY + thumbSize / 2, thumbSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    const closeBtnWidth = isMobile ? 180 : 220;
    const closeBtnHeight = isMobile ? 48 : 56;
    const closeBtnX = (this.width - closeBtnWidth) / 2;
    const closeBtnY = modalY + modalHeight - (isMobile ? 70 : 80);

    const isCloseHovered = this.hoveredToggle === 'close';
    ctx.save();
    ctx.shadowColor = scheme.shadow;
    ctx.shadowBlur = isCloseHovered ? 8 : 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = isCloseHovered ? lightenColor(scheme.buttonPrimary, 0.15) : scheme.buttonPrimary;
    roundRect(ctx, closeBtnX, closeBtnY, closeBtnWidth, closeBtnHeight, 12);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${isMobile ? 18 : 20}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u8FD4\u56DE', this.width / 2, closeBtnY + closeBtnHeight / 2);
  }

  handleClick(x, y) {
    const scheme = getColorScheme();
    const isMobile = this.width < 768;
    const modalWidth = isMobile ? this.width - 20 : Math.min(420, this.width - 40);
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    const closeBtnWidth = isMobile ? 180 : 220;
    const closeBtnHeight = isMobile ? 48 : 56;
    const closeBtnX = (this.width - closeBtnWidth) / 2;
    const closeBtnY = modalY + modalHeight - (isMobile ? 70 : 80);

    if (x >= closeBtnX && x <= closeBtnX + closeBtnWidth && y >= closeBtnY && y <= closeBtnY + closeBtnHeight) {
      if (this.onPlayClickSound) this.onPlayClickSound();
      this.hide();
      if (this.onClose) this.onClose();
      return true;
    }

    const toggleStartY = modalY + (isMobile ? 90 : 110);
    const toggleSpacing = isMobile ? 70 : 80;
    const padding = isMobile ? 16 : 24;
    const toggleWidth = isMobile ? 50 : 56;
    const toggleHeight = isMobile ? 28 : 32;
    const toggleX = modalX + modalWidth - padding - toggleWidth;

    const toggleLabels = [
      { key: 'soundEnabled', isCycle: false },
      { key: 'vibrationEnabled', isCycle: false },
      { key: 'darkMode', isCycle: true }
    ];

    for (let idx = 0; idx < toggleLabels.length; idx++) {
      const item = toggleLabels[idx];
      const ty = toggleStartY + idx * toggleSpacing;

      if (item.isCycle) {
        const btnWidth = isMobile ? 80 : 100;
        const btnHeight = toggleHeight;
        const btnX = toggleX - btnWidth - 10;
        const btnY = ty - btnHeight / 2;

        if (x >= btnX && x <= btnX + btnWidth && y >= btnY && y <= btnY + btnHeight) {
          if (this.onPlayClickSound) this.onPlayClickSound();
          if (this.onSettingChange) this.onSettingChange(item.key);
          return true;
        }
      } else {
        if (x >= toggleX && x <= toggleX + toggleWidth && y >= ty - toggleHeight / 2 && y <= ty + toggleHeight / 2) {
          if (this.onPlayClickSound) this.onPlayClickSound();
          if (this.onSettingChange) this.onSettingChange(item.key);
          return true;
        }
      }
    }

    return false;
  }

  updateHover(x, y) {
    this.hoveredToggle = null;
    const isMobile = this.width < 768;
    const modalWidth = isMobile ? this.width - 20 : Math.min(420, this.width - 40);
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    const closeBtnWidth = isMobile ? 180 : 220;
    const closeBtnHeight = isMobile ? 48 : 56;
    const closeBtnX = (this.width - closeBtnWidth) / 2;
    const closeBtnY = modalY + modalHeight - (isMobile ? 70 : 80);

    if (x >= closeBtnX && x <= closeBtnX + closeBtnWidth && y >= closeBtnY && y <= closeBtnY + closeBtnHeight) {
      this.hoveredToggle = 'close';
    }
  }
}

function lightenColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
