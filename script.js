let road;
let context;
let scoreEl;
let gameOverEl;
let replayBtn;

const roadHeight = 550;
const roadWidth = 260;
const laneCount = 4;
const laneWidth = roadWidth / laneCount;

let lanes = [];
let currentLane = 1;
let score = 0;
let gameOver = false;
let lastTime = 0;
let obstacleSpawnTimer = 0;

const man = {
    x: 0,
    y: 0,
    width: 50,
    height: 72,
    targetX: 0,
    baseY: 0
};

let obstacles = [];
const crashSound = new Audio("./fahhhhhhhhhhhhhh.mp3");

const obstacleAssets = {
    rock: {
        image: new Image(),
        width: 38,
        height: 52,
        speedRange: [4.5, 7]
    },
    bush: {
        image: new Image(),
        width: 44,
        height: 40,
        speedRange: [4.2, 6.8]
    },
    barrier: {
        image: new Image(),
        width: 48,
        height: 58,
        speedRange: [4, 6.5]
    }
};

const manImg = new Image();
obstacleAssets.rock.image.src = "./rock-svgrepo-com (2).svg";
obstacleAssets.bush.image.src = "./bush-svgrepo-com.svg";
obstacleAssets.barrier.image.src = "./barrier-obstacle-svgrepo-com (2).svg";
manImg.src = "./runner-svgrepo-com (1).svg";

window.onload = function () {
    road = document.getElementById("road");
    context = road.getContext("2d");
    scoreEl = document.getElementById("score");
    gameOverEl = document.getElementById("gameOver");
    replayBtn = document.getElementById("replayBtn");

    road.width = roadWidth;
    road.height = roadHeight;

    replayBtn.addEventListener("click", resetGame);

    resetGame();
    requestAnimationFrame(update);
};

function resetGame() {
    lanes = [
        laneWidth / 2,
        laneWidth + laneWidth / 2,
        laneWidth * 2 + laneWidth / 2,
        laneWidth * 3 + laneWidth / 2
    ];

    currentLane = 1;
    score = 0;
    gameOver = false;
    obstacles = [];
    obstacleSpawnTimer = 0;
    lastTime = 0;

    man.width = 50;
    man.height = 72;
    man.baseY = roadHeight - man.height;
    man.x = lanes[currentLane] - man.width / 2;
    man.y = man.baseY;
    man.targetX = man.x;

    scoreEl.textContent = "Score: 0";
    gameOverEl.style.display = "none";
    replayBtn.style.display = "none";
}

function drawLanes() {
    context.strokeStyle = "rgba(255,255,255,0.9)";
    context.lineWidth = 4;
    context.setLineDash([20, 20]);
    context.beginPath();

    for (let i = 1; i < laneCount; i++) {
        const x = laneWidth * i;
        context.moveTo(x, 0);
        context.lineTo(x, roadHeight);
    }

    context.stroke();
    context.setLineDash([]);
}

function createObstacle() {
    const lane = Math.floor(Math.random() * laneCount);
    const obstacleTypes = Object.keys(obstacleAssets);
    const typeKey = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const config = obstacleAssets[typeKey];
    const width = config.width;
    const height = config.height;
    const [minSpeed, maxSpeed] = config.speedRange;

    obstacles.push({
        x: lanes[lane] - width / 2,
        y: -height,
        width,
        height,
        speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
        lane,
        image: config.image,
        type: typeKey
    });
}

function drawObstacles() {
    for (const obstacle of obstacles) {
        context.drawImage(
            obstacle.image,
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );
    }
}

function moveRunnerToLane() {
    man.targetX = lanes[currentLane] - man.width / 2;
    man.x += (man.targetX - man.x) * 0.2;
}

function moveRunner() {
    man.y = man.baseY;
}

function moveObstacles() {
    for (const obstacle of obstacles) {
        obstacle.y += obstacle.speed;
    }

    obstacles = obstacles.filter((obstacle) => obstacle.y < roadHeight + 80);
}

function drawRunner() {
    if (manImg.complete) {
        context.drawImage(
            manImg,
            man.x,
            man.y,
            man.width,
            man.height
        );
    }
}

function playCrashSound() {
    crashSound.currentTime = 0;
    crashSound.volume = 0.8;
    crashSound.play().catch(() => {
        // Ignore autoplay restrictions until the user interacts with the page.
    });
}

function checkCollision() {
    for (const obstacle of obstacles) {
        const collides =
            man.x < obstacle.x + obstacle.width &&
            man.x + man.width > obstacle.x &&
            man.y < obstacle.y + obstacle.height &&
            man.y + man.height > obstacle.y;

        if (collides) {
            playCrashSound();
            gameOver = true;
            gameOverEl.style.display = "block";
            gameOverEl.textContent = "Game Over! Press Enter or Replay";
            replayBtn.style.display = "block";
            return;
        }
    }
}

function updateScore() {
    score += 1;
    scoreEl.textContent = "Score: " + score;
}

function update(timestamp) {
    if (!gameOver) {
        const delta = timestamp - lastTime;
        lastTime = timestamp;

        obstacleSpawnTimer += delta;

        if (obstacleSpawnTimer > 1100) {
            createObstacle();
            obstacleSpawnTimer = 0;
        }

        moveRunnerToLane();
        moveRunner();
        moveObstacles();
        checkCollision();

        if (Math.floor(timestamp / 120) > Math.floor((timestamp - delta) / 120)) {
            updateScore();
        }
    }

    context.clearRect(0, 0, roadWidth, roadHeight);
    drawLanes();
    drawObstacles();
    drawRunner();

    requestAnimationFrame(update);
}

document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (gameOver) {
        if (key === "Enter") {
            resetGame();
        }
        return;
    }

    if (key === "ArrowLeft" || key === "a" || key === "A") {
        currentLane = Math.max(0, currentLane - 1);
    }

    if (key === "ArrowRight" || key === "d" || key === "D") {
        currentLane = Math.min(laneCount - 1, currentLane + 1);
    }

});