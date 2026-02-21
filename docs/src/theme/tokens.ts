export type ThemeMode = 'system' | 'day' | 'night';
export type ResolvedTheme = 'day' | 'night';

export type ThemeTokens = {
  bg: string;
  surface: string;
  elevated: string;
  text: string;
  muted: string;
  line: string;
  primary: string;
  success: string;
  warn: string;
  danger: string;
};

export const dayTokens: ThemeTokens = {
  bg: '#f3f5f9',
  surface: '#ffffff',
  elevated: '#ffffff',
  text: '#101727',
  muted: '#516179',
  line: '#d7deea',
  primary: '#2563eb',
  success: '#0f9a4a',
  warn: '#b26b00',
  danger: '#c02f2f'
};

export const nightTokens: ThemeTokens = {
  bg: '#0c111b',
  surface: '#141c2b',
  elevated: '#1a2436',
  text: '#eef3ff',
  muted: '#a9b7cf',
  line: '#2d3850',
  primary: '#63a4ff',
  success: '#4cc97d',
  warn: '#ffbe5c',
  danger: '#ff7d7d'
};

export const themeTokens = {
  day: dayTokens,
  night: nightTokens
};
