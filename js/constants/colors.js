// 日式和风色系: 灰蓝 #6B7F99 · 大地 #A89585 · 和纸 #F0EBE3
// 配合白色 #FFFFFF 作为中性底色

export const COLOR_SCHEME = {
  name: '日式和风',
  id: 'wabi-sabi',
  background: '#F0EBE3',
  backgroundEnd: '#E8E2D9',
  primary: '#6B7F99',
  secondary: '#A89585',
  accent: '#A89585',
  danger: '#8B5E5E',
  text: '#6B7F99',
  textSecondary: '#8B8B8B',
  textLight: '#FFFFFF',
  border: 'rgba(107, 127, 153, 0.12)',
  borderActive: 'rgba(168, 149, 133, 0.3)',
  borderSubtle: 'rgba(107, 127, 153, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.05)',
  cardBg: 'rgba(255, 255, 255, 0.9)',
  cardBgSolid: '#FFFFFF',
  buttonPrimary: '#6B7F99',
  buttonPrimaryEnd: '#5A6E87',
  buttonSecondary: '#A89585',
  buttonSuccess: '#A89585',
  buttonDanger: '#8B5E5E',
  numberColors: [
    '#6B7F99', '#5A6E87', '#A89585', '#6B7F99', '#5A6E87',
    '#A89585', '#6B7F99', '#5A6E87', '#A89585', '#6B7F99'
  ],
  polygonColors: [
    'rgba(107, 127, 153, 0.04)', 'rgba(168, 149, 133, 0.04)',
    'rgba(107, 127, 153, 0.04)', 'rgba(168, 149, 133, 0.04)',
    'rgba(107, 127, 153, 0.04)', 'rgba(168, 149, 133, 0.04)',
    'rgba(107, 127, 153, 0.04)', 'rgba(168, 149, 133, 0.04)',
    'rgba(107, 127, 153, 0.04)', 'rgba(168, 149, 133, 0.04)',
    'rgba(107, 127, 153, 0.04)', 'rgba(168, 149, 133, 0.04)',
    'rgba(107, 127, 153, 0.04)', 'rgba(168, 149, 133, 0.04)',
    'rgba(107, 127, 153, 0.04)'
  ],
  gradientStart: '#6B7F99',
  gradientEnd: '#5A6E87',
  glowPrimary: 'rgba(107, 127, 153, 0.15)',
  glowAccent: 'rgba(168, 149, 133, 0.15)',
  glassBg: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(107, 127, 153, 0.08)'
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
