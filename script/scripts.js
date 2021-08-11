var snakeArray = [];
var collectedPoints = [];
var playground;
var interval = null;
var direction = "";
var snakeDirection = "up";
var activePoint = null;
var speed = 250;
var isDirectionApplied = true;

function run() {
    playground = document.getElementById("playground");
    document.getElementsByTagName("body")[0].addEventListener("keydown", changeDirection);
    document.getElementById("reset").addEventListener("click", restartGame);
    initSnake();
}

function changeDirection(event) {
    if (isDirectionApplied) {
        if (event.key === "ArrowDown" && direction !== "up" && direction !== "" && snakeDirection !== "up")
            direction = "down";
        else if (event.key === "ArrowUp" && direction !== "down" && snakeDirection !== "down")
            direction = "up";
        else if (event.key === "ArrowLeft" && direction !== "right" && snakeDirection !== "right")
            direction = "left";
        else if (event.key === "ArrowRight" && direction !== "left" && snakeDirection !== "left")
            direction = "right";
        if (interval === null && direction !== "") {
            interval = window.setInterval(move, speed);
            document.getElementById("message").style.display = "none";
        }
        isDirectionApplied = false;
    }
}

function speedUp() {
    window.clearInterval(interval);
    speed -= 10;
    interval = window.setInterval(move, speed);
}

function move() {
    isDirectionApplied = true;
    var cordObj = snakeArray[0];
    var head = document.getElementById(cordObj.id);
    var lastX = cordObj.x;
    var lastY = cordObj.y;
    var rotation = "";
    if (direction === "down") {
        cordObj.y += 1;
        rotation = "180deg";
    } else if (direction === "up") {
        cordObj.y -= 1;
        rotation = "0deg";
    } else if (direction === "left") {
        cordObj.x -= 1;
        rotation = "270deg";
    } else if (direction === "right") {
        cordObj.x += 1;
        rotation = "90deg";
    }
    snakeDirection = direction;
    if (checkWalls(cordObj))
        return;
    head.style.gridColumnStart = cordObj.x;
    head.style.gridRowStart = cordObj.y;
    head.style.transform = "rotate(" + rotation + ")";
    for (var i = 1; i < snakeArray.length; i++) {
        var currentPart = document.getElementById(snakeArray[i].id);
        currentPart.style.gridColumnStart = lastX;
        currentPart.style.gridRowStart = lastY;
        lastX = snakeArray[i].x;
        lastY = snakeArray[i].y;
        snakeArray[i].x = parseInt(currentPart.style.gridColumnStart);
        snakeArray[i].y = parseInt(currentPart.style.gridRowStart);
    }
    if (checkBody(cordObj))
        return;
    var potentialNewTail = getTail(lastX, lastY);
    if (potentialNewTail) {
        collectedPoints = collectedPoints.filter(point => point.id === potentialNewTail.id);
        snakeArray.push(potentialNewTail);
        generateTail(potentialNewTail);
    }
    checkPoint(cordObj);
    if (activePoint === null)
        generatePoint();
}

function initSnake() {
    for (var i = 0; i < 5; i++) {
        var newTail = { id: "part" + (i + 1), x: 17, y: 17 + i };
        generateTail(newTail);
        snakeArray.push(newTail);
    }
    var message = document.createElement("div");
    message.id = "message";
    message.innerHTML = "Use arrows to play a game!";
    message.style.display = "block";
    playground.appendChild(message);
    var maxScore = parseInt(localStorage.getItem("djole-snake-max"));
    document.getElementById("score-value-max").innerHTML = maxScore ? maxScore : 0;
}

function generateTail(obj) {
    var newTail = document.createElement("div");
    newTail.classList.add("snake-part");
    newTail.id = obj.id;
    newTail.style.gridColumnStart = obj.x;
    newTail.style.gridRowStart = obj.y;
    if (obj.id === "part1") {
        newTail.classList.add("snake-head");
        newTail.classList.remove("snake-part");
    }
    playground.appendChild(newTail);
}

function getTail(x, y) {
    for (var collectedPoint of collectedPoints) {
        if (collectedPoint.x === x && collectedPoint.y === y)
            return collectedPoint;
    }
    return null;
}

function checkPoint(headObj) {
    if (activePoint)
        if (activePoint.x === headObj.x && activePoint.y === headObj.y) {
            collectedPoints.push({ id: "part" + (snakeArray.length + 1 + collectedPoints.length), x: activePoint.x, y: activePoint.y });
            document.getElementById(activePoint.id).remove();
            scoreUp();
            activePoint = null;
            if (speed > 50)
                speedUp();
        }
}

function scoreUp() {
    var currentScore = parseInt(document.getElementById("score-value").innerHTML);
    currentScore += Math.round(250 / speed);
    document.getElementById("score-value").innerHTML = currentScore;
}

function checkWalls(headObj) {
    if (headObj.x === 0 || headObj.x === 31 || headObj.y === 0 || headObj.y === 31) {
        endGame();
        return true;
    }
    return false;
}

function checkBody(headObj) {
    for (var i = 3; i < snakeArray.length; i++) {
        if (headObj.x === snakeArray[i].x && headObj.y === snakeArray[i].y) {
            endGame();
            return true;
        }
    }
    return false;
}

function endGame() {
    window.clearInterval(interval);
    document.getElementById("message").innerHTML = "Game over!";
    document.getElementById("message").style.display = "block";
    var maxScore = parseInt(localStorage.getItem("djole-snake-max"));
    var currentScore = parseInt(document.getElementById("score-value").innerHTML);
    if (maxScore) {
        if (currentScore > maxScore)
            localStorage.setItem("djole-snake-max", currentScore);
    } else {
        localStorage.setItem("djole-snake-max", document.getElementById("score-value").innerHTML);
    }
}

function generatePoint() {
    activePoint = randomPoint();
    var newPoint = document.createElement("div");
    newPoint.classList.add("point");
    newPoint.id = activePoint.id;
    newPoint.style.gridColumnStart = activePoint.x;
    newPoint.style.gridRowStart = activePoint.y;
    playground.appendChild(newPoint);
}

function randomPoint() {
    var x = randomInt();
    var y = randomInt();
    for (var item in snakeArray) {
        if (item.x === x && item.y === y)
            return randomPoint();
    }
    return { id: "point", x: x, y: y };
}

function randomInt() {
    return Math.floor(Math.random() * 30) + 1;
}

function restartGame() {
    window.clearInterval(interval);
    document.getElementById("score-value").innerHTML = 0;
    snakeArray = [];
    collectedPoints = [];
    interval = null;
    direction = "up";
    activePoint = null;
    speed = 250;
    playground.innerHTML = "";
    isDirectionApplied = true;
    initSnake();
}