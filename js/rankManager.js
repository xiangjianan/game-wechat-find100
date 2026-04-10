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
    this.isWeChatGame = typeof wx !== 'undefined';
  }

  /**
   * 初始化排行榜
   */
  init() {
    if (!this.isWeChatGame) {
      console.warn('RankManager: not WeChat environment');
      return false;
    }

    try {
      this.sharedCanvas = wx.getSharedCanvas();
      this.sharedCanvasContext = this.sharedCanvas.getContext('2d');
    } catch (error) {
      console.warn('RankManager: getSharedCanvas not available', error.message);
    }

    try {
      wx.onMessage(this.handleOpenDataMessage.bind(this));
    } catch (error) {
      console.warn('RankManager: onMessage not available', error.message);
    }

    console.log('RankManager: init done, isWeChatGame =', this.isWeChatGame);
    return true;
  }

  /**
   * 计算隐藏排名分数
   * 排行榜用此分数排名，但不在UI展示
   * 算法：找到的数字越多分数越高，耗时越短分数越高
   */
  calculateScore(numbersFound, time) {
    return numbersFound - 0.0001 * time;
  }

  uploadScore(numbersFound, time, level = 1) {
    if (!this.isWeChatGame) {
      return;
    }

    try {
      const hiddenScore = this.calculateScore(numbersFound, time);

      wx.setUserCloudStorage({
        KVDataList: [
          {
            key: 'numbersFound',
            value: numbersFound.toString()
          },
          {
            key: 'time',
            value: time.toString()
          },
          {
            key: 'hiddenScore',
            value: hiddenScore.toString()
          }
        ],
        success: () => {
          console.log('RankManager: uploadScore success', { numbersFound, time, hiddenScore });
        },
        fail: (err) => {
          console.error('RankManager: uploadScore failed', err);
        }
      });
    } catch (error) {
      console.error('RankManager: uploadScore exception', error);
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
      console.error('RankManager: sendMessageToOpenData failed', error);
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
   * 渲染排行榜（将共享画布绘制到主画布）
   */
  render(ctx, x, y, width, height) {
    if (!this.isOpen || !this.sharedCanvas) {
      return;
    }

    try {
      ctx.drawImage(this.sharedCanvas, x, y, width, height);
    } catch (error) {
      console.error('RankManager: render failed', error);
    }
  }

  /**
   * 检查排行榜是否打开
   */
  isRankOpen() {
    return this.isOpen;
  }
}
