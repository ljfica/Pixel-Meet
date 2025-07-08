
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

// === DRAW HOUSE WITH ROOF, DOOR AND CHIMNEY ===
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

  ctx.fillStyle = "#555"; // chimney
  ctx.fillRect(chimney.x, chimney.y, chimney.w, chimney.h);

  ctx.fillStyle = "blue";
  ctx.fillRect(house.x + house.w / 3, house.y + house.h / 2, house.w / 3, house.h / 2);
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = { x: 20, y: 20, w: 10, h: 10, speed: 1.5 };
const house = { x: 260, y: 50, w: 30, h: 30 };
const chimney = { x: house.x + house.w - 6, y: house.y - 12, w: 4, h: 10 };
const door = {
  x: house.x + house.w / 3,
  y: house.y + house.h / 2,
  w: house.w / 3,
  h: house.h / 2,
};
const scene = { current: 'outdoor' };
const girlHomeImg = new Image();
girlHomeImg.src = 'assets/GIRL HOME.png';

const cats = [
  {
    x: 140,
    y: 120,
    vx: 0.5,
    vy: 0.5,
    w: 8,
    h: 8,
    color: 'orange',
    name: 'Kitty',
    dialogue: 'Kitty - MeROWWW'
  },
  {
    x: 160,
    y: 120,
    vx: -0.5,
    vy: 0.5,
    spotted: true,
    w: 8,
    h: 8,
    name: 'Cintas',
    dialogue: 'Cintas - ROWRR, meowr :P'
  },
];
const smokeParticles = [];
let lastSmokeTime = 0;
const SMOKE_SPAWN_INTERVAL = 200;
const fence = { x: house.x - 15, y: house.y - 15, w: house.w + 30, h: house.h + 30 };
const gate = {
  x: fence.x + fence.w / 2 - 8, // center with new width
  y: fence.y + fence.h - 2,
  w: 16,
  h: 2
};
let gateOpen = false;
let gateTimer = 0;
const GATE_OPEN_TIME = 60;
// Flower near the top left of the house, adjusted position
const flower = {
  // moved 8 squares left and 7 squares up from the
  // original location to be closer to the fence
  x: fence.x + 2 * player.w - 8,
  y: fence.y + player.h - 7,
  collected: false
};
// Daniela starts near the road but a bit away from the intersection
const daniela = { x: 180, y: 150, w: 10, h: 10, color: "#ff69b4" };
const hearts = [];
let lastHeartTime = 0;

const decorations = [];
function generateDecorations() {
  const verticalRoad = { x: 140, y: 0, w: 20, h: 200 };
  const horizontalRoad = { x: 0, y: 140, w: 300, h: 20 };
  const pathW = 6;
  const walkway = {
    x: house.x + house.w / 2 - pathW / 2,
    y: house.y + house.h,
    w: pathW,
    h: 140 - (house.y + house.h)
  };
  function collides(r, x, y, w, h) {
    return x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y;
  }
  function forbidden(x, y, w, h) {
    if (collides(verticalRoad, x, y, w, h)) return true;
    if (collides(horizontalRoad, x, y, w, h)) return true;
    if (collides(walkway, x, y, w, h)) return true;
    if (collides(fence, x, y, w, h)) return true;
    return false;
  }
  const types = ['tree', 'rock'];
  for (let i = 0; i < 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const size = type === 'tree' ? { w: 8, h: 12 } : { w: 6, h: 4 };
    let x, y, attempts = 0;
    do {
      x = Math.random() * (canvas.width - size.w);
      y = Math.random() * (canvas.height - size.h);
      attempts++;
    } while (forbidden(x, y, size.w, size.h) && attempts < 100);
    decorations.push({ type, x, y, w: size.w, h: size.h });
  }
}
generateDecorations();

const HEART_SPAWN_INTERVAL = 500;
let showMessage = '';
let showTypedMessage = '';
let messageIndex = 0;
let messageTimer = 0;
const messageDelay = 2;
let isTalking = false;
const talkDistance = 30;
let talkTarget = null;
let dx = 0, dy = 0;
let flowerPopup = document.getElementById("flower-popup");

function exitIndoor() {
  scene.current = 'outdoor';
  const doorAudio = document.getElementById('door-sound');
  if (doorAudio) {
    doorAudio.currentTime = 0;
    doorAudio.play().catch(() => {});
  }
  player.x = door.x + door.w / 2 - player.w / 2;
  player.y = door.y + door.h + 2;
  isTalking = false;
  talkTarget = null;
  showTypedMessage = '';
  showMessage = '';
}

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

function spawnSmoke() {
  smokeParticles.push({
    x: chimney.x + chimney.w / 2,
    y: chimney.y,
    vx: (Math.random() - 0.5) * 0.1,
    vy: -0.2 - Math.random() * 0.1,
    life: 60,
    alpha: 1,
  });
}

function updateAndDrawSmoke() {
  const now = Date.now();
  if (now - lastSmokeTime > SMOKE_SPAWN_INTERVAL) {
    spawnSmoke();
    lastSmokeTime = now;
  }
  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    const s = smokeParticles[i];
    s.x += s.vx;
    s.y += s.vy;
    s.life--;
    s.alpha -= 0.015;
    if (s.life <= 0 || s.alpha <= 0) {
      smokeParticles.splice(i, 1);
      continue;
    }
    ctx.fillStyle = `rgba(200,200,200,${s.alpha})`;
    ctx.fillRect(s.x, s.y, 2, 2);
  }
}

function drawFence() {
  ctx.fillStyle = "white";
  // top
  ctx.fillRect(fence.x, fence.y, fence.w, 2);
  // left and right
  ctx.fillRect(fence.x, fence.y, 2, fence.h);
  ctx.fillRect(fence.x + fence.w - 2, fence.y, 2, fence.h);
  // bottom left section
  ctx.fillRect(fence.x, fence.y + fence.h - 2, gate.x - fence.x, 2);
  // bottom right section
  ctx.fillRect(gate.x + gate.w, fence.y + fence.h - 2, fence.x + fence.w - (gate.x + gate.w), 2);
  // gate
  if (!gateOpen) {
    ctx.fillRect(gate.x, gate.y - 2, gate.w, 2);
  }
}

// === DRAW WORLD OBJECTS ===
function drawOutdoorWorld() {
  ctx.fillStyle = "#88c070";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#444";
  ctx.fillRect(140, 0, 20, 200);
  ctx.fillRect(0, 140, 300, 20);

  // dirt path from horizontal road down to the house
  const pathW = 6;
  const doorX = house.x + house.w / 2 - pathW / 2;
  const doorY = house.y + house.h;
  ctx.fillStyle = "#b5651d";
  ctx.fillRect(doorX, doorY, pathW, 140 - doorY); // 140 is top of horizontal road

  drawFence();

  for (const d of decorations) {
    if (d.type === 'tree') {
      ctx.fillStyle = '#228B22';
      ctx.fillRect(d.x, d.y, d.w, d.h - 2);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(d.x + d.w / 2 - 1, d.y + d.h - 2, 2, 2);
    } else {
      ctx.fillStyle = '#888';
      ctx.fillRect(d.x, d.y, d.w, d.h);
    }
  }

  drawHouse();

  updateAndDrawSmoke();

  if (!flower.collected) {
    ctx.fillStyle = "magenta";
    ctx.fillRect(flower.x, flower.y, 5, 5);
  }

  ctx.fillStyle = daniela.color;
  ctx.fillRect(daniela.x, daniela.y, daniela.w, daniela.h);
}

function drawCat(cat) {
  if (cat.spotted) {
    ctx.fillStyle = 'white';
    ctx.fillRect(cat.x, cat.y, cat.w, cat.h);
    ctx.fillStyle = 'black';
    ctx.fillRect(cat.x + 1, cat.y + 1, 2, 2);
    ctx.fillRect(cat.x + 4, cat.y + 3, 2, 2);
  } else {
    ctx.fillStyle = cat.color;
    ctx.fillRect(cat.x, cat.y, cat.w, cat.h);
  }
}

function updateCats() {
  for (const c of cats) {
    c.x += c.vx;
    c.y += c.vy;
    if (c.x < 0 || c.x > canvas.width - c.w) c.vx *= -1;
    if (c.y < 0 || c.y > canvas.height - c.h) c.vy *= -1;
    if (Math.random() < 0.02) {
      c.vx = (Math.random() - 0.5) * 1;
      c.vy = (Math.random() - 0.5) * 1;
    }
  }
}

function drawIndoorWorld() {
  ctx.drawImage(girlHomeImg, 0, 0, canvas.width, canvas.height);
  updateCats();
  for (const c of cats) drawCat(c);
}

function drawDialogueBubble() {
  if (!(isTalking && showTypedMessage && talkTarget)) return;
  ctx.font = "12px monospace";
  ctx.textBaseline = "top";
  const lineHeight = 14;
  const padding = 4;
  const lines = getWrappedLines(ctx, showTypedMessage, 150);
  let maxLineWidth = 0;
  for (const l of lines) {
    maxLineWidth = Math.max(maxLineWidth, ctx.measureText(l).width);
  }
  const boxWidth = maxLineWidth + padding * 2;
  const boxHeight = lineHeight * lines.length + padding * 2;
  const centerX = talkTarget.x + (talkTarget.w || 0) / 2;
  const textX = centerX - boxWidth / 2;
  const baseY = talkTarget.y - (talkTarget.h || 0);
  const textY = baseY - boxHeight - 4;
  ctx.fillStyle = "black";
  ctx.fillRect(textX, textY, boxWidth, boxHeight);
  ctx.fillStyle = "white";
  let y = textY + padding;
  for (const l of lines) {
    ctx.fillText(l, textX + padding, y);
    y += lineHeight;
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
  if (scene.current === 'indoor') {
    if (player.x <= 0 ||
        player.y <= 0 ||
        player.x + player.w >= canvas.width ||
        player.y + player.h >= canvas.height) {
      exitIndoor();
      return;
    }
  } else {
    if (player.x < door.x + door.w &&
        player.x + player.w > door.x &&
        player.y < door.y + door.h &&
        player.y + player.h > door.y) {
      const doorAudio = document.getElementById('door-sound');
      if (doorAudio) {
        doorAudio.currentTime = 0;
        doorAudio.play().catch(() => {});
      }
      scene.current = 'indoor';
      player.x = canvas.width / 2 - player.w / 2;
      player.y = canvas.height - 20;
      isTalking = false;
      talkTarget = null;
      showTypedMessage = '';
      return;
    }
    if (!flower.collected &&
        player.x < flower.x + 5 &&
        player.x + player.w > flower.x &&
        player.y < flower.y + 5 &&
        player.y + player.h > flower.y) {
      flower.collected = true;
      const pickup = document.getElementById("pickup-sound");
      if (pickup) {
        pickup.currentTime = 0;
        pickup.play().catch(() => {});
      }
      flowerPopup.style.opacity = 1;
      setTimeout(() => flowerPopup.style.opacity = 0, 2000);
      updateDialogue();
    }
  }

  let talked = false;
  if (scene.current === 'indoor') {
    for (const cat of cats) {
      const cd = Math.hypot(player.x - cat.x, player.y - cat.y);
      if (cd < talkDistance) {
        if (!isTalking || showMessage !== cat.dialogue) {
          showMessage = cat.dialogue;
          showTypedMessage = '';
          messageIndex = 0;
        }
        talkTarget = cat;
        isTalking = true;
        talked = true;
        break;
      }
    }
  }

  if (!talked && scene.current === 'outdoor') {
    const dist = Math.hypot(player.x - daniela.x, player.y - daniela.y);
    const danielaDialogue = flower.collected
      ? "Luke - I brought you a flower cutie!\nDaniela - OMG THANK YOU SO MUCH!!!!"
      : "Daniela - Hi cutey!\nLuke - You're the cutey!!!";
    if (dist < talkDistance) {
      if (!isTalking || showMessage !== danielaDialogue) {
        updateDialogue();
      }
      talkTarget = daniela;
      isTalking = true;
      talked = true;
    }
  }

  if (!talked) {
    if (isTalking) {
      showTypedMessage = '';
      messageIndex = 0;
    }
    isTalking = false;
    talkTarget = null;
  }

  if (scene.current === 'outdoor') {
    if (player.x < house.x + house.w &&
        player.x + player.w > house.x &&
        player.y < house.y + house.h &&
        player.y + player.h > house.y) {
      player.x -= dx;
      player.y -= dy;
    }

    if (gateTimer > 0) {
      gateTimer--;
      if (gateTimer === 0) gateOpen = false;
    }

    const gateRect = { x: gate.x, y: gate.y - gate.h, w: gate.w, h: gate.h };

    if (!gateOpen &&
        player.x < gateRect.x + gateRect.w &&
        player.x + player.w > gateRect.x &&
        player.y < gateRect.y + gateRect.h &&
        player.y + player.h > gateRect.y) {
      gateOpen = true;
      gateTimer = GATE_OPEN_TIME;
    }

    const fenceRects = [
      { x: fence.x, y: fence.y, w: fence.w, h: 2 },
      { x: fence.x, y: fence.y, w: 2, h: fence.h },
      { x: fence.x + fence.w - 2, y: fence.y, w: 2, h: fence.h },
      { x: fence.x, y: fence.y + fence.h - 2, w: gate.x - fence.x, h: 2 },
      { x: gate.x + gate.w, y: fence.y + fence.h - 2, w: fence.x + fence.w - (gate.x + gate.w), h: 2 },
    ];
    if (!gateOpen) {
      fenceRects.push(gateRect);
    }
    for (const r of fenceRects) {
      if (player.x < r.x + r.w &&
          player.x + player.w > r.x &&
          player.y < r.y + r.h &&
          player.y + player.h > r.y) {
        player.x -= dx;
        player.y -= dy;
      }
    }
  }
}

// === MAIN GAME LOOP ===
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (scene.current === 'outdoor') {
    drawOutdoorWorld();
    updateAndDrawHearts();
  } else {
    drawIndoorWorld();
  }

  updateMovement();
  player.x += dx;
  player.y += dy;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

  updateMessageTyping();
  checkInteractions();

  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  drawDialogueBubble();

  requestAnimationFrame(gameLoop);
}

updateDialogue();
gameLoop();
