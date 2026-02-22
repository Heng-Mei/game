import { useEffect, useRef } from 'react';
import { PhaserBridge } from './phaser-bridge';
import type { GameOutgoingEvent } from './events';

type GameHostProps = {
  gameId: string;
  theme: 'day' | 'night';
  onEvent: (event: GameOutgoingEvent) => void;
};

export function GameHost({ gameId, theme, onEvent }: GameHostProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bridgeRef = useRef<PhaserBridge | null>(null);

  useEffect(() => {
    bridgeRef.current = new PhaserBridge();
    return () => bridgeRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !bridgeRef.current) {
      return;
    }

    bridgeRef.current.mount({
      parent: containerRef.current,
      gameId,
      theme,
      onEvent
    });

    return () => bridgeRef.current?.destroy();
  }, [gameId, theme, onEvent]);

  return <div ref={containerRef} className="game-canvas-host" data-testid="game-host-canvas" />;
}
