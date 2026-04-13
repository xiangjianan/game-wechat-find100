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
  }

  init() {
    if (!this.isWeChatGame) {
      return false;
    }
    try {
      const openDataContext = wx.getOpenDataContext();
      this.sharedCanvas = openDataContext.canvas;
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
      return Promise.resolve();
    }

    const hiddenScore = this.calculateScore(numbersFound, time);

    return new Promise((resolve) => {
      wx.setUserCloudStorage({
        KVDataList: [
          { key: 'numbersFound', value: numbersFound.toString() },
          { key: 'time', value: time.toString() },
          { key: 'hiddenScore', value: hiddenScore.toString() }
        ],
        success: () => {
          console.log('RankManager: uploadScore success', { numbersFound, time, hiddenScore });
          resolve();
        },
        fail: (err) => {
          console.error('RankManager: uploadScore failed', err);
          resolve(); // 即使失败也 resolve，不阻塞后续流程
        }
      });
    });
  }

  open(onClose = null) {
    if (!this.isWeChatGame) {
      return false;
    }

    this.isOpen = true;
    this.onCloseCallback = onClose;
    this.sendMessageToOpenData({ type: 'show' });

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
