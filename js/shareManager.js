import { getCanvas } from './render';

export default class ShareManager {
  constructor() {
    this.canvas = null;
    this.shareTitles = [
      '数一数噻 - 找回消失的专注力！',
      '我能找到所有数字，你能吗？',
      '挑战你的专注力极限！数一数噻',
      '这个数字游戏太上头了！'
    ];
  }

  init() {
    this.canvas = getCanvas();
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
      imageUrl: this._getShareImage()
    }));
  }

  _setupShareTimeline() {
    if (typeof wx === 'undefined' || !wx.onShareTimeline) return;
    wx.onShareTimeline(() => ({
      title: this._getRandomTitle(),
      imageUrl: this._getShareImage()
    }));
  }

  shareAppMessage(title) {
    if (typeof wx === 'undefined' || !wx.shareAppMessage) return;
    wx.shareAppMessage({
      title: title || this._getRandomTitle(),
      imageUrl: this._getShareImage()
    });
  }

  _getRandomTitle() {
    return this.shareTitles[Math.floor(Math.random() * this.shareTitles.length)];
  }

  _getShareImage() {
    if (!this.canvas || typeof this.canvas.toTempFilePathSync !== 'function') {
      return '';
    }
    try {
      return this.canvas.toTempFilePathSync({
        destWidth: 500,
        destHeight: 400
      });
    } catch (e) {
      return '';
    }
  }

  getShareTitle(gameResult) {
    if (!gameResult) return this._getRandomTitle();
    const { level, time, mode } = gameResult;
    const modeText = mode === 'timed' ? '限时' : '自由';
    return `数一数噻 - ${modeText}模式第${level}关 ${time}秒通关！你能更快吗？`;
  }
}
