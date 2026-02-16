export class AudioGenerator {
  static isWxEnvironment() {
    return typeof wx !== 'undefined' && typeof wx.createInnerAudioContext === 'function';
  }

  static isBrowserEnvironment() {
    return typeof window !== 'undefined' && 
           (typeof window.AudioContext === 'function' || typeof window.webkitAudioContext === 'function');
  }

  static getAudioContext() {
    if (this.isWxEnvironment()) return null;
    if (!this.isBrowserEnvironment()) return null;
    
    if (!this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();
        
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
      } catch (e) {
        return null;
      }
    }
    return this.audioContext;
  }

  static playWxSound(src) {
    try {
      const audio = wx.createInnerAudioContext();
      audio.src = src;
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      // 静默处理错误
    }
  }

  static createTone(audioContext, frequency, type, duration, delay = 0) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    if (!oscillator || !gainNode) return;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    const startTime = audioContext.currentTime + delay;
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  static generateClickSound() {
    if (this.isWxEnvironment()) {
      this.playWxSound('audio/click.mp3');
      return;
    }
    
    const audioContext = this.getAudioContext();
    if (!audioContext || !audioContext.destination) return;
    
    try {
      this.createTone(audioContext, 800, 'sine', 0.1);
    } catch (e) {
      // 静默处理错误
    }
  }

  static generateErrorSound() {
    if (this.isWxEnvironment()) {
      this.playWxSound('audio/click.mp3');
      return;
    }
    
    const audioContext = this.getAudioContext();
    if (!audioContext || !audioContext.destination) return;
    
    try {
      this.createTone(audioContext, 200, 'sawtooth', 0.3);
    } catch (e) {
      // 静默处理错误
    }
  }

  static generateCompleteSound() {
    if (this.isWxEnvironment()) {
      this.playWxSound('audio/click.mp3');
      return;
    }
    
    const audioContext = this.getAudioContext();
    if (!audioContext || !audioContext.destination) return;
    
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((frequency, index) => {
        this.createTone(audioContext, frequency, 'sine', 0.2, index * 0.15);
      });
    } catch (e) {
      // 静默处理错误
    }
  }
}
