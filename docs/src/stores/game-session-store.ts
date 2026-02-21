import { create } from 'zustand';

type GameStatus = 'idle' | 'running' | 'paused' | 'over';

type GameSessionState = {
  activeGameId: string;
  score: number;
  status: GameStatus;
  setActiveGame: (gameId: string) => void;
  setScore: (score: number) => void;
  setStatus: (status: GameStatus) => void;
};

export const useGameSessionStore = create<GameSessionState>((set) => ({
  activeGameId: '',
  score: 0,
  status: 'idle',
  setActiveGame: (gameId) => set({ activeGameId: gameId }),
  setScore: (score) => set({ score }),
  setStatus: (status) => set({ status })
}));
