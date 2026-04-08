export default class ShareManager {
  constructor() {
    this.shareTitles = [
      '数一数噻 - 找回消失的专注力！',
      '我能找到所有数字，你能吗？',
      '挑战你的专注力极限！数一数噻',
      '这个数字游戏太上头了！'
    ];
    this.shareImages = [
      'https://mmocgame.qpic.cn/wechatgame/ia9bI9ZkVFJ0CQMNicgq67tocDwKuP04ZDq7wLKNJBbHHJBH4OQ21TFMiawj5A72wCD/0',
      'https://mmocgame.qpic.cn/wechatgame/ZSNQDes4Pge8bRywMDtto8JeM9x6lHUALVbnZBx92CaDlhLVdEayqKC98OovB4gm/0',
      'https://mmocgame.qpic.cn/wechatgame/RptOPklgbiaXPTic6NlTM54IcazvL5BlrqwibHfrDEzZhWn5U6V89ic14nJQHmFAthCg/0'
    ];
  }

  init() {
    this._setupShareMenu();
    this._setupShareAppMessage();
    this._setupShareTimeline();
  }

  _setupShareMenu() {
    if (typeof wx === 'undefined' || !wx.showShareMenu) return;
    wx.showShareMenu({
      menus: ['shareAppMessage', 'shareTimeline'],
      success: () => {},
      fail: () => {}
    });
  }

  _setupShareAppMessage() {
    if (typeof wx === 'undefined' || !wx.onShareAppMessage) return;
    wx.onShareAppMessage(() => ({
      title: this._getRandomTitle(),
      imageUrl: this._getRandomImage()
    }));
  }

  _setupShareTimeline() {
    if (typeof wx === 'undefined' || !wx.onShareTimeline) return;
    wx.onShareTimeline(() => ({
      title: this._getRandomTitle(),
      imageUrl: this._getRandomImage()
    }));
  }

  shareAppMessage(title) {
    if (typeof wx === 'undefined' || !wx.shareAppMessage) return;
    wx.shareAppMessage({
      title: title || this._getRandomTitle(),
      imageUrl: this._getRandomImage()
    });
  }

  _getRandomTitle() {
    return this.shareTitles[Math.floor(Math.random() * this.shareTitles.length)];
  }

  _getRandomImage() {
    return this.shareImages[Math.floor(Math.random() * this.shareImages.length)];
  }
}
