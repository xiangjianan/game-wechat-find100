export default class VibrationManager {
  constructor() {
    this.enabled = true;
    this.supported = false;
    this.checkSupport();
  }

  checkSupport() {
    if (typeof wx !== 'undefined') {
      this.supported = typeof wx.vibrateShort === 'function' || typeof wx.vibrateLong === 'function';
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      this.supported = true;
    } else {
      this.supported = false;
    }
  }

  vibrateShort() {
    if (!this.enabled || !this.supported) return;

    try {
      if (typeof wx !== 'undefined' && typeof wx.vibrateShort === 'function') {
        wx.vibrateShort({ type: 'light' });
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
    } catch (e) {}
  }

  vibrateMedium() {
    if (!this.enabled || !this.supported) return;

    try {
      if (typeof wx !== 'undefined' && typeof wx.vibrateShort === 'function') {
        wx.vibrateShort({ type: 'medium' });
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch (e) {}
  }

  vibrateLong() {
    if (!this.enabled || !this.supported) return;

    try {
      if (typeof wx !== 'undefined' && typeof wx.vibrateLong === 'function') {
        wx.vibrateLong({});
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (e) {}
  }

  vibratePattern(pattern) {
    if (!this.enabled || !this.supported) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      } else if (typeof wx !== 'undefined') {
        this.playPatternOnWx(pattern);
      }
    } catch (e) {}
  }

  playPatternOnWx(pattern) {
    let delay = 0;
    for (let i = 0; i < pattern.length; i += 2) {
      const wait = pattern[i] || 0;
      const vibrate = pattern[i + 1] || 0;
      delay += wait;

      setTimeout(() => {
        if (vibrate <= 15) {
          this.vibrateShort();
        } else if (vibrate <= 50) {
          this.vibrateMedium();
        } else {
          this.vibrateLong();
        }
      }, delay);

      delay += vibrate;
    }
  }

  vibrateCorrect() {
    if (!this.enabled || !this.supported) return;

    try {
      if (typeof wx !== 'undefined' && typeof wx.vibrateShort === 'function') {
        wx.vibrateShort({ type: 'light' });
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([20]);
      }
    } catch (e) {}
  }

  vibrateError() {
    if (!this.enabled || !this.supported) return;

    try {
      if (typeof wx !== 'undefined' && typeof wx.vibrateShort === 'function') {
        wx.vibrateShort({ type: 'heavy' });
        setTimeout(() => {
          if (this.enabled) {
            wx.vibrateShort({ type: 'heavy' });
          }
        }, 80);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 40, 40]);
      }
    } catch (e) {}
  }

  vibrateCombo(intensity) {
    if (!this.enabled || !this.supported) return;

    try {
      switch (intensity) {
        case 'light':
          if (typeof wx !== 'undefined' && typeof wx.vibrateShort === 'function') {
            wx.vibrateShort({ type: 'light' });
          } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(20);
          }
          break;
          
        case 'medium':
          if (typeof wx !== 'undefined' && typeof wx.vibrateShort === 'function') {
            wx.vibrateShort({ type: 'medium' });
            setTimeout(() => {
              if (this.enabled && typeof wx.vibrateShort === 'function') {
                wx.vibrateShort({ type: 'medium' });
              }
            }, 50);
          } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([30, 30, 30]);
          }
          break;
          
        case 'heavy':
          if (typeof wx !== 'undefined' && typeof wx.vibrateLong === 'function') {
            wx.vibrateLong({});
          } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([50, 30, 50, 30, 50]);
          }
          break;
          
        default:
          this.vibrateShort();
      }
    } catch (e) {}
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  isSupported() {
    return this.supported;
  }
}
