/* sudoku.js */

/****************************************************
 * Sudoku App - Full client-side implementation
 * --------------------------------------------------
 * Features:
 *  - Generate valid puzzles by shuffling a solved base
 *  - Carve clues by removing cells while preserving unique solution
 *  - Difficulty levels via clue count
 *  - Backtracking solver (solution + uniqueness counting)
 *  - Hint system and conflict checking
 *  - Timer and status messages
 ****************************************************/

/* ===========================
   DOM references and state
   =========================== */

const boardEl = document.getElementById("board");
const difficultyEl = document.getElementById("difficulty");
const btnNew = document.getElementById("new");
const btnReset = document.getElementById("reset");
const btnCheck = document.getElementById("check");
const btnHint = document.getElementById("hint");
const btnSolve = document.getElementById("solve");
const messageEl = document.getElementById("message");
const timerEl = document.getElementById("timer");

/* Internal board state:
/* - puzzle: the current puzzle with 0 for empty cells */
/* - solution: the solved grid for the current puzzle */
/* - initialMask: boolean grid marking fixed clues (true = given) */
let puzzle = createEmptyBoard();
let solution = createEmptyBoard();
let initialMask = createEmptyMask();

/* Timer */
let timerInterval = null;
let secondsElapsed = 0;

/* ===========================
   Utility helpers
   =========================== */

/** Create a 9x9 board filled with zeros. */
function createEmptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

/** Create a 9x9 boolean mask filled with false. */
function createEmptyMask() {
  return Array.from({ length: 9 }, () => Array(9).fill(false));
}

/** Deep copy a 2D array board. */
function copyBoard(b) {
  return b.map(row => row.slice());
}

/** Format seconds as MM:SS */
function formatTime(total) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Set a status message for the user. */
function setMessage(text, kind = "info") {
  messageEl.textContent = text;
  messageEl.style.color = kind === "error" ? "#d7263d" : "#222";
}

/** Start timer for a new puzzle. */
function startTimer() {
  stopTimer();
  secondsElapsed = 0;
  timerEl.textContent = formatTime(secondsElapsed);
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timerEl.textContent = formatTime(secondsElapsed);
  }, 1000);
}

/** Stop timer. */
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/* ===========================
   Board generation & shuffling
   =========================== */

/**
 * Generate a fully solved valid Sudoku board using a known pattern
 * and random shuffles that preserve validity.
 *
 * The "pattern" approach builds a canonical solution, then we randomize
 * rows/columns within bands/stacks and permute numbers.
 */
function generateSolvedBoard() {
  const base = 3;
  const side = base * base;

  /* Baseline pattern: ensures each row/col obey Sudoku constraints */
  const pattern = (r, c) => (base * (r % base) + Math.floor(r / base) + c) % side;

  /* Helper to shuffle an array (fairly random for UI purposes) */
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

  /* Generate row/column indices by shuffling bands (groups of 3) then rows inside bands */
  const rows = [].concat(...shuffle([0, 1, 2]).map(r => shuffle([0, 1, 2]).map(g => r * base + g)));
  const cols = [].concat(...shuffle([0, 1, 2]).map(c => shuffle([0, 1, 2]).map(g => c * base + g)));

  /* Randomize the digits 1..9 to add variety */
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  /* Build solved board by mapping pattern through randomized rows/cols/nums */
  return rows.map(r => cols.map(c => nums[pattern(r, c)]));
}

/* ===========================
   Solver & validators
   =========================== */

/** Check if placing num at (row,col) is valid wrt row, col, and 3x3 box. */
function isValid(board, row, col, num) {
  /* Row and column checks */
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  /* Box check */
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[boxRow + r][boxCol + c] === num) return false;
    }
  }
  return true;
}

/**
 * Backtracking solver: fills zeros in-place.
 * Returns true if a solution is found.
 */
function solve(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = 0; /* backtrack */
          }
        }
        return false; /* no valid number fits here */
      }
    }
  }
  return true; /* solved */
}

/**
 * Count number of solutions (up to a cap). Useful for uniqueness testing.
 * Early-exits when more than `cap` solutions are found.
 */
function countSolutions(board, cap = 2) {
  let solutions = 0;

  function backtrack() {
    /* Find first empty cell
    let row = -1, col = -1;
    for (let r = 0; r < 9 && row === -1; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) { row = r; col = c; break; }
      }
    }
    /* No empty: found a full solution */
    if (row === -1) {
      solutions++;
      return;
    }
    /* Try numbers with validity */
    for (let num = 1; num <= 9; num++) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        backtrack();
        if (solutions >= cap) return; /* early exit if we exceed cap */
        board[row][col] = 0;
      }
    }
  }

  backtrack();
  return solutions;
}

/* ===========================
   Puzzle carving with uniqueness
   =========================== */

/**
 * Carve clues out of a solved board to create a puzzle with a target
 * number of clues (given cells). Ensures the resulting puzzle has a unique solution.
 *
 * Note: Uniqueness checking is computational; for the browser it's fine for typical sizes,
 * but extreme difficulties may take longer. We keep it reasonable.
 */

function generateUniquePuzzle(solvedBoard, targetClues = 36) {
  /* Start with full solution and then remove cells */
  const puzzleBoard = copyBoard(solvedBoard);

  /* List all positions and shuffle for random removal order */
  const positions = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) positions.push([r, c]);
  positions.sort(() => Math.random() - 0.5);

  /* Current number of clues */
  let clues = 81;

  /* Try removing cells while we stay above target and keep uniqueness */
  for (const [r, c] of positions) {
    if (clues <= targetClues) break;

    const backup = puzzleBoard[r][c];
    puzzleBoard[r][c] = 0;

    /* Check uniqueness by counting solutions (cap 2) */
    const testBoard = copyBoard(puzzleBoard);
    const solCount = countSolutions(testBoard, 2);

    if (solCount === 1) {
      clues--; /* successful removal keeps unique solution */
    } else {
      puzzleBoard[r][c] = backup; /* revert removal */
    }
  }

  return puzzleBoard;
}

/* ===========================
   Difficulty presets
   =========================== */

const difficultyToClues = {
  /* More clues = easier. Typical ranges: */
  /* Easy: ~36-45, Medium: ~30-35, Hard: ~26-30 */
  easy: 40,
  medium: 34,
  hard: 28,
};

/* ===========================
   DOM board creation & binding
   =========================== */

/** Build the 9x9 input grid and attach event handlers. */
function buildBoardUI() {
  boardEl.innerHTML = ""; /* clear any previous grid */

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "cell";
      input.setAttribute("maxlength", "1"); /* limit to one character */
      input.setAttribute("data-row", String(r));
      input.setAttribute("data-col", String(c));
      input.setAttribute("role", "gridcell");
      input.setAttribute("aria-label", `Row ${r + 1}, Column ${c + 1}`);

      /* Only allow digits 1-9. Prevent non-numeric typing. */
      input.addEventListener("input", (e) => {
        const v = input.value.replace(/\D/g, ""); /* strip non-digits */
        input.value = v.slice(0, 1); /* keep single digit
        /* Mark as user-entered if not fixed */
        if (!initialMask[r][c]) {
          input.classList.add("user");
        }
        /* Live conflict highlighting (optional) */
        refreshConflicts();
      });

      /* Highlight peers (same row/col/box) on focus for UX */
      input.addEventListener("focus", () => highlightPeers(r, c, true));
      input.addEventListener("blur", () => highlightPeers(r, c, false));

      boardEl.appendChild(input);
    }
  }
}

/** Fill the UI from the current puzzle state. */
function renderPuzzle() {
  const inputs = boardEl.querySelectorAll(".cell");
  inputs.forEach((cell, idx) => {
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const val = puzzle[r][c];

    /* Set value and classes */
    cell.value = val ? String(val) : "";
    cell.classList.remove("fixed", "user", "error");

    if (initialMask[r][c]) {
      cell.classList.add("fixed");
      cell.setAttribute("disabled", "true"); /* fixed clues are not editable */
    } else {
      cell.removeAttribute("disabled");
    }
  });
}

/** Read the UI values back into the puzzle state for actions. */
function readBoardFromUI() {
  const inputs = boardEl.querySelectorAll(".cell");
  inputs.forEach((cell, idx) => {
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const v = cell.value.trim();
    puzzle[r][c] = v ? Number(v) : 0;
  });
}

/* ===========================
   Visual helpers
   =========================== */

/** Add/remove highlight class to row/col/box peers of (r,c). */
function highlightPeers(r, c, on) {
  const inputs = boardEl.querySelectorAll(".cell");
  inputs.forEach((cell, idx) => {
    const rr = Math.floor(idx / 9);
    const cc = idx % 9;
    const sameRow = rr === r;
    const sameCol = cc === c;
    const sameBox = Math.floor(rr / 3) === Math.floor(r / 3) &&
                    Math.floor(cc / 3) === Math.floor(c / 3);
    if (sameRow || sameCol || sameBox) {
      if (on) cell.classList.add("highlight");
      else cell.classList.remove("highlight");
    }
  });
}

/** Add error class to any cell conflicting with Sudoku rules. */
function refreshConflicts() {
  readBoardFromUI();
  const inputs = boardEl.querySelectorAll(".cell");

  /* Clear errors first
  inputs.forEach(cell => cell.classList.remove("error"));

  /* For each non-zero cell, check if it causes conflict by temporarily clearing it */
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = puzzle[r][c];
      if (!val) continue;

      puzzle[r][c] = 0; /* temporarily clear to test validity */
      const valid = isValid(puzzle, r, c, val);
      puzzle[r][c] = val;

      if (!valid) {
        const idx = r * 9 + c;
        inputs[idx].classList.add("error");
      }
    }
  }
}

/* ===========================
   Game flow
   =========================== */

/**
 * Create a new puzzle for the selected difficulty.
 * - Generates a solved grid
 * - Carves clues to desired clue count while preserving uniqueness
 * - Prepares masks and UI
 */
function newPuzzle() {
  setMessage("Generating puzzle...");
  startTimer();

  /* Generate a fresh solved board */
  solution = generateSolvedBoard();

  /* Carve a unique puzzle according to difficulty */
  const diffKey = difficultyEl.value;
  const targetClues = difficultyToClues[diffKey] ?? 36;
  puzzle = generateUniquePuzzle(solution, targetClues);

  /* Build mask indicating which cells are fixed clues */
  initialMask = createEmptyMask();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      initialMask[r][c] = puzzle[r][c] !== 0;
    }
  }

  renderPuzzle();
  refreshConflicts();
  setMessage(`Puzzle ready — ${diffKey} mode. Good luck!`);
}

/** Reset the board to the initial puzzle state. */
function resetPuzzle() {
  setMessage("Puzzle reset.");
  /* Restore puzzle values from mask (keep clues, clear others) */
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      puzzle[r][c] = initialMask[r][c] ? puzzle[r][c] : 0;
    }
  }
  renderPuzzle();
  refreshConflicts();
  startTimer(); /* optionally restart timer on reset */
}

/* Check the current grid for correctness without solving it. */
function checkProgress() {
  readBoardFromUI();
  refreshConflicts();

  /* If any error class is present, notify user */
  const hasError = !!boardEl.querySelector(".cell.error");
  if (hasError) {
    setMessage("Conflicts detected. Review highlighted cells.", "error");
    return;
  }

  /* If all cells filled and no conflicts, it's solved */
  const allFilled = puzzle.every(row => row.every(v => v !== 0));
  if (allFilled) {
    setMessage("Looks correct — Sudoku complete!");
    stopTimer();
  } else {
    setMessage("No conflicts so far. Keep going!");
  }
}

/**
 * Provide a hint: find one empty cell and fill it with the correct solution value.
 * If solution isn't computed yet, derive it from the current puzzle.
 */
function giveHint() {
  readBoardFromUI();

  /* If we don't have the final solution matching current puzzle, compute it */
  const puzzleCopy = copyBoard(puzzle);
  if (!solve(puzzleCopy)) {
    setMessage("This puzzle state seems unsolvable.", "error");
    return;
  }

  /* Find an empty cell to hint */
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzle[r][c] === 0) {
        puzzle[r][c] = puzzleCopy[r][c]; /* fill correct value
        /* Update UI: mark as user (hint counts as assist) */
        const idx = r * 9 + c;
        const input = boardEl.querySelectorAll(".cell")[idx];
        input.value = String(puzzle[r][c]);
        input.classList.add("user");
        refreshConflicts();
        setMessage("Hint given. Keep solving!");
        return;
      }
    }
  }

  setMessage("No empty cells — you’re done!");
}

/* Solve the current puzzle and fill the board. */
function solveCurrent() {
  readBoardFromUI();
  const b = copyBoard(puzzle);
  const ok = solve(b);
  if (!ok) {
    setMessage("No solution found from this state.", "error");
    return;
  }
  puzzle = b;
  renderPuzzle();
  refreshConflicts();
  setMessage("Solved. Try a new puzzle!");
  stopTimer();
}

/* ===========================
   Event wiring
   =========================== */

function bindEvents() {
  btnNew.addEventListener("click", newPuzzle);
  btnReset.addEventListener("click", resetPuzzle);
  btnCheck.addEventListener("click", checkProgress);
  btnHint.addEventListener("click", giveHint);
  btnSolve.addEventListener("click", solveCurrent);

  /* Regenerate when difficulty changes (optional behavior) */
  difficultyEl.addEventListener("change", () => {
    newPuzzle();
  });
}

/* ===========================
   Init
   =========================== */

(function init() {
  buildBoardUI();
  bindEvents();
  newPuzzle();
})();
