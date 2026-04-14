// 简约蓝色系 (低饱和): 主题蓝 #1E88E5 · 深蓝 #1565C0
// 点缀: 浅蓝 #90CAF9 · 柔绿 #4CAF50 · 珊瑚红 #EF5350

export const COLOR_SCHEME = {
  name: '简约蓝',
  id: 'minimalist-blue',
  background: '#F5F7FA',
  backgroundEnd: '#EEF1F5',
  primary: '#1E88E5',
  secondary: '#90CAF9',
  accent: '#4CAF50',
  danger: '#EF5350',
  text: '#333333',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  border: 'rgba(30, 136, 229, 0.12)',
  borderActive: 'rgba(30, 136, 229, 0.35)',
  borderSubtle: 'rgba(30, 136, 229, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  cardBg: 'rgba(255, 255, 255, 0.96)',
  cardBgSolid: '#FFFFFF',
  buttonPrimary: '#1E88E5',
  buttonPrimaryEnd: '#1565C0',
  buttonSecondary: '#90CAF9',
  buttonSuccess: '#4CAF50',
  buttonDanger: '#EF5350',
  numberColors: [
    '#1E88E5', '#EF5350', '#4CAF50', '#FF9800', '#7E57C2',
    '#26A69A', '#1E88E5', '#EF5350', '#4CAF50', '#7E57C2'
  ],
  polygonColors: [
    'rgba(30, 136, 229, 0.04)', 'rgba(144, 202, 249, 0.04)',
    'rgba(76, 175, 80, 0.04)', 'rgba(239, 83, 80, 0.04)',
    'rgba(126, 87, 194, 0.04)', 'rgba(38, 166, 154, 0.04)',
    'rgba(30, 136, 229, 0.04)', 'rgba(144, 202, 249, 0.04)',
    'rgba(76, 175, 80, 0.04)', 'rgba(239, 83, 80, 0.04)',
    'rgba(126, 87, 194, 0.04)', 'rgba(38, 166, 154, 0.04)',
    'rgba(30, 136, 229, 0.04)', 'rgba(144, 202, 249, 0.04)',
    'rgba(76, 175, 80, 0.04)'
  ],
  gradientStart: '#1E88E5',
  gradientEnd: '#1565C0',
  glowPrimary: 'rgba(30, 136, 229, 0.2)',
  glowAccent: 'rgba(144, 202, 249, 0.2)',
  glassBg: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(30, 136, 229, 0.08)',
  // Minimalist theme extras
  iconBg: '#E3F2FD',
  iconColor: '#1E88E5',
  lightBlueBg: '#E3F2FD',
  warmGrayBg: '#F5F5F5'
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
  borderRadius: 16,
  fontSize: {
    title: 42,
    subtitle: 22,
    button: 18,
    body: 15
  },
  fontWeight: {
    title: '700',
    subtitle: '600',
    button: '500',
    body: '400'
  }
};
