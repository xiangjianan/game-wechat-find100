import { AudioGenerator } from './audioGenerator';

export default class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
    this.useGeneratedAudio = false;
  }

  init() {
    this.useGeneratedAudio = true;
    
    if (typeof wx === 'undefined' || !wx.createInnerAudioContext) return;
    
    try {
      this.sounds.click = wx.createInnerAudioContext();
      this.sounds.click.src = 'audio/click.mp3';
      this.sounds.click.onError(() => {
        this.useGeneratedAudio = true;
      });
      
      this.sounds.error = wx.createInnerAudioContext();
      this.sounds.error.src = 'audio/error.mp3';
      this.sounds.error.onError(() => {
        this.useGeneratedAudio = true;
      });
      
      this.sounds.complete = wx.createInnerAudioContext();
      this.sounds.complete.src = 'audio/complete.mp3';
      this.sounds.complete.onError(() => {
        this.useGeneratedAudio = true;
      });
      
      this.sounds.bg = wx.createInnerAudioContext();
      this.sounds.bg.src = 'audio/bgm.mp3';
      this.sounds.bg.loop = true;
      this.sounds.bg.onError(() => {});
    } catch (e) {
      this.useGeneratedAudio = true;
    }
  }

  playClick() {
    if (!this.enabled) return;
    
    if (this.useGeneratedAudio) {
      try {
        AudioGenerator.generateClickSound();
      } catch (e) {}
      return;
    }
    
    if (!this.sounds.click) return;
    try {
      this.sounds.click.stop();
      this.sounds.click.play();
    } catch (e) {}
  }

  playError() {
    if (!this.enabled) return;
    
    if (this.useGeneratedAudio) {
      try {
        AudioGenerator.generateErrorSound();
      } catch (e) {}
      return;
    }
    
    if (!this.sounds.error) return;
    try {
      this.sounds.error.stop();
      this.sounds.error.play();
    } catch (e) {}
  }

  playComplete() {
    if (!this.enabled) return;
    
    if (this.useGeneratedAudio) {
      try {
        AudioGenerator.generateCompleteSound();
      } catch (e) {}
      return;
    }
    
    if (!this.sounds.complete) return;
    try {
      this.sounds.complete.stop();
      this.sounds.complete.play();
    } catch (e) {}
  }

  playBackground() {
    if (!this.enabled || !this.sounds.bg) return;
    try {
      this.sounds.bg.play();
    } catch (e) {}
  }

  stopBackground() {
    if (!this.sounds.bg) return;
    try {
      this.sounds.bg.stop();
    } catch (e) {}
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBackground();
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    for (const key in this.sounds) {
      if (this.sounds[key]) {
        this.sounds[key].volume = this.volume;
      }
    }
  }

  destroy() {
    for (const key in this.sounds) {
      if (this.sounds[key]) {
        try {
          this.sounds[key].destroy();
        } catch (e) {}
      }
    }
    this.sounds = {};
  }
}
