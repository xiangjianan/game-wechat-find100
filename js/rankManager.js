/**
 * 排行榜管理器
 * 负责处理微信小游戏排行榜功能
 */
export default class RankManager {
  constructor() {
    this.sharedCanvas = null;
    this.sharedCanvasContext = null;
    this.isOpen = false;
    this.onCloseCallback = null;
    this.isWeChatGame = typeof wx !== 'undefined' && wx.createOpenDataContext;
  }

  /**
   * 初始化排行榜
   */
  init() {
    if (!this.isWeChatGame) {
      return false;
    }

    try {
      this.sharedCanvas = wx.getSharedCanvas();
      this.sharedCanvasContext = this.sharedCanvas.getContext('2d');
      wx.onMessage(this.handleOpenDataMessage.bind(this));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 上传分数到排行榜
   * @param {number} score - 分数（时间越短分数越高）
   * @param {number} level - 关卡
   */
  calculateScore(totalNumbers, time) {
    const baseScorePerNumber = 100;
    const baseTimePerNumber = 1.5;
    const timeBonusMultiplier = 50;
    
    const baseScore = totalNumbers * baseScorePerNumber;
    const expectedTime = totalNumbers * baseTimePerNumber;
    const timeDiff = expectedTime - time;
    const timeBonus = Math.max(0, timeDiff * timeBonusMultiplier);
    const finalScore = Math.floor(baseScore + timeBonus);
    
    return Math.max(0, finalScore);
  }

  uploadScore(time, level = 1, totalNumbers = 10) {
    if (!this.isWeChatGame) {
      return;
    }

    try {
      const finalScore = this.calculateScore(totalNumbers, time);

      wx.setUserCloudStorage({
        KVDataList: [
          {
            key: 'score',
            value: finalScore.toString()
          },
          {
            key: 'time',
            value: time.toString()
          },
          {
            key: 'level',
            value: level.toString()
          },
          {
            key: 'totalNumbers',
            value: totalNumbers.toString()
          }
        ]
      });
    } catch (error) {
    }
  }

  /**
   * 打开排行榜
   * @param {Function} onClose - 关闭回调
   */
  open(onClose = null) {
    if (!this.isWeChatGame) {
      return false;
    }

    this.isOpen = true;
    this.onCloseCallback = onClose;
    this.sendMessageToOpenData({
      type: 'show',
      data: {}
    });
    return true;
  }

  /**
   * 关闭排行榜
   */
  close() {
    if (!this.isWeChatGame) {
      return;
    }

    this.isOpen = false;
    this.sendMessageToOpenData({
      type: 'hide',
      data: {}
    });

    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }
  }

  /**
   * 发送消息到开放数据域
   * @param {Object} message - 消息对象
   */
  sendMessageToOpenData(message) {
    if (!this.isWeChatGame) {
      return;
    }

    try {
      const openDataContext = wx.getOpenDataContext();
      openDataContext.postMessage(message);
    } catch (error) {
    }
  }

  /**
   * 处理来自开放数据域的消息
   * @param {Object} message - 消息对象
   */
  handleOpenDataMessage(message) {
    switch (message.type) {
      case 'close':
        this.close();
        break;
      default:
        break;
    }
  }

  handleClick(x, y, width, height) {
    if (!this.isOpen) {
      return false;
    }

    const closeBtnSize = 40;
    if (x >= width - closeBtnSize && x <= width &&
        y >= 0 && y <= closeBtnSize) {
      this.close();
      return true;
    }

    this.sendMessageToOpenData({
      type: 'click',
      data: { x, y }
    });

    return true;
  }

  /**
   * 检查排行榜是否打开
   */
  isRankOpen() {
    return this.isOpen;
  }
}
