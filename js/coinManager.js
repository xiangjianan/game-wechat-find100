export default class CoinManager {
  constructor() {
    this.coins = 0;
    this.onCoinChanged = null;
    this.saveTimeout = null;
    this.pendingSave = false;
    this.loadCoins();
  }

  init() {
    this.loadCoins();
  }

  addCoins(amount) {
    if (amount <= 0) return;
    
    this.coins += amount;
    this.saveCoins();
    
    if (this.onCoinChanged) {
      this.onCoinChanged(this.coins, amount, 'add');
    }
  }

  spendCoins(amount) {
    if (amount <= 0) return false;
    if (this.coins < amount) return false;
    
    this.coins -= amount;
    this.saveCoins();
    
    if (this.onCoinChanged) {
      this.onCoinChanged(this.coins, amount, 'spend');
    }
    
    return true;
  }

  getCoins() {
    return this.coins;
  }

  hasEnoughCoins(amount) {
    return this.coins >= amount;
  }

  saveCoins() {
    if (typeof wx === 'undefined' || !wx.setStorageSync) return;

    // 防抖：如果已有待保存的定时器，直接返回
    if (this.pendingSave) return;
    
    this.pendingSave = true;
    
    // 延迟保存，批量处理
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      this.pendingSave = false;
      try {
        wx.setStorageSync('coins', this.coins);
      } catch (error) {
      }
    }, 300); // 300ms防抖延迟
  }

  // 立即保存（用于游戏退出等关键时机）
  saveCoinsImmediate() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.pendingSave = false;
    
    if (typeof wx === 'undefined' || !wx.setStorageSync) return;
    
    try {
      wx.setStorageSync('coins', this.coins);
    } catch (error) {
    }
  }

  loadCoins() {
    if (typeof wx === 'undefined' || !wx.getStorageSync) return;

    try {
      const savedCoins = wx.getStorageSync('coins');
      if (savedCoins !== null && savedCoins !== undefined) {
        this.coins = parseInt(savedCoins, 10) || 0;
      }
    } catch (error) {
    }
  }

  reset() {
    this.coins = 0;
    this.saveCoins();
    
    if (this.onCoinChanged) {
      this.onCoinChanged(this.coins, 0, 'reset');
    }
  }
}
