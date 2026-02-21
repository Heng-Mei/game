import Phaser from 'phaser';
import type { GameOutgoingEvent } from './events';

export abstract class BaseScene extends Phaser.Scene {
  protected readonly gameId: string;
  private readonly emitEvent?: (event: GameOutgoingEvent) => void;

  constructor(key: string, gameId: string, emitEvent?: (event: GameOutgoingEvent) => void) {
    super(key);
    this.gameId = gameId;
    this.emitEvent = emitEvent;
  }

  protected dispatch(event: GameOutgoingEvent): void {
    this.emitEvent?.(event);
  }
}
