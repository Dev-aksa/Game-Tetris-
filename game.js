// === Konstanta ===
const ROWS = 12;
const COLS = 10;
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const SHAPES = [
  [[1, 1, 1, 1]],               // I
  [[1, 1], [1, 1]],             // O
  [[0, 1, 0], [1, 1, 1]],       // T
  [[1, 1, 0], [0, 1, 1]],       // Z
  [[0, 1, 1], [1, 1, 0]],       // S
  [[1, 0, 0], [1, 1, 1]],       // J
  [[0, 0, 1], [1, 1, 1]],       // L
];
const COLORS = ['#0ff', '#ff0', '#f0f', '#f00', '#0f0', '#00f', '#fa0'];

// === Variabel Game ===
let currentPiece = null;
let score = 0;
let level = 1;
let highscore = 0;
let gameInterval;
let isPaused = false;
let gameStarted = false; // ✅ Tambahan penting

// === DOM Element ===
const boardElement = document.getElementById('tetris-board');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const highscoreEl = document.getElementById('highscore');

// === Setup Papan ===
function drawBoard() {
  boardElement.innerHTML = '';
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = document.createElement('div');
      let val = board[y][x];

      if (currentPiece) {
        const { shape, x: px, y: py, type } = currentPiece;
        const relY = y - py;
        const relX = x - px;
        if (
          relY >= 0 && relY < shape.length &&
          relX >= 0 && relX < shape[0].length &&
          shape[relY][relX]
        ) {
          val = type + 1;
        }
      }

      cell.style.background = val ? COLORS[val - 1] : '#111';
      boardElement.appendChild(cell);
    }
  }
}

// === Spawn Piece ===
function spawnPiece() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  currentPiece = {
    shape,
    x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2),
    y: 0,
    type: SHAPES.indexOf(shape)
  };

  // ❗ FIX: hanya tampilkan Game Over jika game sudah benar-benar dimulai
  if (!isValidPosition(currentPiece)) {
    if (gameStarted) {
      endGame(); // Munculkan Game Over hanya setelah game dimulai
    } else {
      currentPiece = null;
      board.forEach(row => row.fill(0));
      setTimeout(() => spawnPiece(), 10); // coba spawn ulang
    }
    return;
  }

  drawBoard();
}


// === Validasi Posisi ===
function isValidPosition(piece) {
  const { shape, x, y } = piece;
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        const newY = y + i;
        const newX = x + j;
        if (
          newX < 0 || newX >= COLS || newY >= ROWS ||
          (newY >= 0 && board[newY][newX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

// === Gerak ===
function move(dx, dy) {
  if (isPaused) return false;
  const newPiece = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy };
  if (isValidPosition(newPiece)) {
    currentPiece = newPiece;
    drawBoard();
    return true;
  }
  return false;
}

// === Rotate ===
function rotate() {
  if (isPaused) return;
  const shape = currentPiece.shape;
  const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
  const newPiece = { ...currentPiece, shape: rotated };
  if (isValidPosition(newPiece)) {
    currentPiece.shape = rotated;
    drawBoard();
  }
}

// === Merge dan Clear ===
function mergePiece() {
  const { shape, x, y, type } = currentPiece;
  shape.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell && y + i >= 0) {
        board[y + i][x + j] = type + 1;
      }
    });
  });
}

function clearLines() {
  let linesCleared = 0;
  for (let y = board.length - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      linesCleared++;
      y++;
    }
  }
  if (linesCleared > 0) {
    score += linesCleared * 100;
    level = Math.floor(score / 500) + 1;
  }
}

// === Drop ===
function dropPiece() {
  if (!currentPiece || isPaused) return;
  if (!move(0, 1)) {
    mergePiece();
    clearLines();
    updateInfo();
    spawnPiece();
  }
}

// === Start Game ===
function startGame() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      board[y][x] = 0;
    }
  }
  score = 0;
  level = 1;
  isPaused = false;
  currentPiece = null;
  gameStarted = true; // ✅ Tambahkan ini
  updateInfo();
  spawnPiece();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    if (!isPaused) {
      dropPiece();
      drawBoard();
    }
  }, 1000);
}

// === Pause / Resume ===
function pauseGame() {
  isPaused = true;
}

function resumeGame() {
  isPaused = false;
}

function endGame() {
  clearInterval(gameInterval);
  document.getElementById("gameover-popup").classList.remove("hidden");
}

// === Leaderboard Kirim Skor ===
function saveScoreToLeaderboard(name, score) {
  fetch("https://6877a97ddba809d901f06597.mockapi.io/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      score: score,
      time: new Date().toISOString()
    })
  });
}

// === Info Tampilan ===
function updateInfo() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  highscore = Math.max(highscore, score);
  highscoreEl.textContent = highscore;
}

// === Kontrol Arah ===
function moveLeft() { if (move(-1, 0)) drawBoard(); }
function moveRight() { if (move(1, 0)) drawBoard(); }
function drop() { if (move(0, 1)) drawBoard(); }

// === Dropdown Menu ===
const menuBtn = document.getElementById("menu-button");
const dropdown = document.getElementById("dropdown-menu");
menuBtn.addEventListener("click", () => {
  dropdown.classList.toggle("hidden");
});

// === Tombol Menu ===
document.getElementById("resume-button").addEventListener("click", () => {
  resumeGame();
  dropdown.classList.add("hidden");
});
document.getElementById("pause-button").addEventListener("click", () => {
  pauseGame();
  dropdown.classList.add("hidden");
});
document.getElementById("back-button").addEventListener("click", () => {
  window.location.href = "index.html";
});

// === Keyboard Control ===
document.addEventListener('keydown', (e) => {
  if (isPaused) return;
  const key = e.key.toLowerCase();
  switch (key) {
    case 'arrowleft':
    case 'a':
      moveLeft();
      break;
    case 'arrowright':
    case 'd':
      moveRight();
      break;
    case 'arrowdown':
    case 's':
      drop();
      break;
    case 'arrowup':
    case 'w':
    case ' ':
      rotate();
      break;
  }
});

// === Submit Score ke Leaderboard ===
document.getElementById("submitScoreBtn").addEventListener("click", () => {
  const name = document.getElementById("playerNameInput").value.trim();
  if (!name) return alert("Nama tidak boleh kosong!");
  saveScoreToLeaderboard(name, score);
  document.getElementById("gameover-popup").classList.add("hidden");
  window.location.href = "Leaderboard.html";
});

// === Start otomatis ===
window.onload = () => {
  startGame();
};
