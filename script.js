
let keysPressed = new Set();

document.addEventListener("keydown", (e) => {
  keysPressed.add(e.key.toLowerCase());
});

document.addEventListener("keyup", (e) => {
  keysPressed.delete(e.key.toLowerCase());
});

function updateMovement() {
  dx = 0;
  dy = 0;
  if (keysPressed.has("arrowup") || keysPressed.has("w")) dy -= player.speed;
  if (keysPressed.has("arrowdown") || keysPressed.has("s")) dy += player.speed;
  if (keysPressed.has("arrowleft") || keysPressed.has("a")) dx -= player.speed;
  if (keysPressed.has("arrowright") || keysPressed.has("d")) dx += player.speed;
}



function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const lines = text.split('\n');
  for (let j = 0; j < lines.length; j++) {
    const words = lines[j].split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = context.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        context.fillText(line, x, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
    y += lineHeight;
  }
}



// === UPDATE HOUSE WITH ROOF AND DOOR ===
function drawHouse() {
  // Base
  ctx.fillStyle = "brown";
  ctx.fillRect(house.x, house.y, house.w, house.h);

  // Roof
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(house.x - 5, house.y);
  ctx.lineTo(house.x + house.w / 2, house.y - 15);
  ctx.lineTo(house.x + house.w + 5, house.y);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = "blue";
  ctx.fillRect(house.x + house.w / 3, house.y + house.h / 2, house.w / 3, house.h / 2);
}



const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// === GAME OBJECTS ===
const player = { x: 20, y: 20, w: 10, h: 10, speed: 1.5 };
const house = { x: 250, y: 50, w: 30, h: 30 };
const flower = { x: 240, y: 120, collected: false };
const daniela = { x: 250, y: 150 };
// Heart particle effects
const hearts = [];
let lastHeartTime = 0;
const HEART_SPAWN_INTERVAL = 500; // ms
let showMessage = '';
let showTypedMessage = '';
let messageIndex = 0;
let messageTimer = 0;
const messageDelay = 2;
let dx = 0, dy = 0;
let flowerPopup = document.getElementById("flower-popup");

// === SOUND ON TAP ===
document.getElementById("startScreen").addEventListener("click", function () {
  document.getElementById("startScreen").style.display = "none";
  const audio = document.getElementById("bg-music");
  if (audio && audio.play) audio.play().catch(() => {});
});
document.body.addEventListener("click", () => {
  const audio = document.getElementById("bg-music");
  if (audio && audio.paused) {
    audio.play().catch(() => {});
  }
});

// === CONTROLS ===
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") startMove("up");
  if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") startMove("down");
  if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") startMove("left");
  if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") startMove("right");
});
document.addEventListener("keyup", stopMove);

function startMove(dir) {
  if (dir === "up") { dx = 0; dy = -player.speed; }
  if (dir === "down") { dx = 0; dy = player.speed; }
  if (dir === "left") { dx = -player.speed; dy = 0; }
  if (dir === "right") { dx = player.speed; dy = 0; }
}
function stopMove() {
  dx = 0; dy = 0;
}

function spawnHearts(npc) {
  const count = 3 + Math.floor(Math.random() * 2); // 3 or 4
  for (let i = 0; i < count; i++) {
    hearts.push({
      x: npc.x + 4 + (Math.random() * 4 - 2),
      y: npc.y,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -0.3 - Math.random() * 0.2,
      life: 60,
    });
  }
}

function updateAndDrawHearts() {
  const now = Date.now();
  const near = Math.hypot(player.x - daniela.x, player.y - daniela.y) < 30;
  if (near && now - lastHeartTime > HEART_SPAWN_INTERVAL) {
    spawnHearts(daniela);
    lastHeartTime = now;
  }

  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.x += h.vx;
    h.y += h.vy;
    h.life--;
    if (h.life <= 0) {
      hearts.splice(i, 1);
      continue;
    }
    ctx.fillStyle = 'pink';
    ctx.fillRect(h.x, h.y, 2, 2);
  }
}

// === DRAW WORLD OBJECTS ===
function drawWorldExtras() {
  // Grass
  ctx.fillStyle = "#88c070";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Road vertical
  ctx.fillStyle = "#444";
  ctx.fillRect(140, 0, 20, 200);

  // Road horizontal
  ctx.fillRect(0, 140, 300, 20);

    drawHouse();

  // Flower
  if (!flower.collected) {
    ctx.fillStyle = "magenta";
    ctx.fillRect(flower.x, flower.y, 5, 5);
  }

  // Daniela
  ctx.fillStyle = "pink";
  ctx.fillRect(daniela.x, daniela.y, 10, 10);

  // Dialogue
  ctx.fillStyle = "white";
  ctx.font = "12px monospace";
  wrapText(ctx, showTypedMessage, daniela.x - 40, daniela.y - 10, 120, 14);
}

// === DIALOGUE LOGIC ===
function updateDialogue() {
  if (flower.collected) {
    showMessage = "Luke (blue) - I brought you a flower cutie!\nDaniela (pink) - OMG THANK YOU SO MUCH!!!!";
  } else {
    showMessage = "Daniela (pink) - Hi cutey!\nLuke (blue) - You're the cutey!!!";
  }
  messageIndex = 0;
  showTypedMessage = '';
  messageTimer = 0;
}

function updateMessageTyping() {
  if (messageIndex < showMessage.length) {
    if (messageTimer++ % messageDelay === 0) {
      showTypedMessage += showMessage[messageIndex++];
    }
  }
}

// === INTERACTION ===
function checkInteractions() {
  if (!flower.collected &&
      player.x < flower.x + 5 &&
      player.x + player.w > flower.x &&
      player.y < flower.y + 5 &&
      player.y + player.h > flower.y) {
    flower.collected = true;
    flowerPopup.style.opacity = 1;
    setTimeout(() => flowerPopup.style.opacity = 0, 2000);
    updateDialogue();
  }

  if (player.x < house.x + house.w &&
      player.x + player.w > house.x &&
      player.y < house.y + house.h &&
      player.y + player.h > house.y) {
    player.x -= dx;
    player.y -= dy;
  }
}

// === MAIN GAME LOOP ===
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWorldExtras();
  updateAndDrawHearts();
  updateMessageTyping();
  checkInteractions();

    updateMovement();
  // Update position
  player.x += dx;
  player.y += dy;
  // Clamp to canvas
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  // Draw player
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  requestAnimationFrame(gameLoop);
}

updateDialogue();
gameLoop();
