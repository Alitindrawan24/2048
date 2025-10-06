// Service Worker Registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then((registration) =>
      console.log(`Service Worker registered with scope: ${registration.scope}`)
    )
    .catch((error) =>
      console.log(`Service Worker registration failed: ${error}`)
    );
}

// Game Variables
let dialogHowTo = document.querySelector("#dialog-how-to");
let stopGame = false;
let arr = [];
let hasCombine = [];
let hasMove = true;
let score = 0;
let moveCount = 0;
let highestTile = 2;

// Initialize Game Arrays
for (let i = 0; i < 4; i++) {
  arr[i] = [];
  hasCombine[i] = [];
  for (let j = 0; j < 4; j++) {
    arr[i][j] = 0;
    hasCombine[i][j] = false;
  }
}

// Start Game with Initial Tile
let x = Math.floor(Math.random() * 4);
let y = Math.floor(Math.random() * 4);
arr[x][y] = 2;
fill();

// Touch/Swipe Variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let minSwipeDistance = 50;

// Event Listeners
document.addEventListener("keydown", keyPush);

// Touch Events for Mobile
document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, false);

document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
}, false);

// Handle Swipe Gestures
function handleSwipe() {
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    if (Math.abs(deltaX) > minSwipeDistance) {
      triggerHapticFeedback('light');
      if (deltaX > 0) {
        // Swipe right
        simulateKeyPress(39);
      } else {
        // Swipe left
        simulateKeyPress(37);
      }
    }
  } else {
    // Vertical swipe
    if (Math.abs(deltaY) > minSwipeDistance) {
      triggerHapticFeedback('light');
      if (deltaY > 0) {
        // Swipe down
        simulateKeyPress(40);
      } else {
        // Swipe up
        simulateKeyPress(38);
      }
    }
  }
}

// Simulate Key Press
function simulateKeyPress(keyCode) {
  const keyboardEventObject = { keyCode: keyCode };
  document.dispatchEvent(new KeyboardEvent("keydown", keyboardEventObject));
}

// Haptic Feedback
function triggerHapticFeedback(type = 'light') {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(50);
        break;
      case 'heavy':
        navigator.vibrate([50, 30, 50]);
        break;
      case 'success':
        navigator.vibrate([30, 20, 30, 20, 30]);
        break;
    }
  }
}

// Audio System
class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.enabled = true;
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
      this.enabled = false;
    }
  }

  playSound(type, frequency = 440, duration = 0.1) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.log('Audio playback failed:', e);
    }
  }

  playMoveSound() {
    this.playSound('move', 200, 0.05);
  }

  playMergeSound(value) {
    const frequency = Math.min(800, 200 + (value * 10));
    this.playSound('merge', frequency, 0.15);
  }

  playGameOverSound() {
    this.playSound('gameover', 150, 0.5);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Initialize Audio System
const audioSystem = new AudioSystem();

document.addEventListener("click", (event) => {
  const keyboardEventObject = {
    keyCode: 0,
  };
  const validButtons = ["up", "down", "left", "right"];
  
  if (validButtons.includes(event.target.name)) {
    switch (event.target.name) {
      case "up":
        keyboardEventObject.keyCode = 38;
        break;
      case "down":
        keyboardEventObject.keyCode = 40;
        break;
      case "left":
        keyboardEventObject.keyCode = 37;
        break;
      case "right":
        keyboardEventObject.keyCode = 39;
        break;
    }
  }

  if (keyboardEventObject.keyCode !== 0) {
    document.dispatchEvent(new KeyboardEvent("keydown", keyboardEventObject));
  }
});

// Handle Key Presses
function keyPush(evt) {
  if (dialogHowTo.open || stopGame) return;

  hasMove = false;
  moveCount++;
  
  // Play move sound
  audioSystem.playMoveSound();
  
  switch (evt.keyCode) {
    case 37: // Left
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          let c = 0;
          while (j - c > 0) {
            if (arr[i][j - c - 1] == 0) {
              swap(i, j - c, i, j - c - 1);
            } else if (arr[i][j - c - 1] == arr[i][j - c]) {
              combine(i, j - c, i, j - c - 1);
            }
            c++;
          }
        }
      }
      fill();
      break;
      
    case 38: // Up
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          let c = 0;
          while (i - c > 0) {
            if (arr[i - c - 1][j] == 0) {
              swap(i - c, j, i - c - 1, j);
            } else if (arr[i - c - 1][j] == arr[i - c][j]) {
              combine(i - c, j, i - c - 1, j);
            }
            c++;
          }
        }
      }
      fill();
      break;
      
    case 39: // Right
      for (let i = 0; i < 4; i++) {
        for (let j = 3; j >= 0; j--) {
          let c = 0;
          while (j + c < 3) {
            if (arr[i][j + c + 1] == 0) {
              swap(i, j + c, i, j + c + 1);
            } else if (arr[i][j + c + 1] == arr[i][j + c]) {
              combine(i, j + c, i, j + c + 1);
            }
            c++;
          }
        }
      }
      fill();
      break;
      
    case 40: // Down
      for (let i = 3; i >= 0; i--) {
        for (let j = 0; j < 4; j++) {
          let c = 0;
          while (i + c < 3) {
            if (arr[i + c + 1][j] == 0) {
              swap(i + c, j, i + c + 1, j);
            } else if (arr[i + c + 1][j] == arr[i + c][j]) {
              combine(i + c, j, i + c + 1, j);
            }
            c++;
          }
        }
      }
      fill();
      break;
  }
}

// Fill Board After Move
function fill() {
  if (!isFull()) {
    if (hasMove) randomXY();
  }
  
  if (isFull()) {
    if (isGameOver()) {
      // Update game over statistics
      document.getElementById("final-score").textContent = score;
      document.getElementById("highest-tile").textContent = highestTile;
      document.getElementById("move-count").textContent = moveCount;
      
      // Play game over sound
      audioSystem.playGameOverSound();
      
      document.getElementById("gameOver").style.display = "block";
      
      arr = arr.map((line, lineIndex) =>
        line.map((item, itemIndex) => {
          if (lineIndex === 0 || lineIndex === arr.length - 1) return "*";
          return ["GAME", "OVER"][lineIndex - 1][itemIndex];
        })
      );
      
      stopGame = true;
    }
  }
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const temp = document.getElementById(i + "" + j);
      
      if (arr[i][j] != 0) {
        const value = arr[i][j];
        temp.innerHTML = value;
        temp.classList = [`_${value <= 2048 ? value : "greater-than-2048"}`];
      } else {
        temp.innerHTML = "";
        temp.classList = [];
      }
    }
  }
  resetHasCombine();
}

// Generate Random Tile
function randomXY() {
  do {
    x = Math.floor(Math.random() * 4);
    y = Math.floor(Math.random() * 4);
  } while (arr[x][y] != 0);
  
  const z = Math.ceil(Math.random() * 10);
  if (z >= 7) arr[x][y] = 4;
  else arr[x][y] = 2;
}

// Swap Two Tiles
function swap(a, b, x, y) {
  if (arr[a][b] != 0 || arr[x][y] != 0) {
    const temp = arr[a][b];
    arr[a][b] = arr[x][y];
    arr[x][y] = temp;
    hasMove = true;
  }
}

// Combine Two Tiles
function combine(a, b, x, y) {
  if (!hasCombine[x][y] && !hasCombine[a][b]) {
    arr[x][y] += arr[x][y];
    arr[a][b] = 0;
    hasCombine[x][y] = true;
    hasMove = true;
    score += arr[x][y];
    
    // Update highest tile
    if (arr[x][y] > highestTile) {
      highestTile = arr[x][y];
    }
    
    document.getElementById("num-score").innerHTML = score;
    
    // Add visual feedback for merge
    const mergedTile = document.getElementById(x + "" + y);
    mergedTile.classList.add("tile-merge");
    
    // Add score animation
    animateScore();
    
    // Add particle effect for significant merges
    if (arr[x][y] >= 64) {
      createParticleEffect(x, y);
      triggerHapticFeedback('success');
    } else {
      triggerHapticFeedback('medium');
    }
    
    // Play merge sound
    audioSystem.playMergeSound(arr[x][y]);
    
    // Remove animation class after animation completes
    setTimeout(() => {
      mergedTile.classList.remove("tile-merge");
    }, 300);
  }
}

// Animate Score Update
function animateScore() {
  const scoreElement = document.getElementById("num-score");
  scoreElement.style.transform = "scale(1.2)";
  scoreElement.style.color = "#09d635";
  
  setTimeout(() => {
    scoreElement.style.transform = "scale(1)";
    scoreElement.style.color = "";
  }, 200);
}

// Create Particle Effect
function createParticleEffect(x, y) {
  const particleCount = 8;
  const tileElement = document.getElementById(x + "" + y);
  const rect = tileElement.getBoundingClientRect();
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    
    const randomX = (Math.random() - 0.5) * 100;
    const randomY = (Math.random() - 0.5) * 100;
    
    particle.style.left = rect.left + rect.width / 2 + "px";
    particle.style.top = rect.top + rect.height / 2 + "px";
    particle.style.setProperty("--random-x", randomX + "px");
    particle.style.setProperty("--random-y", randomY + "px");
    
    document.body.appendChild(particle);
    
    particle.classList.add("particle-burst");
    
    setTimeout(() => {
      document.body.removeChild(particle);
    }, 600);
  }
}

// Reset Combine Flags
function resetHasCombine() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      hasCombine[i][j] = false;
    }
  }
}

// Check if Board is Full
function isFull() {
  let full = true;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (arr[i][j] == 0) {
        full = false;
        break;
      }
    }
    if (!full) break;
  }
  return full;
}

// Check if Game is Over
function isGameOver() {
  let gameOver = true;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i > 0) {
        if (arr[i - 1][j] == arr[i][j]) {
          gameOver = false;
          break;
        }
      }
      if (j > 0) {
        if (arr[i][j - 1] == arr[i][j]) {
          gameOver = false;
          break;
        }
      }
      if (i < 3) {
        if (arr[i + 1][j] == arr[i][j]) {
          gameOver = false;
          break;
        }
      }
      if (j < 3) {
        if (arr[i][j + 1] == arr[i][j]) {
          gameOver = false;
          break;
        }
      }
    }
    if (!gameOver) break;
  }
  return gameOver;
}

// Restart Game
function restart() {
  arr = [];
  hasCombine = [];
  hasMove = true;
  stopGame = false;
  score = 0;
  moveCount = 0;
  highestTile = 2;

  for (let i = 0; i < 4; i++) {
    arr[i] = [];
    hasCombine[i] = [];
    for (let j = 0; j < 4; j++) {
      arr[i][j] = 0;
      hasCombine[i][j] = false;
    }
  }

  generateNewTile();
  document.getElementById("gameOver").style.display = "none";
  updateScoreDisplay();
  updateGameBoardDisplay();
}

// Generate New Tile
function generateNewTile() {
  let emptyPositions = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (arr[i][j] === 0) {
        emptyPositions.push({ x: i, y: j });
      }
    }
  }

  if (emptyPositions.length > 0) {
    const randomPosition =
      emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;
    arr[randomPosition.x][randomPosition.y] = newValue;
  }
}

// Update Score Display
function updateScoreDisplay() {
  document.getElementById("num-score").innerHTML = score;
}

// Update Game Board Display
function updateGameBoardDisplay() {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const tileElement = document.getElementById(i + "" + j);
      tileElement.innerHTML = arr[i][j] !== 0 ? arr[i][j] : "";
      tileElement.className =
        arr[i][j] !== 0
          ? `_${arr[i][j] <= 2048 ? arr[i][j] : "greater-than-2048"}`
          : "";
    }
  }
}

// Update Text Content Based on Language
function updateTextContent(currentLanguage) {
  const howHeader = document.querySelector(".how h3");
  const howText = document.querySelector(".how p");
  const textScore = document.querySelector("#text-score");
  const resetButton = document.querySelector("#gameOver #reset");

  if (currentLanguage === "en") {
    howHeader.textContent = "How to Play?";
    howText.innerHTML =
      "Use your <i><u>arrow keys</u></i> to move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach <b>2048</b>!";
    textScore.textContent = "Score";
    resetButton.textContent = "Try Again";
  } else if (currentLanguage === "id") {
    howHeader.textContent = "Bagaimana cara Bermain?";
    howText.innerHTML =
      "Gunakan <i><u>tombol panah</u></i> Anda untuk memindahkan ubin. Ubin dengan nomor yang sama bergabung menjadi satu ketika mereka menyentuh. Tambahkan hingga mencapai <b>2048</b>";
    textScore.textContent = "Skor";
    resetButton.textContent = "Coba Lagi";
  } else if (currentLanguage === "es") {
    howHeader.textContent = "Cómo jugar";
    howText.innerHTML =
      "Utiliza las teclas de flecha <i><u>arrow keys</u></i> para mover las fichas. Las fichas con el mismo número se fusionan en una cuando se tocan. ¡Súmalas hasta alcanzar <b>2048</b>!";
    textScore.textContent = "Puntuación";
    resetButton.textContent = "Volver a intentar";
  } else if (currentLanguage === "zh") {
    howHeader.textContent = "怎么玩";
    howText.innerHTML =
      "使用您的 <i><u>方向键</u></i> 移动方块。相同数字的方块相互接触时会合并成一个。将它们相加以达到 <b>2048</b>！";
    textScore.textContent = "分数";
    resetButton.textContent = "再试一次";
  }
}

// Language Translation Button
let btnTranslate = document.getElementsByClassName("btn-translate")[0];
const supportedLanguages = ["en", "id", "es", "zh"];
let currentLanguageIndex = 0;

btnTranslate.onclick = () => {
  currentLanguageIndex = (currentLanguageIndex + 1) % supportedLanguages.length;
  const currentLanguage = supportedLanguages[currentLanguageIndex];
  updateTextContent(currentLanguage);
};

// Dialog Functions
function onClickBtnHowTo() {
  dialogHowTo.showModal();
}

function closeHowToDialog() {
  dialogHowTo.close();
}

// Theme Toggle - Using in-memory storage instead of localStorage
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Default to light theme
  let currentTheme = "light";
  body.classList.add(currentTheme);

  themeToggle.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "dark" : "light";
    body.classList.replace(currentTheme, newTheme);
    currentTheme = newTheme;
  });
});

// Toggle Sound Function
function toggleSound() {
  const enabled = audioSystem.toggle();
  const soundIcon = document.getElementById("sound-icon");
  soundIcon.textContent = enabled ? "🔊" : "🔇";
}