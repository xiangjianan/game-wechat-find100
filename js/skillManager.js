export default class SkillManager {
  constructor() {
    this.skills = new Map();
    this.unlockedSkills = new Set();
    this.skillPoints = 0;
    this.initSkills();
    this.loadProgress();
  }

  initSkills() {
    this.skills.set('time_control_1', {
      id: 'time_control_1',
      name: '时间掌控 I',
      category: 'time',
      description: '初始时间+2秒',
      effect: { type: 'initial_time', value: 2 },
      maxLevel: 2,
      currentLevel: 0,
      cost: 1,
      prerequisite: null,
      icon: '⏱️'
    });

    this.skills.set('time_control_2', {
      id: 'time_control_2',
      name: '时间掌控 II',
      category: 'time',
      description: '初始时间+5秒',
      effect: { type: 'initial_time', value: 5 },
      maxLevel: 2,
      currentLevel: 0,
      cost: 2,
      prerequisite: 'time_control_1',
      icon: '⏱️'
    });

    this.skills.set('time_reward_1', {
      id: 'time_reward_1',
      name: '时间奖励 I',
      category: 'time',
      description: '正确点击+1秒',
      effect: { type: 'time_bonus', value: 1 },
      maxLevel: 2,
      currentLevel: 0,
      cost: 2,
      prerequisite: null,
      icon: '⏰'
    });

    this.skills.set('time_reward_2', {
      id: 'time_reward_2',
      name: '时间奖励 II',
      category: 'time',
      description: '正确点击+2秒',
      effect: { type: 'time_bonus', value: 2 },
      maxLevel: 2,
      currentLevel: 0,
      cost: 3,
      prerequisite: 'time_reward_1',
      icon: '⏰'
    });

    this.skills.set('combo_boost', {
      id: 'combo_boost',
      name: '连击增益',
      category: 'combo',
      description: '5连击后，每次连击额外增加5秒时长',
      effect: { type: 'combo_bonus', value: 5 },
      maxLevel: 1,
      currentLevel: 0,
      cost: 3,
      prerequisite: null,
      icon: '🔥'
    });
  }

  canUnlock(skillId) {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    if (this.unlockedSkills.has(skillId)) return false;
    if (skill.currentLevel >= skill.maxLevel) return false;
    if (this.skillPoints < skill.cost) return false;
    if (skill.prerequisite && !this.unlockedSkills.has(skill.prerequisite)) return false;

    return true;
  }

  unlockSkill(skillId) {
    if (!this.canUnlock(skillId)) return false;

    const skill = this.skills.get(skillId);
    this.skillPoints -= skill.cost;
    skill.currentLevel++;
    this.unlockedSkills.add(skillId);

    this.saveProgress();
    return true;
  }

  isUnlocked(skillId) {
    return this.unlockedSkills.has(skillId);
  }

  getSkill(skillId) {
    return this.skills.get(skillId);
  }

  getAllSkills() {
    return Array.from(this.skills.values());
  }

  getSkillsByCategory(category) {
    return this.getAllSkills().filter(skill => skill.category === category);
  }

  getSkillProgress() {
    const skillsByCategory = new Map();
    const categories = ['time', 'combo'];

    for (const category of categories) {
      const categorySkills = this.getSkillsByCategory(category).map(skill => ({
        ...skill,
        canUnlock: this.canUnlock(skill.id),
        isUnlocked: this.isUnlocked(skill.id)
      }));
      skillsByCategory.set(category, categorySkills);
    }

    return skillsByCategory;
  }

  addSkillPoints(amount) {
    this.skillPoints += amount;
    this.saveProgress();
  }

  getSkillPoints() {
    return this.skillPoints;
  }

  getSkillEffect(type) {
    let totalEffect = 0;

    for (const skillId of this.unlockedSkills) {
      const skill = this.skills.get(skillId);
      if (skill && skill.effect.type === type) {
        totalEffect = Math.max(totalEffect, skill.effect.value);
      }
    }

    return totalEffect;
  }

  getInitialTimeBonus() {
    return this.getSkillEffect('initial_time');
  }

  getTimeBonusPerClick() {
    return this.getSkillEffect('time_bonus');
  }

  getComboBonus() {
    return this.getSkillEffect('combo_bonus');
  }

  saveProgress() {
    if (typeof wx === 'undefined' || !wx.setStorageSync) return;

    try {
      const data = {
        unlockedSkills: Array.from(this.unlockedSkills),
        skillPoints: this.skillPoints,
        skillLevels: Array.from(this.skills.entries()).map(([id, skill]) => ({
          id,
          currentLevel: skill.currentLevel
        }))
      };
      wx.setStorageSync('skill_progress', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save skill progress:', error);
    }
  }

  loadProgress() {
    if (typeof wx === 'undefined' || !wx.getStorageSync) return;

    try {
      const data = wx.getStorageSync('skill_progress');
      if (data) {
        const parsed = JSON.parse(data);
        this.unlockedSkills = new Set(parsed.unlockedSkills || []);
        this.skillPoints = parsed.skillPoints || 0;

        if (parsed.skillLevels) {
          for (const levelData of parsed.skillLevels) {
            const skill = this.skills.get(levelData.id);
            if (skill) {
              skill.currentLevel = levelData.currentLevel || 0;
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load skill progress:', error);
    }
  }

  reset() {
    this.unlockedSkills.clear();
    this.skillPoints = 0;
    this.skills.forEach(skill => {
      skill.currentLevel = 0;
    });
    this.saveProgress();
  }
}
