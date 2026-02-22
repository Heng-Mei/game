import type Phaser from 'phaser';
import type { GameId } from '../contracts/game-contracts';

export type RuntimeSceneDefinition = {
  key: string;
  factory: () => Phaser.Scene;
};

type RuntimeRegistration = {
  id: GameId;
  factory: () => RuntimeSceneDefinition;
};

export function createGameRuntime() {
  const entries = new Map<GameId, RuntimeSceneDefinition>();

  return {
    register(registration: RuntimeRegistration) {
      entries.set(registration.id, registration.factory());
    },
    getSceneKey(id: GameId): string | undefined {
      return entries.get(id)?.key;
    },
    createScene(id: GameId): Phaser.Scene | undefined {
      return entries.get(id)?.factory();
    }
  };
}
