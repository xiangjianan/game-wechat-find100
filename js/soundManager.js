import { AudioGenerator } from './audioGenerator';

export default class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
    this.useGeneratedAudio = false;
  }

  init() {
    try {
      this.sounds.click = wx.createInnerAudioContext();
      this.sounds.click.src = 'audio/click.mp3';
      
      this.sounds.error = wx.createInnerAudioContext();
      this.sounds.error.src = 'audio/error.mp3';
      
      this.sounds.complete = wx.createInnerAudioContext();
      this.sounds.complete.src = 'audio/complete.mp3';
      
      this.sounds.bg = wx.createInnerAudioContext();
      this.sounds.bg.src = 'audio/bgm.mp3';
      this.sounds.bg.loop = true;
    } catch (e) {
      console.log('Sound initialization failed, using generated audio:', e);
      this.useGeneratedAudio = true;
    }
  }

  playClick() {
    if (!this.enabled) return;
    
    if (this.useGeneratedAudio) {
      try {
        AudioGenerator.generateClickSound();
      } catch (e) {
        console.log('Generate click sound failed:', e);
      }
      return;
    }
    
    if (!this.sounds.click) return;
    try {
      this.sounds.click.stop();
      this.sounds.click.play();
    } catch (e) {
      console.log('Play click sound failed:', e);
    }
  }

  playError() {
    if (!this.enabled) return;
    
    if (this.useGeneratedAudio) {
      try {
        AudioGenerator.generateErrorSound();
      } catch (e) {
        console.log('Generate error sound failed:', e);
      }
      return;
    }
    
    if (!this.sounds.error) return;
    try {
      this.sounds.error.stop();
      this.sounds.error.play();
    } catch (e) {
      console.log('Play error sound failed:', e);
    }
  }

  playComplete() {
    if (!this.enabled) return;
    
    if (this.useGeneratedAudio) {
      try {
        AudioGenerator.generateCompleteSound();
      } catch (e) {
        console.log('Generate complete sound failed:', e);
      }
      return;
    }
    
    if (!this.sounds.complete) return;
    try {
      this.sounds.complete.stop();
      this.sounds.complete.play();
    } catch (e) {
      console.log('Play complete sound failed:', e);
    }
  }

  playBackground() {
    if (!this.enabled || !this.sounds.bg) return;
    try {
      this.sounds.bg.play();
    } catch (e) {
      console.log('Play background music failed:', e);
    }
  }

  stopBackground() {
    if (!this.sounds.bg) return;
    try {
      this.sounds.bg.stop();
    } catch (e) {
      console.log('Stop background music failed:', e);
    }
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
        } catch (e) {
          console.log('Destroy sound failed:', e);
        }
      }
    }
    this.sounds = {};
  }
}
