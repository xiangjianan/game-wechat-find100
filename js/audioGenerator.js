export class AudioGenerator {
  static isWxEnvironment() {
    return typeof wx !== 'undefined' && typeof wx.createInnerAudioContext === 'function';
  }

  static isBrowserEnvironment() {
    return typeof window !== 'undefined' && 
           (typeof window.AudioContext === 'function' || typeof window.webkitAudioContext === 'function');
  }

  static getAudioContext() {
    if (this.isWxEnvironment()) {
      console.log('AudioGenerator: WeChat mini-game environment detected, using wx API');
      return null;
    }
    
    if (!this.isBrowserEnvironment()) {
      console.log('AudioGenerator: Browser environment not detected, AudioContext not available');
      return null;
    }
    
    if (!this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();
        
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(e => {
            console.error('Failed to resume AudioContext:', e);
          });
        }
        
        console.log('AudioGenerator: AudioContext created successfully');
      } catch (e) {
        console.error('Failed to create AudioContext:', e);
        return null;
      }
    }
    return this.audioContext;
  }

  static generateClickSound() {
    if (this.isWxEnvironment()) {
      try {
        const audio = wx.createInnerAudioContext();
        audio.src = 'audio/click.mp3';
        audio.volume = 0.5;
        audio.play();
        console.log('AudioGenerator: Click sound played using wx API');
      } catch (e) {
        console.error('Failed to play click sound using wx API:', e);
      }
      return;
    }
    
    const audioContext = this.getAudioContext();
    if (!audioContext || !audioContext.destination) {
      console.log('AudioGenerator: AudioContext not available, skipping click sound');
      return;
    }
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      if (!oscillator || !gainNode) {
        console.error('Failed to create audio nodes');
        return;
      }
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      console.log('AudioGenerator: Click sound generated');
    } catch (e) {
      console.error('Failed to generate click sound:', e);
    }
  }

  static generateErrorSound() {
    if (this.isWxEnvironment()) {
      try {
        const audio = wx.createInnerAudioContext();
        audio.src = 'audio/error.mp3';
        audio.volume = 0.5;
        audio.play();
        console.log('AudioGenerator: Error sound played using wx API');
      } catch (e) {
        console.error('Failed to play error sound using wx API:', e);
      }
      return;
    }
    
    const audioContext = this.getAudioContext();
    if (!audioContext || !audioContext.destination) {
      console.log('AudioGenerator: AudioContext not available, skipping error sound');
      return;
    }
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      if (!oscillator || !gainNode) {
        console.error('Failed to create audio nodes');
        return;
      }
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 200;
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('AudioGenerator: Error sound generated');
    } catch (e) {
      console.error('Failed to generate error sound:', e);
    }
  }

  static generateCompleteSound() {
    if (this.isWxEnvironment()) {
      try {
        const audio = wx.createInnerAudioContext();
        audio.src = 'audio/complete.mp3';
        audio.volume = 0.5;
        audio.play();
        console.log('AudioGenerator: Complete sound played using wx API');
      } catch (e) {
        console.error('Failed to play complete sound using wx API:', e);
      }
      return;
    }
    
    const audioContext = this.getAudioContext();
    if (!audioContext || !audioContext.destination) {
      console.log('AudioGenerator: AudioContext not available, skipping complete sound');
      return;
    }
    
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        if (!oscillator || !gainNode) {
          console.error('Failed to create audio nodes');
          return;
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + index * 0.15;
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      });
      
      console.log('AudioGenerator: Complete sound generated');
    } catch (e) {
      console.error('Failed to generate complete sound:', e);
    }
  }
}
