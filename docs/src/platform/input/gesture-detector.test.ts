import { describe, expect, it } from 'vitest';
import { detectSwipe } from './gesture-detector';

describe('gesture-detector', () => {
  it('maps swipe direction to canonical actions', () => {
    expect(detectSwipe({ x: 0, y: 0 }, { x: 50, y: 2 })).toBe('move_right');
    expect(detectSwipe({ x: 0, y: 0 }, { x: -50, y: 1 })).toBe('move_left');
    expect(detectSwipe({ x: 0, y: 0 }, { x: 1, y: -60 })).toBe('move_up');
    expect(detectSwipe({ x: 0, y: 0 }, { x: 2, y: 60 })).toBe('move_down');
    expect(detectSwipe({ x: 0, y: 0 }, { x: 4, y: 6 })).toBeNull();
  });
});
