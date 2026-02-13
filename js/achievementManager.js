export default class AchievementManager {
  constructor() {
    this.achievements = new Map();
    this.unlockedAchievements = new Set();
    this.progress = new Map();
    this.pendingNotifications = [];
    this.initAchievements();
    this.loadProgress();
  }

  initAchievements() {
    const achievements = [
      {
        id: 'A001',
        name: '初出茅庐',
        description: '完成第一关',
        category: 'beginner',
        condition: { type: 'level_complete', level: 1 },
        reward: { type: 'coins', amount: 100 },
        icon: '🎯'
      },
      {
        id: 'A002',
        name: '入门选手',
        description: '完成10次游戏',
        category: 'beginner',
        condition: { type: 'games_completed', count: 10 },
        reward: { type: 'coins', amount: 200 },
        icon: '🎮'
      },
      {
        id: 'A003',
        name: '连续作战',
        description: '连续玩5局',
        category: 'beginner',
        condition: { type: 'consecutive_games', count: 5 },
        reward: { type: 'coins', amount: 300 },
        icon: '🔥'
      },
      {
        id: 'A004',
        name: '轻松搞定',
        description: '10秒内完成第一关',
        category: 'speed',
        condition: { type: 'fast_complete', level: 1, maxTime: 10 },
        reward: { type: 'coins', amount: 500 },
        icon: '⚡'
      },
      {
        id: 'A005',
        name: '超凡速度',
        description: '5秒内完成第一关',
        category: 'speed',
        condition: { type: 'fast_complete', level: 1, maxTime: 5 },
        reward: { type: 'coins', amount: 1000 },
        icon: '🚀'
      },
      {
        id: 'A006',
        name: '速度达人',
        description: '30秒内完成第二关',
        category: 'speed',
        condition: { type: 'fast_complete', level: 2, maxTime: 30 },
        reward: { type: 'coins', amount: 800 },
        icon: '💨'
      },
      {
        id: 'A101',
        name: '完美无缺',
        description: '零错误完成关卡',
        category: 'perfect',
        condition: { type: 'perfect_game' },
        reward: { type: 'coins', amount: 500 },
        icon: '✨'
      },
      {
        id: 'A102',
        name: '完美主义者',
        description: '连续3次零错误完成',
        category: 'perfect',
        condition: { type: 'consecutive_perfect', count: 3 },
        reward: { type: 'coins', amount: 1000 },
        icon: '💎'
      },
      {
        id: 'A103',
        name: '精准射手',
        description: '累计10次零错误完成',
        category: 'perfect',
        condition: { type: 'total_perfect_games', count: 10 },
        reward: { type: 'coins', amount: 1500 },
        icon: '🎯'
      },
      {
        id: 'A201',
        name: '第二关挑战',
        description: '完成第二关',
        category: 'progress',
        condition: { type: 'level_complete', level: 2 },
        reward: { type: 'coins', amount: 500 },
        icon: '🏆'
      },
      {
        id: 'A202',
        name: '百数挑战',
        description: '在第二关找到100个数字',
        category: 'progress',
        condition: { type: 'total_numbers_found', count: 100 },
        reward: { type: 'coins', amount: 300 },
        icon: '💯'
      },
      {
        id: 'A301',
        name: '时间大师',
        description: '在限时模式下完成关卡',
        category: 'mode',
        condition: { type: 'mode_complete', mode: 'timed' },
        reward: { type: 'coins', amount: 200 },
        icon: '⏰'
      },
      {
        id: 'A302',
        name: '自由探索',
        description: '在自由模式下完成关卡',
        category: 'mode',
        condition: { type: 'mode_complete', mode: 'untimed' },
        reward: { type: 'coins', amount: 200 },
        icon: '🕊️'
      },
      {
        id: 'A401',
        name: '坚持不懈',
        description: '累计游戏20次',
        category: 'persistence',
        condition: { type: 'games_completed', count: 20 },
        reward: { type: 'coins', amount: 400 },
        icon: '💪'
      },
      {
        id: 'A402',
        name: '游戏达人',
        description: '累计游戏50次',
        category: 'persistence',
        condition: { type: 'games_completed', count: 50 },
        reward: { type: 'coins', amount: 800 },
        icon: '🌟'
      },
      {
        id: 'A403',
        name: '数一数噻大师',
        description: '累计游戏100次',
        category: 'persistence',
        condition: { type: 'games_completed', count: 100 },
        reward: { type: 'coins', amount: 2000 },
        icon: '👑'
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  checkAchievement(eventType, data) {
    const newlyUnlocked = [];

    for (const [id, achievement] of this.achievements) {
      if (this.unlockedAchievements.has(id)) continue;

      if (this.checkCondition(achievement.condition, eventType, data)) {
        this.unlockAchievement(id);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  checkCondition(condition, eventType, data) {
    switch (condition.type) {
      case 'level_complete':
        return eventType === 'level_complete' && data.level >= condition.level;

      case 'games_completed':
        if (eventType === 'game_complete') {
          const current = this.progress.get('games_completed') || 0;
          this.progress.set('games_completed', current + 1);
          this.saveProgress();
          return this.progress.get('games_completed') >= condition.count;
        }
        return false;

      case 'consecutive_games':
        if (eventType === 'game_complete') {
          const current = this.progress.get('consecutive_games') || 0;
          this.progress.set('consecutive_games', current + 1);
          this.saveProgress();
          return this.progress.get('consecutive_games') >= condition.count;
        } else if (eventType === 'game_fail') {
          this.progress.set('consecutive_games', 0);
          this.saveProgress();
        }
        return false;

      case 'fast_complete':
        return eventType === 'level_complete' &&
               data.level === condition.level &&
               data.time <= condition.maxTime;

      case 'perfect_game':
        return eventType === 'level_complete' && data.errors === 0;

      case 'consecutive_perfect':
        if (eventType === 'level_complete') {
          if (data.errors === 0) {
            const current = this.progress.get('consecutive_perfect') || 0;
            this.progress.set('consecutive_perfect', current + 1);
          } else {
            this.progress.set('consecutive_perfect', 0);
          }
          this.saveProgress();
          return this.progress.get('consecutive_perfect') >= condition.count;
        }
        return false;

      case 'total_perfect_games':
        if (eventType === 'level_complete' && data.errors === 0) {
          const current = this.progress.get('total_perfect_games') || 0;
          this.progress.set('total_perfect_games', current + 1);
          this.saveProgress();
          return this.progress.get('total_perfect_games') >= condition.count;
        }
        return false;

      case 'total_numbers_found':
        if (eventType === 'level_complete') {
          const current = this.progress.get('total_numbers_found') || 0;
          this.progress.set('total_numbers_found', current + data.totalNumbers);
          this.saveProgress();
          return this.progress.get('total_numbers_found') >= condition.count;
        }
        return false;

      case 'mode_complete':
        return eventType === 'level_complete' && data.mode === condition.mode;

      default:
        return false;
    }
  }

  unlockAchievement(id) {
    const achievement = this.achievements.get(id);
    if (!achievement || this.unlockedAchievements.has(id)) return;

    this.unlockedAchievements.add(id);
    this.pendingNotifications.push(achievement);
    this.saveProgress();
  }

  getPendingNotifications() {
    const notifications = [...this.pendingNotifications];
    this.pendingNotifications = [];
    return notifications;
  }

  hasPendingNotifications() {
    return this.pendingNotifications.length > 0;
  }

  saveProgress() {
    if (typeof wx === 'undefined' || !wx.setStorageSync) return;

    try {
      const data = {
        unlockedAchievements: Array.from(this.unlockedAchievements),
        progress: Array.from(this.progress.entries())
      };
      wx.setStorageSync('achievement_progress', JSON.stringify(data));
    } catch (error) {
      // 静默处理错误
    }
  }

  loadProgress() {
    if (typeof wx === 'undefined' || !wx.getStorageSync) return;

    try {
      const data = wx.getStorageSync('achievement_progress');
      if (data) {
        const parsed = JSON.parse(data);
        this.unlockedAchievements = new Set(parsed.unlockedAchievements || []);
        this.progress = new Map(parsed.progress || []);
      }
    } catch (error) {
      // 静默处理错误
    }
  }

  getAchievementProgress(id) {
    const achievement = this.achievements.get(id);
    if (!achievement) return null;

    return {
      achievement,
      unlocked: this.unlockedAchievements.has(id),
      progress: this.getProgressValue(achievement.condition),
      target: this.getProgressTarget(achievement.condition)
    };
  }

  getProgressValue(condition) {
    switch (condition.type) {
      case 'games_completed':
      case 'consecutive_games':
      case 'consecutive_perfect':
      case 'total_perfect_games':
      case 'total_numbers_found':
        return this.progress.get(condition.type) || 0;
      default:
        return this.unlockedAchievements.has(
          this.findAchievementByCondition(condition)
        ) ? 1 : 0;
    }
  }

  getProgressTarget(condition) {
    return condition.count || condition.level || 1;
  }

  findAchievementByCondition(condition) {
    for (const [id, achievement] of this.achievements) {
      if (JSON.stringify(achievement.condition) === JSON.stringify(condition)) {
        return id;
      }
    }
    return null;
  }

  getUnlockedCount() {
    return this.unlockedAchievements.size;
  }

  getTotalCount() {
    return this.achievements.size;
  }

  getAllAchievements() {
    return Array.from(this.achievements.values()).map(achievement => ({
      ...achievement,
      unlocked: this.unlockedAchievements.has(achievement.id),
      progress: this.getProgressValue(achievement.condition),
      target: this.getProgressTarget(achievement.condition)
    }));
  }

  getAchievementsByCategory(category) {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  getCategories() {
    const categories = new Map();
    categories.set('beginner', { name: '初出茅庐', icon: '🎯' });
    categories.set('speed', { name: '速度恶魔', icon: '⚡' });
    categories.set('perfect', { name: '完美主义', icon: '✨' });
    categories.set('progress', { name: '进度达人', icon: '🏆' });
    categories.set('mode', { name: '模式探索', icon: '🎮' });
    categories.set('persistence', { name: '坚持不懈', icon: '💪' });
    return categories;
  }

  reset() {
    this.unlockedAchievements = new Set();
    this.progress = new Map();
    this.pendingNotifications = [];
    this.saveProgress();
  }
}
