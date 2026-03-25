// Connect 4 with UI + minimax AI (browser-only, no modules/build)

const ROWS = 6;
const COLUMNS = 7;
const EMPTY = 0;
const HUMAN = 1;   // Red
const AI = 2;      // Yellow;
const WIN_SCORE = 1_000_000;

class Connect4 {
  constructor() { this.reset(); }
  reset() { this.board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(EMPTY)); }
  isPlayable(c) { return c >= 0 && c < COLUMNS && this.board[0][c] === EMPTY; }
  drop(c, p) {
    if (!this.isPlayable(c)) return -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r][c] === EMPTY) { this.board[r][c] = p; return r; }
    }
    return -1;
  }
  undo(r, c) { this.board[r][c] = EMPTY; }
  checkWinner() {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLUMNS;c++) {
      const p = this.board[r][c]; if (!p) continue;
      for (const [dr,dc] of dirs) {
        let k=1; while (k<4 && this.board[r+dr*k]?.[c+dc*k] === p) k++;
        if (k===4) return p;
      }
    }
    return this.board[0].every(v=>v!==EMPTY) ? 0 : null; // 0=draw, null=ongoing
  }
  evaluate(ai) {
    const opp = ai === HUMAN ? AI : HUMAN;
    const center = Math.floor(COLUMNS/2);
    let score = 0;
    for (let r=0;r<ROWS;r++) {
      if (this.board[r][center] === ai) score += 3;
      if (this.board[r][center] === opp) score -= 3;
    }
    const windows = [];
    for (let r=0;r<ROWS;r++) for (let c=0;c<=COLUMNS-4;c++)
      windows.push([this.board[r][c], this.board[r][c+1], this.board[r][c+2], this.board[r][c+3]]);
    for (let r=0;r<=ROWS-4;r++) for (let c=0;c<COLUMNS;c++)
      windows.push([this.board[r][c], this.board[r+1][c], this.board[r+2][c], this.board[r+3][c]]);
    for (let r=0;r<=ROWS-4;r++) for (let c=0;c<=COLUMNS-4;c++)
      windows.push([this.board[r][c], this.board[r+1][c+1], this.board[r+2][c+2], this.board[r+3][c+3]]);
    for (let r=0;r<=ROWS-4;r++) for (let c=3;c<COLUMNS;c++)
      windows.push([this.board[r][c], this.board[r+1][c-1], this.board[r+2][c-2], this.board[r+3][c-3]]);
    const val = (w) => {
      const a = w.filter(v=>v===ai).length;
      const o = w.filter(v=>v===opp).length;
      const e = w.filter(v=>v===EMPTY).length;
      if (a===4) return WIN_SCORE;
      if (o===4) return -WIN_SCORE;
      if (a===3 && e===1) return 50;
      if (a===2 && e===2) return 10;
      if (o===3 && e===1) return -40;
      return 0;
    };
    for (const w of windows) score += val(w);
    return score;
  }
  minimax(depth, alpha, beta, maximizing, ai, depthLimit) {
    const winner = this.checkWinner();
    if (winner !== null) {
      if (winner === 0) return 0;
      return winner === ai ? WIN_SCORE - depth : -WIN_SCORE + depth;
    }
    if (depth === depthLimit) return this.evaluate(ai);
    const current = maximizing ? ai : (ai === HUMAN ? AI : HUMAN);
    const playable = [...Array(COLUMNS).keys()].filter(c => this.isPlayable(c));
    if (maximizing) {
      let best = -Infinity;
      for (const col of playable) {
        const row = this.drop(col, current);
        const val = this.minimax(depth+1, alpha, beta, false, ai, depthLimit);
        this.undo(row, col);
        best = Math.max(best, val); alpha = Math.max(alpha, val);
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (const col of playable) {
        const row = this.drop(col, current);
        const val = this.minimax(depth+1, alpha, beta, true, ai, depthLimit);
        this.undo(row, col);
        best = Math.min(best, val); beta = Math.min(beta, val);
        if (beta <= alpha) break;
      }
      return best;
    }
  }
  bestMove(depthLimit, ai = AI) {
    let bestCol = null, bestScore = -Infinity;
    for (const col of [...Array(COLUMNS).keys()]) {
      if (!this.isPlayable(col)) continue;
      const row = this.drop(col, ai);
      const score = this.minimax(1, -Infinity, Infinity, false, ai, depthLimit);
      this.undo(row, col);
      if (score > bestScore) { bestScore = score; bestCol = col; }
    }
    return bestCol;
  }
}

// ----- UI wiring -----
const state = { game: new Connect4(), human: 0, ai: 0, locked: false };
const boardEl = document.getElementById('game-board');
const statusEl = document.getElementById('game-status');
const humanScoreEl = document.getElementById('human-score');
const aiScoreEl = document.getElementById('ai-score');
const diffEl = document.getElementById('difficulty');
const newBtn = document.getElementById('new-game-btn');
const resetBtn = document.getElementById('reset-score-btn');

function renderBoard() {
  boardEl.innerHTML = '';
  for (let r=0;r<ROWS;r++) {
    for (let c=0;c<COLUMNS;c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const v = state.game.board[r][c];
      if (v === HUMAN) cell.classList.add('red');
      if (v === AI) cell.classList.add('yellow');
      cell.dataset.col = c;
      boardEl.appendChild(cell);
    }
  }
}

function setStatus(text) { statusEl.textContent = text; }

function endGame(winner) {
  state.locked = true;
  if (winner === HUMAN) { state.human++; humanScoreEl.textContent = state.human; setStatus('You win!'); }
  else if (winner === AI) { state.ai++; aiScoreEl.textContent = state.ai; setStatus('AI wins!'); }
  else setStatus('Draw!');
}

function handlePlayerMove(col) {
  if (state.locked || !state.game.isPlayable(col)) return;
  state.game.drop(col, HUMAN);
  renderBoard();
  const res = state.game.checkWinner();
  if (res !== null) return endGame(res);

  state.locked = true;
  setStatus('AI thinking...');
  setTimeout(() => {
    const depth = Number(diffEl.value);
    const aiCol = state.game.bestMove(depth, AI);
    if (aiCol !== null) state.game.drop(aiCol, AI);
    renderBoard();
    const res2 = state.game.checkWinner();
    if (res2 !== null) endGame(res2);
    else { state.locked = false; setStatus('Your turn'); }
  }, 80);
}

boardEl.addEventListener('click', (e) => {
  const col = Number(e.target.dataset.col);
  if (!Number.isNaN(col)) handlePlayerMove(col);
});

function newGame() {
  state.game.reset(); state.locked = false;
  setStatus('Your turn');
  renderBoard();
}
function resetScores() { state.human = 0; state.ai = 0; humanScoreEl.textContent = '0'; aiScoreEl.textContent = '0'; newGame(); }
newBtn.onclick = newGame;
resetBtn.onclick = resetScores;

renderBoard();
setStatus('Your turn');