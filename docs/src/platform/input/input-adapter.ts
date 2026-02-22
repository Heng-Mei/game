import { ActionBus, type CanonicalAction } from './action-bus';
import { detectSwipe, type Point } from './gesture-detector';

type InputAdapterOptions = {
  target: HTMLElement;
  keyboardTarget?: Document;
  bus: ActionBus;
  keyMap?: Partial<Record<string, CanonicalAction>>;
};

const defaultKeyMap: Record<string, CanonicalAction> = {
  ArrowLeft: 'move_left',
  ArrowRight: 'move_right',
  ArrowUp: 'move_up',
  ArrowDown: 'move_down',
  KeyA: 'move_left',
  KeyD: 'move_right',
  KeyW: 'move_up',
  KeyS: 'move_down',
  KeyP: 'pause',
  KeyR: 'restart',
  Space: 'primary'
};

export class InputAdapter {
  private readonly target: HTMLElement;
  private readonly keyboardTarget: Document;
  private readonly bus: ActionBus;
  private readonly keyMap: Record<string, CanonicalAction | undefined>;
  private pointerStart: Point | null = null;

  constructor(options: InputAdapterOptions) {
    this.target = options.target;
    this.keyboardTarget = options.keyboardTarget ?? document;
    this.bus = options.bus;
    this.keyMap = {
      ...defaultKeyMap,
      ...(options.keyMap ?? {})
    };
  }

  mount() {
    this.keyboardTarget.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('pointerdown', this.onPointerDown);
    this.target.addEventListener('pointerup', this.onPointerUp);
    this.target.addEventListener('pointercancel', this.onPointerCancel);
  }

  destroy() {
    this.keyboardTarget.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('pointerdown', this.onPointerDown);
    this.target.removeEventListener('pointerup', this.onPointerUp);
    this.target.removeEventListener('pointercancel', this.onPointerCancel);
    this.pointerStart = null;
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const action = this.keyMap[event.code];
    if (!action) {
      return;
    }
    event.preventDefault();
    this.bus.emit(action);
  };

  private onPointerDown = (event: PointerEvent) => {
    this.pointerStart = { x: event.clientX, y: event.clientY };
  };

  private onPointerUp = (event: PointerEvent) => {
    if (!this.pointerStart) {
      return;
    }
    const end = { x: event.clientX, y: event.clientY };
    const swipe = detectSwipe(this.pointerStart, end);
    this.pointerStart = null;
    if (swipe) {
      this.bus.emit(swipe);
      return;
    }
    this.bus.emit('primary');
  };

  private onPointerCancel = () => {
    this.pointerStart = null;
  };
}
