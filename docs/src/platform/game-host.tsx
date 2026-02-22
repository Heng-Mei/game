import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import type { GameId } from '../contracts/game-contracts';
import type { GameOutgoingEvent } from '../game-core/events';
import { createSceneForGame } from './game-registry';
import { createGameRuntime } from './game-runtime';

type GameHostProps = {
  gameId: GameId;
  theme: 'day' | 'night';
  onEvent: (event: GameOutgoingEvent) => void;
};

export function GameHost({ gameId, theme, onEvent }: GameHostProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const runtime = createGameRuntime();
    runtime.register({
      id: gameId,
      factory: () => ({
        key: `scene:${gameId}`,
        factory: () => createSceneForGame(gameId, theme, onEvent)
      })
    });

    const scene = runtime.createScene(gameId);
    if (!scene) {
      return;
    }

    const instance = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: theme === 'night' ? '#0c111b' : '#eef3ff',
      scene: [scene],
      fps: { target: 60, forceSetTimeOut: true },
      pixelArt: true,
      antialias: false,
      antialiasGL: false,
      autoRound: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.NO_CENTER,
        width: 960,
        height: 640
      }
    });

    return () => {
      instance.destroy(true);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [gameId, theme, onEvent]);

  return <div ref={containerRef} className="game-canvas-host" data-testid="game-host-canvas" />;
}
