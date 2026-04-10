/**
 * 排行榜管理器
 * 负责处理微信小游戏排行榜功能
 * 主域通过 postMessage 与开放数据域通信，共享画布由开放数据域绘制后自动叠加显示
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
      this.sharedCanvas = wx.getOpenDataContext().canvas;
    } catch (e) {
      // ignore
    }
    return true;
  }

  calculateScore(numbersFound, time) {
    return numbersFound - 0.0001 * time;
  }

  uploadScore(numbersFound, time, level = 1) {
    if (!this.isWeChatGame) {
      return;
    }

    const hiddenScore = this.calculateScore(numbersFound, time);

    wx.setUserCloudStorage({
      KVDataList: [
        { key: 'numbersFound', value: numbersFound.toString() },
        { key: 'time', value: time.toString() },
        { key: 'hiddenScore', value: hiddenScore.toString() }
      ],
      success: () => {
        console.log('RankManager: uploadScore success', { numbersFound, time, hiddenScore });
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

  handleOpenDataMessage(message) {
    if (message.type === 'close') {
      this.close();
    }
  }

  handleClick(x, y, width, height) {
    if (!this.isOpen) {
      return false;
    }

    // 关闭按钮位置与开放数据域一致：标题栏左侧
    const padX = 16;
    const safeTop = this._getSafeTop();
    const headerY = safeTop + 10;
    const headerHeight = 48;
    const closeSize = 30;
    const closeX = padX;
    const closeY = headerY + (headerHeight - closeSize) / 2;

    if (x >= closeX && x <= closeX + closeSize &&
        y >= closeY && y <= closeY + closeSize) {
      this.close();
      return true;
    }

    return true;
  }

  _getSafeTop() {
    try {
      const sysInfo = wx.getSystemInfoSync();
      if (sysInfo.safeArea && sysInfo.safeArea.top > 0) return sysInfo.safeArea.top;
      if (sysInfo.statusBarHeight > 0) return sysInfo.statusBarHeight;
    } catch (e) {}
    return 44;
  }

  isRankOpen() {
    return this.isOpen;
  }
}
