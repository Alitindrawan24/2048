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
        if (isGameOver())
            document.getElementById("gameOver").style.display = "block";
    }
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            temp = document.getElementById(i + "" + j);
            if (arr[i][j] != 0)
                temp.innerHTML = arr[i][j];
            else
                temp.innerHTML = '';
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
        document.getElementById('score').innerHTML = "Score : " + score;
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
    arr = [];
    hasCombine = [];
    hasMove = true;
    score = 0;
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

    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('score').innerHTML = 'Score : ' + score;
    fill();
}