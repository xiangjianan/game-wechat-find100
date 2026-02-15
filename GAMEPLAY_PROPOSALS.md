# 数一数噻 - 创新玩法建议文档

## 目录

- [1. 文档概述](#1-文档概述)
- [2. 核心玩法优化](#2-核心玩法优化)
  - [2.1 连击系统](#21-连击系统)
  - [2.2 暴走模式](#22-暴走模式)
  - [2.3 倒计时挑战](#23-倒计时挑战)
  - [2.4 记忆模式](#24-记忆模式)
  - [2.5 盲点模式](#25-盲点模式)
- [3. 特色系统设计](#3-特色系统设计)
  - [3.1 道具系统](#31-道具系统)
  - [3.2 成就系统](#32-成就系统)
  - [3.3 皮肤系统](#33-皮肤系统)
  - [3.4 每日挑战系统](#34-每日挑战系统)
  - [3.5 副本系统](#35-副本系统)
- [4. 社交互动机制](#4-社交互动机制)
  - [4.1 好友对战](#41-好友对战)
  - [4.2 房间挑战](#42-房间挑战)
  - [4.3 社交分享](#43-社交分享)
  - [4.4 排行榜增强](#44-排行榜增强)
  - [4.5 礼物系统](#45-礼物系统)
- [5. 关卡设计思路](#5-关卡设计思路)
  - [5.1 关卡体系架构](#51-关卡体系架构)
  - [5.2 关卡类型设计](#52-关卡类型设计)
  - [5.3 难度曲线设计](#53-难度曲线设计)
  - [5.4 特殊关卡设计](#54-特殊关卡设计)
- [6. 角色成长路径](#6-角色成长路径)
  - [6.1 等级系统](#61-等级系统)
  - [6.2 技能树系统](#62-技能树系统)
  - [6.3 装备系统](#63-装备系统)
- [7. 技术实现可行性](#7-技术实现可行性)
- [8. 实施优先级建议](#8-实施优先级建议)

---

## 1. 文档概述

### 1.1 背景

"数一数噻"是一款基于微信小游戏平台的数字查找益智游戏。玩家需要在限定时间内按顺序点击随机分布的数字。当前游戏已具备基础的核心玩法，但为了提升游戏的趣味性、玩家留存率和整体体验，需要引入更多创新玩法和特色系统。

### 1.2 设计目标

- 提升游戏趣味性和可玩性
- 增强玩家留存率
- 促进社交传播和用户增长
- 建立长期激励机制
- 保持游戏简洁易上手的特点

### 1.3 设计原则

- **简洁性**：保持游戏核心玩法简单易懂
- **渐进性**：功能逐步解锁，避免一次性给玩家过多选择
- **平衡性**：确保各系统间的数值平衡
- **可扩展性**：为未来功能扩展预留空间
- **技术可行性**：基于现有技术架构，避免大规模重构

---

## 2. 核心玩法优化

### 2.1 连击系统

#### 2.1.1 设计说明

在现有的正确点击反馈基础上，引入连击机制，连续快速正确点击可以获得额外奖励。

**机制说明**：
- 连击计数：连续正确点击的次数
- 连击计时器：从第一次正确点击开始计时
- 连击中断：错误点击或超时中断连击
- 连击奖励：达到连击阈值获得时间奖励或分数加成
- 连击音效：低频到高频变化，增加游戏趣味性

**连击等级设计**：

| 连击数 | 连击等级 | 视觉效果 | 时间奖励 | 分数加成 |
|--------|----------|----------|----------|----------|
| 5连击 | 火热 | 多边形边框发光 | +1秒 | x1.2 |
| 10连击 | 燃烧 | 屏幕边缘火焰特效 | +2秒 | x1.5 |
| 15连击 | 狂暴 | 全屏震动+粒子特效 | +3秒 | x2.0 |
| 20连击 | 无敌 | 金色光圈特效 | +5秒 | x3.0 |

#### 2.1.2 技术实现

```javascript
class ComboManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.comboCount = 0;
    this.maxCombo = 0;
    this.comboTimer = null;
    this.comboTimeLimit = 2000; // 连击时间窗口2秒
    this.comboLevels = [
      { threshold: 5, name: '火热', timeBonus: 1, scoreMultiplier: 1.2 },
      { threshold: 10, name: '燃烧', timeBonus: 2, scoreMultiplier: 1.5 },
      { threshold: 15, name: '狂暴', timeBonus: 3, scoreMultiplier: 2.0 },
      { threshold: 20, name: '无敌', timeBonus: 5, scoreMultiplier: 3.0 }
    ];
  }

  onCorrectClick() {
    this.comboCount++;
    this.resetComboTimer();
    
    if (this.comboCount > this.maxCombo) {
      this.maxCombo = this.comboCount;
    }

    const level = this.getCurrentComboLevel();
    if (level) {
      this.applyComboReward(level);
      this.showComboEffect(level);
    }
  }

  onWrongClick() {
    this.breakCombo();
  }

  resetComboTimer() {
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
    }
    this.comboTimer = setTimeout(() => {
      this.breakCombo();
    }, this.comboTimeLimit);
  }

  breakCombo() {
    if (this.comboCount > 0) {
      this.showComboBreakEffect();
    }
    this.comboCount = 0;
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
      this.comboTimer = null;
    }
  }

  getCurrentComboLevel() {
    return this.comboLevels.slice().reverse().find(level => 
      this.comboCount >= level.threshold
    );
  }

  applyComboReward(level) {
    if (this.gameManager.gameMode === 'timed') {
      this.gameManager.timeLeft += level.timeBonus;
    }
  }

  showComboEffect(level) {
    this.gameManager.ui.showComboEffect(this.comboCount, level.name);
  }

  showComboBreakEffect() {
    this.gameManager.ui.showComboBreakEffect(this.comboCount);
  }

  reset() {
    this.breakCombo();
    this.maxCombo = 0;
  }
}
```

#### 2.1.3 预期效果

- 提升游戏节奏感和爽快感
- 增加玩家追求高连击的动机
- 延长单次游戏时长
- 提高玩家参与度

#### 2.1.4 潜在风险

- 连击阈值设置不当可能导致难度失衡
- 连击特效可能影响视觉清晰度
- 新手可能难以理解连击机制

**风险缓解**：
- 新手引导中详细解释连击系统
- 提供连击计时器可视化
- 可在设置中关闭连击特效

---

### 2.2 暴走模式

#### 2.2.1 设计说明

引入特殊的游戏状态，激活后短时间内获得特殊能力。

**触发条件**：
- 连击达到20次自动激活
- 使用道具手动激活
- 特殊关卡默认激活

**暴走效果**：
- 时间停止5秒
- 下一个数字自动高亮显示
- 点击区域扩大50%
- 所有数字临时变大

**持续时间**：5-10秒

#### 2.2.2 技术实现

```javascript
class FrenzyModeManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.isActive = false;
    this.duration = 5000;
    this.frenzyTimer = null;
    this.effects = {
      timeStopped: false,
      nextNumberHighlighted: false,
      clickAreaExpanded: false,
      numbersEnlarged: false
    };
  }

  activate() {
    if (this.isActive) return;

    this.isActive = true;
    this.applyEffects();

    this.frenzyTimer = setTimeout(() => {
      this.deactivate();
    }, this.duration);
  }

  applyEffects() {
    this.effects.timeStopped = this.gameManager.gameMode === 'timed';
    if (this.effects.timeStopped) {
      this.gameManager.pauseTimer();
    }

    this.effects.nextNumberHighlighted = true;
    const nextPolygon = this.gameManager.polygons.find(p => 
      p.number === this.gameManager.currentNumber
    );
    if (nextPolygon) {
      nextPolygon.setFrenzyHighlight(true);
    }

    this.effects.clickAreaExpanded = true;
    this.gameManager.setClickAreaMultiplier(1.5);

    this.effects.numbersEnlarged = true;
    this.gameManager.setNumberScale(1.3);

    this.gameManager.ui.showFrenzyModeEffect(true);
  }

  deactivate() {
    this.isActive = false;
    this.removeEffects();

    if (this.frenzyTimer) {
      clearTimeout(this.frenzyTimer);
      this.frenzyTimer = null;
    }

    this.gameManager.ui.showFrenzyModeEffect(false);
  }

  removeEffects() {
    if (this.effects.timeStopped) {
      this.gameManager.resumeTimer();
      this.effects.timeStopped = false;
    }

    if (this.effects.nextNumberHighlighted) {
      const polygons = this.gameManager.polygons;
      polygons.forEach(p => p.setFrenzyHighlight(false));
      this.effects.nextNumberHighlighted = false;
    }

    if (this.effects.clickAreaExpanded) {
      this.gameManager.setClickAreaMultiplier(1.0);
      this.effects.clickAreaExpanded = false;
    }

    if (this.effects.numbersEnlarged) {
      this.gameManager.setNumberScale(1.0);
      this.effects.numbersEnlarged = false;
    }
  }

  getRemainingTime() {
    if (!this.frenzyTimer) return 0;
    // 需要追踪剩余时间的实现
    return Math.max(0, this.duration - (Date.now() - this.activateTime));
  }
}
```

#### 2.2.3 预期效果

- 增加游戏的戏剧性和爽快感
- 为高难度关卡提供辅助手段
- 增强视觉冲击力

#### 2.2.4 潜在风险

- 可能降低游戏难度
- 特效可能干扰视线

**风险缓解**：
- 限制暴走模式使用次数
- 暴走效果可手动关闭
- 仅在高难度关卡启用

---

### 2.3 倒计时挑战

#### 2.3.1 设计说明

限时模式的一种变体，要求在固定时间内完成，而非累加时间。

**规则说明**：
- 初始时间固定（如60秒）
- 正确点击不增加时间
- 错误点击扣除时间
- 必须在时间耗尽前完成所有数字

**难度分级**：

| 难度 | 时间 | 数字数量 | 错误惩罚 |
|------|------|----------|----------|
| 简单 | 90秒 | 10-20 | -5秒 |
| 普通 | 60秒 | 25-50 | -5秒 |
| 困难 | 45秒 | 50-75 | -10秒 |
| 专家 | 30秒 | 75-100 | -10秒 |
| 大师 | 25秒 | 100-150 | -15秒 |

#### 2.3.2 技术实现

```javascript
class CountDownMode {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.initialTime = 60;
    this.errorPenalty = 5;
  }

  initGame(count, difficulty = 'normal') {
    const config = this.getDifficultyConfig(difficulty);
    this.initialTime = config.time;
    this.errorPenalty = config.errorPenalty;

    this.gameManager.timeLeft = this.initialTime;
    this.gameManager.initialTime = this.initialTime;
    this.gameManager.gameMode = 'countdown';

    this.gameManager.initGame(count, 1, 'countdown');
  }

  getDifficultyConfig(difficulty) {
    const configs = {
      easy: { time: 90, errorPenalty: 5 },
      normal: { time: 60, errorPenalty: 5 },
      hard: { time: 45, errorPenalty: 10 },
      expert: { time: 30, errorPenalty: 10 },
      master: { time: 25, errorPenalty: 15 }
    };
    return configs[difficulty] || configs.normal;
  }

  handleCorrectClick(polygon) {
    this.gameManager.currentNumber++;
    this.gameManager.clickCount++;

    if (this.gameManager.currentNumber > this.gameManager.totalNumbers) {
      this.gameManager.handleGameComplete();
    }

    if (this.gameManager.onCorrectClick) {
      const center = polygon.getCenter();
      this.gameManager.onCorrectClick(center);
    }
  }

  handleWrongClick(polygon) {
    polygon.shake();
    this.gameManager.errorCount++;
    this.gameManager.clickCount++;
    this.gameManager.timeLeft -= this.errorPenalty;
    if (this.gameManager.timeLeft < 0) {
      this.gameManager.timeLeft = 0;
    }

    if (this.gameManager.onError) {
      const center = polygon.getCenter();
      this.gameManager.onError(center);
    }
  }
}
```

#### 2.3.3 预期效果

- 提供更具挑战性的游戏体验
- 增加游戏模式的多样性
- 适合追求速度的玩家

#### 2.3.4 潜在风险

- 难度可能过高导致挫败感

**风险缓解**：
- 提供多种难度选择
- 新手从简单难度开始
- 提供充分的引导

---

### 2.4 记忆模式

#### 2.4.1 设计说明

引入记忆元素，数字在开始时显示一段时间后隐藏，玩家需要凭记忆完成。

**规则说明**：
- 游戏开始时所有数字可见5-10秒
- 倒计时结束后所有数字隐藏
- 玩家需要凭记忆按顺序点击
- 错误点击显示错误数字位置但立即再次隐藏

**难度分级**：

| 难度 | 记忆时间 | 数字数量 | 错误提示时间 |
|------|----------|----------|--------------|
| 简单 | 10秒 | 5-10 | 2秒 |
| 普通 | 7秒 | 15-25 | 1.5秒 |
| 困难 | 5秒 | 30-50 | 1秒 |
| 专家 | 3秒 | 50-75 | 0.5秒 |

#### 2.4.2 技术实现

```javascript
class MemoryMode {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.memoryTime = 7000;
    this.errorShowTime = 1500;
    this.isMemoryPhase = true;
    this.memoryTimer = null;
  }

  initGame(count, difficulty = 'normal') {
    const config = this.getDifficultyConfig(difficulty);
    this.memoryTime = config.memoryTime;
    this.errorShowTime = config.errorShowTime;

    this.gameManager.gameMode = 'memory';
    this.gameManager.initGame(count, 1, 'memory');

    this.startMemoryPhase();
  }

  getDifficultyConfig(difficulty) {
    const configs = {
      easy: { memoryTime: 10000, errorShowTime: 2000 },
      normal: { memoryTime: 7000, errorShowTime: 1500 },
      hard: { memoryTime: 5000, errorShowTime: 1000 },
      expert: { memoryTime: 3000, errorShowTime: 500 }
    };
    return configs[difficulty] || configs.normal;
  }

  startMemoryPhase() {
    this.isMemoryPhase = true;
    this.gameManager.ui.showMemoryTimer(this.memoryTime);

    this.memoryTimer = setTimeout(() => {
      this.endMemoryPhase();
    }, this.memoryTime);
  }

  endMemoryPhase() {
    this.isMemoryPhase = false;
    this.gameManager.polygons.forEach(p => p.hideNumber());
    this.gameManager.ui.hideMemoryTimer();
  }

  handleClick(x, y) {
    if (this.isMemoryPhase) {
      return;
    }

    for (const polygon of this.gameManager.polygons) {
      if (!polygon.isClicked && polygon.containsPoint({ x, y })) {
        if (polygon.number === this.gameManager.currentNumber) {
          this.handleCorrectClick(polygon);
        } else {
          this.handleWrongClick(polygon);
        }
        return;
      }
    }
  }

  handleWrongClick(polygon) {
    polygon.showNumber();
    polygon.shake();

    setTimeout(() => {
      polygon.hideNumber();
    }, this.errorShowTime);

    this.gameManager.errorCount++;
    this.gameManager.clickCount++;

    if (this.gameManager.onError) {
      const center = polygon.getCenter();
      this.gameManager.onError(center);
    }
  }

  handleCorrectClick(polygon) {
    polygon.isClicked = true;
    polygon.highlight();
    polygon.showNumber();

    setTimeout(() => {
      polygon.resetHighlight();
    }, 200);

    this.gameManager.currentNumber++;
    this.gameManager.clickCount++;

    if (this.gameManager.currentNumber > this.gameManager.totalNumbers) {
      this.gameManager.handleGameComplete();
    }

    if (this.gameManager.onCorrectClick) {
      const center = polygon.getCenter();
      this.gameManager.onCorrectClick(center);
    }
  }
}
```

#### 2.4.3 预期效果

- 增加游戏的记忆挑战元素
- 吸引喜欢记忆游戏的玩家
- 提升游戏的认知训练价值

#### 2.4.4 潜在风险

- 可能过于困难导致玩家流失

**风险缓解**：
- 提供足够的记忆时间
- 错误提示时间合理
- 难度分级清晰

---

### 2.5 盲点模式

#### 2.5.1 设计说明

特殊的视觉挑战模式，数字被遮挡部分区域。

**规则说明**：
- 屏幕上随机生成遮罩区域
- 遮罩区域内的数字不可见
- 遮罩会随着时间移动
- 玩家需要预判数字位置

**遮罩类型**：
- 圆形遮罩：移动的圆形盲区
- 矩形遮罩：扫描式移动的矩形
- 随机遮罩：多个随机移动的小遮罩

#### 2.5.2 技术实现

```javascript
class BlindSpotMode {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.masks = [];
    this.maskType = 'circle';
    this.updateInterval = 100;
    this.updateTimer = null;
  }

  initGame(count, maskType = 'circle') {
    this.maskType = maskType;
    this.gameManager.gameMode = 'blindspot';
    this.gameManager.initGame(count, 1, 'blindspot');

    this.createMasks();
    this.startMaskUpdate();
  }

  createMasks() {
    this.masks = [];

    switch (this.maskType) {
      case 'circle':
        this.masks.push({
          type: 'circle',
          x: Math.random() * this.gameManager.width,
          y: Math.random() * this.gameManager.height,
          radius: 80,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4
        });
        break;

      case 'rect':
        this.masks.push({
          type: 'rect',
          x: 0,
          y: 0,
          width: this.gameManager.width,
          height: 60,
          vx: 0,
          vy: 3,
          direction: 1
        });
        break;

      case 'random':
        for (let i = 0; i < 5; i++) {
          this.masks.push({
            type: 'circle',
            x: Math.random() * this.gameManager.width,
            y: Math.random() * this.gameManager.height,
            radius: 30 + Math.random() * 30,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6
          });
        }
        break;
    }
  }

  startMaskUpdate() {
    this.updateTimer = setInterval(() => {
      this.updateMasks();
    }, this.updateInterval);
  }

  updateMasks() {
    for (const mask of this.masks) {
      if (mask.type === 'circle') {
        mask.x += mask.vx;
        mask.y += mask.vy;

        if (mask.x < mask.radius || mask.x > this.gameManager.width - mask.radius) {
          mask.vx *= -1;
        }
        if (mask.y < mask.radius || mask.y > this.gameManager.height - mask.radius) {
          mask.vy *= -1;
        }
      } else if (mask.type === 'rect') {
        mask.y += mask.vy * mask.direction;

        if (mask.y < 0 || mask.y > this.gameManager.height - mask.height) {
          mask.direction *= -1;
        }
      }
    }
  }

  renderMasks(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';

    for (const mask of this.masks) {
      if (mask.type === 'circle') {
        ctx.beginPath();
        ctx.arc(mask.x, mask.y, mask.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (mask.type === 'rect') {
        ctx.fillRect(mask.x, mask.y, mask.width, mask.height);
      }
    }
  }

  isPointInMask(x, y) {
    for (const mask of this.masks) {
      if (mask.type === 'circle') {
        const dist = Math.sqrt((x - mask.x) ** 2 + (y - mask.y) ** 2);
        if (dist < mask.radius) {
          return true;
        }
      } else if (mask.type === 'rect') {
        if (x >= mask.x && x <= mask.x + mask.width &&
            y >= mask.y && y <= mask.y + mask.height) {
          return true;
        }
      }
    }
    return false;
  }

  stop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
}
```

#### 2.5.3 预期效果

- 增加视觉挑战和趣味性
- 考验玩家的空间记忆能力
- 提供独特的游戏体验

#### 2.5.4 潜在风险

- 可能导致玩家视觉疲劳
- 影响游戏的可玩性

**风险缓解**：
- 遮罩移动速度适中
- 提供关闭选项
- 仅作为特殊模式

---

## 3. 特色系统设计

### 3.1 道具系统

#### 3.1.1 设计说明

引入道具系统，玩家可以在游戏中使用各种道具获得优势。

**道具类型**：

| 道具 | 效果 | 持续时间 | 冷却时间 | 使用次数 |
|------|------|----------|----------|----------|
| 时间胶囊 | +10秒时间 | 瞬时 | 30秒 | 3次/局 |
| 提示灯 | 高亮下一个数字 | 2秒 | 45秒 | 2次/局 |
| 冻结时钟 | 暂停计时器 | 5秒 | 60秒 | 1次/局 |
| 放大镜 | 扩大点击区域 | 10秒 | 90秒 | 2次/局 |
| 洗牌牌 | 重新排列数字 | 瞬时 | 120秒 | 1次/局 |
| 暴走 | 下一个数字自动高亮显示 | 5秒 | 120秒 | 1次/局 |

ps：排行榜中未使用道具玩家给道具奖励，以及排行榜展示特殊白金标识


#### 3.1.2 技术实现

```javascript
class ItemManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.items = new Map();
    this.cooldowns = new Map();
    this.usageCounts = new Map();
    this.activeEffects = new Map();
  }

  initItems() {
    this.items.set('timeCapsule', {
      id: 'timeCapsule',
      name: '时间胶囊',
      description: '获得+10秒时间',
      icon: '⏰',
      maxUses: 3,
      cooldown: 30000
    });

    this.items.set('hint', {
      id: 'hint',
      name: '提示灯',
      description: '高亮下一个数字2秒',
      icon: '💡',
      maxUses: 2,
      cooldown: 45000,
      duration: 2000
    });

    this.items.set('freeze', {
      id: 'freeze',
      name: '冻结时钟',
      description: '暂停计时器5秒',
      icon: '❄️',
      maxUses: 1,
      cooldown: 60000,
      duration: 5000
    });

    this.items.set('magnifier', {
      id: 'magnifier',
      name: '放大镜',
      description: '扩大点击区域10秒',
      icon: '🔍',
      maxUses: 2,
      cooldown: 90000,
      duration: 10000
    });

    this.items.set('shuffle', {
      id: 'shuffle',
      name: '洗牌',
      description: '重新排列数字位置',
      icon: '🔀',
      maxUses: 1,
      cooldown: 120000
    });

    this.items.forEach((item, id) => {
      this.cooldowns.set(id, 0);
      this.usageCounts.set(id, 0);
    });
  }

  canUseItem(itemId) {
    const item = this.items.get(itemId);
    if (!item) return false;

    const cooldown = this.cooldowns.get(itemId);
    const usageCount = this.usageCounts.get(itemId);

    return cooldown === 0 && usageCount < item.maxUses;
  }

  useItem(itemId) {
    if (!this.canUseItem(itemId)) {
      this.gameManager.ui.showToast('道具冷却中或次数已用完');
      return false;
    }

    const item = this.items.get(itemId);
    this.usageCounts.set(itemId, this.usageCounts.get(itemId) + 1);
    this.cooldowns.set(itemId, item.cooldown);

    switch (itemId) {
      case 'timeCapsule':
        this.useTimeCapsule();
        break;
      case 'hint':
        this.useHint(item.duration);
        break;
      case 'freeze':
        this.useFreeze(item.duration);
        break;
      case 'magnifier':
        this.useMagnifier(item.duration);
        break;
      case 'shuffle':
        this.useShuffle();
        break;
    }

    this.startCooldown(itemId, item.cooldown);
    return true;
  }

  useTimeCapsule() {
    if (this.gameManager.gameMode === 'timed') {
      this.gameManager.timeLeft += 10;
      this.gameManager.ui.showFloatingText(
        this.gameManager.width / 2,
        this.gameManager.height / 2,
        '+10秒',
        '#4CAF50'
      );
    }
  }

  useHint(duration) {
    const nextNumber = this.gameManager.currentNumber;
    const targetPolygon = this.gameManager.polygons.find(p => 
      p.number === nextNumber && !p.isClicked
    );

    if (targetPolygon) {
      targetPolygon.setHintHighlight(true);
      this.gameManager.ui.showFloatingText(
        targetPolygon.center.x,
        targetPolygon.center.y,
        '提示!',
        '#FFC107'
      );

      setTimeout(() => {
        targetPolygon.setHintHighlight(false);
      }, duration);
    }
  }

  useFreeze(duration) {
    if (this.gameManager.gameMode === 'timed') {
      this.gameManager.pauseTimer();
      this.gameManager.ui.showFreezeEffect(true);

      setTimeout(() => {
        this.gameManager.resumeTimer();
        this.gameManager.ui.showFreezeEffect(false);
      }, duration);
    }
  }

  useMagnifier(duration) {
    this.gameManager.setClickAreaMultiplier(1.5);
    this.gameManager.ui.showMagnifierEffect(true);

    setTimeout(() => {
      this.gameManager.setClickAreaMultiplier(1.0);
      this.gameManager.ui.showMagnifierEffect(false);
    }, duration);
  }

  useShuffle() {
    const numbers = this.gameManager.polygons
      .filter(p => !p.isClicked)
      .map(p => p.number);

    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    let index = 0;
    for (const polygon of this.gameManager.polygons) {
      if (!polygon.isClicked) {
        polygon.number = numbers[index++];
      }
    }

    this.gameManager.ui.showShuffleEffect();
  }

  startCooldown(itemId, duration) {
    setTimeout(() => {
      this.cooldowns.set(itemId, 0);
      this.gameManager.ui.updateItemCooldown(itemId, 0);
    }, duration);

    this.updateCooldownDisplay(itemId, duration);
  }

  updateCooldownDisplay(itemId, duration) {
    let remaining = duration;
    const interval = 100;

    const timer = setInterval(() => {
      remaining -= interval;
      this.gameManager.ui.updateItemCooldown(itemId, remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, interval);
  }

  reset() {
    this.cooldowns.forEach((_, id) => {
      this.cooldowns.set(id, 0);
    });
    this.usageCounts.forEach((_, id) => {
      this.usageCounts.set(id, 0);
    });
  }

  getItemStatus(itemId) {
    const item = this.items.get(itemId);
    if (!item) return null;

    return {
      ...item,
      canUse: this.canUseItem(itemId),
      remainingUses: item.maxUses - this.usageCounts.get(itemId),
      cooldownRemaining: this.cooldowns.get(itemId)
    };
  }
}
```

#### 3.1.3 预期效果

- 增加策略性和深度
- 为新手提供帮助
- 增加游戏变数

#### 3.1.4 潜在风险

- 可能降低游戏挑战性
- 过度依赖道具

**风险缓解**：
- 限制道具使用次数
- 设置冷却时间
- 道具获得需要一定条件

---

### 3.2 成就系统

#### 3.2.1 设计说明

引入成就系统，激励玩家探索游戏内容。

**成就分类**：

| 分类 | 成就数量 | 解锁难度 |
|------|----------|----------|
| 速度恶魔 | 5 | 中等 |
| 完美主义 | 5 | 中等 |
| 坚持不懈 | 5 | 困难 |
| 数字大师 | 5 | 困难 |
| 社交达人 | 3 | 中等 |
| 收藏家 | 5 | 简单 |

**成就示例**：

| 名称 | 描述 | 条件 | 奖励 |
|-----|------|------|------|
| 连续作战 | 连续玩10局 | 10局不间断 | 300金币 |
| 轻松搞定 | 5秒内完成第一关 | 第一关<5秒 | 500金币 |
| 超凡速度 | 3秒内完成第一关 | 第一关<3秒 | 1000金币 |
| 连击新星 | 在第二关达成5连击 | 在第二关达成5连击 | 500金币 |
| 连击大师 | 在第二关达成10连击 | 在第二关达成10连击 | 1000金币 |
| 连击狂魔 | 在第二关达成20连击 | 在第二关达成20连击 | 3000金币 |
| 超凡速度 | 3秒内完成第一关 | 第一关<3秒 | 1000金币 |
| 超凡速度 | 3秒内完成第一关 | 第一关<3秒 | 1000金币 |
| 超凡速度 | 3秒内完成第一关 | 第一关<3秒 | 1000金币 |
| 完美无缺 | 零第二关100%准确率完成 | 第二关卡零错误 | 500金币 |
| 速度达人 | 300内完成第二关 | 300内完成第二关 | 1000金币 |
| 第二关挑战 | 完成第二关 | 完成第二关 | 800金币 |
| 自由探索 | 在自由模式下完成第二关 | 在自由模式下完成第二关 | 500金币 |
| 数一数噻大师 | 累计游戏100次 | 累计游戏100次 | 800金币 |

#### 3.2.2 技术实现

```javascript
class AchievementManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.achievements = new Map();
    this.unlockedAchievements = new Set();
    this.progress = new Map();
    this.initAchievements();
    this.loadProgress();
  }

  initAchievements() {
    this.achievements.set('A002', {
      id: 'A002',
      name: '入门选手',
      description: '完成10次游戏',
      category: 'beginner',
      condition: { type: 'games_completed', count: 10 },
      reward: { type: 'coins', amount: 200 },
      icon: '🎮'
    });

    this.achievements.set('A003', {
      id: 'A003',
      name: '连续作战',
      description: '连续玩5局',
      category: 'beginner',
      condition: { type: 'consecutive_games', count: 5 },
      reward: { type: 'coins', amount: 300 },
      icon: '🔥'
    });

    this.achievements.set('A004', {
      id: 'A004',
      name: '轻松搞定',
      description: '10秒内完成第一关',
      category: 'speed',
      condition: { type: 'fast_complete', level: 1, maxTime: 10 },
      reward: { type: 'coins', amount: 500 },
      icon: '⚡'
    });

    this.achievements.set('A005', {
      id: 'A005',
      name: '超凡速度',
      description: '5秒内完成第一关',
      category: 'speed',
      condition: { type: 'fast_complete', level: 1, maxTime: 5 },
      reward: { type: 'coins', amount: 1000 },
      icon: '🚀'
    });

    this.achievements.set('A101', {
      id: 'A101',
      name: '完美无缺',
      description: '零错误完成关卡',
      category: 'perfect',
      condition: { type: 'perfect_game' },
      reward: { type: 'coins', amount: 500 },
      icon: '✨'
    });

    this.achievements.set('A201', {
      id: 'A201',
      name: '连击新手',
      description: '达到5连击',
      category: 'combo',
      condition: { type: 'combo', count: 5 },
      reward: { type: 'coins', amount: 200 },
      icon: '🔥'
    });

    this.achievements.set('A202', {
      id: 'A202',
      name: '连击高手',
      description: '达到20连击',
      category: 'combo',
      condition: { type: 'combo', count: 20 },
      reward: { type: 'coins', amount: 1000 },
      icon: '💥'
    });
  }

  checkAchievement(eventType, data) {
    for (const [id, achievement] of this.achievements) {
      if (this.unlockedAchievements.has(id)) continue;

      if (this.checkCondition(achievement.condition, eventType, data)) {
        this.unlockAchievement(id);
      }
    }
  }

  checkCondition(condition, eventType, data) {
    switch (condition.type) {
      case 'level_complete':
        return eventType === 'level_complete' && data.level >= condition.level;

      case 'games_completed':
        if (eventType === 'game_complete') {
          const current = this.progress.get('games_completed') || 0;
          this.progress.set('games_completed', current + 1);
          return this.progress.get('games_completed') >= condition.count;
        }
        return false;

      case 'consecutive_games':
        if (eventType === 'game_complete') {
          const current = this.progress.get('consecutive_games') || 0;
          this.progress.set('consecutive_games', current + 1);
          return this.progress.get('consecutive_games') >= condition.count;
        } else if (eventType === 'game_fail') {
          this.progress.set('consecutive_games', 0);
        }
        return false;

      case 'fast_complete':
        return eventType === 'level_complete' &&
               data.level === condition.level &&
               data.time <= condition.maxTime;

      case 'perfect_game':
        return eventType === 'level_complete' && data.errors === 0;

      case 'combo':
        return eventType === 'combo' && data.count >= condition.count;

      default:
        return false;
    }
  }

  unlockAchievement(id) {
    const achievement = this.achievements.get(id);
    if (!achievement || this.unlockedAchievements.has(id)) return;

    this.unlockedAchievements.add(id);
    this.giveReward(achievement.reward);
    this.saveProgress();

    this.gameManager.ui.showAchievementUnlock(achievement);
  }

  giveReward(reward) {
    switch (reward.type) {
      case 'coins':
        this.gameManager.player.addCoins(reward.amount);
        break;
      case 'item':
        this.gameManager.player.addItem(reward.itemId, reward.amount);
        break;
      case 'skin':
        this.gameManager.player.unlockSkin(reward.skinId);
        break;
    }
  }

  saveProgress() {
    const data = {
      unlockedAchievements: Array.from(this.unlockedAchievements),
      progress: Array.from(this.progress.entries())
    };
    wx.setStorageSync('achievement_progress', JSON.stringify(data));
  }

  loadProgress() {
    try {
      const data = wx.getStorageSync('achievement_progress');
      if (data) {
        const parsed = JSON.parse(data);
        this.unlockedAchievements = new Set(parsed.unlockedAchievements);
        this.progress = new Map(parsed.progress);
      }
    } catch (error) {
      console.error('Failed to load achievement progress:', error);
    }
  }

  getAchievementProgress(id) {
    const achievement = this.achievements.get(id);
    if (!achievement) return null;

    return {
      achievement,
      unlocked: this.unlockedAchievements.has(id),
      progress: this.progress.get(this.getProgressKey(achievement.condition)) || 0,
      target: this.getProgressTarget(achievement.condition)
    };
  }

  getProgressKey(condition) {
    return `${condition.type}_${condition.level || ''}_${condition.count || ''}`;
  }

  getProgressTarget(condition) {
    return condition.count || condition.level || 1;
  }

  getUnlockedCount() {
    return this.unlockedAchievements.size;
  }

  getTotalCount() {
    return this.achievements.size;
  }
}
```

#### 3.2.3 预期效果

- 提供长期目标
- 增加游戏深度
- 激励玩家探索不同玩法

#### 3.2.4 潜在风险

- 成就过多可能让玩家感到压力
- 成就条件不明确

**风险缓解**：
- 成就分类清晰
- 条件描述明确
- 提供进度提示

---

### 3.3 皮肤系统

#### 3.3.1 设计说明

引入皮肤系统，允许玩家自定义游戏外观。

**皮肤类型**：

| 类型 | 说明 | 数量 |
|------|------|------|
| 多边形主题 | 多边形颜色方案 | 10+ |
| 数字字体 | 数字显示字体 | 8+ |
| 背景主题 | 游戏背景样式 | 6+ |
| 音效包 | 游戏音效风格 | 5+ |
| 完整主题 | 整体视觉风格 | 5+ |

**皮肤获取方式**：
- 默认皮肤：免费
- 付费皮肤：100-500金币
- 成就解锁：完成特定成就
- 活动奖励：参与活动获得

**皮肤示例**：

| ID | 名称 | 类型 | 价格 | 描述 |
|----|------|------|------|------|
| S001 | 经典蓝 | 多边形 | 免费 | 经典蓝色系 |
| S002 | 热情红 | 多边形 | 200金币 | 热情红色系 |
| S003 | 自然绿 | 多边形 | 200金币 | 清新绿色系 |
| S004 | 神秘紫 | 多边形 | 300金币 | 神秘紫色系 |
| S005 | 黑夜主题 | 背景 | 500金币 | 暗黑风格背景 |
| S006 | 粉色少女 | 主题 | 800金币 | 可爱粉色系 |

#### 3.3.2 技术实现

```javascript
class SkinManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.skins = new Map();
    this.unlockedSkins = new Set();
    this.currentSkins = {
      polygon: 'S001',
      font: 'F001',
      background: 'B001',
      theme: 'T001'
    };
    this.initSkins();
    this.loadProgress();
  }

  initSkins() {
    this.skins.set('S001', {
      id: 'S001',
      name: '经典蓝',
      type: 'polygon',
      price: 0,
      colors: ['#3B82F6', '#60A5FA', '#93C5FD'],
      default: true
    });

    this.skins.set('S002', {
      id: 'S002',
      name: '热情红',
      type: 'polygon',
      price: 200,
      colors: ['#EF4444', '#F87171', '#FCA5A5'],
      achievement: null
    });

    this.skins.set('S005', {
      id: 'S005',
      name: '黑夜主题',
      type: 'background',
      price: 500,
      backgroundColor: '#1E1B4B',
      gridColor: 'rgba(99, 102, 241, 0.1)',
      textColor: '#F8FAFC',
      achievement: null
    });

    this.skins.set('T001', {
      id: 'T001',
      name: '默认主题',
      type: 'theme',
      price: 0,
      polygonSkin: 'S001',
      fontSkin: 'F001',
      backgroundSkin: 'B001',
      soundPack: 'A001',
      default: true
    });
  }

  isUnlocked(skinId) {
    const skin = this.skins.get(skinId);
    if (!skin) return false;

    if (skin.default) return true;
    if (this.unlockedSkins.has(skinId)) return true;
    if (skin.achievement) {
      return this.gameManager.achievementManager.unlockedAchievements.has(skin.achievement);
    }
    return false;
  }

  canPurchase(skinId) {
    const skin = this.skins.get(skinId);
    if (!skin) return false;

    if (this.isUnlocked(skinId)) return false;
    if (skin.price > 0 && skin.price <= this.gameManager.player.getCoins()) {
      return true;
    }
    return false;
  }

  purchase(skinId) {
    if (!this.canPurchase(skinId)) return false;

    const skin = this.skins.get(skinId);
    this.gameManager.player.removeCoins(skin.price);
    this.unlockedSkins.add(skinId);
    this.saveProgress();

    return true;
  }

  equip(skinId) {
    const skin = this.skins.get(skinId);
    if (!skin || !this.isUnlocked(skinId)) return false;

    if (skin.type === 'theme') {
      this.currentSkins.theme = skinId;
      this.currentSkins.polygon = skin.polygonSkin;
      this.currentSkins.font = skin.fontSkin;
      this.currentSkins.background = skin.backgroundSkin;
      if (skin.soundPack) {
        this.gameManager.soundManager.loadSoundPack(skin.soundPack);
      }
    } else {
      this.currentSkins[skin.type] = skinId;
    }

    this.saveProgress();
    this.applySkins();
    return true;
  }

  applySkins() {
    const polygonSkin = this.skins.get(this.currentSkins.polygon);
    const backgroundSkin = this.skins.get(this.currentSkins.background);

    if (polygonSkin) {
      Polygon.NUMBER_COLORS = polygonSkin.colors;
    }

    if (backgroundSkin) {
      this.gameManager.ui.setBackground(backgroundSkin);
    }
  }

  getCurrentSkin(type) {
    return this.currentSkins[type];
  }

  saveProgress() {
    const data = {
      unlockedSkins: Array.from(this.unlockedSkins),
      currentSkins: this.currentSkins
    };
    wx.setStorageSync('skin_progress', JSON.stringify(data));
  }

  loadProgress() {
    try {
      const data = wx.getStorageSync('skin_progress');
      if (data) {
        const parsed = JSON.parse(data);
        this.unlockedSkins = new Set(parsed.unlockedSkins);
        this.currentSkins = { ...this.currentSkins, ...parsed.currentSkins };
        this.applySkins();
      }
    } catch (error) {
      console.error('Failed to load skin progress:', error);
    }
  }

  getSkinsByType(type) {
    return Array.from(this.skins.values()).filter(skin => skin.type === type);
  }
}
```

#### 3.3.3 预期效果

- 增加个性化体验
- 提供额外的变现渠道
- 增强视觉多样性

#### 3.3.4 潜在风险

- 过度收费可能影响体验
- 皮肤效果影响可读性

**风险缓解**：
- 提供免费皮肤
- 保持默认皮肤清晰可读
- 支持试穿功能

---

### 3.4 每日挑战系统

#### 3.4.1 设计说明

每日挑战系统提供特殊的关卡和奖励，激励玩家每日登录。

**挑战类型**：

| 类型 | 说明 | 奖励 |
|------|------|------|
| 速度挑战 | 在限定时间内完成 | 金币+道具 |
| 精准挑战 | 零错误完成 | 金币+皮肤碎片 |
| 连击挑战 | 达到指定连击数 | 金币+特殊成就 |
| 模式挑战 | 特殊模式完成 | 金币+新道具 |

**每日挑战示例**：

| 日期 | 挑战名称 | 类型 | 条件 | 奖励 |
|------|----------|------|------|------|
| 1/1 | 新年冲刺 | 速度 | 50数字60秒内完成 | 300金币+1次提示灯 |
| 1/2 | 精准射手 | 精准 | 75数字零错误完成 | 500金币+皮肤碎片x5 |
| 1/3 | 连击大师 | 连击 | 单局达到25连击 | 400金币+新成就 |

**每日刷新**：每天凌晨0点刷新挑战

**连续登录奖励**：

| 天数 | 奖励 |
|------|------|
| 1天 | 100金币 |
| 3天 | 200金币+1次提示灯 |
| 7天 | 500金币+随机皮肤 |
| 14天 | 800金币+完整主题 |
| 21天 | 1000金币+特殊皮肤 |
| 30天 | 2000金币+限定皮肤 |

#### 3.4.2 技术实现

```javascript
class DailyChallengeManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.currentChallenge = null;
    this.completedChallenges = new Set();
    this.consecutiveDays = 0;
    this.lastLoginDate = null;
    this.initChallenges();
    this.loadProgress();
  }

  initChallenges() {
    this.challenges = [
      {
        id: 'speed_50_60',
        name: '速度挑战',
        description: '50个数字在60秒内完成',
        type: 'speed',
        condition: { count: 50, maxTime: 60 },
        reward: { coins: 300, items: [{ id: 'hint', count: 1 }] }
      },
      {
        id: 'perfect_75',
        name: '精准挑战',
        description: '75个数字零错误完成',
        type: 'perfect',
        condition: { count: 75, maxErrors: 0 },
        reward: { coins: 500, skinFragments: 5 }
      },
      {
        id: 'combo_25',
        name: '连击挑战',
        description: '单局达到25连击',
        type: 'combo',
        condition: { comboCount: 25 },
        reward: { coins: 400, achievement: 'A203' }
      }
    ];
  }

  checkDailyRefresh() {
    const today = this.getDateString();
    const lastDate = this.lastLoginDate;

    if (lastDate !== today) {
      this.refreshDailyChallenge();
      this.checkConsecutiveDays(today, lastDate);
      this.lastLoginDate = today;
      this.saveProgress();
    }
  }

  getDateString() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  checkConsecutiveDays(today, lastDate) {
    if (!lastDate) {
      this.consecutiveDays = 1;
      return;
    }

    const lastDateObj = new Date(lastDate);
    const todayObj = new Date(today);
    const diffDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      this.consecutiveDays++;
    } else if (diffDays > 1) {
      this.consecutiveDays = 1;
    }
  }

  refreshDailyChallenge() {
    this.completedChallenges.clear();

    const challengeIndex = Math.floor(Math.random() * this.challenges.length);
    this.currentChallenge = this.challenges[challengeIndex];
  }

  getCurrentChallenge() {
    return this.currentChallenge;
  }

  startChallenge() {
    if (!this.currentChallenge) return false;

    const challenge = this.currentChallenge;

    switch (challenge.type) {
      case 'speed':
        this.gameManager.initGame(
          challenge.condition.count,
          1,
          'countdown'
        );
        this.gameManager.timeLeft = challenge.condition.maxTime;
        break;

      case 'perfect':
        this.gameManager.initGame(
          challenge.condition.count,
          1,
          'timed'
        );
        break;

      case 'combo':
        this.gameManager.initGame(
          50,
          1,
          'timed'
        );
        break;
    }

    return true;
  }

  completeChallenge(success) {
    if (!this.currentChallenge) return;

    if (success) {
      this.completedChallenges.add(this.currentChallenge.id);
      this.giveReward(this.currentChallenge.reward);
      this.saveProgress();
      this.gameManager.ui.showChallengeComplete(this.currentChallenge);
    }
  }

  giveReward(reward) {
    if (reward.coins) {
      this.gameManager.player.addCoins(reward.coins);
    }

    if (reward.items) {
      reward.items.forEach(item => {
        this.gameManager.player.addItem(item.id, item.count);
      });
    }

    if (reward.achievement) {
      this.gameManager.achievementManager.unlockAchievement(reward.achievement);
    }

    if (reward.skinFragments) {
      this.gameManager.player.addSkinFragments(reward.skinFragments);
    }
  }

  getConsecutiveReward() {
    const rewards = [
      { days: 1, reward: { coins: 100 } },
      { days: 3, reward: { coins: 200, items: [{ id: 'hint', count: 1 }] } },
      { days: 7, reward: { coins: 500, skin: 'random' } },
      { days: 14, reward: { coins: 800, theme: 'T002' } },
      { days: 21, reward: { coins: 1000, skin: 'S010' } },
      { days: 30, reward: { coins: 2000, skin: 'S999' } }
    ];

    let lastReward = null;
    for (const reward of rewards) {
      if (this.consecutiveDays >= reward.days) {
        lastReward = reward;
      }
    }

    return lastReward;
  }

  claimConsecutiveReward() {
    const reward = this.getConsecutiveReward();
    if (!reward) return false;

    if (reward.reward.coins) {
      this.gameManager.player.addCoins(reward.reward.coins);
    }

    if (reward.reward.skin === 'random') {
      const availableSkins = this.gameManager.skinManager.getSkinsByType('polygon')
        .filter(s => !s.default && !this.gameManager.skinManager.isUnlocked(s.id));
      if (availableSkins.length > 0) {
        const skin = availableSkins[Math.floor(Math.random() * availableSkins.length)];
        this.gameManager.skinManager.unlockedSkins.add(skin.id);
      }
    }

    this.saveProgress();
    return true;
  }

  isChallengeCompleted() {
    return this.currentChallenge && this.completedChallenges.has(this.currentChallenge.id);
  }

  saveProgress() {
    const data = {
      currentChallenge: this.currentChallenge?.id,
      completedChallenges: Array.from(this.completedChallenges),
      consecutiveDays: this.consecutiveDays,
      lastLoginDate: this.lastLoginDate
    };
    wx.setStorageSync('daily_challenge_progress', JSON.stringify(data));
  }

  loadProgress() {
    try {
      const data = wx.getStorageSync('daily_challenge_progress');
      if (data) {
        const parsed = JSON.parse(data);
        this.completedChallenges = new Set(parsed.completedChallenges);
        this.consecutiveDays = parsed.consecutiveDays || 0;
        this.lastLoginDate = parsed.lastLoginDate;
        this.checkDailyRefresh();
      }
    } catch (error) {
      console.error('Failed to load daily challenge progress:', error);
    }
  }
}
```

#### 3.4.3 预期效果

- 提高日活
- 提供长期目标
- 增加游戏新鲜感

#### 3.4.4 潜在风险

- 挑战难度不当
- 玩家忘记登录

**风险缓解**：
- 难度自适应调整
- 提醒功能
- 连续登录奖励激励

---

### 3.5 副本系统

#### 3.5.1 设计说明

引入副本系统，提供特殊关卡和Boss战。

**副本类型**：

| 副本 | 关卡数 | 难度 | 奖励 |
|------|--------|------|------|
| 基础训练 | 5 | 简单 | 金币 |
| 进阶挑战 | 10 | 中等 | 金币+道具 |
| 大师试炼 | 15 | 困难 | 金币+皮肤 |
| 传说副本 | 20 | 极难 | 限定皮肤 |

**副本关卡设计**：

| 副本 | 关卡 | 特殊规则 | 目标 |
|------|------|----------|------|
| 进阶挑战-1 | 第1关 | 倒计时模式45秒 | 完成30数字 |
| 进阶挑战-2 | 第2关 | 记忆模式7秒记忆 | 完成40数字 |
| 进阶挑战-3 | 第3关 | 盲点模式圆形遮罩 | 完成50数字 |
| 进阶挑战-4 | 第4关 | 暴走模式自动激活 | 完成60数字 |

**Boss关卡**：
- 副本最后关为Boss关
- Boss关有特殊机制
- 通关Boss获得特殊奖励

#### 3.5.2 技术实现

```javascript
class DungeonManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.dungeons = new Map();
    this.completedDungeons = new Set();
    this.currentDungeon = null;
    this.currentLevel = 0;
    this.initDungeons();
    this.loadProgress();
  }

  initDungeons() {
    this.dungeons.set('basic', {
      id: 'basic',
      name: '基础训练',
      description: '新手入门副本',
      difficulty: 'easy',
      levelCount: 5,
      levels: [
        { count: 10, mode: 'timed', time: 60 },
        { count: 15, mode: 'timed', time: 60 },
        { count: 20, mode: 'timed', time: 60 },
        { count: 25, mode: 'timed', time: 60 },
        { count: 30, mode: 'timed', time: 60 }
      ],
      rewards: {
        coins: 500,
        items: [{ id: 'timeCapsule', count: 2 }]
      },
      bossLevel: 4,
      bossEffect: 'enlarged_numbers'
    });

    this.dungeons.set('advanced', {
      id: 'advanced',
      name: '进阶挑战',
      description: '进阶玩家挑战',
      difficulty: 'normal',
      levelCount: 10,
      levels: [
        { count: 30, mode: 'countdown', time: 45 },
        { count: 35, mode: 'memory', memoryTime: 7 },
        { count: 40, mode: 'blindspot', maskType: 'circle' },
        { count: 45, mode: 'frenzy', frenzyOnStart: true },
        { count: 50, mode: 'timed', time: 90 },
        { count: 55, mode: 'countdown', time: 40 },
        { count: 60, mode: 'memory', memoryTime: 5 },
        { count: 65, mode: 'blindspot', maskType: 'random' },
        { count: 70, mode: 'frenzy', frenzyOnCombo: 15 },
        { count: 75, mode: 'timed', time: 120 }
      ],
      rewards: {
        coins: 1000,
        items: [{ id: 'hint', count: 3 }, { id: 'freeze', count: 1 }],
        skin: 'S003'
      },
      bossLevel: 9,
      bossEffect: 'time_storm'
    });
  }

  startDungeon(dungeonId) {
    const dungeon = this.dungeons.get(dungeonId);
    if (!dungeon) return false;

    this.currentDungeon = dungeon;
    this.currentLevel = 0;
    return true;
  }

  startNextLevel() {
    if (!this.currentDungeon) return false;
    if (this.currentLevel >= this.currentDungeon.levelCount) {
      this.completeDungeon();
      return false;
    }

    const levelConfig = this.currentDungeon.levels[this.currentLevel];
    const isBoss = this.currentLevel === this.currentDungeon.bossLevel;

    switch (levelConfig.mode) {
      case 'timed':
        this.gameManager.initGame(levelConfig.count, 1, 'timed');
        this.gameManager.timeLeft = levelConfig.time || 60;
        break;

      case 'countdown':
        this.gameManager.initGame(levelConfig.count, 1, 'countdown');
        this.gameManager.timeLeft = levelConfig.time || 60;
        break;

      case 'memory':
        this.gameManager.memoryMode.initGame(levelConfig.count, levelConfig.memoryTime || 7);
        break;

      case 'blindspot':
        this.gameManager.blindSpotMode.initGame(levelConfig.count, levelConfig.maskType || 'circle');
        break;

      case 'frenzy':
        this.gameManager.initGame(levelConfig.count, 1, 'timed');
        if (levelConfig.frenzyOnStart) {
          this.gameManager.frenzyMode.activate();
        }
        if (levelConfig.frenzyOnCombo) {
          this.gameManager.frenzyMode.setComboThreshold(levelConfig.frenzyOnCombo);
        }
        break;
    }

    if (isBoss) {
      this.applyBossEffect(this.currentDungeon.bossEffect);
    }

    return true;
  }

  applyBossEffect(effect) {
    switch (effect) {
      case 'enlarged_numbers':
        this.gameManager.setNumberScale(1.5);
        break;

      case 'time_storm':
        this.gameManager.setTimeMultiplier(0.8);
        break;

      case 'blind_rage':
        this.gameManager.blindSpotMode.createMasks();
        break;
    }
  }

  onLevelComplete(success) {
    if (!this.currentDungeon) return;

    if (success) {
      this.currentLevel++;
      if (this.currentLevel >= this.currentDungeon.levelCount) {
        this.completeDungeon();
      }
    } else {
      this.currentLevel = 0;
    }

    this.saveProgress();
  }

  completeDungeon() {
    if (!this.currentDungeon) return;

    this.completedDungeons.add(this.currentDungeon.id);
    this.giveDungeonRewards(this.currentDungeon);
    this.saveProgress();

    this.gameManager.ui.showDungeonComplete(this.currentDungeon);
    this.currentDungeon = null;
    this.currentLevel = 0;
  }

  giveDungeonRewards(dungeon) {
    if (dungeon.rewards.coins) {
      this.gameManager.player.addCoins(dungeon.rewards.coins);
    }

    if (dungeon.rewards.items) {
      dungeon.rewards.items.forEach(item => {
        this.gameManager.player.addItem(item.id, item.count);
      });
    }

    if (dungeon.rewards.skin) {
      this.gameManager.skinManager.unlockedSkins.add(dungeon.rewards.skin);
    }
  }

  isDungeonCompleted(dungeonId) {
    return this.completedDungeons.has(dungeonId);
  }

  getDungeonProgress(dungeonId) {
    const dungeon = this.dungeons.get(dungeonId);
    if (!dungeon) return null;

    return {
      completed: this.completedDungeons.has(dungeonId),
      currentLevel: this.currentDungeon?.id === dungeonId ? this.currentLevel : 0,
      totalLevels: dungeon.levelCount
    };
  }

  saveProgress() {
    const data = {
      completedDungeons: Array.from(this.completedDungeons),
      currentDungeon: this.currentDungeon?.id,
      currentLevel: this.currentLevel
    };
    wx.setStorageSync('dungeon_progress', JSON.stringify(data));
  }

  loadProgress() {
    try {
      const data = wx.getStorageSync('dungeon_progress');
      if (data) {
        const parsed = JSON.parse(data);
        this.completedDungeons = new Set(parsed.completedDungeons);
        this.currentLevel = parsed.currentLevel || 0;
        if (parsed.currentDungeon) {
          this.currentDungeon = this.dungeons.get(parsed.currentDungeon);
        }
      }
    } catch (error) {
      console.error('Failed to load dungeon progress:', error);
    }
  }
}
```

#### 3.5.3 预期效果

- 提供长期目标
- 增加游戏内容
- 提升玩家留存

#### 3.5.4 潜在风险

- 副本难度失衡
- 玩家卡在某一关

**风险缓解**：
- 提供跳过机制
- 难度自适应
- 提供攻略提示

---

## 4. 社交互动机制

### 4.1 好友对战

#### 4.1.1 设计说明

允许玩家与好友进行实时对战。

**对战模式**：

| 模式 | 说明 | 规则 |
|------|------|------|
| 同屏对战 | 同设备轮流玩 | 比较完成时间 |
| 异步对战 | 不同时间完成 | 比较分数 |
| 实时对战 | 同时在线对战 | 实时比拼进度 |

**对战流程**：
1. 邀请好友
2. 对方接受邀请
3. 开始对战
4. 实时显示双方进度（类似直播PK）
5. 对战结束显示结果

#### 4.1.2 技术实现

```javascript
class BattleManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.currentBattle = null;
    this.battleSocket = null;
  }

  inviteFriend(friendId, mode = 'async') {
    const battleId = this.generateBattleId();
    const battle = {
      id: battleId,
      mode: mode,
      creator: this.getUserId(),
      opponent: friendId,
      status: 'pending',
      createdAt: Date.now(),
      level: this.gameManager.currentLevel,
      polygonCount: this.gameManager.polygonCount
    };

    this.currentBattle = battle;
    this.saveBattle(battle);

    wx.shareAppMessage({
      title: '来和我对战吧！',
      path: `/pages/battle?id=${battleId}`,
      imageUrl: '/assets/battle-share.png'
    });

    return battleId;
  }

  acceptInvitation(battleId) {
    const battle = this.loadBattle(battleId);
    if (!battle || battle.status !== 'pending') return false;

    battle.status = 'accepted';
    battle.acceptedAt = Date.now();
    this.currentBattle = battle;
    this.saveBattle(battle);

    return true;
  }

  startBattle() {
    if (!this.currentBattle) return false;

    const battle = this.currentBattle;
    battle.status = 'in_progress';
    battle.startedAt = Date.now();
    this.saveBattle(battle);

    if (battle.mode === 'realtime') {
      this.connectBattleSocket(battle.id);
    }

    return true;
  }

  connectBattleSocket(battleId) {
    this.battleSocket = wx.connectSocket({
      url: `wss://api.example.com/battle/${battleId}`
    });

    this.battleSocket.onMessage((message) => {
      const data = JSON.parse(message.data);
      this.handleBattleMessage(data);
    });
  }

  handleBattleMessage(data) {
    switch (data.type) {
      case 'progress':
        this.gameManager.ui.updateOpponentProgress(data.progress, data.time);
        break;
      case 'complete':
        this.handleOpponentComplete(data);
        break;
    }
  }

  sendProgress(progress, time) {
    if (this.battleSocket && this.currentBattle?.mode === 'realtime') {
      this.battleSocket.send({
        data: JSON.stringify({
          type: 'progress',
          userId: this.getUserId(),
          progress,
          time
        })
      });
    }
  }

  sendComplete(time) {
    if (this.battleSocket) {
      this.battleSocket.send({
        data: JSON.stringify({
          type: 'complete',
          userId: this.getUserId(),
          time
        })
      });
    }

    this.currentBattle.creatorTime = time;
    this.saveBattle(this.currentBattle);
  }

  handleOpponentComplete(data) {
    this.currentBattle.opponentTime = data.time;
    this.currentBattle.status = 'waiting';
    this.saveBattle(this.currentBattle);
  }

  finishBattle() {
    if (!this.currentBattle) return;

    const battle = this.currentBattle;
    battle.status = 'completed';
    battle.completedAt = Date.now();

    const winner = battle.creatorTime < battle.opponentTime ? 'creator' : 'opponent';
    battle.winner = winner;

    this.saveBattle(battle);
    this.gameManager.ui.showBattleResult(battle);

    if (this.battleSocket) {
      this.battleSocket.close();
      this.battleSocket = null;
    }

    this.currentBattle = null;
  }

  generateBattleId() {
    return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  saveBattle(battle) {
    wx.setStorageSync(`battle_${battle.id}`, JSON.stringify(battle));
  }

  loadBattle(battleId) {
    try {
      const data = wx.getStorageSync(`battle_${battleId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load battle:', error);
      return null;
    }
  }

  getUserId() {
    let userId = wx.getStorageSync('user_id');
    if (!userId) {
      userId = 'user_' + Date.now();
      wx.setStorageSync('user_id', userId);
    }
    return userId;
  }
}
```

#### 4.1.3 预期效果

- 增加社交互动
- 提高用户留存
- 促进病毒传播

#### 4.1.4 潜在风险

- 网络问题影响体验
- 匹配机制问题

**风险缓解**：
- 支持异步对战
- 优化网络连接
- 提供离线模式

---

### 4.2 房间挑战

#### 4.2.1 设计说明

允许玩家创建房间，邀请好友一起挑战（或一起合作）。

**房间类型**：

| 类型 | 说明 | 人数限制 |
|------|------|----------|
| 私有房间 | 仅限邀请 | 2-4人 |
| 公开房间 | 任何人可加入 | 2-8人 |
| 排位房间 | 匹配实力相近 | 2人 |

**房间功能**：
- 实时聊天
- 观战模式
- 回放功能

#### 4.2.2 技术实现

```javascript
class RoomManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.currentRoom = null;
    this.roomSocket = null;
    this.rooms = [];
  }

  createRoom(type = 'private', maxPlayers = 4) {
    const roomId = this.generateRoomId();
    const room = {
      id: roomId,
      type: type,
      host: this.getUserId(),
      hostName: this.getUserName(),
      maxPlayers: maxPlayers,
      players: [{ id: this.getUserId(), name: this.getUserName(), status: 'ready' }],
      status: 'waiting',
      createdAt: Date.now()
    };

    this.currentRoom = room;
    this.connectRoomSocket(roomId);
    this.saveRoom(room);

    return roomId;
  }

  joinRoom(roomId) {
    const room = this.loadRoom(roomId);
    if (!room) return false;
    if (room.players.length >= room.maxPlayers) return false;

    const player = {
      id: this.getUserId(),
      name: this.getUserName(),
      status: 'ready'
    };

    room.players.push(player);
    this.saveRoom(room);
    this.currentRoom = room;
    this.connectRoomSocket(roomId);

    return true;
  }

  startGame() {
    if (!this.currentRoom) return;
    if (this.currentRoom.host !== this.getUserId()) return;

    this.currentRoom.status = 'in_progress';
    this.currentRoom.startedAt = Date.now();
    this.saveRoom(this.currentRoom);

    this.roomSocket.send({
      data: JSON.stringify({
        type: 'start_game',
        room: this.currentRoom
      })
    });
  }

  handleRoomMessage(data) {
    switch (data.type) {
      case 'player_joined':
        this.handlePlayerJoined(data.player);
        break;
      case 'player_left':
        this.handlePlayerLeft(data.playerId);
        break;
      case 'player_progress':
        this.handlePlayerProgress(data);
        break;
      case 'player_complete':
        this.handlePlayerComplete(data);
        break;
      case 'start_game':
        this.handleGameStart(data.room);
        break;
      case 'chat_message':
        this.handleChatMessage(data);
        break;
    }
  }

  sendChatMessage(message) {
    if (!this.roomSocket) return;

    this.roomSocket.send({
      data: JSON.stringify({
        type: 'chat_message',
        userId: this.getUserId(),
        userName: this.getUserName(),
        message,
        timestamp: Date.now()
      })
    });
  }

  sendProgress(progress, time) {
    if (!this.roomSocket) return;

    this.roomSocket.send({
      data: JSON.stringify({
        type: 'player_progress',
        userId: this.getUserId(),
        progress,
        time
      })
    });
  }

  leaveRoom() {
    if (!this.currentRoom) return;

    if (this.roomSocket) {
      this.roomSocket.send({
        data: JSON.stringify({
          type: 'player_left',
          userId: this.getUserId()
        })
      });
      this.roomSocket.close();
      this.roomSocket = null;
    }

    this.currentRoom = null;
  }

  generateRoomId() {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  saveRoom(room) {
    wx.setStorageSync(`room_${room.id}`, JSON.stringify(room));
  }

  loadRoom(roomId) {
    try {
      const data = wx.getStorageSync(`room_${roomId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load room:', error);
      return null;
    }
  }

  connectRoomSocket(roomId) {
    this.roomSocket = wx.connectSocket({
      url: `wss://api.example.com/room/${roomId}`
    });

    this.roomSocket.onMessage((message) => {
      const data = JSON.parse(message.data);
      this.handleRoomMessage(data);
    });
  }

  getUserId() {
    let userId = wx.getStorageSync('user_id');
    if (!userId) {
      userId = 'user_' + Date.now();
      wx.setStorageSync('user_id', userId);
    }
    return userId;
  }

  getUserName() {
    return wx.getStorageSync('user_name') || '玩家';
  }
}
```

#### 4.2.3 预期效果

- 增加多人游戏乐趣
- 提升社交互动
- 促进用户邀请好友

#### 4.2.4 潜在风险

- 房间匹配问题
- 网络延迟影响体验

**风险缓解**：
- 优化匹配算法
- 支持房间密码
- 提供网络状态提示

---

### 4.3 社交分享

#### 4.3.1 设计说明

优化分享功能，促进病毒传播。

**分享类型**：

| 类型 | 内容 | 场景 |
|------|------|------|
| 成绩分享 | 游戏成绩截图 | 关卡完成 |
| 挑战分享 | 邀请好友挑战 | 新纪录 |
| 成就分享 | 解锁成就通知 | 成就解锁 |
| 邀请分享 | 游戏邀请链接 | 主动邀请 |

**分享文案示例**：

| 场景 | 文案 |
|------|------|
| 关卡完成 | 我在第X关用时XX秒！快来挑战我吧！ |
| 新纪录 | 创造新纪录！第X关XX秒通关！ |
| 成就解锁 | 解锁成就「XXX」！看看你能解锁几个？ |
| 邀请好友 | 发现一款超好玩的游戏，一起来玩吧！ |

#### 4.3.2 技术实现

```javascript
class ShareManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.shareTemplates = {
      level_complete: [
        '我在第{level}关用时{time}秒！快来挑战我吧！',
        '第{level}关挑战成功！用时{time}秒，你能更快吗？',
        '数一数噻第{level}关{time}秒通关，来比一比！'
      ],
      new_record: [
        '创造新纪录！第{level}关{time}秒通关！',
        '新纪录诞生！第{level}关{time}秒完成！',
        '超越自我！第{level}关{time}秒打破记录！'
      ],
      achievement_unlock: [
        '解锁成就「{achievement}」！看看你能解锁几个？',
        '成就达成！获得「{achievement}」徽章！',
        '「{achievement}」成就已解锁，快来挑战吧！'
      ],
      invite: [
        '发现一款超好玩的游戏，一起来玩吧！',
        '数一数噻，考验反应和数字认知的游戏！',
        '来挑战数一数噻，看看你能多快完成！'
      ]
    };
  }

  shareLevelComplete(level, time, count) {
    const template = this.getRandomTemplate('level_complete');
    const title = template
      .replace('{level}', level)
      .replace('{time}', time.toFixed(2));

    wx.shareAppMessage({
      title: title,
      path: `/pages/index/index?level=${level}`,
      imageUrl: this.generateShareImage(level, time, count)
    });
  }

  shareNewRecord(level, time, count) {
    const template = this.getRandomTemplate('new_record');
    const title = template
      .replace('{level}', level)
      .replace('{time}', time.toFixed(2));

    wx.shareAppMessage({
      title: title,
      path: `/pages/index/index?level=${level}`,
      imageUrl: this.generateShareImage(level, time, count, true)
    });
  }

  shareAchievement(achievement) {
    const template = this.getRandomTemplate('achievement_unlock');
    const title = template.replace('{achievement}', achievement.name);

    wx.shareAppMessage({
      title: title,
      path: `/pages/index/index`,
      imageUrl: this.generateAchievementImage(achievement)
    });
  }

  shareInvite() {
    const template = this.getRandomTemplate('invite');

    wx.shareAppMessage({
      title: template,
      path: `/pages/index/index?from=${this.getUserId()}`,
      imageUrl: '/assets/invite-share.png'
    });
  }

  getRandomTemplate(type) {
    const templates = this.shareTemplates[type];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateShareImage(level, time, count, isRecord = false) {
    const canvas = wx.createOffscreenCanvas(400, 300);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('数一数噻', 200, 50);

    ctx.fillStyle = '#64748B';
    ctx.font = '18px sans-serif';
    ctx.fillText(`第${level}关`, 200, 90);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${time.toFixed(2)}秒`, 200, 140);

    ctx.fillStyle = '#64748B';
    ctx.font = '16px sans-serif';
    ctx.fillText(`${count}个数字`, 200, 170);

    if (isRecord) {
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('新纪录！', 200, 210);
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px sans-serif';
    ctx.fillText('长按识别二维码', 200, 260);

    return canvas.toDataURL();
  }

  generateAchievementImage(achievement) {
    const canvas = wx.createOffscreenCanvas(400, 300);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('成就解锁', 200, 60);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(achievement.icon, 200, 130);

    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(achievement.name, 200, 180);

    ctx.fillStyle = '#64748B';
    ctx.font = '14px sans-serif';
    ctx.fillText(achievement.description, 200, 210);

    return canvas.toDataURL();
  }

  getUserId() {
    let userId = wx.getStorageSync('user_id');
    if (!userId) {
      userId = 'user_' + Date.now();
      wx.setStorageSync('user_id', userId);
    }
    return userId;
  }
}
```

#### 4.3.3 预期效果

- 促进病毒传播
- 提高用户增长
- 增强社交属性

#### 4.3.4 潜在风险

- 过度打扰用户
- 分享内容不吸引人

**风险缓解**：
- 分享时机合理
- 内容多样化
- 避免强制分享

---

### 4.4 排行榜增强

#### 4.4.1 设计说明

增强现有排行榜功能，增加更多维度和互动。

**排行榜类型**：

| 类型 | 说明 | 数据来源 |
|------|------|----------|
| 好友榜 | 好友排名 | 微信好友数据 |
| 世界榜 | 全球排名 | 云存储数据 |
| 周榜 | 本周排名 | 本周数据 |
| 历史榜 | 历史最高 | 历史记录 |

**排行榜功能**：
- 实时更新
- 排名变化动画
- 好友对比
- 分享成绩

#### 4.4.2 技术实现

```javascript
class EnhancedRankManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.rankType = 'friends';
    this.ranks = new Map();
    this.myRank = null;
  }

  async loadRanks(type = 'friends') {
    this.rankType = type;

    switch (type) {
      case 'friends':
        await this.loadFriendRanks();
        break;
      case 'world':
        await this.loadWorldRanks();
        break;
      case 'weekly':
        await this.loadWeeklyRanks();
        break;
      case 'history':
        await this.loadHistoryRanks();
        break;
    }
  }

  async loadFriendRanks() {
    return new Promise((resolve, reject) => {
      wx.getFriendCloudStorage({
        keyList: ['score', 'time', 'level'],
        success: (res) => {
          const ranks = res.data.map(item => ({
            avatarUrl: item.avatarUrl,
            nickname: item.nickname,
            score: parseInt(item.KVDataList.find(d => d.key === 'score')?.value || '0'),
            time: parseFloat(item.KVDataList.find(d => d.key === 'time')?.value || '0'),
            level: parseInt(item.KVDataList.find(d => d.key === 'level')?.value || '1')
          })).sort((a, b) => b.score - a.score);

          this.ranks.set('friends', ranks);
          this.myRank = this.findMyRank(ranks);
          resolve(ranks);
        },
        fail: reject
      });
    });
  }

  async loadWorldRanks() {
    const response = await fetch('https://api.example.com/ranks/world');
    const ranks = await response.json();
    this.ranks.set('world', ranks);
    this.myRank = this.findMyRank(ranks);
    return ranks;
  }

  async loadWeeklyRanks() {
    const response = await fetch('https://api.example.com/ranks/weekly');
    const ranks = await response.json();
    this.ranks.set('weekly', ranks);
    this.myRank = this.findMyRank(ranks);
    return ranks;
  }

  async loadHistoryRanks() {
    const history = wx.getStorageSync('history_ranks') || [];
    this.ranks.set('history', history);
    return history;
  }

  findMyRank(ranks) {
    const myId = this.getUserId();
    return ranks.findIndex(r => r.id === myId) + 1;
  }

  getRanks(type) {
    return this.ranks.get(type) || [];
  }

  getMyRank(type) {
    if (type === this.rankType) {
      return this.myRank;
    }
    return null;
  }

  async uploadScore(score, time, level) {
    await wx.setUserCloudStorage({
      KVDataList: [
        { key: 'score', value: score.toString() },
        { key: 'time', value: time.toString() },
        { key: 'level', value: level.toString() }
      ]
    });

    await this.uploadToServer(score, time, level);
  }

  async uploadToServer(score, time, level) {
    await fetch('https://api.example.com/ranks/upload', {
      method: 'POST',
      body: JSON.stringify({
        userId: this.getUserId(),
        userName: this.getUserName(),
        score,
        time,
        level
      })
    });
  }

  getUserId() {
    let userId = wx.getStorageSync('user_id');
    if (!userId) {
      userId = 'user_' + Date.now();
      wx.setStorageSync('user_id', userId);
    }
    return userId;
  }

  getUserName() {
    return wx.getStorageSync('user_name') || '玩家';
  }
}
```

#### 4.4.3 预期效果

- 增强竞争感
- 提供更多目标
- 提升玩家活跃度

#### 4.4.4 潜在风险

- 排行榜数据不准确
- 作弊问题

**风险缓解**：
- 数据加密
- 异常检测
- 举报机制

---

### 4.5 礼物系统

#### 4.5.1 设计说明

允许玩家之间互赠礼物。

**礼物类型**：

| 类型 | 效果 | 价格 |
|------|------|------|
| 金币礼物 | 赠送金币 | 100-1000金币 |
| 道具礼物 | 赠送道具 | 相应道具 |
| 皮肤礼物 | 赠送皮肤 | 相应皮肤 |
| 爱心礼物 | 增加好感度 | 免费 |

**礼物功能**：
- 收到礼物通知
- 礼物历史记录
- 回赠功能

#### 4.5.2 技术实现

```javascript
class GiftManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.gifts = new Map();
    this.receivedGifts = [];
    this.sentGifts = [];
    this.initGifts();
    this.loadGiftHistory();
  }

  initGifts() {
    this.gifts.set('coins_100', {
      id: 'coins_100',
      name: '金币礼包',
      type: 'coins',
      amount: 100,
      icon: '💰',
      price: 0
    });

    this.gifts.set('item_hint', {
      id: 'item_hint',
      name: '提示灯',
      type: 'item',
      itemId: 'hint',
      count: 1,
      icon: '💡',
      price: 200
    });

    this.gifts.set('skin_random', {
      id: 'skin_random',
      name: '随机皮肤',
      type: 'skin',
      skinType: 'random',
      icon: '🎨',
      price: 500
    });

    this.gifts.set('heart', {
      id: 'heart',
      name: '爱心',
      type: 'heart',
      affection: 1,
      icon: '❤️',
      price: 0
    });
  }

  async sendGift(friendId, giftId) {
    const gift = this.gifts.get(giftId);
    if (!gift) return false;

    const player = this.gameManager.player;

    switch (gift.type) {
      case 'coins':
        if (player.getCoins() < gift.amount) return false;
        player.removeCoins(gift.amount);
        break;

      case 'item':
        if (!player.hasItem(gift.itemId, gift.count)) return false;
        player.removeItem(gift.itemId, gift.count);
        break;

      case 'skin':
        if (gift.skinType === 'random') {
          if (player.getCoins() < gift.price) return false;
          player.removeCoins(gift.price);
        }
        break;
    }

    const giftRecord = {
      id: this.generateGiftId(),
      from: this.getUserId(),
      fromName: this.getUserName(),
      to: friendId,
      giftId,
      gift,
      timestamp: Date.now(),
      status: 'sent'
    };

    this.sentGifts.push(giftRecord);

    await fetch('https://api.example.com/gifts/send', {
      method: 'POST',
      body: JSON.stringify(giftRecord)
    });

    this.saveGiftHistory();
    return true;
  }

  async receiveGift(giftRecord) {
    const player = this.gameManager.player;

    switch (giftRecord.gift.type) {
      case 'coins':
        player.addCoins(giftRecord.gift.amount);
        break;

      case 'item':
        player.addItem(giftRecord.gift.itemId, giftRecord.gift.count);
        break;

      case 'skin':
        const availableSkins = this.gameManager.skinManager.getSkinsByType('polygon')
          .filter(s => !s.default && !this.gameManager.skinManager.isUnlocked(s.id));
        if (availableSkins.length > 0) {
          const skin = availableSkins[Math.floor(Math.random() * availableSkins.length)];
          this.gameManager.skinManager.unlockedSkins.add(skin.id);
        }
        break;

      case 'heart':
        player.addAffection(giftRecord.from, giftRecord.gift.affection);
        break;
    }

    giftRecord.status = 'received';
    this.receivedGifts.push(giftRecord);
    this.saveGiftHistory();

    this.gameManager.ui.showGiftReceived(giftRecord);
  }

  getReceivedGifts() {
    return this.receivedGifts.filter(g => g.status === 'received');
  }

  getSentGifts() {
    return this.sentGifts;
  }

  canSendGift(giftId) {
    const gift = this.gifts.get(giftId);
    if (!gift) return false;

    const player = this.gameManager.player;

    switch (gift.type) {
      case 'coins':
        return player.getCoins() >= gift.amount;

      case 'item':
        return player.hasItem(gift.itemId, gift.count);

      case 'skin':
        if (gift.skinType === 'random') {
          return player.getCoins() >= gift.price;
        }
        return true;

      default:
        return true;
    }
  }

  generateGiftId() {
    return `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  saveGiftHistory() {
    const data = {
      receivedGifts: this.receivedGifts.slice(-100),
      sentGifts: this.sentGifts.slice(-100)
    };
    wx.setStorageSync('gift_history', JSON.stringify(data));
  }

  loadGiftHistory() {
    try {
      const data = wx.getStorageSync('gift_history');
      if (data) {
        const parsed = JSON.parse(data);
        this.receivedGifts = parsed.receivedGifts || [];
        this.sentGifts = parsed.sentGifts || [];
      }
    } catch (error) {
      console.error('Failed to load gift history:', error);
    }
  }

  getUserId() {
    let userId = wx.getStorageSync('user_id');
    if (!userId) {
      userId = 'user_' + Date.now();
      wx.setStorageSync('user_id', userId);
    }
    return userId;
  }

  getUserName() {
    return wx.getStorageSync('user_name') || '玩家';
  }
}
```

#### 4.5.3 预期效果

- 增强社交互动
- 提升用户粘性
- 促进礼物经济

#### 4.5.4 潜在风险

- 礼物滥用
- 经济系统失衡

**风险缓解**：
- 礼物发送限制
- 礼物价值限制
- 监控异常行为

---

## 5. 关卡设计思路

### 5.1 关卡体系架构

#### 5.1.1 关卡结构

```
关卡体系
├── 主线关卡 (1-50关)
│   ├── 入门教学 (1-5关)
│   ├── 基础挑战 (6-20关)
│   ├── 进阶挑战 (21-40关)
│   └── 大师挑战 (41-50关)
├── 特殊关卡
│   ├── 限时关卡
│   ├── 记忆关卡
│   └── 盲点关卡
└── 活动关卡
    ├── 节日关卡
    └── 主题活动
```

#### 5.1.2 关卡配置

```javascript
class LevelConfig {
  static getLevels() {
    return {
      main: this.getMainLevels(),
      special: this.getSpecialLevels(),
      event: this.getEventLevels()
    };
  }

  static getMainLevels() {
    return [
      // 入门教学 (1-5关)
      { id: 1, name: '初识数字', count: 10, mode: 'timed', time: 60, difficulty: 'easy' },
      { id: 2, name: '快速反应', count: 15, mode: 'timed', time: 60, difficulty: 'easy' },
      { id: 3, name: '数字迷宫', count: 20, mode: 'timed', time: 60, difficulty: 'easy' },
      { id: 4, name: '速度提升', count: 25, mode: 'timed', time: 60, difficulty: 'normal' },
      { id: 5, name: '毕业考试', count: 30, mode: 'timed', time: 60, difficulty: 'normal' },

      // 基础挑战 (6-20关)
      { id: 6, name: '挑战开始', count: 30, mode: 'timed', time: 50, difficulty: 'normal' },
      { id: 7, name: '时间压力', count: 35, mode: 'countdown', time: 45, difficulty: 'normal' },
      { id: 8, name: '记忆考验', count: 30, mode: 'memory', memoryTime: 8, difficulty: 'normal' },
      { id: 9, name: '数字暴增', count: 40, mode: 'timed', time: 60, difficulty: 'normal' },
      { id: 10, name: '十连击', count: 45, mode: 'timed', time: 60, difficulty: 'normal', targetCombo: 10 },

      // ... 更多关卡配置
    ];
  }

  static getSpecialLevels() {
    return [
      { id: 'S001', name: '闪电战', count: 50, mode: 'countdown', time: 30, type: 'timed' },
      { id: 'S002', name: '记忆大师', count: 40, mode: 'memory', memoryTime: 3, type: 'memory' },
      { id: 'S003', name: '盲点挑战', count: 60, mode: 'blindspot', maskType: 'random', type: 'blindspot' }
    ];
  }

  static getEventLevels() {
    return [
      { id: 'E001', name: '新年挑战', count: 100, mode: 'timed', time: 120, event: 'new_year', startDate: '2024-01-01', endDate: '2024-01-07' },
      { id: 'E002', name: '情人节', count: 66, mode: 'timed', time: 66, event: 'valentine', startDate: '2024-02-14', endDate: '2024-02-14' }
    ];
  }
}
```

### 5.2 关卡类型设计

#### 5.2.1 主线关卡

**设计原则**：
- 难度逐步递增
- 教学循序渐进
- 多样化游戏模式

**关卡节奏**：
```
难度曲线
  ^
  |         _______
  |        /       \
  |       /         \
  |   ___/           \___
  |__/                   \_______
  |_________________________________> 关卡
   1    10   20   30   40    50
```

#### 5.2.2 特殊关卡

**限时关卡**：
- 固定时间完成
- 时间紧凑
- 奖励丰厚

**记忆关卡**：
- 数字隐藏
- 考验记忆
- 提示有限

**盲点关卡**：
- 遮挡视线
- 空间预判
- 难度较高

#### 5.2.3 活动关卡

**节日关卡**：
- 节日主题
- 限时开放
- 特殊奖励

**主题活动**：
- 挑战任务
- 排行榜活动
- 社交活动

### 5.3 难度曲线设计

#### 5.3.1 难度因子

| 因子 | 权重 | 说明 |
|------|------|------|
| 数字数量 | 40% | 数量越多越难 |
| 时间限制 | 30% | 时间越短越难 |
| 特殊规则 | 20% | 特殊规则增加难度 |
| 多边形大小 | 10% | 越小越难 |

#### 5.3.2 难度计算

```javascript
class DifficultyCalculator {
  static calculate(levelConfig) {
    const countScore = this.getCountScore(levelConfig.count);
    const timeScore = this.getTimeScore(levelConfig.time, levelConfig.count);
    const modeScore = this.getModeScore(levelConfig.mode);
    const sizeScore = this.getSizeScore(levelConfig.difficulty);

    const totalScore = 
      countScore * 0.4 + 
      timeScore * 0.3 + 
      modeScore * 0.2 + 
      sizeScore * 0.1;

    return this.mapToDifficulty(totalScore);
  }

  static getCountScore(count) {
    if (count <= 10) return 0;
    if (count <= 25) return 1;
    if (count <= 50) return 2;
    if (count <= 75) return 3;
    return 4;
  }

  static getTimeScore(time, count) {
    const timePerNumber = time / count;
    if (timePerNumber >= 3) return 0;
    if (timePerNumber >= 2) return 1;
    if (timePerNumber >= 1.5) return 2;
    if (timePerNumber >= 1) return 3;
    return 4;
  }

  static getModeScore(mode) {
    const modeScores = {
      'timed': 1,
      'untimed': 0,
      'countdown': 3,
      'memory': 4,
      'blindspot': 3,
      'frenzy': 2
    };
    return modeScores[mode] || 1;
  }

  static getSizeScore(difficulty) {
    const difficultyScores = {
      'easy': 0,
      'normal': 1,
      'hard': 2,
      'expert': 3,
      'master': 4
    };
    return difficultyScores[difficulty] || 1;
  }

  static mapToDifficulty(score) {
    if (score <= 0.8) return 'easy';
    if (score <= 1.6) return 'normal';
    if (score <= 2.4) return 'hard';
    if (score <= 3.2) return 'expert';
    return 'master';
  }
}
```

### 5.4 特殊关卡设计

#### 5.4.1 Boss关卡

**Boss关卡特点**：
- 独特视觉风格
- 特殊规则组合
- Boss倒计时

**Boss示例**：

| Boss | 关卡 | 特殊效果 |
|------|------|----------|
| 速度之魔 | 20关 | 数字自动移动 |
| 记忆之灵 | 40关 | 记忆模式+盲点模式 |
| 时间之神 | 50关 | 时间忽快忽慢 |

#### 5.4.2 隐藏关卡

**解锁条件**：
- 零错误完成前置关卡
- 完成特定成就
- 收集所有隐藏数字

**隐藏关卡特点**：
- 高难度
- 特殊奖励
- 独特外观

---

## 6. 角色成长路径

### 6.1 等级系统

#### 6.1.1 等级设计

| 等级 | 名称 | 所需经验 | 解锁内容 |
|------|------|----------|----------|
| 1 | 菜鸟 | 0 | 基础游戏 |
| 2 | 学徒 | 100 | 提示灯道具 |
| 3 | 新手 | 300 | 倒计时模式 |
| 5 | 进阶 | 1000 | 记忆模式 |
| 10 | 高手 | 5000 | 盲点模式 |
| 15 | 大师 | 15000 | 副本系统 |
| 20 | 传奇 | 50000 | 限定皮肤 |
| 30 | 神话 | 200000 | 特殊称号 |

#### 6.1.2 经验获取

| 来源 | 经验值 |
|------|--------|
| 完成关卡 | 基础经验 × 难度系数 |
| 零错误完成 | 额外经验 |
| 创造记录 | 额外经验 |
| 解锁成就 | 固定经验 |
| 每日登录 | 每日经验 |

#### 6.1.3 技术实现

```javascript
class LevelSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.level = 1;
    this.experience = 0;
    this.totalExperience = 0;
    this.levelConfig = this.getLevelConfig();
    this.loadProgress();
  }

  getLevelConfig() {
    const config = new Map();

    for (let level = 1; level <= 50; level++) {
      const requiredExp = this.calculateRequiredExp(level);
      const rewards = this.getLevelRewards(level);
      config.set(level, { requiredExp, rewards });
    }

    return config;
  }

  calculateRequiredExp(level) {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  getLevelRewards(level) {
    const rewards = [];

    if (level === 2) rewards.push({ type: 'item', itemId: 'hint', count: 3 });
    if (level === 3) rewards.push({ type: 'unlock', content: 'countdown_mode' });
    if (level === 5) rewards.push({ type: 'unlock', content: 'memory_mode' });
    if (level === 10) rewards.push({ type: 'unlock', content: 'blindspot_mode' });
    if (level === 15) rewards.push({ type: 'unlock', content: 'dungeon_system' });
    if (level === 20) rewards.push({ type: 'skin', skinId: 'S020' });
    if (level === 30) rewards.push({ type: 'title', titleId: 'T001' });

    return rewards;
  }

  addExperience(amount, source = 'other') {
    const bonus = this.getExperienceBonus(source);
    const totalAmount = amount * bonus;

    this.experience += totalAmount;
    this.totalExperience += totalAmount;

    while (this.canLevelUp()) {
      this.levelUp();
    }

    this.saveProgress();
    this.gameManager.ui.showExperienceGain(totalAmount);
  }

  canLevelUp() {
    const levelData = this.levelConfig.get(this.level + 1);
    if (!levelData) return false;
    return this.experience >= levelData.requiredExp;
  }

  levelUp() {
    const nextLevelData = this.levelConfig.get(this.level + 1);
    this.experience -= nextLevelData.requiredExp;
    this.level++;

    this.giveLevelRewards(nextLevelData.rewards);
    this.gameManager.ui.showLevelUp(this.level, nextLevelData.rewards);
  }

  getExperienceBonus(source) {
    const bonuses = {
      'level_complete': 1.0,
      'perfect_game': 1.5,
      'new_record': 2.0,
      'achievement': 1.2,
      'daily_login': 1.0,
      'other': 1.0
    };
    return bonuses[source] || 1.0;
  }

  giveLevelRewards(rewards) {
    for (const reward of rewards) {
      switch (reward.type) {
        case 'coins':
          this.gameManager.player.addCoins(reward.amount);
          break;
        case 'item':
          this.gameManager.player.addItem(reward.itemId, reward.count);
          break;
        case 'skin':
          this.gameManager.skinManager.unlockedSkins.add(reward.skinId);
          break;
        case 'title':
          this.gameManager.player.unlockTitle(reward.titleId);
          break;
        case 'unlock':
          this.gameManager.unlockContent(reward.content);
          break;
      }
    }
  }

  getLevelProgress() {
    const levelData = this.levelConfig.get(this.level + 1);
    if (!levelData) {
      return { current: this.experience, required: 0, percent: 100 };
    }
    return {
      current: this.experience,
      required: levelData.requiredExp,
      percent: Math.floor((this.experience / levelData.requiredExp) * 100)
    };
  }

  saveProgress() {
    const data = {
      level: this.level,
      experience: this.experience,
      totalExperience: this.totalExperience
    };
    wx.setStorageSync('level_progress', JSON.stringify(data));
  }

  loadProgress() {
    try {
      const data = wx.getStorageSync('level_progress');
      if (data) {
        const parsed = JSON.parse(data);
        this.level = parsed.level || 1;
        this.experience = parsed.experience || 0;
        this.totalExperience = parsed.totalExperience || 0;
      }
    } catch (error) {
      console.error('Failed to load level progress:', error);
    }
  }
}
```

### 6.2 技能树系统

#### 6.2.1 技能分类

| 分类 | 技能数量 | 说明 |
|------|----------|------|
| 效率 | 5 | 提升游戏效率 |
| 时间 | 4 | 时间相关技能 |
| 精准 | 3 | 提升准确性 |
| 辅助 | 4 | 辅助功能 |

#### 6.2.2 技能列表

**效率技能**：

| 技能 | 等级 | 效果 | 消耗点数 |
|------|------|------|----------|
| 快速点击 | 1 | 点击判定范围+10% | 1 |
| 快速点击 | 2 | 点击判定范围+20% | 2 |
| 快速点击 | 3 | 点击判定范围+30% | 3 |
| 视觉增强 | 1 | 数字字号+10% | 1 |
| 视觉增强 | 2 | 数字字号+20% | 2 |

**时间技能**：

| 技能 | 等级 | 效果 | 消耗点数 |
|------|------|------|----------|
| 时间掌控 | 1 | 初始时间+2秒 | 1 |
| 时间掌控 | 2 | 初始时间+5秒 | 2 |
| 时间奖励 | 1 | 正确点击+1秒 | 2 |
| 时间奖励 | 2 | 正确点击+2秒 | 3 |

#### 6.2.3 技术实现

```javascript
class SkillTreeManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.skills = new Map();
    this.unlockedSkills = new Set();
    this.skillPoints = 0;
    this.initSkills();
    this.loadProgress();
  }

  initSkills() {
    this.skills.set('click_range_1', {
      id: 'click_range_1',
      name: '快速点击 I',
      category: 'efficiency',
      description: '点击判定范围+10%',
      effect: { type: 'click_range', value: 1.1 },
      maxLevel: 3,
      currentLevel: 0,
      cost: 1,
      prerequisite: null
    });

    this.skills.set('click_range_2', {
      id: 'click_range_2',
      name: '快速点击 II',
      category: 'efficiency',
      description: '点击判定范围+20%',
      effect: { type: 'click_range', value: 1.2 },
      maxLevel: 3,
      currentLevel: 0,
      cost: 2,
      prerequisite: 'click_range_1'
    });

    this.skills.set('click_range_3', {
      id: 'click_range_3',
      name: '快速点击 III',
      category: 'efficiency',
      description: '点击判定范围+30%',
      effect: { type: 'click_range', value: 1.3 },
      maxLevel: 3,
      currentLevel: 0,
      cost: 3,
      prerequisite: 'click_range_2'
    });

    this.skills.set('time_bonus_1', {
      id: 'time_bonus_1',
      name: '时间奖励 I',
      category: 'time',
      description: '正确点击+1秒',
      effect: { type: 'time_bonus', value: 1 },
      maxLevel: 2,
      currentLevel: 0,
      cost: 2,
      prerequisite: null
    });

    this.skills.set('time_bonus_2', {
      id: 'time_bonus_2',
      name: '时间奖励 II',
      category: 'time',
      description: '正确点击+2秒',
      effect: { type: 'time_bonus', value: 2 },
      maxLevel: 2,
      currentLevel: 0,
      cost: 3,
      prerequisite: 'time_bonus_1'
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

    this.applySkillEffect(skill);
    this.saveProgress();

    this.gameManager.ui.showSkillUnlock(skill);
    return true;
  }

  applySkillEffect(skill) {
    switch (skill.effect.type) {
      case 'click_range':
        this.gameManager.setClickAreaMultiplier(skill.effect.value);
        break;

      case 'time_bonus':
        this.gameManager.setTimeBonus(skill.effect.value);
        break;

      case 'initial_time':
        this.gameManager.setInitialTime(skill.effect.value);
        break;

      case 'number_size':
        this.gameManager.setNumberScale(skill.effect.value);
        break;
    }
  }

  getSkillEffect(type) {
    let totalEffect = 1.0;

    for (const skillId of this.unlockedSkills) {
      const skill = this.skills.get(skillId);
      if (skill.effect.type === type) {
        totalEffect = Math.max(totalEffect, skill.effect.value);
      }
    }

    return totalEffect;
  }

  getSkillProgress() {
    const skillsByCategory = new Map();

    for (const [id, skill] of this.skills) {
      if (!skillsByCategory.has(skill.category)) {
        skillsByCategory.set(skill.category, []);
      }
      skillsByCategory.get(skill.category).push({
        ...skill,
        canUnlock: this.canUnlock(id)
      });
    }

    return skillsByCategory;
  }

  giveSkillPoints(amount) {
    this.skillPoints += amount;
    this.saveProgress();
    this.gameManager.ui.showSkillPointsGain(amount);
  }

  saveProgress() {
    const data = {
      unlockedSkills: Array.from(this.unlockedSkills),
      skillPoints: this.skillPoints,
      skillLevels: Array.from(this.skills.entries()).map(([id, skill]) => ({
        id,
        currentLevel: skill.currentLevel
      }))
    };
    wx.setStorageSync('skill_progress', JSON.stringify(data));
  }

  loadProgress() {
    try {
      const data = wx.getStorageSync('skill_progress');
      if (data) {
        const parsed = JSON.parse(data);
        this.unlockedSkills = new Set(parsed.unlockedSkills);
        this.skillPoints = parsed.skillPoints || 0;

        if (parsed.skillLevels) {
          for (const levelData of parsed.skillLevels) {
            const skill = this.skills.get(levelData.id);
            if (skill) {
              skill.currentLevel = levelData.currentLevel;
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load skill progress:', error);
    }
  }
}
```

### 6.3 装备系统

#### 6.3.1 装备类型

| 类型 | 位置 | 数量 |
|------|------|------|
| 头饰 | 头部 | 10 |
| 服饰 | 身体 | 15 |
| 配饰 | 装饰 | 20 |
| 特效 | 特效 | 8 |

#### 6.3.2 装备效果

**基础属性**：
- 时间加成
- 准确度加成
- 经验加成

**套装效果**：
- 同套装装备2件：小效果
- 同套装装备3件：中效果
- 同套装装备4件：大效果

#### 6.3.3 技术实现

```javascript
class EquipmentManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.equipment = new Map();
    this.equipped = {
      head: null,
      body: null,
      accessory: null,
      effect: null
    };
    this.initEquipment();
    this.loadProgress();
  }

  initEquipment() {
    this.equipment.set('E001', {
      id: 'E001',
      name: '新手帽',
      type: 'head',
      rarity: 'common',
      attributes: { timeBonus: 0 },
      set: 'novice'
    });

    this.equipment.set('E002', {
      id: 'E002',
      name: '速度头带',
      type: 'head',
      rarity: 'rare',
      attributes: { timeBonus: 2, accuracyBonus: 5 },
      set: 'speed'
    });

    this.equipment.set('E011', {
      id: 'E011',
      name: '新手服',
      type: 'body',
      rarity: 'common',
      attributes: { expBonus: 5 },
      set: 'novice'
    });

    this.equipment.set('E012', {
      id: 'E012',
      name: '极速战甲',
      type: 'body',
      rarity: 'rare',
      attributes: { timeBonus: 5, expBonus: 10 },
      set: 'speed'
    });
  }

  equip(itemId, slot) {
    const equipment = this.equipment.get(itemId);
    if (!equipment || equipment.type !== slot) return false;

    this.equipped[slot] = itemId;
    this.applyEquipmentEffects();
    this.saveProgress();

    this.gameManager.ui.showEquipmentEquip(equipment);
    return true;
  }

  unequip(slot) {
    this.equipped[slot] = null;
    this.applyEquipmentEffects();
    this.saveProgress();
  }

  applyEquipmentEffects() {
    let totalBonus = {
      timeBonus: 0,
      accuracyBonus: 0,
      expBonus: 0
    };

    for (const [slot, itemId] of Object.entries(this.equipped)) {
      if (!itemId) continue;

      const equipment = this.equipment.get(itemId);
      if (equipment.attributes) {
        for (const [key, value] of Object.entries(equipment.attributes)) {
          if (totalBonus[key] !== undefined) {
            totalBonus[key] += value;
          }
        }
      }
    }

    const setBonus = this.calculateSetBonus();
    for (const [key, value] of Object.entries(setBonus)) {
      if (totalBonus[key] !== undefined) {
        totalBonus[key] += value;
      }
    }

    this.gameManager.applyEquipmentBonus(totalBonus);
  }

  calculateSetBonus() {
    const setCounts = new Map();

    for (const [slot, itemId] of Object.entries(this.equipped)) {
      if (!itemId) continue;

      const equipment = this.equipment.get(itemId);
      if (equipment.set) {
        const count = setCounts.get(equipment.set) || 0;
        setCounts.set(equipment.set, count + 1);
      }
    }

    const setBonuses = {
      novice: { 2: { timeBonus: 1 }, 3: { timeBonus: 3 } },
      speed: { 2: { timeBonus: 3, accuracyBonus: 5 }, 3: { timeBonus: 8, accuracyBonus: 15 } }
    };

    let totalBonus = { timeBonus: 0, accuracyBonus: 0, expBonus: 0 };

    for (const [setName, count] of setCounts) {
      const bonuses = setBonuses[setName];
      if (bonuses) {
        const levelBonuses = bonuses[count];
        if (levelBonuses) {
          for (const [key, value] of Object.entries(levelBonuses)) {
            if (totalBonus[key] !== undefined) {
              totalBonus[key] += value;
            }
          }
        }
      }
    }

    return totalBonus;
  }

  getEquipmentByType(type) {
    return Array.from(this.equipment.values()).filter(e => e.type === type);
  }

  getEquipped(slot) {
    const itemId = this.equipped[slot];
    return itemId ? this.equipment.get(itemId) : null;
  }

  saveProgress() {
    const data = {
      equipped: this.equipped
    };
    wx.setStorageSync('equipment_progress', JSON.stringify(data));
  }

  loadProgress() {
    try {
      const data = wx.getStorageSync('equipment_progress');
      if (data) {
        this.equipped = data.equipped || this.equipped;
        this.applyEquipmentEffects();
      }
    } catch (error) {
      console.error('Failed to load equipment progress:', error);
    }
  }
}
```

---

## 7. 技术实现可行性

### 7.1 架构兼容性

现有架构支持以下扩展：

| 扩展类型 | 兼容性 | 说明 |
|----------|----------|------|
| 游戏模式 | 高 | GameManager已支持多种模式 |
| 道具系统 | 中 | 需添加ItemManager |
| 成就系统 | 高 | 可独立实现 |
| 社交功能 | 中 | 需网络支持 |
| 排行榜 | 高 | 已有基础实现 |

### 7.2 性能考虑

| 功能 | 性能影响 | 优化方案 |
|------|----------|----------|
| 连击系统 | 低 | 轻量级计算 |
| 暴走模式 | 中 | 特效优化 |
| 盲点模式 | 中 | 遮罩渲染优化 |
| 道具系统 | 低 | 对象池复用 |
| 成就系统 | 低 | 异步检查 |

### 7.3 存储需求

| 数据类型 | 存储大小 | 频率 |
|----------|----------|------|
| 玩家进度 | <5KB | 每次游戏结束 |
| 成就数据 | <10KB | 成就解锁时 |
| 皮肤数据 | <5KB | 购买/装备时 |
| 社交数据 | <20KB | 社交操作时 |

### 7.4 网络需求

| 功能 | 带宽需求 | 延迟要求 |
|------|----------|----------|
| 排行榜 | <1KB/次 | <500ms |
| 好友对战 | <100B/s | <200ms |
| 房间挑战 | <500B/s | <300ms |
| 礼物系统 | <500B/次 | <500ms |

---

## 8. 实施优先级建议

### 8.1 第一阶段（P0 - 立即实施）

| 功能 | 预计工作量 | 优先级 | 预期效果 |
|------|------------|--------|----------|
| 连击系统 | 3天 | 高 | 提升爽快感 |
| 成就系统 | 5天 | 高 | 增加长期目标 |
| 每日挑战 | 4天 | 高 | 提高日活 |
| 皮肤系统 | 3天 | 中 | 增加个性化 |

**总计**: 15天

### 8.2 第二阶段（P1 - 1-2周内）

| 功能 | 预计工作量 | 优先级 | 预期效果 |
|------|------------|--------|----------|
| 道具系统 | 5天 | 高 | 增加策略性 |
| 暴走模式 | 2天 | 中 | 增加戏剧性 |
| 排行榜增强 | 4天 | 中 | 提升竞争感 |
| 社交分享 | 2天 | 中 | 促进传播 |

**总计**: 13天

### 8.3 第三阶段（P2 - 按需实施）

| 功能 | 预计工作量 | 优先级 | 预期效果 |
|------|------------|--------|----------|
| 倒计时挑战 | 2天 | 低 | 增加模式 |
| 记忆模式 | 3天 | 低 | 增加多样性 |
| 盲点模式 | 3天 | 低 | 特殊挑战 |
| 好友对战 | 7天 | 低 | 社交互动 |
| 房间挑战 | 7天 | 低 | 多人游戏 |
| 礼物系统 | 5天 | 低 | 社交增强 |
| 副本系统 | 10天 | 低 | 长期内容 |
| 技能树 | 8天 | 低 | 成长系统 |
| 装备系统 | 8天 | 低 | 深度系统 |

**总计**: 53天

### 8.4 实施建议

1. **快速迭代**：先实施高优先级功能，快速验证效果
2. **数据驱动**：根据用户反馈和数据调整后续开发方向
3. **逐步解锁**：功能逐步开放，避免一次性给玩家过多选择
4. **平衡调整**：持续监控数值平衡，及时调整

---

## 总结

本文档为"数一数噻"小游戏设计了一系列创新且可行的玩法建议，涵盖了核心玩法优化、特色系统设计、社交互动机制、关卡设计思路和角色成长路径等多个方面。

所有建议均基于游戏现有框架进行设计，具有良好的技术实现可行性。建议按照优先级分阶段实施，先快速上线高价值功能，根据用户反馈持续优化。

通过这些玩法的实施，预期可以：
- 提升游戏趣味性和可玩性
- 增强玩家留存率和日活
- 促进社交传播和用户增长
- 建立长期激励机制
- 为游戏的持续发展奠定基础

    room.players.push(player