import { setColorMode, getColorMode } from './constants/colors';

const SETTINGS_KEY = 'gameSettings';

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  vibrationEnabled: true,
  darkMode: 'auto'
};

export default class SettingsManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.onSettingsChanged = null;
  }

  init() {
    this.load();
    this.applyDarkMode();
  }

  load() {
    if (typeof wx === 'undefined' || !wx.getStorageSync) return;
    try {
      const saved = wx.getStorageSync(SETTINGS_KEY);
      if (saved && typeof saved === 'object') {
        this.settings = { ...DEFAULT_SETTINGS, ...saved };
      }
    } catch (e) {
      // Use defaults
    }
  }

  save() {
    if (typeof wx === 'undefined' || !wx.setStorageSync) return;
    try {
      wx.setStorageSync(SETTINGS_KEY, this.settings);
    } catch (e) {
      // Silent fail
    }
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.save();

    if (key === 'darkMode') {
      this.applyDarkMode();
    }

    if (this.onSettingsChanged) {
      this.onSettingsChanged(key, value);
    }
  }

  applyDarkMode() {
    const mode = this.settings.darkMode;
    if (mode === 'auto') {
      const prefersDark = typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
      setColorMode(prefersDark ? 'dark' : 'light');
    } else {
      setColorMode(mode);
    }
  }

  isSoundEnabled() {
    return this.settings.soundEnabled;
  }

  isVibrationEnabled() {
    return this.settings.vibrationEnabled;
  }

  getDarkMode() {
    return this.settings.darkMode;
  }

  toggleSound() {
    this.set('soundEnabled', !this.settings.soundEnabled);
    return this.settings.soundEnabled;
  }

  toggleVibration() {
    this.set('vibrationEnabled', !this.settings.vibrationEnabled);
    return this.settings.vibrationEnabled;
  }

  cycleDarkMode() {
    const modes = ['auto', 'light', 'dark'];
    const currentIdx = modes.indexOf(this.settings.darkMode);
    const nextIdx = (currentIdx + 1) % modes.length;
    this.set('darkMode', modes[nextIdx]);
    return this.settings.darkMode;
  }

  getAll() {
    return { ...this.settings };
  }
}
