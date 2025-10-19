
let powerupUsed = {
  abacaxi: false,
  uva: false,
  caixa: false,
  espada: false,
  banana: false
};
let firstMoveDone = false;

document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const scoreEl = document.getElementById("score");
  const highscoreEl = document.getElementById("highscore");
  const gameOverEl = document.getElementById("game-over");
  const restartBtn = document.getElementById("restart-btn");
  const startScreen = document.getElementById("start-screen");
  const startBtn = document.getElementById("start-btn");
  const continueBtn = document.getElementById("continue-btn");
  const undoBtn = document.getElementById("undo-btn");

  let grid = [];
  let previousGrid = [];
  let score = 0;
  let highscore = localStorage.getItem("highscore2048") || 0;
  let boostNextScore = false;

  function saveGame() {
    localStorage.setItem("2048PiratesGrid", JSON.stringify(grid));
    localStorage.setItem("score2048", score);
    if (score > highscore) {
      highscore = score;
      localStorage.setItem("highscore2048", highscore);
    }
    updateScore();
  }

  function loadGame() {
    const saved = localStorage.getItem("2048PiratesGrid");
    const savedScore = localStorage.getItem("score2048");
    if (saved) grid = JSON.parse(saved);
    if (savedScore) score = parseInt(savedScore);
    updateScore();
    draw();
  }

  function init() {
  firstMoveDone = false;
  document.getElementById("undo-btn").disabled = true;
    score = 0;
    grid = new Array(4).fill(null).map(() => new Array(4).fill(0));
    gameOverEl.style.display = "none";
    addTile();
    addTile();
    draw();
    updateScore();
    saveGame();
  }

  function updateScore() {
    scoreEl.textContent = score;
    highscoreEl.textContent = highscore;
  }

  function addTile() {
    let empty = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) empty.push({ i, j });
      }
    }
    if (empty.length === 0) return;
    let spot = empty[Math.floor(Math.random() * empty.length)];
    grid[spot.i][spot.j] = Math.random() > 0.9 ? 4 : 2;
  }

  function draw() {
    board.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const tile = document.createElement("div");
        const val = grid[i][j];
        tile.className = "tile tile-" + val;
        tile.textContent = val === 0 ? "" : val;
        board.appendChild(tile);
      }
    }
  }

  function copyGrid(g) {
    return g.map(row => row.slice());
  }

  function slide(row) {
    let arr = row.filter(val => val);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += boostNextScore ? arr[i] * 2 : arr[i]; playSound('merge');
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(val => val);
    while (arr.length < 4) arr.push(0);
    return arr;
  }

  function rotateGrid(grid) {
    return grid[0].map((_, i) => grid.map(row => row[i]).reverse());
  }

  function move(dir) {
    previousGrid = copyGrid(grid);
    let oldGrid = JSON.stringify(grid);

    for (let i = 0; i < dir; i++) grid = rotateGrid(grid);
    for (let i = 0; i < 4; i++) grid[i] = slide(grid[i]);
    for (let i = 0; i < (4 - dir) % 4; i++) grid = rotateGrid(grid);

    if (boostNextScore) boostNextScore = false;

    if (JSON.stringify(grid) !== oldGrid) {
      
    if (!firstMoveDone) {
      document.getElementById("undo-btn").disabled = false;
      firstMoveDone = true;
    }
      addTile();
      draw();
      saveGame();
      if (isGameOver()) showGameOver();
    }
  }

  function isGameOver() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) return false;
        if (j < 3 && grid[i][j] === grid[i][j + 1]) return false;
        if (i < 3 && grid[i][j] === grid[i + 1][j]) return false;
      }
    }
    return true;
  }

  function showGameOver() {
    gameOverEl.style.display = "block";
    playSound('gameover');
  document.getElementById("undo-btn").disabled = true;
  }

  // Power-ups
  document.getElementById("power-abacaxi").onclick = () => {
  if (powerupUsed.abacaxi) return;
  powerupUsed.abacaxi = true;
  document.getElementById("power-abacaxi").style.display = "none";

    boostNextScore = true;
    alert("Abacaxi ativado! Próxima fusão com pontuação dobrada!");
  };

  document.getElementById("power-uva").onclick = () => {
  if (powerupUsed.uva) return;
  powerupUsed.uva = true;
  document.getElementById("power-uva").style.display = "none";

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        grid[i][j] *= 2;
      }
    }
    draw();
    alert("Uva ativada! Todas as peças dobraram!");
  };

  document.getElementById("power-caixa").onclick = () => {
  if (powerupUsed.caixa) return;
  powerupUsed.caixa = true;
  document.getElementById("power-caixa").style.display = "none";

    let tiles = [];
    for (let row of grid) for (let val of row) if (val !== 0) tiles.push(val);
    grid = grid.map(r => r.map(() => 0));
    tiles = tiles.sort(() => Math.random() - 0.5);
    for (let i = 0; i < tiles.length; i++) {
      grid[Math.floor(i / 4)][i % 4] = tiles[i];
    }
    draw();
    alert("Caixa ativada! Peças embaralhadas!");
  };

  document.getElementById("power-espada").onclick = () => {
  if (powerupUsed.espada) return;
  powerupUsed.espada = true;
  document.getElementById("power-espada").style.display = "none";

    let max = 0, pos = null;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] > max) {
          max = grid[i][j];
          pos = { i, j };
        }
      }
    }
    if (pos) grid[pos.i][pos.j] = 0;
    draw();
    alert("Espada ativada! Peça mais alta removida.");
  };

  document.getElementById("power-banana").onclick = () => {
  if (powerupUsed.banana) return;
  powerupUsed.banana = true;
  document.getElementById("power-banana").style.display = "none";

    alert("Clique em uma peça para apagar!");
    board.onclick = e => {
      const idx = Array.from(board.children).indexOf(e.target);
      const i = Math.floor(idx / 4), j = idx % 4;
      grid[i][j] = 0;
      board.onclick = null;
      draw();
    };
  };

  // Eventos básicos
  restartBtn.addEventListener("click", () => init());
  startBtn.addEventListener("click", () => {
    init();
    startScreen.style.display = "none";
  });
  continueBtn.addEventListener("click", () => {
    loadGame();
    startScreen.style.display = "none";
  });
  undoBtn.addEventListener("click", () => {
    grid = copyGrid(previousGrid);
    draw();
  });

  window.addEventListener("keydown", e => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
    if (e.key === "ArrowLeft") move(0);
    if (e.key === "ArrowUp") move(3);
    if (e.key === "ArrowRight") move(2);
    if (e.key === "ArrowDown") move(1);
  });
});

document.getElementById("btn-home").addEventListener("click", () => {
  document.getElementById("start-screen").style.display = "flex";
});



// ================= SOM =================
let sounds = {};
let isMuted = true;

function initSounds() {
  sounds = {
    move: new Audio("audio/move.mp3"),
    merge: new Audio("audio/merge.mp3"),
    gameover: new Audio("audio/gameover.mp3")
  };
  for (let key in sounds) {
    sounds[key].volume = 1.0;
    sounds[key].preload = "auto";
  }
}

function playSound(name) {
  if (!isMuted && sounds[name]) {
    sounds[name].currentTime = 0;
    sounds[name].play().catch(err => console.warn("Erro ao tocar som:", err));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const audioBtn = document.getElementById("audio-button");
  const audioIcon = document.getElementById("audio-icon");

  if (audioBtn && audioIcon) {
    audioBtn.addEventListener("click", () => {
      if (Object.keys(sounds).length === 0) initSounds();
      isMuted = !isMuted;
      audioIcon.src = isMuted ? "img/audio-off.png" : "img/audio-on.png";
    });
  }

  // Garante inicialização no primeiro clique em qualquer lugar
  document.body.addEventListener("click", () => {
    if (Object.keys(sounds).length === 0) initSounds();
  }, { once: true });
});
