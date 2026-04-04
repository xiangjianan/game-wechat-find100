export const COLOR_SCHEME = {
  name: '暖阳初雪',
  id: 'warm-sunlight',
  background: '#FEFBF6',
  backgroundEnd: '#FAF5EE',
  primary: '#7168E0',
  secondary: '#9580EA',
  accent: '#5A8DEF',
  danger: '#D9617A',
  text: '#2E2A33',
  textSecondary: '#908A96',
  textLight: '#FFFFFF',
  border: 'rgba(160, 150, 168, 0.12)',
  borderActive: 'rgba(113, 104, 224, 0.35)',
  shadow: 'rgba(46, 42, 51, 0.06)',
  cardBg: 'rgba(255, 255, 255, 0.82)',
  cardBgSolid: '#FFFFFF',
  buttonPrimary: '#7168E0',
  buttonPrimaryEnd: '#9580EA',
  buttonSecondary: '#5A8DEF',
  buttonSuccess: '#4BB89E',
  buttonDanger: '#D9617A',
  numberColors: [
    '#7168E0', '#5A8DEF', '#4BB89E', '#E0A04A', '#D9617A',
    '#9580EA', '#D67AAF', '#3DBAB0', '#CC8B4D', '#52ACD6'
  ],
  polygonColors: [
    'rgba(113, 104, 224, 0.05)', 'rgba(90, 141, 239, 0.05)',
    'rgba(149, 128, 234, 0.05)', 'rgba(75, 184, 158, 0.05)',
    'rgba(224, 160, 74, 0.05)', 'rgba(113, 104, 224, 0.05)',
    'rgba(90, 141, 239, 0.05)', 'rgba(149, 128, 234, 0.05)',
    'rgba(75, 184, 158, 0.05)', 'rgba(224, 160, 74, 0.05)',
    'rgba(113, 104, 224, 0.05)', 'rgba(90, 141, 239, 0.05)',
    'rgba(149, 128, 234, 0.05)', 'rgba(75, 184, 158, 0.05)',
    'rgba(224, 160, 74, 0.05)'
  ],
  gradientStart: '#7168E0',
  gradientEnd: '#5A8DEF',
  glowPrimary: 'rgba(113, 104, 224, 0.18)',
  glowAccent: 'rgba(90, 141, 239, 0.12)',
  glassBg: 'rgba(255, 255, 255, 0.65)',
  glassBorder: 'rgba(160, 150, 168, 0.10)'
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
