(function initSpiderGame() {
  window.GameHub = window.GameHub || {};
  window.GameHub.games = window.GameHub.games || {};

  const { mainCanvas, mainCtx } = window.GameHub.refs;

  const DIFFICULTIES = {
    one: {
      label: '单色',
      suits: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S']
    },
    two: {
      label: '双色',
      suits: ['S', 'S', 'S', 'S', 'H', 'H', 'H', 'H']
    },
    four: {
      label: '四色',
      suits: ['S', 'H', 'D', 'C', 'S', 'H', 'D', 'C']
    }
  };

  const DIFFICULTY_ORDER = ['one', 'two', 'four'];
  const SUIT_SYMBOLS = {
    S: '♠',
    H: '♥',
    D: '♦',
    C: '♣'
  };
  const RANK_LABELS = {
    1: 'A',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'J',
    12: 'Q',
    13: 'K'
  };

  class SpiderGame {
    constructor(uiRef) {
      this.ui = uiRef;
      this.columnCount = 10;
      this.cardWidth = 72;
      this.cardHeight = 96;
      this.cardOverlap = 24;
      this.margin = 14;
      this.columnGap = 10;
      this.topAreaHeight = 112;
      this.difficultyKey = 'one';
      this.reset();
    }

    enter() {
      this.ui.showNextCanvas(false);
      this.updateSettings();
      this.ui.setControls([
        '花色显示：♠ ♥ ♦ ♣',
        '点击同花连续下降序列进行移动',
        '目标列顶部牌点数需比移动序列首牌大 1',
        '空列可放任意序列；每次操作 -1 分',
        'K 到 A 同花连续 13 张自动移除并 +100 分',
        'D：切换难度  R：重开  Space：发牌',
        '移动端：点击选牌；底部按钮发牌/切换难度'
      ]);
      this.reset();
    }

    exit() { }

    updateSettings() {
      const label = DIFFICULTIES[this.difficultyKey].label;
      this.ui.setSettings([
        {
          label: `难度：${label}`,
          enabled: true,
          onToggle: () => {
            this.onAction('cycle_difficulty');
          }
        }
      ]);
    }

    buildDeck() {
      const suits = DIFFICULTIES[this.difficultyKey].suits;
      const deck = [];
      let id = 1;
      suits.forEach((suit) => {
        for (let rank = 1; rank <= 13; rank += 1) {
          deck.push({
            id: id,
            suit: suit,
            rank: rank,
            faceUp: false
          });
          id += 1;
        }
      });

      for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
      }

      return deck;
    }

    reset() {
      const deck = this.buildDeck();
      this.columns = Array.from({ length: this.columnCount }, () => []);

      for (let col = 0; col < this.columnCount; col += 1) {
        const count = col < 4 ? 6 : 5;
        for (let i = 0; i < count; i += 1) {
          const card = deck.pop();
          if (!card) {
            continue;
          }
          card.faceUp = i === count - 1;
          this.columns[col].push(card);
        }
      }

      this.stock = deck;
      this.selection = null;
      this.completedRuns = 0;
      this.score = 500;
      this.moves = 0;
      this.elapsed = 0;
      this.started = false;
      this.ended = false;
      this.won = false;
      this.hudTicker = 0;
      this.updateCanvasSize();
      this.updateHUD();
      this.ui.setState('经典蜘蛛纸牌：点击选择序列，再点击目标列');
      this.draw();
    }

    setDifficulty(nextKey) {
      if (!DIFFICULTIES[nextKey]) {
        return;
      }
      this.difficultyKey = nextKey;
      this.updateSettings();
      this.reset();
    }

    cycleDifficulty() {
      const idx = DIFFICULTY_ORDER.indexOf(this.difficultyKey);
      const next = DIFFICULTY_ORDER[(idx + 1) % DIFFICULTY_ORDER.length];
      this.setDifficulty(next);
    }

    updateCanvasSize() {
      const width = this.margin * 2
        + this.columnCount * this.cardWidth
        + (this.columnCount - 1) * this.columnGap;
      const maxDepth = this.columns.reduce((max, col) => Math.max(max, col.length), 0);
      const height = this.topAreaHeight
        + this.margin
        + this.cardHeight
        + Math.max(0, maxDepth - 1) * this.cardOverlap
        + this.margin;

      this.canvasWidth = width;
      this.canvasHeight = Math.max(height, 420);
      this.tableauTop = this.margin + this.topAreaHeight;
      this.stockRect = {
        x: this.canvasWidth - this.margin - this.cardWidth,
        y: this.margin,
        w: this.cardWidth,
        h: this.cardHeight
      };
      this.ui.setCanvasSize(this.canvasWidth, this.canvasHeight);
    }

    updateHUD() {
      this.ui.setStatus([
        { label: '难度', value: DIFFICULTIES[this.difficultyKey].label },
        { label: '分数', value: this.score },
        { label: '步数', value: this.moves },
        { label: '已完成牌组', value: `${this.completedRuns} / 8` },
        { label: '剩余发牌', value: Math.floor(this.stock.length / 10) },
        { label: '用时(秒)', value: Math.floor(this.elapsed / 1000) }
      ]);
    }

    columnLeft(col) {
      return this.margin + col * (this.cardWidth + this.columnGap);
    }

    cardTop(index) {
      return this.tableauTop + index * this.cardOverlap;
    }

    isPointInsideRect(point, rect) {
      return point.x >= rect.x
        && point.x <= rect.x + rect.w
        && point.y >= rect.y
        && point.y <= rect.y + rect.h;
    }

    pointFromEvent(event) {
      const rect = mainCanvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) * mainCanvas.width) / rect.width,
        y: ((event.clientY - rect.top) * mainCanvas.height) / rect.height
      };
    }

    getHitColumn(point) {
      for (let col = 0; col < this.columnCount; col += 1) {
        const left = this.columnLeft(col);
        if (point.x < left || point.x > left + this.cardWidth) {
          continue;
        }

        const stack = this.columns[col];
        if (stack.length === 0) {
          if (point.y >= this.tableauTop && point.y <= this.tableauTop + this.cardHeight) {
            return { col: col, index: -1 };
          }
          continue;
        }

        for (let i = stack.length - 1; i >= 0; i -= 1) {
          const top = this.cardTop(i);
          const bottom = i === stack.length - 1 ? top + this.cardHeight : top + this.cardOverlap;
          if (point.y >= top && point.y <= bottom) {
            return { col: col, index: i };
          }
        }

        const firstTop = this.cardTop(0);
        const lastTop = this.cardTop(stack.length - 1);
        if (point.y >= firstTop && point.y <= lastTop + this.cardHeight) {
          return { col: col, index: stack.length - 1 };
        }
      }
      return null;
    }

    canSelectRun(col, index) {
      const stack = this.columns[col];
      if (!stack || index < 0 || index >= stack.length) {
        return false;
      }

      const run = stack.slice(index);
      if (!run.length || !run[0].faceUp) {
        return false;
      }

      for (let i = 0; i < run.length; i += 1) {
        if (!run[i].faceUp) {
          return false;
        }
        if (i < run.length - 1) {
          if (run[i].suit !== run[i + 1].suit) {
            return false;
          }
          if (run[i].rank !== run[i + 1].rank + 1) {
            return false;
          }
        }
      }

      return true;
    }

    canDrop(run, targetCol) {
      const target = this.columns[targetCol];
      if (!target || run.length === 0) {
        return false;
      }
      if (target.length === 0) {
        return true;
      }
      const top = target[target.length - 1];
      return top.faceUp && top.rank === run[0].rank + 1;
    }

    revealTopIfNeeded(col) {
      const stack = this.columns[col];
      if (!stack || stack.length === 0) {
        return;
      }
      const top = stack[stack.length - 1];
      if (!top.faceUp) {
        top.faceUp = true;
      }
    }

    applyMovePenalty() {
      this.moves += 1;
      this.score = Math.max(0, this.score - 1);
      this.started = true;
    }

    tryExtractCompletedRun(col) {
      const stack = this.columns[col];
      if (!stack || stack.length < 13) {
        return false;
      }

      const run = stack.slice(stack.length - 13);
      const suit = run[0].suit;
      for (let i = 0; i < run.length; i += 1) {
        const expectedRank = 13 - i;
        if (!run[i].faceUp || run[i].suit !== suit || run[i].rank !== expectedRank) {
          return false;
        }
      }

      stack.splice(stack.length - 13, 13);
      this.completedRuns += 1;
      this.score += 100;
      this.revealTopIfNeeded(col);
      return true;
    }

    checkCompletions(col) {
      while (this.tryExtractCompletedRun(col)) {
        // keep extracting while full runs exist at the top.
      }

      if (this.completedRuns === 8) {
        this.ended = true;
        this.won = true;
        this.ui.setState('你赢了！经典蜘蛛纸牌通关');
      }
    }

    tryMove(selection, targetCol) {
      if (!selection) {
        return false;
      }
      const sourceCol = selection.col;
      const sourceIndex = selection.index;
      if (sourceCol === targetCol) {
        return false;
      }
      if (!this.canSelectRun(sourceCol, sourceIndex)) {
        return false;
      }

      const source = this.columns[sourceCol];
      const run = source.slice(sourceIndex);
      if (!this.canDrop(run, targetCol)) {
        return false;
      }

      this.columns[sourceCol] = source.slice(0, sourceIndex);
      this.columns[targetCol] = this.columns[targetCol].concat(run);
      this.applyMovePenalty();
      this.revealTopIfNeeded(sourceCol);
      this.checkCompletions(targetCol);
      this.checkCompletions(sourceCol);
      this.updateCanvasSize();
      this.updateHUD();

      if (!this.ended) {
        this.ui.setState('移动成功');
      }
      return true;
    }

    dealFromStock() {
      if (this.ended) {
        return;
      }
      if (this.stock.length < 10) {
        this.ui.setState('没有可发牌组了');
        return;
      }
      if (this.columns.some((col) => col.length === 0)) {
        this.ui.setState('发牌前每一列都必须至少有一张牌');
        return;
      }

      for (let col = 0; col < this.columnCount; col += 1) {
        const card = this.stock.pop();
        if (!card) {
          continue;
        }
        card.faceUp = true;
        this.columns[col].push(card);
      }

      this.applyMovePenalty();
      this.selection = null;
      for (let col = 0; col < this.columnCount; col += 1) {
        this.checkCompletions(col);
      }
      this.updateCanvasSize();
      this.updateHUD();
      if (!this.ended) {
        this.ui.setState('已发牌');
      }
    }

    onPointerDown(event) {
      if (event.button !== 0 || this.ended) {
        return;
      }

      const point = this.pointFromEvent(event);
      if (this.isPointInsideRect(point, this.stockRect)) {
        this.dealFromStock();
        return;
      }

      const hit = this.getHitColumn(point);
      if (!hit) {
        this.selection = null;
        return;
      }

      if (this.selection) {
        if (hit.col === this.selection.col && hit.index === this.selection.index) {
          this.selection = null;
          this.ui.setState('已取消选择');
          return;
        }

        if (this.tryMove(this.selection, hit.col)) {
          this.selection = null;
          return;
        }

        if (hit.index >= 0 && this.canSelectRun(hit.col, hit.index)) {
          this.selection = { col: hit.col, index: hit.index };
          this.ui.setState('已切换选中牌组，点击目标列');
          return;
        }

        this.selection = null;
        this.ui.setState('该目标列不可放置此牌组');
        return;
      }

      if (hit.index >= 0 && this.canSelectRun(hit.col, hit.index)) {
        this.selection = { col: hit.col, index: hit.index };
        this.ui.setState('已选牌组，点击目标列放置');
      } else {
        this.ui.setState('只能选择同花且连续下降的明牌序列');
      }
    }

    onKeyDown(event) {
      switch (event.code) {
        case 'KeyR':
          this.onAction('restart');
          break;
        case 'KeyD':
          this.onAction('cycle_difficulty');
          break;
        case 'Space':
          event.preventDefault();
          this.onAction('deal_stock');
          break;
        case 'Digit1':
          this.onAction('difficulty_one');
          break;
        case 'Digit2':
          this.onAction('difficulty_two');
          break;
        case 'Digit3':
          this.onAction('difficulty_four');
          break;
        default:
          break;
      }
    }

    onAction(action) {
      switch (action) {
        case 'restart':
        case 'double_tap_restart':
          this.reset();
          break;
        case 'deal_stock':
          this.dealFromStock();
          break;
        case 'cycle_difficulty':
          this.cycleDifficulty();
          break;
        case 'difficulty_one':
          this.setDifficulty('one');
          break;
        case 'difficulty_two':
          this.setDifficulty('two');
          break;
        case 'difficulty_four':
          this.setDifficulty('four');
          break;
        case 'primary_tap':
          break;
        default:
          break;
      }
    }

    suitColor(suit) {
      return suit === 'H' || suit === 'D' ? '#cf3149' : '#202531';
    }

    suitSymbol(suit) {
      const key = String(suit || '').trim().toUpperCase();
      return SUIT_SYMBOLS[key] || '♠';
    }

    drawCard(card, x, y, selected) {
      if (!card.faceUp) {
        mainCtx.fillStyle = '#2d4874';
        mainCtx.fillRect(x, y, this.cardWidth, this.cardHeight);
        mainCtx.strokeStyle = '#9dc7ff';
        mainCtx.strokeRect(x + 1.5, y + 1.5, this.cardWidth - 3, this.cardHeight - 3);
        return;
      }

      mainCtx.fillStyle = '#f4f5f8';
      mainCtx.fillRect(x, y, this.cardWidth, this.cardHeight);
      mainCtx.strokeStyle = selected ? '#ffd166' : '#646b79';
      mainCtx.lineWidth = selected ? 3 : 1;
      mainCtx.strokeRect(x + 0.5, y + 0.5, this.cardWidth - 1, this.cardHeight - 1);
      mainCtx.lineWidth = 1;

      const suitSymbol = this.suitSymbol(card.suit);
      mainCtx.fillStyle = this.suitColor(card.suit);
      mainCtx.font = 'bold 18px sans-serif';
      mainCtx.textAlign = 'left';
      mainCtx.textBaseline = 'top';
      mainCtx.fillText(RANK_LABELS[card.rank], x + 8, y + 6);
      mainCtx.font = "bold 16px 'Segoe UI Symbol', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
      mainCtx.fillText(suitSymbol, x + 8, y + 28);

      mainCtx.textAlign = 'right';
      mainCtx.textBaseline = 'bottom';
      mainCtx.fillText(`${RANK_LABELS[card.rank]}${suitSymbol}`, x + this.cardWidth - 8, y + this.cardHeight - 6);
    }

    drawCompletedSlots() {
      const slotW = 28;
      const slotH = 38;
      const baseX = this.margin;
      const baseY = this.margin + 10;

      for (let i = 0; i < 8; i += 1) {
        const x = baseX + i * (slotW + 4);
        const filled = i < this.completedRuns;
        mainCtx.fillStyle = filled ? '#f4f5f8' : 'rgba(255,255,255,0.08)';
        mainCtx.fillRect(x, baseY, slotW, slotH);
        mainCtx.strokeStyle = filled ? '#6f7684' : 'rgba(255,255,255,0.2)';
        mainCtx.strokeRect(x + 0.5, baseY + 0.5, slotW - 1, slotH - 1);
        if (filled) {
          mainCtx.fillStyle = '#2a3242';
          mainCtx.font = 'bold 10px sans-serif';
          mainCtx.textAlign = 'center';
          mainCtx.textBaseline = 'middle';
          mainCtx.fillText('K-A', x + slotW / 2, baseY + slotH / 2);
        }
      }
    }

    drawStock() {
      const deals = Math.floor(this.stock.length / 10);
      const { x, y, w, h } = this.stockRect;

      if (deals === 0) {
        mainCtx.strokeStyle = 'rgba(255,255,255,0.35)';
        mainCtx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      } else {
        for (let i = 0; i < deals; i += 1) {
          const ox = x - i * 3;
          const oy = y + i * 2;
          mainCtx.fillStyle = '#2d4874';
          mainCtx.fillRect(ox, oy, w, h);
          mainCtx.strokeStyle = '#9dc7ff';
          mainCtx.strokeRect(ox + 0.5, oy + 0.5, w - 1, h - 1);
        }
      }

      mainCtx.fillStyle = '#d4d9e6';
      mainCtx.font = '13px sans-serif';
      mainCtx.textAlign = 'right';
      mainCtx.textBaseline = 'top';
      mainCtx.fillText(`发牌 ${deals}`, x + w, y + h + 6);
    }

    drawTableau() {
      for (let col = 0; col < this.columnCount; col += 1) {
        const left = this.columnLeft(col);
        const stack = this.columns[col];

        if (stack.length === 0) {
          mainCtx.strokeStyle = 'rgba(255,255,255,0.25)';
          mainCtx.strokeRect(left + 0.5, this.tableauTop + 0.5, this.cardWidth - 1, this.cardHeight - 1);
          continue;
        }

        for (let i = 0; i < stack.length; i += 1) {
          const card = stack[i];
          const top = this.cardTop(i);
          const selected = this.selection
            && this.selection.col === col
            && i >= this.selection.index;
          this.drawCard(card, left, top, selected);
        }
      }
    }

    draw() {
      mainCtx.fillStyle = '#0f4f34';
      mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

      mainCtx.fillStyle = 'rgba(0,0,0,0.2)';
      mainCtx.fillRect(0, 0, mainCanvas.width, this.topAreaHeight);

      this.drawCompletedSlots();
      this.drawStock();
      this.drawTableau();
    }

    update(delta) {
      if (!this.ended) {
        this.elapsed += delta;
        this.hudTicker += delta;
        if (this.hudTicker >= 220) {
          this.hudTicker = 0;
          this.updateHUD();
        }
      }
      this.draw();
    }
  }

  window.GameHub.games.SpiderGame = SpiderGame;
})();
