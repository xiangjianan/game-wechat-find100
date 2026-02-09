export class AudioGenerator {
  static getAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(e => {
            console.error('Failed to resume AudioContext:', e);
          });
        }
      } catch (e) {
        console.error('Failed to create AudioContext:', e);
        return null;
      }
    }
    return this.audioContext;
  }

  static generateClickSound() {
    const audioContext = this.getAudioContext();
    if (!audioContext || !audioContext.destination) return;
    
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
    } catch (e) {
      console.error('Failed to generate click sound:', e);
    }
  }

  static generateErrorSound() {
    const audioContext = this.getAudioContext();
    if (!audioContext || !audioContext.destination) return;
    
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
    } catch (e) {
      console.error('Failed to generate error sound:', e);
    }
  }

  static generateCompleteSound() {
    const audioContext = this.getAudioContext();
    if (!audioContext || !audioContext.destination) return;
    
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
    } catch (e) {
      console.error('Failed to generate complete sound:', e);
    }
  }
}
