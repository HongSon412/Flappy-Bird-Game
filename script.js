// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const bestScoreElement = document.getElementById('bestScore');

// Game state
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let score = 0;
let bestScore = localStorage.getItem('flappyBirdBest') || 0;

// Bird object
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    velocity: 0,
    gravity: 0.5,
    jumpPower: -8,
    color: '#FFD700'
};

// Pipes array
let pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 2;

// Game functions
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    scoreElement.textContent = score;
}

function jump() {
    if (gameState === 'start') {
        gameState = 'playing';
        startScreen.classList.add('hidden');
        resetGame();
    } else if (gameState === 'playing') {
        bird.velocity = bird.jumpPower;
    } else if (gameState === 'gameOver') {
        gameState = 'start';
        gameOverScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        resetGame();
    }
}

function updateBird() {
    if (gameState !== 'playing') return;
    
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Check boundaries
    if (bird.y < 0 || bird.y + bird.height > canvas.height) {
        gameOver();
    }
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        bottomHeight: canvas.height - (topHeight + pipeGap),
        passed: false
    });
}

function updatePipes() {
    if (gameState !== 'playing') return;
    
    // Create new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        createPipe();
    }
    
    // Update pipe positions
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;
        
        // Check for scoring
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
            scoreElement.textContent = score;
        }
        
        // Remove pipes that are off screen
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
        
        // Check collision
        if (checkCollision(pipes[i])) {
            gameOver();
        }
    }
}

function checkCollision(pipe) {
    // Check if bird hits the pipe
    if (bird.x < pipe.x + pipeWidth && 
        bird.x + bird.width > pipe.x) {
        if (bird.y < pipe.topHeight || 
            bird.y + bird.height > pipe.bottomY) {
            return true;
        }
    }
    return false;
}

function gameOver() {
    gameState = 'gameOver';
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBirdBest', bestScore);
    }
    
    finalScoreElement.textContent = score;
    bestScoreElement.textContent = bestScore;
    gameOverScreen.classList.remove('hidden');
}

function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Draw simple bird details
    ctx.fillStyle = '#FF6347';
    ctx.fillRect(bird.x + bird.width, bird.y + bird.height/3, 5, 3); // beak
    
    ctx.fillStyle = '#000';
    ctx.fillRect(bird.x + 5, bird.y + 5, 3, 3); // eye
}

function drawPipes() {
    ctx.fillStyle = '#228B22';
    
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight);
        
        // Pipe caps
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipeWidth + 10, 20);
        ctx.fillStyle = '#228B22';
    });
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#98FB98');
    gradient.addColorStop(1, '#90EE90');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simple clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(100, 100, 30, 0, Math.PI * 2);
    ctx.arc(120, 90, 25, 0, Math.PI * 2);
    ctx.arc(140, 100, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(300, 150, 25, 0, Math.PI * 2);
    ctx.arc(315, 140, 20, 0, Math.PI * 2);
    ctx.arc(330, 150, 25, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update and draw game objects
    updateBird();
    updatePipes();
    
    drawPipes();
    drawBird();
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', jump);

// Initialize game
bestScoreElement.textContent = bestScore;
gameLoop();
