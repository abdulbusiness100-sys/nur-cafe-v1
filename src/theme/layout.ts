// src/theme/layout.ts
import { Dimensions } from 'react-native';

export const SPACING = 16;
export const SCREEN_W = Dimensions.get('window').width;

export const container = {
  width: '100%' as const,
  alignSelf: 'center' as const,
  paddingHorizontal: SPACING,
  maxWidth: 580, // looks identical across iPhones/Androids
};
