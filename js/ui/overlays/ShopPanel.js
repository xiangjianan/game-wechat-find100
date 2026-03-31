import { roundRect } from '../helpers/drawing.js';
import { getColorScheme } from '../../constants/colors.js';
import { ScrollManager } from '../helpers/scrollManager.js';

function lightenColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export class ShopPanel {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this._visible = false;
    this.products = null;
    this.coins = 0;

    this.scroll = new ScrollManager({
      friction: 0.95,
      minVelocity: 0.5
    });

    this.hoveredButton = null;
    this.clickedButton = null;
    this.onPlayClickSound = null;
    this.onShopBuy = null;
    this.onClose = null;
  }

  getScheme() {
    return getColorScheme();
  }

  _drawBrutalismRect(ctx, x, y, width, height, fillColor, options = {}) {
    const scheme = this.getScheme();
    const radius = options.radius !== undefined ? options.radius : 12;

    if (options.shadowOffset > 0) {
      ctx.shadowColor = scheme.shadow;
      ctx.shadowBlur = options.shadowOffset * 2;
      ctx.shadowOffsetY = options.shadowOffset;
    }

    ctx.fillStyle = fillColor;
    roundRect(ctx, x, y, width, height, radius);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = 'transparent';

    if (options.borderWidth > 0) {
      ctx.strokeStyle = scheme.glassBorder;
      ctx.lineWidth = options.borderWidth;
      roundRect(ctx, x, y, width, height, radius);
      ctx.stroke();
    }
  }

  setProducts(products) {
    this.products = products;
  }

  setCoins(coins) {
    this.coins = coins;
  }

  show() {
    this._visible = true;
    this.scroll.offset = 0;
    this.scroll.velocity = 0;
  }

  hide() {
    this._visible = false;
    this.scroll.offset = 0;
    this.scroll.velocity = 0;
    if (this.onClose) {
      this.onClose();
    }
  }

  isVisible() {
    return this._visible;
  }

  update(deltaTime) {
    if (!this._visible) return;
    this.scroll.update(deltaTime);
  }

  render(ctx) {
    if (!this._visible) return;

    const scheme = this.getScheme();
    const isMobile = this.width < 768;

    ctx.fillStyle = `rgba(0, 0, 0, 0.8)`;
    ctx.fillRect(0, 0, this.width, this.height);

    const modalWidth = isMobile ? this.width - 20 : Math.min(500, this.width - 40);
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;

    this._drawBrutalismRect(ctx, modalX, modalY, modalWidth, modalHeight, scheme.cardBg, {
      shadowOffset: 10,
      borderWidth: 5
    });

    const titleY = modalY + (isMobile ? 40 : 50);
    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 28 : 34}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('商店', this.width / 2, titleY);

    const titleWidth = ctx.measureText('商店').width;
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.width / 2 - titleWidth / 2 - 20, titleY + 25);
    ctx.lineTo(this.width / 2 + titleWidth / 2 + 20, titleY + 25);
    ctx.stroke();

    if (this.products) {
      this.renderShopProducts(ctx, modalX, modalY, modalWidth, modalHeight, isMobile);
    }

    // Close button
    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const buttonY = modalY + modalHeight - (isMobile ? 70 : 80);

    const isHovered = this.hoveredButton === 'shop_close';
    const isClicked = this.clickedButton === 'shop_close';

    let fillColor = scheme.buttonPrimary;
    if (isHovered) {
      fillColor = lightenColor(scheme.buttonPrimary, 0.15);
    }

    let scale = 1;
    if (isHovered) scale = 1.02;
    if (isClicked) scale = 0.95;

    const scaledWidth = buttonWidth * scale;
    const scaledHeight = buttonHeight * scale;
    const scaledX = (this.width - scaledWidth) / 2;
    const scaledY = buttonY + (buttonHeight - scaledHeight) / 2;

    const shadowOffset = isClicked ? 2 : (isHovered ? 8 : 6);
    this._drawBrutalismRect(ctx, scaledX, scaledY, scaledWidth, scaledHeight, fillColor, {
      shadowOffset: shadowOffset,
      borderWidth: 4
    });

    ctx.fillStyle = scheme.textLight;
    ctx.font = `bold ${isMobile ? 18 : 20}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('返回', this.width / 2, scaledY + scaledHeight / 2);

    const coinsY = buttonY - (isMobile ? 20 : 25);
    ctx.fillStyle = scheme.text;
    ctx.font = `bold ${isMobile ? 16 : 18}px "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`💰 金币: ${this.coins}`, this.width / 2, coinsY);
  }

  renderShopProducts(ctx, modalX, modalY, modalWidth, modalHeight, isMobile) {
    const scheme = this.getScheme();
    const products = this.products;

    if (!products || products.length === 0) return;

    const listStartY = modalY + (isMobile ? 90 : 110);
    const listEndY = modalY + modalHeight - (isMobile ? 120 : 140);
    const listHeight = listEndY - listStartY;
    const itemHeight = isMobile ? 100 : 120;
    const itemPadding = isMobile ? 12 : 15;
    const itemWidth = modalWidth - (isMobile ? 20 : 30);
    const itemX = modalX + (isMobile ? 10 : 15);

    const totalHeight = products.length * (itemHeight + itemPadding);
    const maxScroll = Math.max(0, totalHeight - listHeight);
    this.scroll.setMaxOffset(maxScroll);

    ctx.save();
    ctx.beginPath();
    ctx.rect(modalX, listStartY, modalWidth, listHeight);
    ctx.clip();

    products.forEach((product, index) => {
      const itemY = listStartY + index * (itemHeight + itemPadding) - this.scroll.offset;

      if (itemY + itemHeight < listStartY || itemY > listEndY) return;

      const canBuy = this.coins >= product.price;
      const bgColor = scheme.cardBg;

      this._drawBrutalismRect(ctx, itemX, itemY, itemWidth, itemHeight, bgColor, {
        shadowOffset: 2,
        borderWidth: 2
      });

      ctx.font = `bold ${isMobile ? 36 : 44}px Arial, sans-serif`;
      ctx.fillStyle = scheme.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(product.icon, itemX + (isMobile ? 12 : 15), itemY + itemHeight / 2);

      ctx.font = `bold ${isMobile ? 18 : 20}px "Arial Black", Arial, sans-serif`;
      ctx.fillText(product.name, itemX + (isMobile ? 55 : 65), itemY + (isMobile ? 25 : 30));

      ctx.font = `${isMobile ? 12 : 14}px Arial, sans-serif`;
      ctx.fillStyle = scheme.text;
      ctx.fillText(product.description, itemX + (isMobile ? 55 : 65), itemY + (isMobile ? 50 : 55));

      const priceText = `💰 ${product.price}`;
      ctx.font = `bold ${isMobile ? 14 : 16}px "Arial Black", Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(priceText, itemX + (isMobile ? 55 : 65), itemY + (isMobile ? 75 : 85));

      const buyButtonWidth = isMobile ? 60 : 80;
      const buyButtonHeight = isMobile ? 32 : 40;
      const buyButtonX = itemX + itemWidth - buyButtonWidth - (isMobile ? 10 : 15);
      const buyButtonY = itemY + (itemHeight - buyButtonHeight) / 2;

      const isBuyButtonHovered = this.hoveredButton === `shop_buy_${product.id}`;
      const isBuyButtonClicked = this.clickedButton === `shop_buy_${product.id}`;

      if (canBuy) {
        let buyButtonColor = scheme.buttonPrimary;
        if (isBuyButtonHovered) {
          buyButtonColor = lightenColor(scheme.buttonPrimary, 0.15);
        }

        let buyButtonScale = 1;
        if (isBuyButtonHovered) buyButtonScale = 1.02;
        if (isBuyButtonClicked) buyButtonScale = 0.95;

        const scaledBuyWidth = buyButtonWidth * buyButtonScale;
        const scaledBuyHeight = buyButtonHeight * buyButtonScale;
        const scaledBuyX = buyButtonX + (buyButtonWidth - scaledBuyWidth) / 2;
        const scaledBuyY = buyButtonY + (buyButtonHeight - scaledBuyHeight) / 2;

        const buyShadowOffset = isBuyButtonClicked ? 2 : (isBuyButtonHovered ? 6 : 4);
        this._drawBrutalismRect(ctx, scaledBuyX, scaledBuyY, scaledBuyWidth, scaledBuyHeight, buyButtonColor, {
          shadowOffset: buyShadowOffset,
          borderWidth: 3
        });

        ctx.fillStyle = scheme.textLight;
        ctx.font = `bold ${isMobile ? 14 : 16}px "Arial Black", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('购买', scaledBuyX + scaledBuyWidth / 2, scaledBuyY + scaledBuyHeight / 2);
      } else {
        this._drawBrutalismRect(ctx, buyButtonX, buyButtonY, buyButtonWidth, buyButtonHeight, '#CCCCCC', {
          shadowOffset: 2,
          borderWidth: 2
        });

        ctx.fillStyle = '#666666';
        ctx.font = `bold ${isMobile ? 12 : 14}px "Arial Black", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('金币不足', buyButtonX + buyButtonWidth / 2, buyButtonY + buyButtonHeight / 2);
      }
    });

    ctx.restore();
  }

  handleClick(x, y, onBuy) {
    if (!this._visible) return false;

    const isMobile = this.width < 768;
    const buttonWidth = isMobile ? 180 : 220;
    const buttonHeight = isMobile ? 48 : 56;
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const modalY = (this.height - modalHeight) / 2;
    const buttonX = (this.width - buttonWidth) / 2;
    const buttonY = modalY + modalHeight - (isMobile ? 70 : 80);

    // Close button
    if (x >= buttonX && x <= buttonX + buttonWidth &&
        y >= buttonY && y <= buttonY + buttonHeight) {
      this.clickedButton = 'shop_close';
      if (this.onPlayClickSound) {
        this.onPlayClickSound();
      }
      setTimeout(() => {
        this.clickedButton = null;
        this.hide();
        this.hoveredButton = null;
      }, 150);
      return true;
    }

    // Product buy buttons
    if (this.products) {
      const modalWidth = isMobile ? this.width - 20 : Math.min(500, this.width - 40);
      const modalX = (this.width - modalWidth) / 2;
      const listStartY = modalY + (isMobile ? 90 : 110);
      const listEndY = modalY + modalHeight - (isMobile ? 120 : 140);
      const itemHeight = isMobile ? 100 : 120;
      const itemPadding = isMobile ? 12 : 15;
      const itemWidth = modalWidth - (isMobile ? 20 : 30);
      const itemX = modalX + (isMobile ? 10 : 15);

      if (y >= listStartY && y <= listEndY) {
        for (let i = 0; i < this.products.length; i++) {
          const product = this.products[i];
          const itemY = listStartY + i * (itemHeight + itemPadding) - this.scroll.offset;

          if (itemY + itemHeight < listStartY || itemY > listEndY) continue;

          const buyButtonWidth = isMobile ? 60 : 80;
          const buyButtonHeight = isMobile ? 32 : 40;
          const buyButtonX = itemX + itemWidth - buyButtonWidth - (isMobile ? 10 : 15);
          const buyButtonY = itemY + (itemHeight - buyButtonHeight) / 2;

          if (y >= buyButtonY && y <= buyButtonY + buyButtonHeight &&
              x >= buyButtonX && x <= buyButtonX + buyButtonWidth) {
            if (this.coins >= product.price) {
              this.clickedButton = `shop_buy_${product.id}`;
              setTimeout(() => {
                this.clickedButton = null;
                const buyFn = onBuy || this.onShopBuy;
                if (buyFn) {
                  buyFn(product);
                }
              }, 150);
              return true;
            }
          }
        }
      }
    }

    return true;
  }

  handleTouchStart(y) {
    if (!this._visible) return;
    this.scroll.handleTouchStart(y);
  }

  handleTouchMove(y) {
    if (!this._visible || !this.scroll.isTouching) return;

    const isMobile = this.width < 768;
    const modalHeight = isMobile ? this.height - 80 : this.height - 100;
    const listStartY = (this.height - modalHeight) / 2 + (isMobile ? 90 : 110);
    const listEndY = (this.height - modalHeight) / 2 + modalHeight - (isMobile ? 120 : 140);

    if (y >= listStartY && y <= listEndY) {
      const prevY = this.scroll.lastTouchY;
      const delta = prevY - y;
      this.scroll.offset = Math.max(0, this.scroll.offset + delta);
      this.scroll.lastTouchY = y;

      const now = Date.now();
      const deltaTime = now - this.scroll.lastScrollTime;
      this.scroll.lastScrollTime = now;

      if (deltaTime > 0) {
        this.scroll.lastScrollDelta = delta / deltaTime;
        this.scroll.velocity = delta / deltaTime * 16;
      }
    }
  }

  handleTouchEnd() {
    this.scroll.handleTouchEnd();
  }

  handleWheel(deltaY) {
    if (!this._visible) return;
    this.scroll.handleWheel(deltaY);
  }
}
