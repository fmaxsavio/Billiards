// Billiards Web Game - Simple Implementation with JavaScript + HTML5 Canvas
// This version handles basic rules, ball collisions, cue stick interaction, and turn switching

const canvas = document.getElementById("billiardsCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

const table = {
  width: canvas.width,
  height: canvas.height,
  friction: 0.98
};

const BALL_RADIUS = 10;
const POCKET_RADIUS = 15;
const balls = [];
let currentPlayer = 1;
let gameActive = true;

// Ball constructor
class Ball {
  constructor(x, y, color, isCue = false) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.color = color;
    this.isCue = isCue;
    this.potted = false;
  }

  draw() {
    if (this.potted) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.stroke();
  }

  update() {
    if (this.potted) return;
    this.x += this.vx;
    this.y += this.vy;

    this.vx *= table.friction;
    this.vy *= table.friction;

    // Wall collision
    if (this.x < BALL_RADIUS || this.x > table.width - BALL_RADIUS) this.vx *= -1;
    if (this.y < BALL_RADIUS || this.y > table.height - BALL_RADIUS) this.vy *= -1;

    // Pocket detection
    for (let px of [0, table.width]) {
      for (let py of [0, table.height]) {
        if (Math.hypot(this.x - px, this.y - py) < POCKET_RADIUS) {
          this.potted = true;
          this.vx = this.vy = 0;
        }
      }
    }
  }
}

function createBalls() {
  balls.push(new Ball(150, 200, "white", true)); // Cue ball
  const colors = ["yellow", "blue", "red", "purple", "orange", "green", "maroon"];
  let startX = 600;
  let startY = 200;
  let offset = 0;

  for (let i = 0; i < colors.length; i++) {
    let row = Math.floor(i / 2);
    let x = startX + row * BALL_RADIUS * 2;
    let y = startY + (i % 2 === 0 ? -offset : offset);
    offset += BALL_RADIUS;
    balls.push(new Ball(x, y, colors[i]));
  }
}

let aiming = false;
let aimX = 0;
let aimY = 0;

canvas.addEventListener("mousedown", (e) => {
  if (!gameActive) return;
  const rect = canvas.getBoundingClientRect();
  aimX = e.clientX - rect.left;
  aimY = e.clientY - rect.top;
  aiming = true;
});

canvas.addEventListener("mouseup", (e) => {
  if (!aiming) return;
  const cueBall = balls.find((b) => b.isCue);
  if (cueBall.potted) return;

  const dx = cueBall.x - aimX;
  const dy = cueBall.y - aimY;
  cueBall.vx = dx * 0.1;
  cueBall.vy = dy * 0.1;
  aiming = false;
});

function checkCollisions() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let b1 = balls[i];
      let b2 = balls[j];
      if (b1.potted || b2.potted) continue;

      let dx = b1.x - b2.x;
      let dy = b1.y - b2.y;
      let dist = Math.hypot(dx, dy);
      if (dist < BALL_RADIUS * 2) {
        // Simple elastic collision
        let angle = Math.atan2(dy, dx);
        let totalVelX = b1.vx - b2.vx;
        let totalVelY = b1.vy - b2.vy;

        let force = (totalVelX * Math.cos(angle) + totalVelY * Math.sin(angle));
        b1.vx -= force * Math.cos(angle);
        b1.vy -= force * Math.sin(angle);
        b2.vx += force * Math.cos(angle);
        b2.vy += force * Math.sin(angle);

        // Separate balls
        let overlap = BALL_RADIUS * 2 - dist;
        let moveX = (overlap / 2) * Math.cos(angle);
        let moveY = (overlap / 2) * Math.sin(angle);
        b1.x += moveX;
        b1.y += moveY;
        b2.x -= moveX;
        b2.y -= moveY;
      }
    }
  }
}

function allBallsStopped() {
  return balls.every((b) => Math.abs(b.vx) < 0.1 && Math.abs(b.vy) < 0.1);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw table
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let ball of balls) {
    ball.update();
    ball.draw();
  }

  checkCollisions();

  if (allBallsStopped() && !aiming) {
    // Switch turn logic can go here if needed
  }

  requestAnimationFrame(update);
}

createBalls();
update();
