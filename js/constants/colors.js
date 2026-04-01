export const COLOR_SCHEME = {
  name: '毛玻璃',
  id: 'glass',
  background: 'rgba(241, 244, 253, 1)',
  backgroundEnd: 'rgba(236, 240, 255, 1)',
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#3B82F6',
  danger: '#EF4444',
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#FFFFFF',
  border: 'rgba(148, 163, 184, 0.15)',
  borderActive: 'rgba(99, 102, 241, 0.4)',
  shadow: 'rgba(99, 102, 241, 0.08)',
  cardBg: 'rgba(255, 255, 255, 0.55)',
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
    'rgba(249, 115, 22, 0.08)', 'rgba(99, 102, 241, 0.08)',
    'rgba(59, 130, 246, 0.08)', 'rgba(139, 92, 246, 0.08)',
    'rgba(16, 185, 129, 0.08)', 'rgba(249, 115, 22, 0.08)',
    'rgba(99, 102, 241, 0.08)', 'rgba(59, 130, 246, 0.08)',
    'rgba(139, 92, 246, 0.08)', 'rgba(16, 185, 129, 0.08)',
    'rgba(249, 115, 22, 0.08)'
  ],
  gradientStart: '#6366F1',
  gradientEnd: '#3B82F6',
  glowPrimary: 'rgba(99, 102, 241, 0.2)',
  glowAccent: 'rgba(59, 130, 246, 0.15)',
  glassBg: 'rgba(255, 255, 255, 0.45)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
  // Glass-specific additions
  glassBgHeavy: 'rgba(255, 255, 255, 0.65)',
  glassBgLight: 'rgba(255, 255, 255, 0.3)',
  glassBorderLight: 'rgba(255, 255, 255, 0.8)',
  glassShadow: 'rgba(99, 102, 241, 0.06)',
  aurora1: 'rgba(99, 102, 241, 0.12)',
  aurora2: 'rgba(59, 130, 246, 0.10)',
  aurora3: 'rgba(139, 92, 246, 0.08)',
  aurora4: 'rgba(16, 185, 129, 0.07)',
  aurora5: 'rgba(236, 72, 153, 0.06)'
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
