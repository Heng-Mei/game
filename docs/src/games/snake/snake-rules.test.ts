import { describe, expect, it } from 'vitest';
import { createSnakeState, stepSnake } from './snake-rules';

describe('snake-rules', () => {
  it('grows by one after eating food', () => {
    const state = createSnakeState({
      snake: [{ x: 2, y: 2 }],
      food: { x: 3, y: 2 },
      dir: 'right',
      pendingDir: 'right',
      score: 0
    });

    const next = stepSnake(state);
    expect(next.snake).toHaveLength(2);
    expect(next.score).toBe(1);
  });
});
