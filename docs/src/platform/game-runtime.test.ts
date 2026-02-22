import { describe, expect, it } from 'vitest';
import type Phaser from 'phaser';
import { createGameRuntime } from './game-runtime';

describe('game-runtime', () => {
  it('registers and resolves scene key by game id', () => {
    const runtime = createGameRuntime();
    runtime.register({
      id: 'tetris',
      factory: () => ({
        key: 'scene:tetris',
        factory: () => ({ key: 'inline-scene' } as unknown as Phaser.Scene)
      })
    });

    expect(runtime.getSceneKey('tetris')).toBe('scene:tetris');
  });
});
