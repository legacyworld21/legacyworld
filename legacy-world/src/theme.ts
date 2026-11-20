// Tokens de marca extraídos de legacy-world.com (negro / blanco / azul #032A67)
export const colors = {
  bg: '#000000',
  surface: '#141414',
  surface2: '#1C1C1C',
  border: '#2A2A2A',
  text: '#F4F1EA',
  muted: '#8C8880',
  accent: '#FFFFFF', // blanco sobre negro (marca)
  navy: '#032A67', // azul de marca (legacy-world.com)
  accentDark: '#BDBDBD',
  danger: '#E5484D',
  success: '#3DD68C',
};

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 14, lg: 22, pill: 999 };

export const type = {
  display: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -1, color: colors.text },
  h1: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.5, color: colors.text },
  h2: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 21 },
  small: { fontSize: 12, color: colors.muted, letterSpacing: 0.4 },
  eyebrow: { fontSize: 11, fontWeight: '700' as const, color: colors.accent, letterSpacing: 2 },
};
