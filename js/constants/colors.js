// 三色极简色系: 珊瑚橘 #E8725A · 青苔 #5BA88F · 暖灰 #E8E4E0
// 配合白色 #FFFFFF 和 浅灰 #F5F3F0 作为中性底色

export const COLOR_SCHEME = {
  name: '极简三色',
  id: 'minimal-trio',
  background: '#F5F3F0',
  backgroundEnd: '#EDEAE6',
  primary: '#E8725A',
  secondary: '#5BA88F',
  accent: '#5BA88F',
  danger: '#C0392B',
  text: '#E8725A',
  textSecondary: '#6B6878',
  textLight: '#FFFFFF',
  border: 'rgba(232, 114, 90, 0.15)',
  borderActive: 'rgba(91, 168, 143, 0.3)',
  borderSubtle: 'rgba(232, 114, 90, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.06)',
  cardBg: 'rgba(255, 255, 255, 0.9)',
  cardBgSolid: '#FFFFFF',
  buttonPrimary: '#E8725A',
  buttonPrimaryEnd: '#D4634E',
  buttonSecondary: '#5BA88F',
  buttonSuccess: '#5BA88F',
  buttonDanger: '#C0392B',
  numberColors: [
    '#E8725A', '#D4634E', '#5BA88F', '#E8725A', '#D4634E',
    '#5BA88F', '#E8725A', '#D4634E', '#5BA88F', '#E8725A'
  ],
  polygonColors: [
    'rgba(232, 114, 90, 0.05)', 'rgba(91, 168, 143, 0.05)',
    'rgba(232, 114, 90, 0.05)', 'rgba(91, 168, 143, 0.05)',
    'rgba(232, 114, 90, 0.05)', 'rgba(91, 168, 143, 0.05)',
    'rgba(232, 114, 90, 0.05)', 'rgba(91, 168, 143, 0.05)',
    'rgba(232, 114, 90, 0.05)', 'rgba(91, 168, 143, 0.05)',
    'rgba(232, 114, 90, 0.05)', 'rgba(91, 168, 143, 0.05)',
    'rgba(232, 114, 90, 0.05)', 'rgba(91, 168, 143, 0.05)',
    'rgba(232, 114, 90, 0.05)'
  ],
  gradientStart: '#E8725A',
  gradientEnd: '#D4634E',
  glowPrimary: 'rgba(232, 114, 90, 0.15)',
  glowAccent: 'rgba(91, 168, 143, 0.15)',
  glassBg: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(232, 114, 90, 0.08)'
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
