export const colors = {
  bg: '#0B0B0B',
  surface: '#151515',
  surfaceHigh: '#1F1F1F',
  border: '#262626',
  text: '#F2F2F2',
  muted: '#8A8A8A',
  faint: '#555555',
  accent: '#D4FF3A',
  onAccent: '#0B0B0B',
  danger: '#FF5A4E',
} as const;

export const fonts = {
  display: 'Anton_400Regular',
  body: 'Archivo_400Regular',
  bodySemi: 'Archivo_600SemiBold',
  bodyBold: 'Archivo_800ExtraBold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 20, pill: 999 } as const;
