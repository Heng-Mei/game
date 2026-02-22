export type SpiderDifficulty = 1 | 2 | 4;
export type CardSuit = 'S' | 'H' | 'D' | 'C';

export type SpiderCard = {
  suit: CardSuit;
  rank: number;
  faceUp: boolean;
};

export type SpiderState = {
  difficulty: SpiderDifficulty;
  tableau: SpiderCard[][];
  stock: SpiderCard[];
  foundations: SpiderCard[][];
  moves: number;
  won: boolean;
};

export const SPIDER_CLASSIC_CONFIG = {
  deckCount: 2,
  columns: 10,
  completeSequenceLength: 13
};

export const SPIDER_RULES = {
  requiresSameSuitSequence: true,
  allowsDealWhenEachColumnHasCard: true,
  supportsDifficultyCycle: true
};

export function difficultyLabel(value: SpiderDifficulty): string {
  if (value === 1) {
    return '单花色';
  }
  if (value === 2) {
    return '双花色';
  }
  return '四花色';
}

export function suitSymbol(suit: CardSuit): string {
  if (suit === 'S') {
    return '♠';
  }
  if (suit === 'H') {
    return '♥';
  }
  if (suit === 'D') {
    return '♦';
  }
  return '♣';
}

function suitsForDifficulty(difficulty: SpiderDifficulty): CardSuit[] {
  if (difficulty === 1) {
    return ['S'];
  }
  if (difficulty === 2) {
    return ['S', 'H'];
  }
  return ['S', 'H', 'D', 'C'];
}

function shuffle<T>(items: T[], randomValue: () => number): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomValue() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function createDeck(difficulty: SpiderDifficulty, randomValue: () => number): SpiderCard[] {
  const suits = suitsForDifficulty(difficulty);
  const setRepeat = 8 / suits.length;
  const cards: SpiderCard[] = [];
  suits.forEach((suit) => {
    for (let repeat = 0; repeat < setRepeat; repeat += 1) {
      for (let rank = 1; rank <= 13; rank += 1) {
        cards.push({ suit, rank, faceUp: false });
      }
    }
  });
  return shuffle(cards, randomValue);
}

function cloneColumns(columns: SpiderCard[][]): SpiderCard[][] {
  return columns.map((column) => column.map((card) => ({ ...card })));
}

function flipTop(column: SpiderCard[]): SpiderCard[] {
  if (!column.length) {
    return column;
  }
  const next = [...column];
  next[next.length - 1] = {
    ...next[next.length - 1],
    faceUp: true
  };
  return next;
}

function isDescendingSameSuit(run: SpiderCard[]): boolean {
  if (run.length < 2) {
    return true;
  }
  for (let i = 0; i < run.length - 1; i += 1) {
    const curr = run[i];
    const next = run[i + 1];
    if (curr.suit !== next.suit || curr.rank !== next.rank + 1) {
      return false;
    }
  }
  return true;
}

function topFaceUpIndex(column: SpiderCard[]): number {
  return column.findIndex((card) => card.faceUp);
}

export function createSpiderState(
  difficulty: SpiderDifficulty = 1,
  randomValue: () => number = Math.random
): SpiderState {
  const deck = createDeck(difficulty, randomValue);
  const tableau: SpiderCard[][] = Array.from({ length: SPIDER_CLASSIC_CONFIG.columns }, () => []);
  let cursor = 0;
  for (let col = 0; col < SPIDER_CLASSIC_CONFIG.columns; col += 1) {
    const count = col < 4 ? 6 : 5;
    for (let i = 0; i < count; i += 1) {
      const faceUp = i === count - 1;
      tableau[col].push({ ...deck[cursor], faceUp });
      cursor += 1;
    }
  }
  const stock = deck.slice(cursor).map((card) => ({ ...card, faceUp: false }));
  return {
    difficulty,
    tableau,
    stock,
    foundations: [],
    moves: 0,
    won: false
  };
}

export function canMoveRun(state: SpiderState, fromCol: number, startIndex: number): boolean {
  const column = state.tableau[fromCol];
  if (!column || startIndex < 0 || startIndex >= column.length) {
    return false;
  }
  const run = column.slice(startIndex);
  if (run.some((card) => !card.faceUp)) {
    return false;
  }
  return isDescendingSameSuit(run);
}

export function moveRun(state: SpiderState, fromCol: number, startIndex: number, toCol: number): SpiderState {
  if (fromCol === toCol || !canMoveRun(state, fromCol, startIndex)) {
    return state;
  }
  const source = state.tableau[fromCol];
  const target = state.tableau[toCol];
  if (!source || !target) {
    return state;
  }

  const run = source.slice(startIndex);
  const targetTop = target[target.length - 1];
  if (targetTop && targetTop.rank !== run[0].rank + 1) {
    return state;
  }

  const tableau = cloneColumns(state.tableau);
  tableau[fromCol] = flipTop(source.slice(0, startIndex));
  tableau[toCol] = [...target, ...run];

  return resolveCompletedRuns({
    ...state,
    tableau,
    moves: state.moves + 1
  });
}

export function dealFromStock(state: SpiderState): SpiderState {
  if (state.stock.length < SPIDER_CLASSIC_CONFIG.columns) {
    return state;
  }
  if (SPIDER_RULES.allowsDealWhenEachColumnHasCard && state.tableau.some((column) => column.length === 0)) {
    return state;
  }
  const tableau = cloneColumns(state.tableau);
  const stock = [...state.stock];
  for (let col = 0; col < SPIDER_CLASSIC_CONFIG.columns; col += 1) {
    const card = stock.shift();
    if (!card) {
      continue;
    }
    tableau[col].push({ ...card, faceUp: true });
  }
  return resolveCompletedRuns({
    ...state,
    tableau,
    stock,
    moves: state.moves + 1
  });
}

export function resolveCompletedRuns(state: SpiderState): SpiderState {
  let tableau = cloneColumns(state.tableau);
  const foundations = [...state.foundations.map((seq) => seq.map((card) => ({ ...card })))];
  let changed = true;
  while (changed) {
    changed = false;
    for (let col = 0; col < tableau.length; col += 1) {
      const column = tableau[col];
      if (column.length < SPIDER_CLASSIC_CONFIG.completeSequenceLength) {
        continue;
      }
      const run = column.slice(column.length - SPIDER_CLASSIC_CONFIG.completeSequenceLength);
      const isRun = run[0].rank === 13
        && run[run.length - 1].rank === 1
        && isDescendingSameSuit(run);
      if (!isRun) {
        continue;
      }
      tableau[col] = flipTop(column.slice(0, column.length - SPIDER_CLASSIC_CONFIG.completeSequenceLength));
      foundations.push(run.map((card) => ({ ...card, faceUp: true })));
      changed = true;
      break;
    }
  }

  const won = foundations.length === 8;
  return {
    ...state,
    tableau,
    foundations,
    won
  };
}
