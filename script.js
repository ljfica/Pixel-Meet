
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
  const lines = getWrappedLines(context, text, maxWidth);
  for (const line of lines) {
    context.fillText(line, x, y);
    y += lineHeight;
  }
}

function getWrappedLines(context, text, maxWidth) {
  const wrapped = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let line = '';

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = context.measureText(testLine);

      if (metrics.width > maxWidth && line) {
        wrapped.push(line.trimEnd());
        line = word + ' ';
      } else {
        line = testLine;
      }
    }

    if (line) {
      wrapped.push(line.trimEnd());
    }
  }

  return wrapped;
}

// === DRAW HOUSE WITH ROOF AND DOOR ===
function drawHouse() {
  ctx.fillStyle = "brown";
  ctx.fillRect(house.x, house.y, house.w, house.h);

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(house.x - 5, house.y);
  ctx.lineTo(house.x + house.w / 2, house.y - 15);
  ctx.lineTo(house.x + house.w + 5, house.y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "blue";
  ctx.fillRect(house.x + house.w / 3, house.y + house.h / 2, house.w / 3, house.h / 2);
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = { x: 20, y: 20, w: 10, h: 10, speed: 1.5 };
const house = { x: 230, y: 50, w: 30, h: 30 };
const flower = { x: 220, y: 120, collected: false };
const daniela = { x: 230, y: 150 };
const hearts = [];
let lastHeartTime = 0;

const HEART_SPAWN_INTERVAL = 500;
let showMessage = '';
let showTypedMessage = '';
let messageIndex = 0;
let messageTimer = 0;
const messageDelay = 2;
let isTalking = false;
const talkDistance = 30;
let dx = 0, dy = 0;
let flowerPopup = document.getElementById("flower-popup");

// === SOUND ON TAP ===
document.getElementById("startScreen").addEventListener("click", () => {
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

// === TOUCH/ON-SCREEN CONTROLS ===
function startMove(dir) {
  if (dir === "up") keysPressed.add("arrowup");
  if (dir === "down") keysPressed.add("arrowdown");
  if (dir === "left") keysPressed.add("arrowleft");
  if (dir === "right") keysPressed.add("arrowright");
}
function stopMove(dir) {
  if (dir === "up") keysPressed.delete("arrowup");
  if (dir === "down") keysPressed.delete("arrowdown");
  if (dir === "left") keysPressed.delete("arrowleft");
  if (dir === "right") keysPressed.delete("arrowright");
  if (!dir) keysPressed.clear();
}

function spawnHearts(npc) {
  const count = 3 + Math.floor(Math.random() * 2);
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
  ctx.fillStyle = "#88c070";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#444";
  ctx.fillRect(140, 0, 20, 200);
  ctx.fillRect(0, 140, 300, 20);

  drawHouse();

  if (!flower.collected) {
    ctx.fillStyle = "magenta";
    ctx.fillRect(flower.x, flower.y, 5, 5);
  }

  ctx.fillStyle = "pink";
  ctx.fillRect(daniela.x, daniela.y, 10, 10);

  if (isTalking && showTypedMessage) {
    ctx.font = "12px monospace";
    ctx.textBaseline = "top";
    const lineHeight = 14;
    const padding = 4;
    const lines = getWrappedLines(ctx, showTypedMessage, 120);
    let maxLineWidth = 0;
    for (const l of lines) {
      maxLineWidth = Math.max(maxLineWidth, ctx.measureText(l).width);
    }
    const boxWidth = maxLineWidth + padding * 2;
    const boxHeight = lineHeight * lines.length + padding * 2;
    const textX = daniela.x - boxWidth / 2;
    const textY = daniela.y - boxHeight - 10;
    ctx.fillStyle = "black";
    ctx.fillRect(textX, textY, boxWidth, boxHeight);
    ctx.fillStyle = "white";
    let y = textY + padding;
    for (const l of lines) {
      ctx.fillText(l, textX + padding, y);
      y += lineHeight;
    }
  }
}

// === DIALOGUE LOGIC ===
function updateDialogue() {
  if (flower.collected) {
    showMessage = "Luke - I brought you a flower cutie!\nDaniela - OMG THANK YOU SO MUCH!!!!";
  } else {
    showMessage = "Daniela - Hi cutey!\nLuke - You're the cutey!!!";
  }
  messageIndex = 0;
  showTypedMessage = '';
  messageTimer = 0;
}

function updateMessageTyping() {
  if (!isTalking) return;
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

  const dist = Math.hypot(player.x - daniela.x, player.y - daniela.y);
  if (dist < talkDistance) {
    if (!isTalking) updateDialogue();
    isTalking = true;
  } else {
    if (isTalking) {
      showTypedMessage = '';
      messageIndex = 0;
    }
    isTalking = false;
  }

  // Collision with house
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

  player.x += dx;
  player.y += dy;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  requestAnimationFrame(gameLoop);
}

updateDialogue();
gameLoop();
