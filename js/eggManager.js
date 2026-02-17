export default class EggManager {
  constructor() {
    this.eggs = new Map();
    this.triggeredEggs = new Set();
    this.coinManager = null;
    this.achievementManager = null;
    this.reverseSequence = [];
    this.initEggs();
    this.loadTriggeredEggs();
  }

  initEggs() {
    this.eggs.set('reverse_king', {
      id: 'reverse_king',
      name: '倒序之王',
      description: '在自由模式第一关按倒序点击10到1',
      condition: 'reverse_sequence',
      reward: { type: 'coins', amount: 100000 },
      achievementId: 'EGG001',
      achievementName: '倒序之王',
      achievementDescription: '发现逆向思维彩蛋',
      achievementIcon: '🔄',
      achievementReward: { type: 'coins', amount: 100000 },
      achievementHidden: true
    });
  }

  init() {
    this.loadTriggeredEggs();
  }

  resetSequence() {
    this.reverseSequence = [];
  }

  checkClick(number, gameMode, level, totalNumbers) {
    console.log('[EggManager] checkClick called:', { number, gameMode, level, totalNumbers });
    
    if (gameMode !== 'untimed' || level !== 1 || totalNumbers !== 10) {
      console.log('[EggManager] Conditions not met, resetting sequence');
      this.reverseSequence = [];
      return null;
    }

    const expectedNumber = 10 - this.reverseSequence.length;
    console.log('[EggManager] Expected number:', expectedNumber, 'Current sequence:', this.reverseSequence);

    if (number === expectedNumber) {
      this.reverseSequence.push(number);
      console.log('[EggManager] Correct! Sequence now:', this.reverseSequence);

      if (this.reverseSequence.length === 10) {
        console.log('[EggManager] Reverse sequence complete! Triggering egg...');
        return this.triggerEgg('reverse_king');
      }
    } else if (!this.reverseSequence.includes(number)) {
      console.log('[EggManager] Wrong number, resetting sequence');
      this.reverseSequence = [];
    }

    return null;
  }

  triggerEgg(eggId) {
    if (this.triggeredEggs.has(eggId)) {
      return null;
    }

    const egg = this.eggs.get(eggId);
    if (!egg) return null;

    this.triggeredEggs.add(eggId);
    this.saveTriggeredEggs();

    if (egg.reward && egg.reward.type === 'coins' && this.coinManager) {
      this.coinManager.addCoins(egg.reward.amount);
    }

    if (egg.achievementId && this.achievementManager) {
      this.achievementManager.unlockAchievement(egg.achievementId);
    }

    return egg;
  }

  isEggTriggered(eggId) {
    return this.triggeredEggs.has(eggId);
  }

  saveTriggeredEggs() {
    if (typeof wx === 'undefined' || !wx.setStorageSync) return;

    try {
      wx.setStorageSync('triggered_eggs', JSON.stringify(Array.from(this.triggeredEggs)));
    } catch (error) {
    }
  }

  loadTriggeredEggs() {
    if (typeof wx === 'undefined' || !wx.getStorageSync) return;

    try {
      const saved = wx.getStorageSync('triggered_eggs');
      if (saved) {
        this.triggeredEggs = new Set(JSON.parse(saved));
      }
    } catch (error) {
    }
  }

  reset() {
    this.triggeredEggs = new Set();
    this.reverseSequence = [];
    this.saveTriggeredEggs();
  }

  setCoinManager(coinManager) {
    this.coinManager = coinManager;
  }

  setAchievementManager(achievementManager) {
    this.achievementManager = achievementManager;
  }

  getEgg(eggId) {
    return this.eggs.get(eggId);
  }

  getAllEggs() {
    return Array.from(this.eggs.values());
  }
}
