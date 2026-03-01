(() => {
  const Player = {
    X: "X",
    O: "O",
  };

  let audioCtx;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playBeep(freq, duration, type = "sine", gain = 0.15) {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }

  function playClickSound() {
    playBeep(660, 0.09, "square", 0.12);
  }

  function playCpuSound() {
    playBeep(330, 0.12, "sine", 0.12);
  }

  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const subtitleEl = document.getElementById("subtitle");
  const newGameBtn = document.getElementById("newGameBtn");
  const toggleStarterBtn = document.getElementById("toggleStarterBtn");

  /** @type {("X"|"O"|null)[]} */
  let board = Array(9).fill(null);
  let isGameOver = false;
  let isCpuThinking = false;

  // By default: you are X and start.
  let you = Player.X;
  let cpu = Player.O;
  let current = you;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function setSubtitle() {
    subtitleEl.textContent = `You vs CPU (easy) — You are ${you}`;
  }

  function availableMoves(b) {
    const moves = [];
    for (let i = 0; i < b.length; i++) {
      if (b[i] === null) moves.push(i);
    }
    return moves;
  }

  function winnerFor(b) {
    for (const [a, c, d] of winningLines) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a], line: [a, c, d] };
      }
    }
    return null;
  }

  function isTie(b) {
    return b.every((v) => v !== null) && !winnerFor(b);
  }

  function markClassFor(player) {
    return player === Player.X ? "markX" : "markO";
  }

  function render() {
    // Clear & rebuild to keep it simple and predictable.
    boardEl.innerHTML = "";

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Cell ${i + 1}`);

      const value = board[i];
      if (value) {
        cell.textContent = value;
        cell.classList.add(markClassFor(value));
        cell.setAttribute("aria-disabled", "true");
      }

      const disabled = isGameOver || isCpuThinking || board[i] !== null;
      if (disabled) {
        cell.setAttribute("aria-disabled", "true");
      }

      cell.addEventListener("click", () => onCellClick(i));
      boardEl.appendChild(cell);
    }

    const win = winnerFor(board);
    if (win) {
      const cells = boardEl.querySelectorAll(".cell");
      for (const idx of win.line) {
        cells[idx]?.classList.add("win");
      }
    }

    setSubtitle();

    if (isGameOver) return;

    if (isCpuThinking) {
      setStatus("CPU is thinking…");
      return;
    }

    setStatus(current === you ? "Your turn." : "CPU turn.");
  }

  function endGame(message) {
    isGameOver = true;
    setStatus(message);
    render();
  }

  function switchTurn() {
    current = current === Player.X ? Player.O : Player.X;
  }

  function makeMove(index, player) {
    if (board[index] !== null) return false;
    board[index] = player;
    return true;
  }

  function maybeFinish() {
    const win = winnerFor(board);
    if (win) {
      endGame(`${win.winner} wins!`);
      return true;
    }
    if (isTie(board)) {
      endGame("Tie game.");
      return true;
    }
    return false;
  }

  function cpuPickMove() {
    const moves = availableMoves(board);
    if (moves.length === 0) return null;

    // Smart-but-beatable CPU:
    // 1) take a winning move if available
    // 2) block an immediate loss
    // 3) otherwise prefer strong positions (center, corners), with occasional randomness

    function findImmediateMove(forPlayer) {
      for (const idx of moves) {
        const b2 = board.slice();
        b2[idx] = forPlayer;
        if (winnerFor(b2)?.winner === forPlayer) return idx;
      }
      return null;
    }

    const winNow = findImmediateMove(cpu);
    if (winNow !== null) return winNow;

    const blockNow = findImmediateMove(you);
    if (blockNow !== null) {
      // Rarely make a mistake so it's not too strong.
      if (Math.random() < 0.12 && moves.length > 1) {
        return moves[Math.floor(Math.random() * moves.length)];
      }
      return blockNow;
    }

    // Prefer center
    if (board[4] === null && Math.random() < 0.75) return 4;

    // Prefer corners, then edges
    const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
    const edges = [1, 3, 5, 7].filter((i) => board[i] === null);

    if (corners.length && Math.random() < 0.75) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    const pool = corners.length ? corners : edges.length ? edges : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function cpuMove() {
    isCpuThinking = true;
    render();

    window.setTimeout(() => {
      const idx = cpuPickMove();
      if (idx === null) {
        isCpuThinking = false;
        render();
        return;
      }

      makeMove(idx, cpu);
      isCpuThinking = false;

      playCpuSound();

      if (maybeFinish()) return;

      switchTurn();
      render();
    }, 380);
  }

  function onCellClick(index) {
    if (isGameOver || isCpuThinking) return;
    if (current !== you) return;

    const ok = makeMove(index, you);
    if (!ok) return;

    playClickSound();

    if (maybeFinish()) return;

    switchTurn();
    render();

    if (current === cpu) cpuMove();
  }

  function newGame({ starter } = {}) {
    board = Array(9).fill(null);
    isGameOver = false;
    isCpuThinking = false;
    current = starter ?? you;

    render();

    if (current === cpu) cpuMove();
  }

  function toggleStarter() {
    // Toggle between: You start as X vs CPU as O
    // and CPU starts as X vs You as O.
    if (you === Player.X) {
      you = Player.O;
      cpu = Player.X;
      toggleStarterBtn.textContent = "You start: O";
      newGame({ starter: cpu });
    } else {
      you = Player.X;
      cpu = Player.O;
      toggleStarterBtn.textContent = "You start: X";
      newGame({ starter: you });
    }
  }

  newGameBtn.addEventListener("click", () => newGame({ starter: you }));
  toggleStarterBtn.addEventListener("click", toggleStarter);

  // Initial render.
  toggleStarterBtn.textContent = "You start: X";
  newGame({ starter: you });
})();
