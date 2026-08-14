import { DefaultTheme } from '@react-navigation/native';
import { navigationThemeColors } from '../constants/theme';

export const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: navigationThemeColors,
};
