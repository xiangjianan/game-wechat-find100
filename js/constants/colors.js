export const COLOR_SCHEMES = {
  CLASSIC: {
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
  },
  
  NATURE: {
    name: '自然',
    id: 'nature',
    background: '#F0FFF4',
    primary: '#38A169',
    secondary: '#48BB78',
    accent: '#ED8936',
    danger: '#E53E3E',
    text: '#1A202C',
    textLight: '#FFFFFF',
    border: '#1A202C',
    shadow: '#1A202C',
    cardBg: '#FFFFFF',
    buttonPrimary: '#38A169',
    buttonSecondary: '#3182CE',
    buttonSuccess: '#38A169',
    buttonDanger: '#E53E3E',
    numberColors: [
      '#38A169', '#3182CE', '#ED8936', '#805AD5', '#DD6B20',
      '#00B5D8', '#D69E2E', '#E53E3E', '#319795', '#9F7AEA'
    ],
    polygonColors: [
      '#C6F6D5', '#BEE3F8', '#FEEBC8', '#E9D8FD', '#FED7AA',
      '#C6F6D5', '#BEE3F8', '#FEEBC8', '#E9D8FD', '#FED7AA',
      '#C6F6D5', '#BEE3F8', '#FEEBC8', '#E9D8FD', '#FED7AA'
    ]
  }
};

let currentScheme = COLOR_SCHEMES.CLASSIC;

export function setColorScheme(schemeId) {
  const scheme = Object.values(COLOR_SCHEMES).find(s => s.id === schemeId);
  if (scheme) {
    currentScheme = scheme;
  }
}

export function getColorScheme() {
  return currentScheme;
}

export function getAllColorSchemes() {
  return Object.values(COLOR_SCHEMES);
}

export const COLORS = {
  get NUMBER_COLORS() {
    return currentScheme.numberColors;
  },
  
  get STATE_COLORS() {
    return {
      default: currentScheme.cardBg,
      clicked: currentScheme.buttonSuccess,
      highlighted: currentScheme.accent,
      error: currentScheme.danger,
      border: currentScheme.border,
      textClicked: currentScheme.textLight,
      textDefault: currentScheme.text
    };
  },
  
  get POLYGON_COLORS() {
    return currentScheme.polygonColors;
  },
  
  get SCHEME() {
    return currentScheme;
  },
  
  NUMBER_COLORS_STATIC: [
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#10B981',
    '#06B6D4',
    '#6366F1',
    '#F97316',
    '#14B8A6',
    '#A855F7',
  ],

  STATE_COLORS_STATIC: {
    default: '#F8FAFC',
    clicked: '#10B981',
    highlighted: '#F59E0B',
    error: '#EF4444',
    border: '#64748B',
    textClicked: '#FFFFFF',
  },

  POLYGON_COLORS_STATIC: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9'
  ]
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
