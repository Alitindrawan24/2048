if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then((registration) =>
      console.log(`Service Worker registered with scope: ${registration.scope}`)
    )
    .catch((error) =>
      console.log(`Service Worker registration failed:
        ${error}`)
    );
}

let dialogHowTo = document.querySelector("#dialog-how-to");
let stopGame = false;

let arr = [];
let hasCombine = [];
let hasMove = true;
let score = 0;
for (var i = 0; i < 4; i++) {
  arr[i] = [];
  hasCombine[i] = [];
  for (var j = 0; j < 4; j++) {
    arr[i][j] = 0;
    hasCombine[i][j] = false;
  }
}
x = Math.floor(Math.random() * 4);
y = Math.floor(Math.random() * 4);
arr[x][y] = 2;
fill();
document.addEventListener("keydown", keyPush);

document.addEventListener("click", (event) => {
  const keyboardEventObject = {
    keyCode: 0, // example values.
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

function keyPush(evt) {
  if (dialogHowTo.open || stopGame) return;

  hasMove = false;
  switch (evt.keyCode) {
    case 37:
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
          c = 0;
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
    case 38:
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
          c = 0;
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
    case 39:
      for (var i = 0; i < 4; i++) {
        for (var j = 3; j >= 0; j--) {
          c = 0;
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
    case 40:
      for (var i = 3; i >= 0; i--) {
        for (var j = 0; j < 4; j++) {
          c = 0;
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

function fill() {
  if (!isFull()) {
    if (hasMove) randomXY();
  }
  if (isFull()) {
    if (isGameOver()) {
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
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      temp = document.getElementById(i + "" + j);

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

function randomXY() {
  do {
    x = Math.floor(Math.random() * 4);
    y = Math.floor(Math.random() * 4);
  } while (arr[x][y] != 0);
  z = Math.ceil(Math.random() * 10);
  if (z >= 7) arr[x][y] = 4;
  else arr[x][y] = 2;
}

function swap(a, b, x, y) {
  if (arr[a][b] != 0 || arr[x][y] != 0) {
    temp = arr[a][b];
    arr[a][b] = arr[x][y];
    arr[x][y] = temp;
    hasMove = true;
  }
}

function combine(a, b, x, y) {
  if (!hasCombine[x][y] && !hasCombine[a][b]) {
    arr[x][y] += arr[x][y];
    arr[a][b] = 0;
    hasCombine[x][y] = true;
    hasMove = true;
    score += arr[x][y];
    document.getElementById("num-score").innerHTML = score;
  }
}

function resetHasCombine() {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      hasCombine[i][j] = false;
    }
  }
}

function isFull() {
  full = true;
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (arr[i][j] == 0) {
        full = false;
        break;
      }
    }
    if (!full) break;
  }
  return full;
}

function isGameOver() {
  gameOver = true;
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
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

function restart() {
  // Reset game state
  arr = [];
  hasCombine = [];
  hasMove = true;
  stopGame = false;
  score = 0;

  // Initialize the game board
  for (let i = 0; i < 4; i++) {
    arr[i] = [];
    hasCombine[i] = [];
    for (let j = 0; j < 4; j++) {
      arr[i][j] = 0;
      hasCombine[i][j] = false;
    }
  }

  // Generate a new tile
  generateNewTile();

  // Hide game over message
  document.getElementById("gameOver").style.display = "none";

  // Update the score display
  updateScoreDisplay();

  // Update the game board display
  updateGameBoardDisplay();
}

function generateNewTile() {
  // Generate a new tile (either 2 or 4) at a random empty position
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

function updateScoreDisplay() {
  // Update the displayed score
  document.getElementById("num-score").innerHTML = score;
}

function updateGameBoardDisplay() {
  // Update the game board display based on the current state of the game array
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

// Function to update text content based on the selected language
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

// btn-translate
let btnTranslate = document.getElementsByClassName("btn-translate")[0];
const supportedLanguages = ["en", "id", "es", "zh"]; // Languages - English, Indonesian, Spanish, Chinese
let currentLanguageIndex = 0; // Start with the first language

btnTranslate.onclick = () => {
  currentLanguageIndex = (currentLanguageIndex + 1) % supportedLanguages.length;
  const currentLanguage = supportedLanguages[currentLanguageIndex];
  updateTextContent(currentLanguage);
};

function onClickBtnHowTo() {
  dialogHowTo.showModal();
}

function closeHowToDialog() {
  dialogHowTo.close();
}

// Theme Update
const lightButton = document.querySelector("[data-light-theme-button]");
const darkButton = document.querySelector("[data-dark-theme-button]");

lightButton.addEventListener("click", () => updateTheme("light"));
darkButton.addEventListener("click", () => updateTheme("dark"));

function updateTheme(theme) {
  const body = document.body;

  if (theme === "light") return body.classList.remove("dark");

  body.classList.add("dark");
}
