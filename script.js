const canvas = document.getElementById('billiardsCanvas');
const ctx = canvas.getContext('2d');

// Canvas and Table properties
canvas.width = 800;
canvas.height = 400;

const table = {
    width: canvas.width,
    height: canvas.height,
    holeRadius: 15,
    holes: [
        {x: 0, y: 0},
        {x: table.width / 2, y: 0},
        {x: table.width, y: 0},
        {x: 0, y: table.height},
        {x: table.width / 2, y: table.height},
        {x: table.width, y: table.height},
    ]
};

// Ball and Cue properties
const cueBall = {x: 400, y: 200, radius: 10, color: 'white', vx: 0, vy: 0};
const balls = [
    {x: 300, y: 200, radius: 10, color: 'red', vx: 0, vy: 0},
    {x: 500, y: 200, radius: 10, color: 'yellow', vx: 0, vy: 0},
];

const friction = 0.98;  // Ball friction for rolling

// Cue stick properties
let stickPower = 0;
let aiming = false;
let powerIncrease = false;
let cueAngle = 0;

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    cueAngle = Math.atan2(mouseY - cueBall.y, mouseX - cueBall.x);
});

canvas.addEventListener('mousedown', () => {
    aiming = true;
    powerIncrease = true;
});

canvas.addEventListener('mouseup', () => {
    if (aiming) {
        cueBall.vx = Math.cos(cueAngle) * stickPower;
        cueBall.vy = Math.sin(cueAngle) * stickPower;
        stickPower = 0;
        powerIncrease = false;
        aiming = false;
    }
});

function update() {
    // Update stick power
    if (powerIncrease && stickPower < 25) {
        stickPower += 0.5;  // Increase stick power gradually
    }

    // Update ball positions
    cueBall.x += cueBall.vx;
    cueBall.y += cueBall.vy;
    cueBall.vx *= friction;
    cueBall.vy *= friction;

    // Detect collisions with walls
    if (cueBall.x < cueBall.radius || cueBall.x > canvas.width - cueBall.radius) cueBall.vx = -cueBall.vx;
    if (cueBall.y < cueBall.radius || cueBall.y > canvas.height - cueBall.radius) cueBall.vy = -cueBall.vy;

    // Detect if cueBall falls into a hole
    table.holes.forEach(hole => {
        const dist = Math.hypot(cueBall.x - hole.x, cueBall.y - hole.y);
        if (dist < table.holeRadius) {
            cueBall.x = 400;
            cueBall.y = 200;
            cueBall.vx = 0;
            cueBall.vy = 0;  // Reset ball if it falls into a hole
        }
    });

    // Update other balls similarly
    balls.forEach(ball => {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= friction;
        ball.vy *= friction;

        // Collision detection with walls
        if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) ball.vx = -ball.vx;
        if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) ball.vy = -ball.vy;

        // Ball falling into holes
        table.holes.forEach(hole => {
            const dist = Math.hypot(ball.x - hole.x, ball.y - hole.y);
            if (dist < table.holeRadius) {
                ball.x = -100;  // Ball is "pocketed"
                ball.y = -100;
                ball.vx = 0;
                ball.vy = 0;
            }
        });
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw table holes
    ctx.fillStyle = 'black';
    table.holes.forEach(hole => {
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, table.holeRadius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw cue ball
    ctx.fillStyle = cueBall.color;
    ctx.beginPath();
    ctx.arc(cueBall.x, cueBall.y, cueBall.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw other balls
    balls.forEach(ball => {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw cue stick
    if (aiming) {
        ctx.strokeStyle = 'brown';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        ctx.lineTo(cueBall.x - Math.cos(cueAngle) * (stickPower * 5 + 30), cueBall.y - Math.sin(cueAngle) * (stickPower * 5 + 30));
        ctx.stroke();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
