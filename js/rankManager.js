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
    this.onPlayClickSound = null;
    this.isWeChatGame = typeof wx !== 'undefined' && wx.createOpenDataContext;
  }

  /**
   * 初始化排行榜
   */
  init() {
    if (!this.isWeChatGame) {
      console.log('非微信小游戏环境，排行榜功能不可用');
      return false;
    }

    try {
      // 获取共享画布
      this.sharedCanvas = wx.getSharedCanvas();
      this.sharedCanvasContext = this.sharedCanvas.getContext('2d');

      // 监听开放数据域的消息
      wx.onMessage(this.handleOpenDataMessage.bind(this));

      console.log('排行榜初始化成功');
      return true;
    } catch (error) {
      console.error('排行榜初始化失败:', error);
      return false;
    }
  }

  /**
   * 上传分数到排行榜
   * @param {number} score - 分数（时间越短分数越高）
   * @param {number} level - 关卡
   */
  uploadScore(score, level = 1) {
    if (!this.isWeChatGame) {
      console.log('非微信小游戏环境，无法上传分数');
      return;
    }

    try {
      // 将时间转换为分数（时间越短分数越高）
      // 基础分10000，每秒扣100分
      const finalScore = Math.max(0, Math.floor(10000 - score * 100));

      wx.setUserCloudStorage({
        KVDataList: [
          {
            key: 'score',
            value: finalScore.toString()
          },
          {
            key: 'time',
            value: score.toString()
          },
          {
            key: 'level',
            value: level.toString()
          }
        ],
        success: () => {
          console.log('分数上传成功:', finalScore);
        },
        fail: (error) => {
          console.error('分数上传失败:', error);
        }
      });
    } catch (error) {
      console.error('上传分数时出错:', error);
    }
  }

  /**
   * 打开排行榜
   * @param {Function} onClose - 关闭回调
   */
  open(onClose = null) {
    if (!this.isWeChatGame) {
      console.log('非微信小游戏环境，无法打开排行榜');
      return;
    }

    this.isOpen = true;
    this.onCloseCallback = onClose;

    // 通知开放数据域显示排行榜
    this.sendMessageToOpenData({
      type: 'show',
      data: {}
    });

    console.log('排行榜已打开');
  }

  /**
   * 关闭排行榜
   */
  close() {
    if (!this.isWeChatGame) {
      return;
    }

    this.isOpen = false;

    // 通知开放数据域隐藏排行榜
    this.sendMessageToOpenData({
      type: 'hide',
      data: {}
    });

    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }

    console.log('排行榜已关闭');
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
      console.error('发送消息到开放数据域失败:', error);
    }
  }

  /**
   * 处理来自开放数据域的消息
   * @param {Object} message - 消息对象
   */
  handleOpenDataMessage(message) {
    console.log('收到开放数据域消息:', message);

    switch (message.type) {
      case 'close':
        this.close();
        break;
      default:
        break;
    }
  }

  /**
   * 渲染共享画布到主画布
   * @param {CanvasRenderingContext2D} ctx - 主画布上下文
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  render(ctx, x = 0, y = 0, width = null, height = null) {
    if (!this.isOpen || !this.sharedCanvas) {
      return;
    }

    const drawWidth = width || ctx.canvas.width;
    const drawHeight = height || ctx.canvas.height;

    // 将共享画布绘制到主画布
    ctx.drawImage(
      this.sharedCanvas,
      x, y, drawWidth, drawHeight
    );
  }

  /**
   * 处理排行榜区域的点击
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {number} width - 排行榜宽度
   * @param {number} height - 排行榜高度
   */
  handleClick(x, y, width, height) {
    if (!this.isOpen) {
      return false;
    }

    // 检查是否点击了关闭按钮区域（右上角）
    const closeBtnSize = 40;
    if (x >= width - closeBtnSize && x <= width &&
        y >= 0 && y <= closeBtnSize) {
      if (this.onPlayClickSound) {
        this.onPlayClickSound();
      }
      this.close();
      return true;
    }

    // 其他点击事件转发到开放数据域
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
