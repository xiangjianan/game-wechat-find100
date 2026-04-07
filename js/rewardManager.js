/**
 * 奖励管理器
 * 处理点击数字时的概率性奖励触发
 */
export default class RewardManager {
  constructor() {
    this.rewards = new Map();
    this.skillManager = null;
    this.onRewardTriggered = null;
    this.initRewards();
  }

  initRewards() {
    // 提示道具奖励
    this.rewards.set('hint', {
      id: 'hint',
      name: '提示道具',
      icon: '💡',
      baseProbability: 0, // 基础概率为0，需要幸运之星才能触发
      color: '#FBBF24',
      action: (managers) => {
        if (managers.itemManager) {
          managers.itemManager.addItem('hint', 1);
        }
        return { type: 'hint', amount: 1, icon: '💡', name: '提示道具' };
      }
    });

    // 金币奖励
    this.rewards.set('coin', {
      id: 'coin',
      name: '金币',
      icon: '🪙',
      baseProbability: 0, // 基础概率为0，需要幸运之星才能触发
      color: '#3B82F6',
      action: (managers) => {
        const amount = Math.floor(Math.random() * 11) + 5; // 5-15金币
        if (managers.coinManager) {
          managers.coinManager.addCoins(amount, 'reward');
        }
        return { type: 'coin', amount, icon: '🪙', name: '金币' };
      }
    });

    // 额外时长奖励
    this.rewards.set('time', {
      id: 'time',
      name: '额外时长',
      icon: '⏰',
      baseProbability: 0, // 基础概率为0，需要幸运之星才能触发
      color: '#14B8A6',
      action: (managers) => {
        const bonus = 3; // 3秒
        if (managers.gameManager) {
          managers.gameManager.addTime(bonus);
        }
        return { type: 'time', amount: bonus, icon: '⏰', name: '额外时长' };
      }
    });
  }

  /**
   * 设置技能管理器
   * @param {SkillManager} skillManager
   */
  setSkillManager(skillManager) {
    this.skillManager = skillManager;
  }

  /**
   * 获取幸运之星加成
   * @returns {number} 概率加成值
   */
  getLuckyStarBonus() {
    if (this.skillManager) {
      return this.skillManager.getLuckyBonus() || 0;
    }
    return 0;
  }

  /**
   * 检查并触发奖励
   * @param {Object} managers - 包含各种管理器的对象
   * @returns {Object|null} 奖励结果或null
   */
  checkReward(managers) {
    // 只在限时模式下触发奖励
    if (managers.gameManager && managers.gameManager.gameMode !== 'timed') {
      return null;
    }

    const luckyBonus = this.getLuckyStarBonus();
    const rewardOrder = ['hint', 'coin', 'time']; // 定义检查顺序

    for (const rewardId of rewardOrder) {
      const reward = this.rewards.get(rewardId);
      if (!reward) continue;

      // 计算最终概率 = 基础概率 + 幸运之星加成
      // 基础概率为0，只有解锁幸运之星后才能触发奖励
      const finalProbability = reward.baseProbability + luckyBonus;

      if (Math.random() < finalProbability) {
        const result = reward.action(managers);
        
        if (this.onRewardTriggered) {
          this.onRewardTriggered(result);
        }
        
        return result;
      }
    }

    return null;
  }

  /**
   * 获取所有奖励配置
   * @returns {Array}
   */
  getAllRewards() {
    return Array.from(this.rewards.values());
  }

  /**
   * 获取当前总触发概率（用于UI显示）
   * @returns {Object}
   */
  getProbabilities() {
    const luckyBonus = this.getLuckyStarBonus();
    const probabilities = {};

    this.rewards.forEach((reward, id) => {
      probabilities[id] = {
        base: reward.baseProbability,
        final: reward.baseProbability + luckyBonus,
        bonus: luckyBonus
      };
    });

    return probabilities;
  }
}
