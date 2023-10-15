let dialogHowTo = document.querySelector('#dialog-how-to');
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
        keyCode: 0// example values.
    };
    const validButtons = ['up','down','left','right'];
    if(validButtons.includes(event.target.name)) {
        switch(event.target.name) {
            case 'up':
                keyboardEventObject.keyCode = 38;
                break;
            case 'down':
                keyboardEventObject.keyCode = 40;
                break;
            case 'left':
                keyboardEventObject.keyCode = 37;
                break;
            case 'right':
                keyboardEventObject.keyCode = 39;
                break;
        }
    }

    if(keyboardEventObject.keyCode !== 0) {
        document.dispatchEvent(
            new KeyboardEvent("keydown", keyboardEventObject)
          );
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
        if (hasMove)
            randomXY();
    }
    if (isFull()) {
      if (isGameOver()) {
        document.getElementById('gameOver').style.display = 'block';

        arr = arr.map((line, lineIndex) => line.map((item, itemIndex) => {
          if (lineIndex === 0 || lineIndex === arr.length - 1) return '*';
          return ['GAME', 'OVER'][lineIndex - 1][itemIndex];
        }));

        stopGame = true;
      }
    }
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            temp = document.getElementById(i + "" + j);
			      
            if (arr[i][j] != 0) {
				        const value = arr[i][j];
                
                temp.innerHTML = value;
                temp.classList = [
                  `_${value <= 2048 ? value : 'greater-than-2048'}`,
                ];
            } else {
                temp.innerHTML = '';
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
    if (z >= 7)
        arr[x][y] = 4;
    else
        arr[x][y] = 2;
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
        document.getElementById('num-score').innerHTML = score;
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
        if (!full)
            break;
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
        if (!gameOver)
            break;
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
    document.getElementById('gameOver').style.display = 'none';

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
        const randomPosition = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        const newValue = Math.random() < 0.9 ? 2 : 4;
        arr[randomPosition.x][randomPosition.y] = newValue;
    }
}

function updateScoreDisplay() {
    // Update the displayed score
    document.getElementById('num-score').innerHTML = score;
}

function updateGameBoardDisplay() {
    // Update the game board display based on the current state of the game array
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tileElement = document.getElementById(i + "" + j);
            tileElement.innerHTML = arr[i][j] !== 0 ? arr[i][j] : '';
            tileElement.className = arr[i][j] !== 0 ? `_${arr[i][j] <= 2048 ? arr[i][j] : 'greater-than-2048'}` : '';
        }
    }
}


// btn-translate
let btnTranslate = document.getElementsByClassName("btn-translate")[0];

btnTranslate.onclick = () => {
    let body = document.getElementsByTagName("body")[0];

    if(body.className != "id"){
        // ID
        body.classList.add("id");

        // .how -> span
        document.querySelector('.how h3').textContent = "Bagaimana cara Bermain?";
        // .how -> p
        document.querySelector('.how p').innerHTML = "Gunakan <i><u>tombol panah</u></i> Anda untuk memindahkan ubin. Ubin dengan nomor yang sama bergabung menjadi satu ketika mereka menyentuh. Tambahkan hingga mencapai <b>2048</b>!";
        // #text-score
        document.querySelector('#text-score').textContent = "Skor";
        // #gameOver -> #reset
        document.querySelector('#gameOver #reset').textContent = "Coba Lagi";

    } else {
        // EN
        body.classList.remove("id");

        // how -> span
        document.querySelector('.how h3').textContent = "How to Play?"
        // how -> p
        document.querySelector('.how p').innerHTML = "Use your <i><u>arrow keys</u></i> to move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach <b>2048</b>!"
        // #text-score
        document.querySelector('#text-score').textContent = "Score";
        // #gameOver -> #reset
        document.querySelector('#gameOver #reset').textContent = "Try Again";
    }
}

function onClickBtnHowTo() {
    dialogHowTo.showModal();
}

function closeHowToDialog() {
    dialogHowTo.close();
}

//Theme Switcher
var body = document.querySelector("body"), // Creates a variable called body, so we can reference it more easily below.
  goLight = function() { // Creates a function called goLight that adds the 'dark' class to the body
    body.className = "";
  },
  goDark = function() { // Creates a function called goDark that removes the 'dark' class from the body
    body.className = "";
    body.classList.add("dark");
  }

document.querySelector(".theme1").addEventListener("click", goLight, false); // Tells the first button to run the goLight function when clicked

document.querySelector(".theme2").addEventListener("click", goDark, false); // Tells the second button to run the goDark function when clicked

switchImmediately(); // Invoke the function
function updateTheme(theme) {
    const body = document.querySelector("body");
    if (theme === "light") {
      body.classList.remove("dark");
      document.querySelector(".button1.theme1").classList.remove("dark-theme-button");
    } else {
      body.classList.add("dark");
      document.querySelector(".button1.theme1").classList.add("dark-theme-button");
    }
  }
  
  document.querySelector(".theme1").addEventListener("click", () => {
    updateTheme("light");
  });
  
  document.querySelector(".theme2").addEventListener("click", () => {
    updateTheme("dark");
  });

