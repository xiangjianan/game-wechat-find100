import { roundRect, lightenColor, drawBrutalismRect } from '../helpers/drawing.js';
import { lerp } from '../helpers/animation.js';
import { getColorScheme } from '../../constants/colors.js';

export class GameHUD {
  constructor(width, height, safeArea) {
    this.width = width;
    this.height = height;
    this.safeArea = safeArea || { top: 0, bottom: 0, left: 0, right: 0 };

    this.headerButtons = [];
    this.hintCount = 0;
    this.hintButtonAnimation = 0;
    this.isPaused = false;
    this.coins = 0;
    this.currentLevel = 1;
    this.levelConfig = {
      1: { count: 10, name: '第一关' },
      2: { count: 100, name: '第二关' }
    };
    this.comboData = {
      count: 0,
      level: null,
      animation: 0,
      scale: 1,
      glowIntensity: 0,
      breakAnimation: 0
    };

    this.gameMode = 'timed';
    this.mouseX = 0;
    this.mouseY = 0;
    this.clickedButton = null;
    this.clickAnimation = 0;

    // Timer improvements state
    this.timerPulseTime = 0;
    this.edgeFlashAlpha = 0;

    // Countdown overlay state
    this.countdownActive = false;
    this.countdownValue = 3;
    this.countdownAlpha = 0;
    this.countdownTimer = 0;

    // Callbacks
    this.onBackToMenu = null;
    this.onGameReset = null;
    this.onUseHint = null;
    this.onPlayClickSound = null;
    this.onTogglePause = null;
    this.onRefreshGame = null;
  }

  getScheme() {
    return getColorScheme();
  }

  init() {
    this.headerButtons = [];
    this.hintButtonAnimation = 0;
    this.comboData = {
      count: 0,
      level: null,
      animation: 0,
      scale: 1,
      glowIntensity: 0,
      breakAnimation: 0
    };
    this.timerPulseTime = 0;
    this.edgeFlashAlpha = 0;
    this.countdownActive = false;
    this.countdownValue = 3;
    this.countdownAlpha = 0;
    this.countdownTimer = 0;
  }

  update(deltaTime) {
    if (this.hintButtonAnimation > 0) {
      this.hintButtonAnimation = Math.max(0, this.hintButtonAnimation - deltaTime * 5);
    }

    this.timerPulseTime += deltaTime;

    // Countdown overlay update
    if (this.countdownActive) {
      this.countdownTimer += deltaTime;
      if (this.countdownTimer < 0.3) {
        // Fade in phase
        this.countdownAlpha = Math.min(1, this.countdownTimer / 0.3);
      } else if (this.countdownTimer < 0.8) {
        // Hold phase
        this.countdownAlpha = 1;
      } else if (this.countdownTimer < 1.1) {
        // Fade out phase
        this.countdownAlpha = Math.max(0, 1 - (this.countdownTimer - 0.8) / 0.3);
      } else {
        // Move to next countdown value
        this.countdownValue--;
        this.countdownTimer = 0;
        if (this.countdownValue < 0) {
          this.countdownActive = false;
          this.countdownAlpha = 0;
        }
      }
    }
  }

  render(ctx, gameState, currentNumber, totalNumbers, timeLeft, deltaTime) {
    const isMobile = this.width < 768;
    const topSafeArea = Math.max(this.safeArea.top, isMobile ? 44 : 0);
    const bottomSafeArea = Math.max(this.safeArea.bottom, isMobile ? 34 : 0);
    const headerHeight = isMobile ? Math.max(100, topSafeArea + 56) : 120;
    const footerHeight = isMobile ? Math.max(80, bottomSafeArea + 46) : 60;

    this._renderHeader(ctx, headerHeight, topSafeArea, isMobile, timeLeft);
    this._renderFooter(ctx, footerHeight, bottomSafeArea, isMobile, currentNumber, totalNumbers);

    // Timer edge flash warning at < 3s
    if (this.gameMode === 'timed' && timeLeft < 3 && timeLeft > 0) {
      this._renderEdgeFlash(ctx, timeLeft);
    }
  }

  _renderHeader(ctx, headerHeight, topSafeArea, isMobile, timeLeft) {
    const scheme = this.getScheme();

    ctx.fillStyle = scheme.background;
    ctx.fillRect(0, 0, this.width, headerHeight);

    ctx.fillStyle = scheme.border;
    ctx.fillRect(0, headerHeight - 4, this.width, 4);

    const buttonSize = isMobile ? 48 : 56;
    const buttonSpacing = isMobile ? 14 : 18;
    const contentStartY = topSafeArea;
    const contentHeight = headerHeight - topSafeArea;
    const buttonY = contentStartY + (contentHeight - buttonSize) / 2;
    const buttonStartX = isMobile ? 16 : 24;

    this.headerButtons = [
      {
        id: 'menu',
        text: '\u2190',
        x: buttonStartX,
        y: buttonY,
        width: buttonSize,
        height: buttonSize,
        color: scheme.cardBg,
        hoverColor: scheme.buttonSecondary,
        action: () => { if (this.onBackToMenu) this.onBackToMenu(); }
      },
      {
        id: 'refresh',
        text: '\u21BB',
        x: buttonStartX + buttonSize + buttonSpacing,
        y: buttonY,
        width: buttonSize,
        height: buttonSize,
        color: scheme.cardBg,
        hoverColor: scheme.buttonPrimary,
        action: () => { if (this.onRefreshGame) this.onRefreshGame(); }
      }
    ];

    ctx.font = `bold ${isMobile ? 20 : 24}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    this.headerButtons.forEach(button => {
      const isHovered = this._isPointInButton(this.mouseX, this.mouseY, button);
      const isClicked = this.clickedButton === button.id;

      let scale = 1;
      if (isHovered) scale = 1.05;
      if (isClicked) scale = 0.95;

      const scaledSize = (buttonSize * scale) | 0;
      const scaledX = (button.x + (buttonSize - scaledSize) / 2) | 0;
      const scaledY = (button.y + (buttonSize - scaledSize) / 2) | 0;

      let fillColor = button.color;
      if (isHovered) fillColor = button.hoverColor;

      const shadowOffset = isClicked ? 2 : (isHovered ? 6 : 4);
      drawBrutalismRect(ctx, scheme, scaledX, scaledY, scaledSize, scaledSize, fillColor, {
        shadowOffset: shadowOffset,
        borderWidth: 3
      });

      ctx.fillStyle = isHovered ? scheme.textLight : scheme.text;
      ctx.fillText(button.text, scaledX + (scaledSize / 2) | 0, scaledY + (scaledSize / 2) | 0);
    });

    // Timer display
    if (this.gameMode === 'timed') {
      const centerX = this.width / 2;
      const timerY = buttonY + buttonSize / 2;
      const timerFontSize = isMobile ? 28 : 36;

      let timerColor;
      let timerBgColor;
      if (timeLeft <= 5.0) {
        timerColor = scheme.textLight;
        timerBgColor = scheme.danger;
      } else if (timeLeft <= 10.0) {
        timerColor = scheme.textLight;
        timerBgColor = scheme.buttonPrimary;
      } else {
        timerColor = scheme.textLight;
        timerBgColor = scheme.accent;
      }

      const timerWidth = isMobile ? 100 : 120;
      const timerHeight = isMobile ? 44 : 52;
      const timerX = centerX - timerWidth / 2;
      const timerBoxY = timerY - timerHeight / 2;

      // Pulse animation for timer < 5s
      let pulseScale = 1;
      if (timeLeft <= 5.0 && timeLeft > 0) {
        pulseScale = 1 + Math.sin(this.timerPulseTime * 4) * 0.05;
      }

      ctx.save();
      ctx.translate(centerX, timerY);
      ctx.scale(pulseScale, pulseScale);
      ctx.translate(-centerX, -timerY);

      drawBrutalismRect(ctx, scheme, timerX, timerBoxY, timerWidth, timerHeight, timerBgColor, {
        shadowOffset: 4,
        borderWidth: 3
      });

      ctx.font = `bold ${timerFontSize}px "Arial Black", Arial, sans-serif`;
      ctx.fillStyle = timerColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayTime = Math.max(0, timeLeft).toFixed(1);
      ctx.fillText(`${displayTime}s`, centerX, timerY);

      ctx.restore();
    }

    // Coins display - top right
    this._renderCoinsDisplay(ctx, buttonY, buttonSize, isMobile);
  }

  _renderEdgeFlash(ctx, timeLeft) {
    const intensity = (1 - timeLeft / 3) * 0.15;
    const pulse = (Math.sin(this.timerPulseTime * 6) + 1) / 2;
    const alpha = intensity * pulse;

    if (alpha > 0.01) {
      ctx.save();

      // Top edge flash
      const topGrad = ctx.createLinearGradient(0, 0, 0, 60);
      topGrad.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
      topGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, this.width, 60);

      // Bottom edge flash
      const botGrad = ctx.createLinearGradient(0, this.height - 60, 0, this.height);
      botGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      botGrad.addColorStop(1, `rgba(239, 68, 68, ${alpha})`);
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, this.height - 60, this.width, 60);

      // Left edge flash
      const leftGrad = ctx.createLinearGradient(0, 0, 40, 0);
      leftGrad.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
      leftGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = leftGrad;
      ctx.fillRect(0, 0, 40, this.height);

      // Right edge flash
      const rightGrad = ctx.createLinearGradient(this.width - 40, 0, this.width, 0);
      rightGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      rightGrad.addColorStop(1, `rgba(239, 68, 68, ${alpha})`);
      ctx.fillStyle = rightGrad;
      ctx.fillRect(this.width - 40, 0, 40, this.height);

      ctx.restore();
    }
  }

  renderCountdownOverlay(ctx) {
    if (!this.countdownActive) return;

    const isMobile = this.width < 768;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    ctx.save();
    ctx.globalAlpha = this.countdownAlpha * 0.3;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();

    // Draw countdown number
    const text = this.countdownValue > 0 ? `${this.countdownValue}` : 'GO!';
    const fontSize = isMobile ? 120 : 160;

    ctx.save();
    ctx.globalAlpha = this.countdownAlpha;

    // Scale animation: pop in then settle
    let textScale = 1;
    if (this.countdownTimer < 0.15) {
      textScale = lerp(0.5, 1.1, this.countdownTimer / 0.15);
    } else if (this.countdownTimer < 0.3) {
      textScale = lerp(1.1, 1, (this.countdownTimer - 0.15) / 0.15);
    }

    ctx.translate(centerX, centerY);
    ctx.scale(textScale, textScale);
    ctx.translate(-centerX, -centerY);

    // Glow effect
    ctx.shadowColor = this.countdownValue > 0 ? 'rgba(99, 102, 241, 0.6)' : 'rgba(16, 185, 129, 0.6)';
    ctx.shadowBlur = 40;

    ctx.font = `900 ${fontSize}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.countdownValue > 0 ? '#6366F1' : '#10B981';
    ctx.fillText(text, centerX, centerY);

    // White stroke
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeText(text, centerX, centerY);

    ctx.restore();
  }

  _renderFooter(ctx, footerHeight, bottomSafeArea, isMobile, currentNumber, totalNumbers) {
    const scheme = this.getScheme();
    const footerY = this.height - footerHeight;
    const centerX = this.width / 2;

    ctx.fillStyle = scheme.background;
    ctx.fillRect(0, footerY, this.width, footerHeight);

    ctx.fillStyle = scheme.border;
    ctx.fillRect(0, footerY, this.width, 4);

    const progressBarWidth = isMobile ? 220 : 300;
    const progressBarHeight = isMobile ? 28 : 34;
    const progressBarY = footerY + (footerHeight - progressBarHeight) / 2;
    const progress = (currentNumber - 1) / totalNumbers;

    drawBrutalismRect(ctx, scheme, centerX - progressBarWidth / 2, progressBarY, progressBarWidth, progressBarHeight, scheme.cardBg, {
      shadowOffset: 4,
      borderWidth: 3
    });

    const fillWidth = (progressBarWidth * progress) | 0;
    if (fillWidth > 0) {
      ctx.fillStyle = scheme.buttonPrimary;
      ctx.fillRect(centerX - progressBarWidth / 2 + 3, progressBarY + 3, fillWidth - 6, progressBarHeight - 6);
    }

    ctx.font = `bold ${isMobile ? 14 : 16}px "Arial Black", Arial, sans-serif`;
    ctx.fillStyle = scheme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${currentNumber - 1}/${totalNumbers}`, centerX, progressBarY + progressBarHeight / 2);

    this._renderHintButton(ctx, footerY, footerHeight, bottomSafeArea, isMobile);
  }

  _renderHintButton(ctx, footerY, footerHeight, bottomSafeArea, isMobile) {
    const scheme = this.getScheme();
    const buttonSize = isMobile ? 40 : 64;
    const paddingX = isMobile ? 16 : 20;
    const offsetY = isMobile ? 8 : 12;

    const buttonX = paddingX;
    const buttonY = footerY - offsetY + bottomSafeArea / 2;

    const isHintHovered = this.mouseX >= buttonX && this.mouseX <= buttonX + buttonSize &&
                          this.mouseY >= buttonY && this.mouseY <= buttonY + buttonSize;
    const isHintClicked = this.clickedButton === 'hint';
    const hasHints = this.hintCount > 0;

    let hintScale = 1;
    if (isHintHovered && hasHints) hintScale = 1.05;
    if (isHintClicked) hintScale = 0.95;
    if (this.hintButtonAnimation > 0) {
      hintScale = 1 + this.hintButtonAnimation * 0.1;
    }

    const hintScaledSize = (buttonSize * hintScale) | 0;
    const hintScaledX = (buttonX + (buttonSize - hintScaledSize) / 2) | 0;
    const hintScaledY = (buttonY + (buttonSize - hintScaledSize) / 2) | 0;

    let hintFillColor = hasHints ? scheme.accent : scheme.cardBg;
    if (isHintHovered && hasHints) {
      hintFillColor = lightenColor(scheme.accent, 0.15);
    }

    const hintShadowOffset = isHintClicked ? 2 : (isHintHovered && hasHints ? 6 : 4);
    drawBrutalismRect(ctx, scheme, hintScaledX, hintScaledY, hintScaledSize, hintScaledSize, hintFillColor, {
      shadowOffset: hintShadowOffset,
      borderWidth: 3
    });

    ctx.font = `bold ${isMobile ? 18 : 28}px Arial, sans-serif`;
    ctx.fillStyle = hasHints ? scheme.textLight : scheme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uD83D\uDCA1', hintScaledX + (hintScaledSize / 2) | 0, hintScaledY + (hintScaledSize / 2) | 0);

    ctx.font = `bold ${isMobile ? 10 : 14}px "Arial Black", Arial, sans-serif`;
    ctx.fillStyle = hasHints ? scheme.textLight : scheme.text;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${this.hintCount}`, hintScaledX + hintScaledSize - (isMobile ? 4 : 6), hintScaledY + hintScaledSize - (isMobile ? 4 : 6));

    this.headerButtons.push({
      id: 'hint',
      x: hintScaledX,
      y: hintScaledY,
      width: hintScaledSize,
      height: hintScaledSize
    });
  }

  _renderCoinsDisplay(ctx, buttonY, buttonSize, isMobile) {
    const scheme = this.getScheme();

    const coinBoxWidth = isMobile ? 80 : 100;
    const coinBoxHeight = isMobile ? 36 : 42;
    const coinBoxX = this.width - coinBoxWidth - (isMobile ? 16 : 24);
    const coinBoxY = buttonY + (buttonSize - coinBoxHeight) / 2;
    const coinRadius = coinBoxHeight / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = scheme.cardBg;
    roundRect(ctx, coinBoxX, coinBoxY, coinBoxWidth, coinBoxHeight, coinRadius);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = scheme.border;
    ctx.lineWidth = 1;
    roundRect(ctx, coinBoxX, coinBoxY, coinBoxWidth, coinBoxHeight, coinRadius);
    ctx.stroke();

    const coinIconSize = isMobile ? 20 : 24;
    const coinIconX = coinBoxX + (isMobile ? 10 : 12);
    const coinIconY = coinBoxY + (coinBoxHeight - coinIconSize) / 2;

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(coinIconX + coinIconSize / 2, coinIconY + coinIconSize / 2, coinIconSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#92400E';
    ctx.font = `bold ${isMobile ? 11 : 13}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u00A5', coinIconX + coinIconSize / 2, coinIconY + coinIconSize / 2 + 1);

    ctx.fillStyle = scheme.text;
    ctx.font = `600 ${isMobile ? 14 : 16}px Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.coins}`, coinBoxX + coinBoxWidth - (isMobile ? 10 : 14), coinBoxY + coinBoxHeight / 2);
  }

  _isPointInButton(x, y, button) {
    return x >= button.x && x <= button.x + button.width &&
           y >= button.y && y <= button.y + button.height;
  }

  handleClick(x, y) {
    // Check header buttons (including hint which is appended by _renderHintButton)
    const allButtons = [...this.headerButtons];

    for (const button of allButtons) {
      if (this._isPointInButton(x, y, button)) {
        if (button.id === 'hint') {
          if (this.hintCount <= 0) return true;
          this.clickedButton = button.id;
          this.clickAnimation = 1;
          if (this.onPlayClickSound) {
            this.onPlayClickSound();
          }
          setTimeout(() => {
            this.clickedButton = null;
            this.clickAnimation = 0;
            if (this.onUseHint) {
              this.onUseHint();
            }
          }, 150);
          return true;
        }

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

  setHintCount(count) {
    this.hintCount = count;
  }

  setCoins(coins) {
    this.coins = coins;
  }

  setGameMode(mode) {
    this.gameMode = mode;
  }

  triggerHintAnimation() {
    this.hintButtonAnimation = 1;
  }

  startCountdown() {
    this.countdownActive = true;
    this.countdownValue = 3;
    this.countdownTimer = 0;
    this.countdownAlpha = 0;
  }

  getButtons() {
    return this.headerButtons;
  }

  updateHover(x, y) {
    this.mouseX = x;
    this.mouseY = y;
  }
}
