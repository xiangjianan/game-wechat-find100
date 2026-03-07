export const COLOR_SCHEME = {
  name: '经典',
  id: 'classic',
  background: '#FFF5E1',
  primary: '#FF6B35',
  secondary: '#FFD93D',
  accent: '#6BCB77',
  danger: '#FF4757',
  text: '#1A1A2E',
  textLight: '#FFFFFF',
  border: '#1A1A2E',
  borderSubtle: 'rgba(26, 26, 46, 0.25)',
  shadow: '#1A1A2E',
  cardBg: '#FFFFFF',
  buttonPrimary: '#FF6B35',
  buttonSecondary: '#4D96FF',
  buttonSuccess: '#6BCB77',
  buttonDanger: '#FF4757',
  numberColors: [
    '#FF6B35', '#4D96FF', '#6BCB77', '#FFD93D', '#FF4757',
    '#9B59B6', '#00CEC9', '#FD79A8', '#FDCB6E', '#E17055'
  ],
  polygonColors: [
    '#FFEAA7', '#DFE6E9', '#FFEAA7', '#DFE6E9', '#FFEAA7',
    '#DFE6E9', '#FFEAA7', '#DFE6E9', '#FFEAA7', '#DFE6E9',
    '#FFEAA7', '#DFE6E9', '#FFEAA7', '#DFE6E9', '#FFEAA7'
  ]
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
  borderWidth: 4,
  shadowOffset: 6,
  borderRadius: 0,
  fontSize: {
    title: 48,
    subtitle: 24,
    button: 20,
    body: 16
  },
  fontWeight: {
    title: '900',
    subtitle: '800',
    button: '700',
    body: '600'
  }
};
