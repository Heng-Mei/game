export type CanonicalAction =
  | 'move_left'
  | 'move_right'
  | 'move_up'
  | 'move_down'
  | 'primary'
  | 'secondary'
  | 'pause'
  | 'restart';

type Listener = (action: CanonicalAction) => void;

export class ActionBus {
  private listeners = new Set<Listener>();

  emit(action: CanonicalAction) {
    this.listeners.forEach((listener) => listener(action));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
