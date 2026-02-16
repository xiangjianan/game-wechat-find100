export class CacheManager {
  static CACHE_KEY = 'find100wx_cache';
  static CACHE_VERSION = '1.0.0';
  
  static init() {
    try {
      const cache = this.getCache();
      if (!cache || cache.version !== this.CACHE_VERSION) {
        this.clearCache();
        this.saveCache({ version: this.CACHE_VERSION, timestamp: Date.now() });
      }
    } catch (e) {
      console.error('Cache init failed:', e);
    }
  }
  
  static getCache() {
    try {
      return wx.getStorageSync(this.CACHE_KEY);
    } catch (e) {
      return null;
    }
  }
  
  static saveCache(data) {
    try {
      wx.setStorageSync(this.CACHE_KEY, {
        ...data,
        version: this.CACHE_VERSION,
        timestamp: Date.now()
      });
      return true;
    } catch (e) {
      console.error('Cache save failed:', e);
      return false;
    }
  }
  
  static clearCache() {
    try {
      wx.removeStorageSync(this.CACHE_KEY);
      return true;
    } catch (e) {
      console.error('Cache clear failed:', e);
      return false;
    }
  }
  
  static preloadAudio() {
    const audioFiles = ['audio/click.mp3', 'audio/complete.mp3', 'audio/error.mp3'];
    
    audioFiles.forEach(src => {
      try {
        const audio = wx.createInnerAudioContext();
        audio.src = src;
        audio.preload();
        audio.destroy();
      } catch (e) {
        console.error('Audio preload failed:', src, e);
      }
    });
  }
  
  static checkUpdate() {
    const cache = this.getCache();
    if (!cache) return false;
    
    const oneDay = 24 * 60 * 60 * 1000;
    return Date.now() - cache.timestamp > oneDay;
  }
}
