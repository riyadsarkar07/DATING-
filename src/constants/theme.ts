export const colors = {
  ink: {
    950: '#05050A',
    900: '#0A0A14',
    800: '#12121F',
    700: '#1A1A2E',
    600: '#24243A',
    500: '#2E2E4A',
  },
  violet: {
    300: '#C4A8FF',
    400: '#9D6FFF',
    500: '#8A4FFF',
    600: '#7C4DFF',
    700: '#6A35E8',
  },
  blush: {
    300: '#FF8FD0',
    400: '#FF63BB',
    500: '#FF3EA5',
    600: '#F12593',
  },
  aqua: {
    300: '#66DAFF',
    400: '#38CFFC',
    500: '#00D1FF',
    600: '#00AEEB',
  },
  gold: {
    400: '#FFD76A',
    500: '#FFC53D',
    600: '#F5A623',
  },
  green: '#3DDC97',
  red: '#FF5B79',
  danger: '#FF5B79',
  white: '#FFFFFF',
  offWhite: '#EDEDF7',
  textSecondary: '#A6A6C4',
  textTertiary: '#6F6F94',
  surfaceGlass: 'rgba(255,255,255,0.06)',
  surfaceGlassStrong: 'rgba(255,255,255,0.10)',
  borderGlass: 'rgba(255,255,255,0.12)',
};

export const gradients = {
  primary: ['#FF3EA5', '#8A4FFF'] as const,
  primaryReverse: ['#8A4FFF', '#FF3EA5'] as const,
  premium: ['#FFC53D', '#FF3EA5'] as const,
  diamond: ['#00D1FF', '#7C4DFF'] as const,
  gold: ['#FFE29A', '#F5A623'] as const,
  sunset: ['#FF5B79', '#FF3EA5', '#8A4FFF'] as const,
  card: ['#1A1A2E', '#12121F'] as const,
  overlay: ['rgba(5,5,10,0)', 'rgba(5,5,10,0.92)'] as const,
  button: ['#7C4DFF', '#FF3EA5'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const typography = {
  display: { fontSize: 40, lineHeight: 48, fontWeight: '800' as const },
  title: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  heading: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const },
  subheading: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  caption: { fontSize: 11, lineHeight: 16, fontWeight: '500' as const },
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  glowViolet: {
    shadowColor: '#7C4DFF',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  glowBlush: {
    shadowColor: '#FF3EA5',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
};

export const layout = {
  screenPadding: 20,
  maxContentWidth: 480,
};

export const navigationThemeColors = {
  background: colors.ink[950],
  card: colors.ink[900],
  text: colors.white,
  border: colors.borderGlass,
  primary: colors.violet[600],
  notification: colors.blush[500],
};
