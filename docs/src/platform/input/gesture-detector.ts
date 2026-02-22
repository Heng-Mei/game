import type { CanonicalAction } from './action-bus';

export type Point = {
  x: number;
  y: number;
};

const SWIPE_THRESHOLD_PX = 24;

export function detectSwipe(from: Point, to: Point): CanonicalAction | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) < SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX) {
    return null;
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'move_right' : 'move_left';
  }
  return dy > 0 ? 'move_down' : 'move_up';
}
