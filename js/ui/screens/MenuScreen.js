import { roundRect } from '../helpers/drawing.js';
import { getColorScheme } from '../../constants/colors.js';
import { ButtonRenderer } from '../components/Button.js';

export class MenuScreen {
  constructor(width, height, safeArea) {
    this.width = width;
    this.height = height;
    this.safeArea = safeArea || { top: 0, bottom: 0, left: 0, right: 0 };

    this.menuAnimation = 0;
    this.menuTargetAnimation = 1;
    this.particleOffset = 0;
    this.shimmerTime = 0;

    this.buttons = [];
    this.gameMode = 'timed';

    this.modeSwitcher = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      animation: 0,
      targetAnimation: 1,
      hoveredSegment: null,
      clickedSegment: null
    };

    this.mouseX = 0;
    this.mouseY = 0;
    this.hoveredButton = null;
    this.clickedButton = null;
    this.clickAnimation = 0;

    this.coins = 0;

    this.buttonRenderer = new ButtonRenderer(width, height);

    // Callbacks
    this.onGameStart = null;
    this.onModeChange = null;
    this.onPlayClickSound = null;
    this.onShare = null;
    this.onAchievementsOpen = null;
    this.onOpenShop = null;
    this.onOpenSkills = null;
  }

  getScheme() {
    return getColorScheme();
  }

  init() {
    this.menuAnimation = 0;
    this.menuTargetAnimation = 1;
    this.buttons = this._buildMenuButtons();
  }

  _buildMenuButtons() {
    const isMobile = this.width < 768;
    const margin = isMobile ? 20 : 40;
    const startY = this.height * 0.44;

    // Start button - full-width, taller and more prominent
    const startButtonWidth = this.width - margin * 2;
    const startButtonHeight = isMobile ? 62 : 70;

    // Card grid - 2x2 layout
    const cardGap = isMobile ? 14 : 16;
    const cardWidth = (this.width - margin * 2 - cardGap) / 2;
    const cardHeight = isMobile ? 105 : 115;

    const cardRow1Y = startY + startButtonHeight + 20;
    const cardRow2Y = cardRow1Y + cardHeight + cardGap;

    const buttons = [
      // Start game - gradient prominent button
      {
        id: 'start',
        text: '开始游戏',
        type: 'primary',
        x: margin,
        y: startY,
        width: startButtonWidth,
        height: startButtonHeight,
        color: '#6366F1',
        colorEnd: '#8B5CF6',
        glowColor: 'rgba(99, 102, 241, 0.4)',
        icon: 'play',
        action: () => this._onStartGame()
      },
      // Instructions - amber card
      {
        id: 'instructions',
        text: '游戏规则',
        subtitle: '了解玩法说明',
        type: 'card',
        x: margin,
        y: cardRow1Y,
        width: cardWidth,
        height: cardHeight,
        icon: 'book',
        iconBg: '#FEF3C7',
        iconColor: '#F59E0B',
        cardBg: 'rgba(255, 252, 245, 0.95)',
        cardBorder: 'rgba(245, 158, 11, 0.2)',
        cardHoverGlow: 'rgba(245, 158, 11, 0.15)',
        action: () => this._onShowInstructions()
      },
      // Shop - blue card
      {
        id: 'shop',
        text: '商店',
        subtitle: '道具 & 皮肤',
        type: 'card',
        x: margin + cardWidth + cardGap,
        y: cardRow1Y,
        width: cardWidth,
        height: cardHeight,
        icon: 'cart',
        iconBg: '#DBEAFE',
        iconColor: '#3B82F6',
        cardBg: 'rgba(245, 249, 255, 0.95)',
        cardBorder: 'rgba(59, 130, 246, 0.2)',
        cardHoverGlow: 'rgba(59, 130, 246, 0.15)',
        action: () => { if (this.onOpenShop) this.onOpenShop(); }
      },
      // Skills - green card
      {
        id: 'skills',
        text: '技能',
        subtitle: '解锁特殊能力',
        type: 'card',
        x: margin,
        y: cardRow2Y,
        width: cardWidth,
        height: cardHeight,
        icon: 'lightning',
        iconBg: '#D1FAE5',
        iconColor: '#10B981',
        cardBg: 'rgba(245, 255, 250, 0.95)',
        cardBorder: 'rgba(16, 185, 129, 0.2)',
        cardHoverGlow: 'rgba(16, 185, 129, 0.15)',
        action: () => { if (this.onOpenSkills) this.onOpenSkills(); }
      },
      // Achievements - pink card
      {
        id: 'achievements',
        text: '成就',
        subtitle: '查看你的战绩',
        type: 'card',
        x: margin + cardWidth + cardGap,
        y: cardRow2Y,
        width: cardWidth,
        height: cardHeight,
        icon: 'trophy',
        iconBg: '#FCE7F3',
        iconColor: '#EC4899',
        cardBg: 'rgba(255, 245, 250, 0.95)',
        cardBorder: 'rgba(236, 72, 153, 0.2)',
        cardHoverGlow: 'rgba(236, 72, 153, 0.15)',
        action: () => { if (this.onAchievementsOpen) this.onAchievementsOpen(); }
      }
    ];

    // Third row - share button (single centered, shorter)
    const shareRowY = cardRow2Y + cardHeight + cardGap;
    const shareButtonHeight = isMobile ? 46 : 52;

    buttons.push({
      id: 'share',
      text: '分享给朋友',
      type: 'card',
      x: margin,
      y: shareRowY,
      width: this.width - margin * 2,
      height: shareButtonHeight,
      icon: 'share',
      iconBg: '#EDE9FE',
      iconColor: '#8B5CF6',
      cardBg: 'rgba(245, 243, 255, 0.95)',
      cardBorder: 'rgba(139, 92, 246, 0.2)',
      cardHoverGlow: 'rgba(139, 92, 246, 0.15)',
      action: () => { if (this.onShare) this.onShare(); }
    });

    return buttons;
  }

  _onStartGame() {
    if (this.onGameStart) {
      this.onGameStart(this.gameMode);
    }
  }

  _onShowInstructions() {
    // Delegate to parent UI to show instructions overlay
    if (this.onPlayClickSound) this.onPlayClickSound();
  }

  update(deltaTime) {
    // Menu fade-in animation
    if (this.menuAnimation < this.menuTargetAnimation) {
      this.menuAnimation += deltaTime * 4;
      if (this.menuAnimation > this.menuTargetAnimation) {
        this.menuAnimation = this.menuTargetAnimation;
      }
    } else if (this.menuAnimation > this.menuTargetAnimation) {
      this.menuAnimation -= deltaTime * 4;
      if (this.menuAnimation < this.menuTargetAnimation) {
        this.menuAnimation = this.menuTargetAnimation;
      }
    }

    this.shimmerTime += deltaTime;
    this.particleOffset += deltaTime;
  }

  render(ctx) {
    const scheme = this.getScheme();
    const isMobile = this.width < 768;

    this._renderModernBackground(ctx);

    const titleY = isMobile ? this.height * 0.2 : this.height * 0.18;
    const titleSize = isMobile ? 56 : 72;
    const subtitleSize = isMobile ? 14 : 16;

    ctx.save();
    ctx.globalAlpha = Math.min(1, this.menuAnimation * 1.5);

    this._renderModernTitle(ctx, this.width / 2, titleY, titleSize);

    const sloganY = titleY + (isMobile ? 85 : 108);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const sloganBefore = '找回消失的专注，从找到第一个 ';
    const sloganHighlight = '1';
    const sloganAfter = ' 开始';

    ctx.font = `${subtitleSize}px Arial, sans-serif`;
    ctx.fillStyle = scheme.textSecondary;
    const wBefore = ctx.measureText(sloganBefore).width;
    const wHighlight = ctx.measureText(sloganHighlight).width;
    const wAfter = ctx.measureText(sloganAfter).width;
    const totalW = wBefore + wHighlight + wAfter;
    const sloganStartX = this.width / 2 - totalW / 2;

    ctx.textAlign = 'left';
    ctx.fillText(sloganBefore, sloganStartX, sloganY);

    ctx.fillStyle = '#EF4444';
    ctx.font = `bold ${subtitleSize}px Arial, sans-serif`;
    ctx.fillText(sloganHighlight, sloganStartX + wBefore, sloganY);

    ctx.fillStyle = scheme.textSecondary;
    ctx.font = `${subtitleSize}px Arial, sans-serif`;
    ctx.fillText(sloganAfter, sloganStartX + wBefore + wHighlight, sloganY);

    ctx.restore();

    // Mode switcher pill
    const switcherWidth = isMobile ? 240 : 280;
    const switcherHeight = isMobile ? 42 : 48;
    const switcherX = (this.width - switcherWidth) / 2;
    const switcherY = sloganY + (isMobile ? 30 : 38);

    ctx.save();
    ctx.globalAlpha = Math.min(1, this.menuAnimation * 2);
    this._drawModeSwitcher(ctx, switcherX, switcherY, switcherWidth, switcherHeight);
    ctx.restore();

    // Render buttons with staggered fade-in
    this._renderButtons(ctx);

    // Coins display
    this._renderCoinsDisplay(ctx);

    // Bottom badge
    const badgeY = this.height - (isMobile ? 30 : 40);
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.menuAnimation * 2) * 0.3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${isMobile ? 10 : 11}px Arial, sans-serif`;
    ctx.fillStyle = scheme.textSecondary;
    ctx.fillText('Inspired by xiangjianan \u00B7 \uD83E\uDD16 \u00B7 100% AI Developed', this.width / 2, badgeY);
    ctx.restore();
  }

  _renderModernBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#F8FAFC');
    gradient.addColorStop(0.5, '#EFF6FF');
    gradient.addColorStop(1, '#F5F3FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    this._renderFloatingOrbs(ctx);
  }

  _renderFloatingOrbs(ctx) {
    const t = Date.now() / 1000;
    const orbs = [
      { x: this.width * 0.1, y: this.height * 0.15, r: 140, color: 'rgba(99, 102, 241, 0.06)' },
      { x: this.width * 0.9, y: this.height * 0.25, r: 180, color: 'rgba(59, 130, 246, 0.05)' },
      { x: this.width * 0.5, y: this.height * 0.55, r: 160, color: 'rgba(139, 92, 246, 0.04)' },
      { x: this.width * 0.15, y: this.height * 0.75, r: 120, color: 'rgba(16, 185, 129, 0.04)' },
      { x: this.width * 0.8, y: this.height * 0.7, r: 150, color: 'rgba(236, 72, 153, 0.03)' }
    ];

    orbs.forEach((orb, i) => {
      const offsetX = Math.sin(t * 0.4 + i * 1.5) * 20;
      const offsetY = Math.cos(t * 0.25 + i * 1.0) * 15;
      const cx = orb.x + offsetX;
      const cy = orb.y + offsetY;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
      grad.addColorStop(0, orb.color);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, orb.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  _renderModernTitle(ctx, x, y, size) {
    const scheme = this.getScheme();
    const chars = ['数', '一', '数', '噻'];
    const tileColors = [
      { start: '#6366F1', end: '#818CF8' },
      { start: '#EC4899', end: '#F472B6' },
      { start: '#10B981', end: '#34D399' },
      { start: '#F59E0B', end: '#FBBF24' }
    ];
    const tileNumbers = ['1', '2', '3', '4'];

    const tilePaddingX = size * 0.32;
    const tilePaddingY = size * 0.28;
    const tileGap = size * 0.12;
    const tileRadius = size * 0.28;

    ctx.save();
    ctx.font = `800 ${size}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const charWidths = chars.map(c => ctx.measureText(c).width);
    const tileWidth = Math.max(...charWidths) + tilePaddingX * 2;
    const tileHeight = size + tilePaddingY * 2;
    const totalWidth = tileWidth * chars.length + tileGap * (chars.length - 1);
    const startX = x - totalWidth / 2;

    const t = Date.now() / 1000;

    for (let i = 0; i < chars.length; i++) {
      const tx = startX + i * (tileWidth + tileGap);
      const ty = y - tileHeight / 2;
      const bounceOffset = Math.sin(t * 1.8 + i * 0.9) * 3;

      ctx.save();

      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 4 + bounceOffset * 0.5;

      const grad = ctx.createLinearGradient(tx, ty + bounceOffset, tx + tileWidth, ty + tileHeight + bounceOffset);
      grad.addColorStop(0, tileColors[i].start);
      grad.addColorStop(1, tileColors[i].end);
      ctx.fillStyle = grad;
      roundRect(ctx, tx, ty + bounceOffset, tileWidth, tileHeight, tileRadius);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = 'transparent';

      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      roundRect(ctx, tx, ty + bounceOffset, tileWidth, tileHeight * 0.45, tileRadius);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(chars[i], tx + tileWidth / 2, y + 2 + bounceOffset);

      const numSize = Math.round(size * 0.22);
      ctx.font = `bold ${numSize}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillText(tileNumbers[i], tx + tileWidth - numSize * 0.6, ty + bounceOffset + numSize * 0.8);

      ctx.font = `800 ${size}px "Arial Black", Arial, sans-serif`;
      ctx.restore();
    }

    // Decorative numbers around title
    const decorNumbers = ['1', '2', '3', '5', '8', '13'];
    const decorPositions = [
      { px: -0.42, py: -0.7, s: 0.18 },
      { px: 0.38, py: -0.65, s: 0.15 },
      { px: -0.5, py: 0.6, s: 0.14 },
      { px: 0.48, py: 0.55, s: 0.17 },
      { px: -0.15, py: -0.78, s: 0.12 },
      { px: 0.2, py: 0.72, s: 0.13 }
    ];
    const decorColors = [
      'rgba(99,102,241,0.15)', 'rgba(236,72,153,0.12)', 'rgba(16,185,129,0.12)',
      'rgba(245,158,11,0.12)', 'rgba(59,130,246,0.10)', 'rgba(139,92,246,0.10)'
    ];

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    decorPositions.forEach((pos, i) => {
      const dx = x + totalWidth * pos.px;
      const dy = y + tileHeight * pos.py;
      const drift = Math.sin(t * 0.8 + i * 1.2) * 4;
      const fontSize = Math.round(size * pos.s);
      ctx.font = `900 ${fontSize}px "Arial Black", Arial, sans-serif`;
      ctx.fillStyle = decorColors[i];
      ctx.fillText(decorNumbers[i], dx, dy + drift);
    });

    ctx.restore();
  }

  _drawModeSwitcher(ctx, x, y, width, height) {
    const isMobile = this.width < 768;

    this.modeSwitcher.x = x;
    this.modeSwitcher.y = y;
    this.modeSwitcher.width = width;
    this.modeSwitcher.height = height;

    const segmentWidth = width / 2;
    const radius = height / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, x, y, width, height, radius);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, width, height, radius);
    ctx.stroke();

    const isTimedActive = this.gameMode === 'timed';
    const isTimedClicked = this.modeSwitcher.clickedSegment === 'timed';
    const isUntimedClicked = this.modeSwitcher.clickedSegment === 'untimed';

    const activeX = isTimedActive ? x : x + segmentWidth;
    let offsetX = 0;
    let offsetY = 0;
    if ((isTimedActive && isTimedClicked) || (!isTimedActive && isUntimedClicked)) {
      offsetX = 1;
      offsetY = 1;
    }

    ctx.save();
    ctx.shadowColor = 'rgba(99, 102, 241, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;

    const activeGradient = ctx.createLinearGradient(activeX, y, activeX + segmentWidth, y + height);
    activeGradient.addColorStop(0, '#6366F1');
    activeGradient.addColorStop(1, '#3B82F6');
    ctx.fillStyle = activeGradient;
    roundRect(ctx, activeX + 3 + offsetX, y + 3 + offsetY, segmentWidth - 6, height - 6, radius - 3);
    ctx.fill();
    ctx.restore();

    const fontSize = isMobile ? 13 : 15;
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = isTimedActive ? '#FFFFFF' : '#64748B';
    ctx.fillText('限时模式', x + segmentWidth / 2, y + height / 2);

    ctx.fillStyle = !isTimedActive ? '#FFFFFF' : '#64748B';
    ctx.fillText('自由模式', x + segmentWidth + segmentWidth / 2, y + height / 2);
  }

  _renderButtons(ctx) {
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      const isHovered = this.hoveredButton === button.id;
      const isClicked = this.clickedButton === button.id;

      const delay = i * 0.08;
      const alpha = Math.min(1, Math.max(0, (this.menuAnimation - delay) * 3));

      if (alpha <= 0) continue;

      this.buttonRenderer.draw(ctx, button, isHovered, isClicked, alpha);
    }
  }

  _renderCoinsDisplay(ctx) {
    const isMobile = this.width < 768;

    const boxWidth = isMobile ? 100 : 120;
    const boxHeight = isMobile ? 36 : 42;
    const boxX = this.width - boxWidth - (isMobile ? 16 : 24);
    const boxY = isMobile ? 24 : 36;
    const radius = boxHeight / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, radius);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 1;
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, radius);
    ctx.stroke();

    const coinSize = isMobile ? 24 : 28;
    const coinX = boxX + (isMobile ? 10 : 12);
    const coinY = boxY + (boxHeight - coinSize) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(coinX + coinSize / 2, coinY + coinSize / 2, coinSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#1F2937';
    ctx.font = `bold ${isMobile ? 13 : 15}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u00A5', coinX + coinSize / 2, coinY + coinSize / 2 + 1);

    ctx.fillStyle = '#0F172A';
    ctx.font = `600 ${isMobile ? 15 : 17}px Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.coins}`, boxX + boxWidth - (isMobile ? 12 : 14), boxY + boxHeight / 2);
  }

  handleClick(x, y) {
    if (this._handleModeSwitcherClick(x, y)) {
      return true;
    }

    for (const button of this.buttons) {
      if (x >= button.x && x <= button.x + button.width &&
          y >= button.y && y <= button.y + button.height) {
        this.clickedButton = button.id;
        this.clickAnimation = 1;
        if (this.onPlayClickSound) {
          this.onPlayClickSound();
        }
        setTimeout(() => {
          this.clickedButton = null;
          this.clickAnimation = 0;
          if (button.action) {
            button.action();
          }
        }, 150);
        return true;
      }
    }

    return false;
  }

  _handleModeSwitcherClick(x, y) {
    const ms = this.modeSwitcher;
    if (ms.width === 0) return false;

    if (x >= ms.x && x <= ms.x + ms.width && y >= ms.y && y <= ms.y + ms.height) {
      const segmentWidth = ms.width / 2;
      const segment = x < ms.x + segmentWidth ? 'timed' : 'untimed';

      if (segment !== this.gameMode) {
        ms.clickedSegment = segment;
        if (this.onPlayClickSound) {
          this.onPlayClickSound();
        }
        setTimeout(() => {
          ms.clickedSegment = null;
          this.gameMode = segment;
          this.buttons = this._buildMenuButtons();
          if (this.onModeChange) {
            this.onModeChange(segment);
          }
        }, 100);
        return true;
      }
    }
    return false;
  }

  handleModeSwitcherClick(x, y) {
    return this._handleModeSwitcherClick(x, y);
  }

  updateHover(x, y) {
    this.mouseX = x;
    this.mouseY = y;
    this.hoveredButton = null;

    // Check mode switcher hover
    const ms = this.modeSwitcher;
    if (ms.width > 0 && x >= ms.x && x <= ms.x + ms.width && y >= ms.y && y <= ms.y + ms.height) {
      const segmentWidth = ms.width / 2;
      ms.hoveredSegment = x < ms.x + segmentWidth ? 'timed' : 'untimed';
    } else {
      ms.hoveredSegment = null;
    }

    // Check buttons
    for (const button of this.buttons) {
      if (x >= button.x && x <= button.x + button.width &&
          y >= button.y && y <= button.y + button.height) {
        this.hoveredButton = button.id;
        break;
      }
    }
  }

  getButtons() {
    return this.buttons;
  }

  getGameMode() {
    return this.gameMode;
  }

  setGameMode(mode) {
    this.gameMode = mode;
  }

  setCoins(coins) {
    this.coins = coins;
  }

  refreshButtons() {
    this.buttons = this._buildMenuButtons();
  }
}
