import { getColorScheme } from '../../constants/colors.js';
import { drawBrutalismRect } from '../helpers/drawing.js';

export default class NotificationManager {
  constructor() {
    this.achievementNotifications = [];
    this.achievementNotificationDuration = 3000;
    this.rewardNotifications = [];
    this.rewardNotificationDuration = 2000;
  }

  showAchievement(achievements) {
    if (!achievements || achievements.length === 0) return;

    achievements.forEach((achievement, index) => {
      this.achievementNotifications.push({
        achievement,
        startTime: Date.now() + index * 500,
        animation: 0,
        targetAnimation: 1
      });
    });
  }

  showReward(reward) {
    if (!reward) return;

    this.rewardNotifications.push({
      reward,
      startTime: Date.now(),
      animation: 0,
      targetAnimation: 1,
      offsetY: 0
    });
  }

  update(deltaTime) {
    this._updateAchievementNotifications(deltaTime);
    this._updateRewardNotifications(deltaTime);
  }

  _updateAchievementNotifications(deltaTime) {
    const now = Date.now();

    for (let i = this.achievementNotifications.length - 1; i >= 0; i--) {
      const notification = this.achievementNotifications[i];

      if (now < notification.startTime) continue;

      const elapsed = now - notification.startTime;

      if (elapsed < 300) {
        notification.animation = Math.min(1, notification.animation + deltaTime * 5);
      } else if (elapsed > this.achievementNotificationDuration - 300) {
        notification.animation = Math.max(0, notification.animation - deltaTime * 5);
      }

      if (elapsed > this.achievementNotificationDuration) {
        this.achievementNotifications.splice(i, 1);
      }
    }
  }

  _updateRewardNotifications(deltaTime) {
    const now = Date.now();

    for (let i = this.rewardNotifications.length - 1; i >= 0; i--) {
      const notification = this.rewardNotifications[i];
      const elapsed = now - notification.startTime;

      if (elapsed < 200) {
        notification.animation = Math.min(1, notification.animation + deltaTime * 8);
      } else if (elapsed > this.rewardNotificationDuration - 300) {
        notification.animation = Math.max(0, notification.animation - deltaTime * 5);
      }

      notification.offsetY -= deltaTime * 50;

      if (elapsed > this.rewardNotificationDuration) {
        this.rewardNotifications.splice(i, 1);
      }
    }
  }

  render(ctx, width, height, safeArea) {
    this._renderAchievementNotifications(ctx, width, height);
    this._renderRewardNotifications(ctx, width, height, safeArea);
  }

  _renderAchievementNotifications(ctx, width, height) {
    const scheme = getColorScheme();
    const isMobile = width < 768;

    for (const notification of this.achievementNotifications) {
      if (notification.animation <= 0) continue;

      const achievement = notification.achievement;
      const alpha = notification.animation;

      const notificationWidth = isMobile ? 280 : 320;
      const notificationHeight = isMobile ? 80 : 90;
      const notificationX = (width - notificationWidth) / 2;
      const notificationY = isMobile ? 100 : 120;

      ctx.save();
      ctx.globalAlpha = alpha;

      const slideOffset = (1 - notification.animation) * 50;
      const actualY = notificationY - slideOffset;

      drawBrutalismRect(ctx, scheme, notificationX, actualY, notificationWidth, notificationHeight, scheme.buttonSuccess, {
        shadowOffset: 8,
        borderWidth: 4
      });

      ctx.fillStyle = scheme.textLight;
      ctx.font = `bold ${isMobile ? 14 : 16}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('成就解锁!', width / 2, actualY + (isMobile ? 20 : 25));

      ctx.font = `bold ${isMobile ? 28 : 32}px Arial, sans-serif`;
      ctx.fillText(achievement.icon, width / 2, actualY + (isMobile ? 50 : 55));

      ctx.font = `bold ${isMobile ? 16 : 18}px "Arial Black", Arial, sans-serif`;
      ctx.fillText(achievement.name, width / 2, actualY + notificationHeight - (isMobile ? 15 : 18));

      ctx.restore();
    }
  }

  _renderRewardNotifications(ctx, width, height, safeArea) {
    const scheme = getColorScheme();
    const isMobile = width < 768;
    const headerHeight = isMobile ? Math.max(100, Math.max(safeArea ? safeArea.top : 0, 44) + 56) : 120;

    for (const notification of this.rewardNotifications) {
      if (notification.animation <= 0) continue;

      const reward = notification.reward;
      const alpha = notification.animation;

      const baseY = headerHeight + 8;
      const notificationY = baseY + notification.offsetY;

      ctx.save();
      ctx.globalAlpha = alpha * 0.75;

      const notificationWidth = isMobile ? 140 : 170;
      const notificationHeight = isMobile ? 32 : 38;
      const notificationX = (width - notificationWidth) / 2;

      let bgColor = scheme.accent;
      if (reward.type === 'hint') {
        bgColor = '#FFD700';
      } else if (reward.type === 'coin') {
        bgColor = '#FFA500';
      } else if (reward.type === 'time') {
        bgColor = '#00BFFF';
      }

      drawBrutalismRect(ctx, scheme, notificationX, notificationY, notificationWidth, notificationHeight, bgColor, {
        shadowOffset: 4,
        borderWidth: 2
      });

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isMobile ? 14 : 16}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = `${reward.icon} ${reward.name} +${reward.amount}`;
      ctx.fillText(text, width / 2, notificationY + notificationHeight / 2);

      ctx.restore();
    }
  }

  clear() {
    this.achievementNotifications = [];
    this.rewardNotifications = [];
  }
}
