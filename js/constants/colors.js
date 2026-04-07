// 波普糖果色系: 明蓝 #4A90D9 · 明黄 #F5C542 · 粉白 #FFF8F0
// 点缀: 珊瑚 #E8725A · 薄荷 #5EC4B6 · 薰衣草 #9B8EC4

export const COLOR_SCHEME = {
  name: '波普糖果',
  id: 'pop-candy',
  background: '#FFF8F0',
  backgroundEnd: '#FFF0E6',
  primary: '#4A90D9',
  secondary: '#F5C542',
  accent: '#5EC4B6',
  danger: '#E8725A',
  text: '#4A90D9',
  textSecondary: '#8B8B8B',
  textLight: '#FFFFFF',
  border: 'rgba(74, 144, 217, 0.12)',
  borderActive: 'rgba(245, 197, 66, 0.4)',
  borderSubtle: 'rgba(74, 144, 217, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.06)',
  cardBg: 'rgba(255, 255, 255, 0.92)',
  cardBgSolid: '#FFFFFF',
  buttonPrimary: '#4A90D9',
  buttonPrimaryEnd: '#6AA8E8',
  buttonSecondary: '#F5C542',
  buttonSuccess: '#5EC4B6',
  buttonDanger: '#E8725A',
  numberColors: [
    '#4A90D9', '#E8725A', '#5EC4B6', '#F5C542', '#9B8EC4',
    '#4A90D9', '#E8725A', '#5EC4B6', '#F5C542', '#9B8EC4'
  ],
  polygonColors: [
    'rgba(74, 144, 217, 0.05)', 'rgba(245, 197, 66, 0.05)',
    'rgba(94, 196, 182, 0.05)', 'rgba(232, 114, 90, 0.05)',
    'rgba(155, 142, 196, 0.05)', 'rgba(74, 144, 217, 0.05)',
    'rgba(245, 197, 66, 0.05)', 'rgba(94, 196, 182, 0.05)',
    'rgba(232, 114, 90, 0.05)', 'rgba(155, 142, 196, 0.05)',
    'rgba(74, 144, 217, 0.05)', 'rgba(245, 197, 66, 0.05)',
    'rgba(94, 196, 182, 0.05)', 'rgba(232, 114, 90, 0.05)',
    'rgba(155, 142, 196, 0.05)'
  ],
  gradientStart: '#4A90D9',
  gradientEnd: '#6AA8E8',
  glowPrimary: 'rgba(74, 144, 217, 0.2)',
  glowAccent: 'rgba(245, 197, 66, 0.2)',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(74, 144, 217, 0.08)'
};

export function getColorScheme() {
  return COLOR_SCHEME;
}

export const COLORS = {
  get NUMBER_COLORS() {
    return COLOR_SCHEME.numberColors;
  },

  get STATE_COLORS() {
    return {
      default: COLOR_SCHEME.cardBg,
      clicked: COLOR_SCHEME.buttonSuccess,
      highlighted: COLOR_SCHEME.accent,
      error: COLOR_SCHEME.danger,
      border: COLOR_SCHEME.border,
      textClicked: COLOR_SCHEME.textLight,
      textDefault: COLOR_SCHEME.text
    };
  },

  get POLYGON_COLORS() {
    return COLOR_SCHEME.polygonColors;
  },

  get SCHEME() {
    return COLOR_SCHEME;
  }
};

export const BRUTALISM_STYLES = {
  borderWidth: 0,
  shadowOffset: 0,
  borderRadius: 18,
  fontSize: {
    title: 48,
    subtitle: 24,
    button: 20,
    body: 16
  },
  fontWeight: {
    title: '800',
    subtitle: '700',
    button: '600',
    body: '400'
  }
};
