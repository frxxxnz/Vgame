const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const startMessage = document.getElementById('start-message');

let gameRunning = false;
let score = 0;
const winningScore = 20;
let playerX = 50;
const playerSpeed = 8;
const bgSpeed = 4;           
let bgPosition = 0;          

let objectSpeed = 4;
let objectSpawnTimer;
let gameLoopId;

const badItemsList = ['pocion', 'libro', 'bola', 'arana'];
const keys = { ArrowRight: false, ArrowLeft: false };

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (!gameRunning) startGame();
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function gameLoop() {
    if (!gameRunning) return;
    updatePlayerAndBackground(); 
    updateObjects();
    gameLoopId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    score = 0;
    objectSpeed = 4;
    scoreElement.innerText = "Puntos: 0";
    startMessage.style.display = 'none';
    
    document.querySelectorAll('.item').forEach(item => item.remove());
    
    playerX = 50;
    bgPosition = 0;
    player.style.left = playerX + "px";
    gameContainer.style.backgroundPositionX = bgPosition + "px";

    player.classList.remove("dead"); 
    player.classList.remove("run");
    player.classList.add("idle"); 
    player.style.backgroundPositionY = "";
    
    gameLoop();
    objectSpawnTimer = setInterval(createFallingObject, 1200);
}

function gameOver() {
    gameRunning = false;
    clearInterval(objectSpawnTimer);
    cancelAnimationFrame(gameLoopId);

    player.classList.remove("run");
    player.classList.remove("idle");
    player.style.backgroundPositionY = "";
    player.classList.add("dead");
    startMessage.innerHTML = `<p style="color: #ff4444; font-size: 40px;">¡GOLPE!</p>Puntos: ${score}<br><p style="margin-top:30px; color: #d4af37; animation: blink 1s infinite;">Presiona para jugar</p>`;    
    startMessage.style.display = 'block';
}

function gameWin() {
    gameRunning = false;
    clearInterval(objectSpawnTimer);
    cancelAnimationFrame(gameLoopId);

    player.classList.remove("run");
    player.classList.add("idle");
    player.style.backgroundPositionY = "0px"; 

    startMessage.innerHTML = `
        <p style="color: #ffd700; font-size: 50px; text-shadow: 0 0 10px #d4af37;">¡VICTORIA!</p>
        <p>¡Llegaste a Hogwarts a tiempo!</p>
        <br>
        <p style="font-size: 20px;">Puntos: ${score}</p>
        <p style="margin-top:30px; color: white; animation: blink 1s infinite;">Presiona para jugar otra vez</p>
    `;
    startMessage.style.display = 'flex'; 
}

function updatePlayerAndBackground() {
    let isMoving = false;
    
    if (keys.ArrowRight) {
        if (playerX < 736) playerX += playerSpeed;
        bgPosition -= bgSpeed;
        isMoving = true;
        player.style.transform = "scaleX(1)"; 
    }
    
    if (keys.ArrowLeft) {
        if (playerX > 0) playerX -= playerSpeed;
        bgPosition += bgSpeed;
        isMoving = true;
        player.style.transform = "scaleX(-1)"; 
    }

    player.style.left = playerX + "px";
    gameContainer.style.backgroundPositionX = bgPosition + "px";

    if (isMoving) {
        if (!player.classList.contains("run")) {
            player.classList.remove("idle");
            player.classList.add("run");
            player.style.backgroundPositionY = ""; 
        }
    } else {
        if (!player.classList.contains("idle")) {
            player.classList.remove("run");
            player.classList.add("idle");
            player.style.backgroundPositionY = "0px";
        }
    }
}

function createFallingObject() {
    const item = document.createElement('div');
    item.classList.add('item');
    item.style.left = Math.floor(Math.random() * 752) + "px";
    item.style.top = "-50px";
    
    if (Math.random() > 0.5) {
        item.classList.add('hedwig');
        item.dataset.type = 'good';
    } else {
        const randomBad = badItemsList[Math.floor(Math.random() * badItemsList.length)];
        item.classList.add(randomBad);
        item.dataset.type = 'bad';
    }
    gameContainer.appendChild(item);
}

function updateObjects() {
    document.querySelectorAll('.item').forEach(item => {
        const currentTop = parseFloat(item.style.top);
        item.style.top = (currentTop + objectSpeed) + "px";
        
        if (checkCollision(player, item)) {
            if (item.dataset.type === 'good') {
                score += 10;
                scoreElement.innerText = "Puntos: " + score;
                item.remove();
                
                if (score >= winningScore) {
                    gameWin();
                }

                if(score % 50 === 0) objectSpeed += 0.5;

            } else {
                gameOver();
            }
        }
        if (currentTop > 400) item.remove();
    });
}

function checkCollision(rect1, rect2) {
    const r1 = rect1.getBoundingClientRect();
    const r2 = rect2.getBoundingClientRect();
    const padding = 15; 
    return !(
        r1.top + padding > r2.bottom - padding ||
        r1.bottom - padding < r2.top + padding ||
        r1.right - padding < r2.left + padding ||
        r1.left + padding > r2.right - padding
    );
}