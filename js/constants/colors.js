export const COLOR_SCHEME = {
  name: '活力暖彩',
  id: 'vibrant-warm',
  background: '#FFFBF5',
  backgroundEnd: '#FFF1E6',
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#3B82F6',
  danger: '#EF4444',
  success: '#10B981',
  text: '#1E1B4B',
  textSecondary: '#6B7280',
  textLight: '#FFFFFF',
  border: 'rgba(148, 163, 184, 0.12)',
  borderActive: 'rgba(99, 102, 241, 0.4)',
  borderSubtle: 'rgba(148, 163, 184, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.06)',
  cardBg: 'rgba(255, 255, 255, 0.88)',
  cardBgSolid: '#FFFFFF',
  buttonPrimary: '#6366F1',
  buttonPrimaryEnd: '#818CF8',
  buttonSecondary: '#8B5CF6',
  buttonSuccess: '#10B981',
  buttonDanger: '#EF4444',
  numberColors: [
    '#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4'
  ],
  polygonColors: [
    'rgba(99, 102, 241, 0.08)', 'rgba(59, 130, 246, 0.08)',
    'rgba(139, 92, 246, 0.08)', 'rgba(16, 185, 129, 0.08)',
    'rgba(249, 115, 22, 0.08)', 'rgba(236, 72, 153, 0.08)',
    'rgba(20, 184, 166, 0.08)', 'rgba(245, 158, 11, 0.08)',
    'rgba(6, 182, 212, 0.08)', 'rgba(249, 115, 22, 0.08)',
    'rgba(99, 102, 241, 0.08)', 'rgba(59, 130, 246, 0.08)',
    'rgba(139, 92, 246, 0.08)', 'rgba(16, 185, 129, 0.08)',
    'rgba(249, 115, 22, 0.08)'
  ],
  gradientStart: '#6366F1',
  gradientEnd: '#3B82F6',
  glowPrimary: 'rgba(99, 102, 241, 0.2)',
  glowAccent: 'rgba(59, 130, 246, 0.15)',
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(148, 163, 184, 0.10)'
};

export const COLOR_SCHEME_DARK = {
  name: '深邃夜空',
  id: 'deep-night',
  background: '#1A1B2E',
  backgroundEnd: '#16172B',
  primary: '#818CF8',
  secondary: '#A78BFA',
  accent: '#60A5FA',
  danger: '#F87171',
  success: '#34D399',
  text: '#E2E8F0',
  textSecondary: '#94A3B8',
  textLight: '#FFFFFF',
  border: 'rgba(148, 163, 184, 0.15)',
  borderActive: 'rgba(129, 140, 248, 0.5)',
  borderSubtle: 'rgba(148, 163, 184, 0.10)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  cardBg: 'rgba(30, 32, 52, 0.92)',
  cardBgSolid: '#1E2034',
  buttonPrimary: '#818CF8',
  buttonPrimaryEnd: '#A78BFA',
  buttonSecondary: '#A78BFA',
  buttonSuccess: '#34D399',
  buttonDanger: '#F87171',
  numberColors: [
    '#818CF8', '#60A5FA', '#34D399', '#FBBF24', '#F87171',
    '#A78BFA', '#F472B6', '#2DD4BF', '#FB923C', '#22D3EE'
  ],
  polygonColors: [
    'rgba(129, 140, 248, 0.12)', 'rgba(96, 165, 250, 0.12)',
    'rgba(167, 139, 250, 0.12)', 'rgba(52, 211, 153, 0.12)',
    'rgba(251, 146, 60, 0.12)', 'rgba(244, 114, 182, 0.12)',
    'rgba(45, 212, 191, 0.12)', 'rgba(251, 191, 36, 0.12)',
    'rgba(34, 211, 238, 0.12)', 'rgba(251, 146, 60, 0.12)',
    'rgba(129, 140, 248, 0.12)', 'rgba(96, 165, 250, 0.12)',
    'rgba(167, 139, 250, 0.12)', 'rgba(52, 211, 153, 0.12)',
    'rgba(251, 146, 60, 0.12)'
  ],
  gradientStart: '#818CF8',
  gradientEnd: '#60A5FA',
  glowPrimary: 'rgba(129, 140, 248, 0.25)',
  glowAccent: 'rgba(96, 165, 250, 0.2)',
  glassBg: 'rgba(30, 32, 52, 0.8)',
  glassBorder: 'rgba(148, 163, 184, 0.12)'
};

let currentMode = 'light';

export function setColorMode(mode) {
  currentMode = mode;
}

export function getColorMode() {
  return currentMode;
}

export function getColorScheme() {
  return currentMode === 'dark' ? COLOR_SCHEME_DARK : COLOR_SCHEME;
}

export const COLORS = {
  get NUMBER_COLORS() {
    return getColorScheme().numberColors;
  },

  get STATE_COLORS() {
    const scheme = getColorScheme();
    return {
      default: scheme.cardBg,
      clicked: scheme.buttonSuccess,
      highlighted: scheme.accent,
      error: scheme.danger,
      border: scheme.border,
      textClicked: scheme.textLight,
      textDefault: scheme.text
    };
  },

  get POLYGON_COLORS() {
    return getColorScheme().polygonColors;
  },

  get SCHEME() {
    return getColorScheme();
  }
};

export const BRUTALISM_STYLES = {
  borderWidth: 0,
  shadowOffset: 0,
  borderRadius: 16,
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
