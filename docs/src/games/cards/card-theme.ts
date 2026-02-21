export type CardThemeMode = 'day' | 'night';

export type CardSuitStyle = {
  symbol: string;
  color: string;
};

export function getCardSuitTheme(mode: CardThemeMode): Record<'spade' | 'heart' | 'club' | 'diamond', CardSuitStyle> {
  const darkColor = mode === 'night' ? '#f3f6ff' : '#101727';
  const redColor = mode === 'night' ? '#ff8f8f' : '#c02f2f';
  return {
    spade: { symbol: '♠', color: darkColor },
    heart: { symbol: '♥', color: redColor },
    club: { symbol: '♣', color: darkColor },
    diamond: { symbol: '♦', color: redColor }
  };
}
