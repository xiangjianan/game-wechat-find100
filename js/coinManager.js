export default class CoinManager {
  constructor() {
    this.coins = 0;
    this.onCoinChanged = null;
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
