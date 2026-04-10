/**
 * 排行榜管理器
 * 主域通过 postMessage 与开放数据域通信
 * 开放数据域获取好友数据后通过 wx.postMessage 回传给主域
 */
export default class RankManager {
  constructor() {
    this.isOpen = false;
    this.onCloseCallback = null;
    this.isWeChatGame = typeof wx !== 'undefined';
    this.sharedCanvas = null;
    this.friendData = [];
    this.onFriendData = null;
  }

  init() {
    if (!this.isWeChatGame) {
      return false;
    }
    try {
      const openDataContext = wx.getOpenDataContext();
      this.sharedCanvas = openDataContext.canvas;

      // 监听开放数据域回传的好友数据
      openDataContext.onMessage((message) => {
        if (message.type === 'friendData') {
          this.friendData = message.data || [];
          if (this.onFriendData) {
            this.onFriendData(this.friendData);
          }
        }
      });
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

  isRankOpen() {
    return this.isOpen;
  }
}
