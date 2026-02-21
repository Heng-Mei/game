export type GameReadyEvent = {
  type: 'GAME_READY';
  gameId: string;
};

export type GameStateChangedEvent = {
  type: 'GAME_STATE_CHANGED';
  gameId: string;
  state: 'idle' | 'running' | 'paused' | 'over';
};

export type ScoreChangedEvent = {
  type: 'SCORE_CHANGED';
  gameId: string;
  score: number;
};

export type GameOutgoingEvent = GameReadyEvent | GameStateChangedEvent | ScoreChangedEvent;

export type GameIncomingEvent =
  | { type: 'BOOT_GAME'; gameId: string }
  | { type: 'APPLY_THEME'; theme: 'day' | 'night' }
  | { type: 'RESTART' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' };
