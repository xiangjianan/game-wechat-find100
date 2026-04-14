/**
 * 排行榜管理器
 * 主域通过 postMessage 与开放数据域通信
 * 开放数据域使用共享 Canvas 渲染排行榜（微信推荐方式）
 */
export default class RankManager {
  constructor() {
    this.isOpen = false;
    this.onCloseCallback = null;
    this.isWeChatGame = typeof wx !== 'undefined';
    this.sharedCanvas = null;
    this.previousScore = null; // 上次上传的分数，用于开放数据域精确匹配当前用户
    this.playerId = null; // 唯一标识，用于开放数据域可靠识别当前用户
  }

  init() {
    if (!this.isWeChatGame) {
      return false;
    }
    try {
      const openDataContext = wx.getOpenDataContext();
      this.sharedCanvas = openDataContext.canvas;

      // 加载或生成唯一 playerId，用于开放数据域识别当前用户
      this.playerId = wx.getStorageSync('rankPlayerId');
      if (!this.playerId) {
        this.playerId = 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        wx.setStorageSync('rankPlayerId', this.playerId);
      }
    } catch (e) {
      console.error('RankManager: init failed', e);
    }
    return true;
  }

  getSharedCanvas() {
    return this.sharedCanvas;
  }

  calculateScore(numbersFound, time) {
    return numbersFound - 0.0001 * time;
  }

  uploadScore(numbersFound, time, level = 1) {
    if (!this.isWeChatGame) {
      return;
    }

    const hiddenScore = this.calculateScore(numbersFound, time);
    const prevHiddenScore = this.previousScore ? this.previousScore.hiddenScore : null;
    this.previousScore = { numbersFound, time, hiddenScore };

    wx.setUserCloudStorage({
      KVDataList: [
        { key: 'numbersFound', value: numbersFound.toString() },
        { key: 'time', value: time.toString() },
        { key: 'hiddenScore', value: hiddenScore.toString() },
        { key: 'playerId', value: this.playerId || '' }
      ],
      success: () => {
        console.log('RankManager: uploadScore success', { numbersFound, time, hiddenScore });
        this.sendMessageToOpenData({
          type: 'selfScore',
          numbersFound,
          time,
          hiddenScore,
          prevHiddenScore,
          playerId: this.playerId
        });
        this.sendMessageToOpenData({ type: 'refresh' });
      },
      fail: (err) => {
        console.error('RankManager: uploadScore failed', err);
      }
    });
  }

  open(onClose = null) {
    if (!this.isWeChatGame) {
      return false;
    }

    this.isOpen = true;
    this.onCloseCallback = onClose;
    this.sendMessageToOpenData({ type: 'show' });

    // 多次延迟刷新，增加拿到最新数据的概率
    const delays = [1500, 3000];
    delays.forEach(delay => {
      setTimeout(() => {
        if (this.isOpen) {
          this.sendMessageToOpenData({ type: 'refresh' });
        }
      }, delay);
    });

    return true;
  }

  close() {
    if (!this.isWeChatGame) {
      return;
    }

    this.isOpen = false;
    this.sendMessageToOpenData({ type: 'hide' });

    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }
  }

  forwardTouch(type, x, y) {
    if (!this.isOpen) return;
    this.sendMessageToOpenData({ type, x, y });
  }

  sendMessageToOpenData(message) {
    if (!this.isWeChatGame) {
      return;
    }

    try {
      const openDataContext = wx.getOpenDataContext();
      openDataContext.postMessage(message);
    } catch (error) {
      console.error('RankManager: postMessage failed', error);
    }
  }

  isRankOpen() {
    return this.isOpen;
  }
}
