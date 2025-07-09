
(function () {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const startScreenEl = document.getElementById('startScreen');
  const bgMusic = document.getElementById('bg-music');
  const forestMusic = document.getElementById('forest-music');
  const pickupSound = document.getElementById('pickup-sound');
  const doorSound = document.getElementById('door-sound');
  const flowerPopup = document.getElementById('flower-popup');

  const kittySprites = {};
  const KITTY_ACTIONS = ['idle', 'walk_left', 'walk_right', 'walk_back'];
  const KITTY_FRAME_COUNT = 4;
  const KITTY_FRAME_DURATION = 200; // ms

  (function loadKittySprites() {
    const folder = 'assets/ORANGE CAT ANIMATIONS';
    for (const action of KITTY_ACTIONS) {
      kittySprites[action] = [];
      for (let i = 1; i <= KITTY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `${folder}/cat_${action}_frame_${num}.png`;
        kittySprites[action].push(img);
      }
    }
  })();

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
let girlHomeLoaded = false;
girlHomeImg.addEventListener('load', () => {
  girlHomeLoaded = true;
});
girlHomeImg.src = 'assets/GIRL HOME.png';

const cats = [
  {
    x: 140,
    y: 120,
    vx: 0,
    vy: 0,
    w: 16,
    h: 16,
    name: 'Kitty',
    dialogue: 'Kitty - MeROWWW',
    sprites: kittySprites,
    action: 'idle',
    frame: 0,
    lastFrameTime: Date.now(),
    aiTimer: 0
  },
  {
    x: 160,
    y: 120,
    vx: 0,
    vy: 0,
    spotted: true,
    w: 8,
    h: 8,
    name: 'Cintas',
    dialogue: 'Cintas - ROWRR, meowr :P',
    aiTimer: 0
  },
];
const smokeParticles = [];
const randomNames = ['Alex','Sam','Jamie','Taylor','Jordan','Casey','Morgan','Riley','Drew','Quinn'];
function getRandomName() {
  return randomNames[Math.floor(Math.random()*randomNames.length)];
}
const townNPCs = [];
const farmNPCs = [];
const campNPCs = [];
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

const helloKittyBushImg = new Image();
let helloKittyBushLoaded = false;
helloKittyBushImg.addEventListener('load', () => {
  helloKittyBushLoaded = true;
});
helloKittyBushImg.src = 'assets/HELLO KITTY BUSH.png';
const helloKittyBush = {
  x: gate.x + gate.w + 4,
  y: gate.y - 14,
  w: 14,
  h: 14
};
// Flower near the top left of the house, adjusted position
const flower = {
  // moved 8 squares left and 7 squares up from the
  // original location to be closer to the fence
  x: fence.x - 5 * player.w - 8,
  y: fence.y + player.h - 7,
  collected: false
};
// Daniela starts near the road but a bit away from the intersection
const daniela = { x: 180, y: 150, w: 10, h: 10, color: "#ff69b4" };
// Hunter NPC in bottom left quadrant between the roads
const hunter = {
  x: 60,
  y: 170,
  w: 10,
  h: 10,
  color: "#77553a",
  dialogue: "Hunter - Best stay 'way from my deer boy."
};
let hunterFollowStart = null;
let hunterFollowActive = false;
let hunterFollowEnd = 0;
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

const deer = { x: 100, y: 60, w: 8, h: 8, vx: 0.3, vy: 0.3, color: '#a0522d' };

const CAR_SPEED = 20; // pixels per second
const CAR_INTERVAL = 30000; // ms
const car = {
  x: 140 + 10 - 6,
  y: canvas.height,
  w: 12,
  h: 16, // doubled length
  direction: -1,
  active: true
};
let lastCarMove = Date.now();
let lastCarSpawn = Date.now();

// === DECOR FOR ADDITIONAL MAPS ===
const forestTrees = [];
const townBuildings = [];
const farmPlots = [];
const campItems = { fire: { x: canvas.width / 2 - 4, y: canvas.height / 2 - 4 } };

const farmHouse = { x: 20, y: 130, w: 30, h: 25 };
const rockingChair = { x: farmHouse.x - 8, y: farmHouse.y + farmHouse.h - 10, w: 6, h: 10 };
const cows = [];
const campTents = [];
const campSmokeParticles = [];
const campFireParticles = [];

function generateTownNPCs() {
  const sayings = [
    'Lovely weather for a stroll!',
    'Have you tried the bakery rolls?',
    "Don't step on the cracks!"
  ];
  for (let i = 0; i < 3; i++) {
    const name = getRandomName();
    townNPCs.push({
      x: 40 + Math.random() * 220,
      y: 40 + Math.random() * 120,
      w: 10,
      h: 10,
      name,
      dialogue: `${name} - ${sayings[Math.floor(Math.random()*sayings.length)]}`
    });
  }
}

function generateFarmNPCs() {
  const name = getRandomName();
  farmNPCs.push({
    x: farmHouse.x + farmHouse.w + 10,
    y: farmHouse.y + 5,
    w: 10,
    h: 10,
    name,
    dialogue: `${name} - Well howdy! Them plants sure do grow purty!`
  });
  for (let i = 0; i < 3; i++) {
    cows.push({
      x: 60 + i * 20,
      y: 50 + Math.random() * 30,
      w: 12,
      h: 8,
      vx: 0,
      vy: 0
    });
  }
}

function generateCampNPCs() {
  const sayings = [
    'I love roasting marshmallows!',
    'The stars are amazing!',
    'Nature is the best playground!'
  ];
  for (let i = 0; i < 2; i++) {
    const name = getRandomName();
    campNPCs.push({
      x: 80 + i * 40,
      y: 130,
      w: 10,
      h: 10,
      name,
      dialogue: `${name} - ${sayings[Math.floor(Math.random()*sayings.length)]}`
    });
    campTents.push({ x: 70 + i * 40, y: 120, w: 20, h: 15 });
  }
}

function generateForestTrees() {
  for (let i = 0; i < 12; i++) {
    forestTrees.push({
      x: Math.random() * (canvas.width - 8),
      y: Math.random() * (canvas.height - 30)
    });
  }
}

function generateTownBuildings() {
  const types = ['home', 'store'];
  for (let i = 0; i < 6; i++) {
    const w = 20;
    const h = 20;
    townBuildings.push({
      x: 30 + Math.random() * (canvas.width - w - 30),
      y: Math.random() * (canvas.height - h),
      w,
      h,
      type: types[Math.floor(Math.random()*types.length)]
    });
  }
}

function generateFarmPlots() {
  for (let i = 0; i < 4; i++) {
    farmPlots.push({
      x: 30 + i * 40,
      y: 40,
      w: 30,
      h: 80
    });
  }
}

generateForestTrees();
generateTownBuildings();
generateFarmPlots();
generateTownNPCs();
generateFarmNPCs();
generateCampNPCs();

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
// timer for luke forgetting flowers message
// timers for Luke forgetting the flower
let forgotFlowersStart = null;
let forgotFlowersActive = false;
let forgotFlowersEnd = 0;
let danielaTalkAfterFlowersCount = 0;

function exitIndoor() {
  scene.current = 'outdoor';
  if (doorSound) {
    doorSound.currentTime = 0;
    doorSound.play().catch(() => {});
  }
  player.x = door.x + door.w / 2 - player.w / 2;
  player.y = door.y + door.h + 2;
  isTalking = false;
  talkTarget = null;
  showTypedMessage = '';
  showMessage = '';
}

// === SOUND ON TAP ===
startScreenEl.addEventListener('click', () => {
  startScreenEl.style.display = 'none';
  if (bgMusic && bgMusic.play) bgMusic.play().catch(() => {});
  if (forestMusic && forestMusic.play) {
    forestMusic.play().then(() => {
      forestMusic.pause();
      forestMusic.currentTime = 0;
    }).catch(() => {});
  }
});
document.body.addEventListener('click', () => {
  if (bgMusic && bgMusic.paused) {
    bgMusic.play().catch(() => {});
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
  const talking = isTalking && talkTarget === daniela;
  if ((near || talking) && now - lastHeartTime > HEART_SPAWN_INTERVAL) {
    spawnHearts(daniela);
    if (talking) spawnHearts(player);
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
    ctx.fillStyle = 'red';
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

function spawnCampSmoke() {
  campSmokeParticles.push({
    x: campItems.fire.x + 4,
    y: campItems.fire.y,
    vx: (Math.random() - 0.5) * 0.1,
    vy: -0.2 - Math.random() * 0.1,
    life: 50,
    alpha: 1
  });
}

let lastCampSmoke = 0;
function updateAndDrawCampSmoke() {
  const now = Date.now();
  if (now - lastCampSmoke > 200) {
    spawnCampSmoke();
    lastCampSmoke = now;
  }
  for (let i = campSmokeParticles.length - 1; i >= 0; i--) {
    const s = campSmokeParticles[i];
    s.x += s.vx;
    s.y += s.vy;
    s.life--;
    s.alpha -= 0.02;
    if (s.life <= 0 || s.alpha <= 0) {
      campSmokeParticles.splice(i, 1);
      continue;
    }
    ctx.fillStyle = `rgba(200,200,200,${s.alpha})`;
    ctx.fillRect(s.x, s.y, 2, 2);
  }
}

function spawnCampFireParticle() {
  campFireParticles.push({
    x: campItems.fire.x + 4,
    y: campItems.fire.y + 4,
    vx: (Math.random() - 0.5) * 0.1,
    vy: -0.3 - Math.random() * 0.2,
    life: 30,
    alpha: 1,
    color: Math.random() > 0.5 ? 'orange' : 'yellow'
  });
}

let lastCampFire = 0;
function updateAndDrawCampFire() {
  const now = Date.now();
  if (now - lastCampFire > 100) {
    spawnCampFireParticle();
    lastCampFire = now;
  }
  for (let i = campFireParticles.length - 1; i >= 0; i--) {
    const p = campFireParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    p.alpha -= 0.03;
    if (p.life <= 0 || p.alpha <= 0) {
      campFireParticles.splice(i, 1);
      continue;
    }
    ctx.fillStyle = `rgba(${p.color === 'orange' ? '255,140,0' : '255,255,0'},${p.alpha})`;
    ctx.fillRect(p.x, p.y, 2, 2);
  }
}

function updateDeer() {
  const dist = Math.hypot(player.x - deer.x, player.y - deer.y);
  if (dist < talkDistance) {
    const angle = Math.atan2(deer.y - player.y, deer.x - player.x);
    const speed = 1.2;
    deer.vx = Math.cos(angle) * speed;
    deer.vy = Math.sin(angle) * speed;
  } else if (Math.random() < 0.01) {
    deer.vx = (Math.random() - 0.5) * 0.6;
    deer.vy = (Math.random() - 0.5) * 0.6;
  }
  deer.x += deer.vx;
  deer.y += deer.vy;
  // keep deer within top-left quadrant inside the roads
  const maxX = 140 - deer.w;
  const maxY = 140 - deer.h;
  if (deer.x < 0) { deer.x = 0; deer.vx *= -1; }
  if (deer.x > maxX) { deer.x = maxX; deer.vx *= -1; }
  if (deer.y < 0) { deer.y = 0; deer.vy *= -1; }
  if (deer.y > maxY) { deer.y = maxY; deer.vy *= -1; }
}

function updateCar() {
  const now = Date.now();
  if (car.active) {
    const dt = (now - lastCarMove) / 1000;
    lastCarMove = now;
    car.y += car.direction * CAR_SPEED * dt;
    if ((car.direction === -1 && car.y + car.h < 0) ||
        (car.direction === 1 && car.y > canvas.height)) {
      car.active = false;
      lastCarSpawn = now;
    }
  } else if (now - lastCarSpawn >= CAR_INTERVAL) {
    car.direction *= -1;
    car.y = car.direction === -1 ? canvas.height : -car.h;
    lastCarMove = now;
    car.active = true;
  }
}

function updateCows() {
  for (const c of cows) {
    if (!c.aiTimer || --c.aiTimer <= 0) {
      c.vx = (Math.random() - 0.5) * 0.3;
      c.vy = (Math.random() - 0.5) * 0.3;
      c.aiTimer = 60 + Math.random() * 60;
    }

    const dist = Math.hypot(player.x - c.x, player.y - c.y);
    if (dist < talkDistance) {
      const angle = Math.atan2(c.y - player.y, c.x - player.x);
      const speed = 0.4;
      c.vx = Math.cos(angle) * speed;
      c.vy = Math.sin(angle) * speed;
    }

    c.x += c.vx;
    c.y += c.vy;

    const minX = 30;
    const maxX = 180 - c.w;
    const minY = 40;
    const maxY = 120 - c.h;
    if (c.x < minX) { c.x = minX; c.vx *= -1; }
    if (c.x > maxX) { c.x = maxX; c.vx *= -1; }
    if (c.y < minY) { c.y = minY; c.vy *= -1; }
    if (c.y > maxY) { c.y = maxY; c.vy *= -1; }
  }
}

function drawCar() {
  if (!car.active) return;
  ctx.fillStyle = 'red';
  ctx.fillRect(car.x, car.y, car.w, car.h);
  ctx.fillStyle = '#a0e0ff';
  ctx.fillRect(car.x + 2, car.y + 2, car.w - 4, 3);
  ctx.fillRect(car.x + 2, car.y + car.h - 5, car.w - 4, 3);
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
  if (helloKittyBushLoaded) {
    ctx.drawImage(helloKittyBushImg, helloKittyBush.x, helloKittyBush.y, helloKittyBush.w, helloKittyBush.h);
  }

  updateCar();
  drawCar();

  updateDeer();
  ctx.fillStyle = deer.color;
  ctx.fillRect(deer.x, deer.y, deer.w, deer.h);

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

  ctx.fillStyle = hunter.color;
  ctx.fillRect(hunter.x, hunter.y, hunter.w, hunter.h);

  ctx.fillStyle = daniela.color;
  ctx.fillRect(daniela.x, daniela.y, daniela.w, daniela.h);
}

function drawForestWorld() {
  ctx.fillStyle = '#116611';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#444';
  ctx.fillRect(140, canvas.height - 20, 20, 20);
  ctx.fillStyle = '#228B22';
  for (const t of forestTrees) {
    ctx.fillRect(t.x, t.y, 8, 10);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(t.x + 3, t.y + 10, 2, 4);
    ctx.fillStyle = '#228B22';
  }
}

function drawTownWorld() {
  ctx.fillStyle = '#777';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#555';
  ctx.fillRect(0, 140, canvas.width, 20);
  ctx.fillRect(140, 0, 20, canvas.height);
  for (const b of townBuildings) {
    ctx.fillStyle = b.type === 'home' ? '#8b0000' : '#4444aa';
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }
  ctx.fillStyle = '#b5651d';
  ctx.fillRect(60, 140, 180, 6);
  for (const n of townNPCs) {
    ctx.fillStyle = '#ffeeaa';
    ctx.fillRect(n.x, n.y, n.w, n.h);
  }
}

function drawFarmWorld() {
  if (cows.length === 0) {
    for (let i = 0; i < 3; i++) {
      cows.push({
        x: 60 + i * 20,
        y: 40 + Math.random() * 40,
        w: 8,
        h: 8,
        vx: 0,
        vy: 0,
      });
    }
  }
  updateCows();
  ctx.fillStyle = '#c2b280';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#444';
  ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);

  ctx.fillStyle = '#8b4513';
  ctx.fillRect(farmHouse.x, farmHouse.y, farmHouse.w, farmHouse.h);
  ctx.fillStyle = '#b5651d';
  ctx.fillRect(rockingChair.x, rockingChair.y, rockingChair.w, rockingChair.h);

  ctx.fillStyle = '#a0522d';
  for (const p of farmPlots) {
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = 'white';
    ctx.fillRect(p.x, p.y - 2, p.w, 2);
    ctx.fillRect(p.x, p.y + p.h, p.w, 2);
    ctx.fillRect(p.x - 2, p.y, 2, p.h);
    ctx.fillRect(p.x + p.w, p.y, 2, p.h);
    ctx.fillStyle = '#a0522d';
  }

  drawCows();

  for (const n of farmNPCs) {
    ctx.fillStyle = '#ffeeaa';
    ctx.fillRect(n.x, n.y, n.w, n.h);
  }
}
function drawCows() {
  for (const c of cows) {
    ctx.fillStyle = "white";
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = "black";
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = "black";
    ctx.fillRect(c.x + 2, c.y + 2, 2, 2);
  }
}


function drawCampWorld() {
  ctx.fillStyle = '#355e3b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#444';
  ctx.fillRect(140, 0, 20, 20);

  for (const t of campTents) {
    ctx.fillStyle = '#aa0000';
    ctx.beginPath();
    ctx.moveTo(t.x, t.y);
    ctx.lineTo(t.x + t.w / 2, t.y - t.h);
    ctx.lineTo(t.x + t.w, t.y);
    ctx.closePath();
    ctx.fill();
  }

  const f = campItems.fire;
  ctx.fillStyle = '#663300';
  ctx.fillRect(f.x - 2, f.y + 6, 12, 3);
  updateAndDrawCampFire();
  updateAndDrawCampSmoke();

  for (const n of campNPCs) {
    ctx.fillStyle = '#ffeeaa';
    ctx.fillRect(n.x, n.y, n.w, n.h);
  }
}

function drawCat(cat) {
  if (cat.sprites) {
    const frames = cat.sprites[cat.action] || cat.sprites.idle;
    const frameImg = frames[Math.floor(cat.frame) % frames.length];
    if (frameImg && frameImg.complete) {
      ctx.drawImage(frameImg, cat.x, cat.y, cat.w, cat.h);
    }
  } else if (cat.spotted) {
    ctx.fillStyle = 'white';
    ctx.fillRect(cat.x, cat.y, cat.w, cat.h);
    ctx.fillStyle = 'black';
    ctx.fillRect(cat.x + 1, cat.y + 1, 2, 2);
    ctx.fillRect(cat.x + 4, cat.y + 3, 2, 2);
  } else if (scene.current === 'outdoor') {
    ctx.fillStyle = cat.color;
    ctx.fillRect(cat.x, cat.y, cat.w, cat.h);
  }
}

function updateCats() {
  for (const c of cats) {
    if (!c.aiTimer || --c.aiTimer <= 0) {
      if (Math.random() < 0.3) {
        c.vx = 0;
        c.vy = 0;
        c.aiTimer = 30 + Math.random() * 60;
      } else {
        const speed = 0.3;
        if (Math.random() < 0.7) {
          c.vx = (Math.random() < 0.5 ? -1 : 1) * speed;
          c.vy = 0;
        } else {
          c.vx = 0;
          c.vy = (Math.random() < 0.5 ? -1 : 1) * speed;
        }
        c.aiTimer = 60 + Math.random() * 120;
      }
    }

    c.x += c.vx;
    c.y += c.vy;
    if (c.x < 0) { c.x = 0; c.vx *= -1; }
    if (c.x > canvas.width - c.w) { c.x = canvas.width - c.w; c.vx *= -1; }
    if (c.y < 0) { c.y = 0; c.vy *= -1; }
    if (c.y > canvas.height - c.h) { c.y = canvas.height - c.h; c.vy *= -1; }

    if (c.sprites) {
      const now = Date.now();
      const absVx = Math.abs(c.vx);
      const absVy = Math.abs(c.vy);
      if (absVx < 0.05 && absVy < 0.05) {
        c.action = 'idle';
      } else if (absVx >= absVy) {
        c.action = c.vx < 0 ? 'walk_left' : 'walk_right';
      } else {
        c.action = 'walk_back';
      }
      if (now - c.lastFrameTime > KITTY_FRAME_DURATION) {
        c.frame = (c.frame + 1) % c.sprites[c.action].length;
        c.lastFrameTime = now;
      }
    }

  }
}

function drawIndoorWorld() {
  if (girlHomeLoaded) {
    ctx.drawImage(girlHomeImg, 0, 0, canvas.width, canvas.height);
  }
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

function drawForgotFlowersBubble() {
  if (!forgotFlowersActive) return;
  const message = 'Luke - I FORGOT THE FLOWERS!!';
  ctx.font = '12px monospace';
  ctx.textBaseline = 'top';
  const lineHeight = 14;
  const padding = 4;
  const lines = getWrappedLines(ctx, message, 150);
  let maxLineWidth = 0;
  for (const l of lines) {
    maxLineWidth = Math.max(maxLineWidth, ctx.measureText(l).width);
  }
  const boxWidth = maxLineWidth + padding * 2;
  const boxHeight = lineHeight * lines.length + padding * 2;
  const centerX = player.x + player.w / 2;
  const textX = centerX - boxWidth / 2;
  const baseY = player.y;
  const textY = baseY - boxHeight - 4;
  ctx.fillStyle = 'black';
  ctx.fillRect(textX, textY, boxWidth, boxHeight);
  ctx.fillStyle = 'white';
  let y = textY + padding;
  for (const l of lines) {
    ctx.fillText(l, textX + padding, y);
    y += lineHeight;
  }
}

function drawHunterFollowupBubble() {
  if (!hunterFollowActive || scene.current !== 'outdoor') return;
  const message = "Hunter - That's what I thought hehe.";
  ctx.font = '12px monospace';
  ctx.textBaseline = 'top';
  const lineHeight = 14;
  const padding = 4;
  const lines = getWrappedLines(ctx, message, 150);
  let maxLineWidth = 0;
  for (const l of lines) {
    maxLineWidth = Math.max(maxLineWidth, ctx.measureText(l).width);
  }
  const boxWidth = maxLineWidth + padding * 2;
  const boxHeight = lineHeight * lines.length + padding * 2;
  const centerX = hunter.x + hunter.w / 2;
  const textX = centerX - boxWidth / 2;
  const baseY = hunter.y;
  const textY = baseY - boxHeight - 4;
  ctx.fillStyle = 'black';
  ctx.fillRect(textX, textY, boxWidth, boxHeight);
  ctx.fillStyle = 'white';
  let y = textY + padding;
  for (const l of lines) {
    ctx.fillText(l, textX + padding, y);
    y += lineHeight;
  }
}

// === DIALOGUE LOGIC ===
function updateDialogue() {
  if (flower.collected) {
    if (danielaTalkAfterFlowersCount > 2) {
      showMessage = "Daniela - EEEkkKEEkkkeeee GET AWAY YOU FAT CREEP! Jus kiddin gimmie a kiss ;)";
    } else {
      showMessage = "Luke - I brought you a flower cutie!\nDaniela - OMG THANK YOU SO MUCH!!!!";
    }
  } else if (scene.current === 'outdoor') {
    showMessage = "Daniela - Hi cutey!\nLuke - You're the cutey!!!";
  }
  messageIndex = 0;
  showTypedMessage = "";
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
  } else if (scene.current === 'outdoor') {
    if (player.x < door.x + door.w &&
        player.x + player.w > door.x &&
        player.y < door.y + door.h &&
        player.y + player.h > door.y) {
      if (doorSound) {
        doorSound.currentTime = 0;
        doorSound.play().catch(() => {});
      }
      scene.current = 'indoor';
      hunterFollowStart = null;
      hunterFollowActive = false;
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
      forgotFlowersStart = null;
      forgotFlowersActive = false;
      if (pickupSound) {
        danielaTalkAfterFlowersCount = 0;
        pickupSound.currentTime = 0;
        pickupSound.play().catch(() => {});
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
    const hd = Math.hypot(player.x - hunter.x, player.y - hunter.y);
    if (hd < talkDistance) {
      if (!isTalking || showMessage !== hunter.dialogue) {
        showMessage = hunter.dialogue;
        showTypedMessage = '';
        messageIndex = 0;
      }
      talkTarget = hunter;
      isTalking = true;
      talked = true;
      hunterFollowStart = null;
    }
  }

  if (!talked && scene.current === 'outdoor') {
    const dist = Math.hypot(player.x - daniela.x, player.y - daniela.y);
    const danielaDialogue = flower.collected
      ? "Luke - I brought you a flower cutie!\nDaniela - OMG THANK YOU SO MUCH!!!!"
      : "Daniela - Hi cutey!\nLuke - You're the cutey!!!";
    if (dist < talkDistance) {
      if (!isTalking) {
        if (flower.collected) {
          danielaTalkAfterFlowersCount++;
        }
        updateDialogue();
      }
      talkTarget = daniela;
      isTalking = true;
      talked = true;
    }
    }

  if (!talked && scene.current === 'town') {
    for (const n of townNPCs) {
      const nd = Math.hypot(player.x - n.x, player.y - n.y);
      if (nd < talkDistance) {
        if (!isTalking || showMessage !== n.dialogue) {
          showMessage = n.dialogue;
          showTypedMessage = '';
          messageIndex = 0;
        }
        talkTarget = n;
        isTalking = true;
        talked = true;
        break;
      }
    }
  }

  if (!talked && scene.current === 'farm') {
    for (const n of farmNPCs) {
      const nd = Math.hypot(player.x - n.x, player.y - n.y);
      if (nd < talkDistance) {
        if (!isTalking || showMessage !== n.dialogue) {
          showMessage = n.dialogue;
          showTypedMessage = '';
          messageIndex = 0;
        }
        talkTarget = n;
        isTalking = true;
        talked = true;
        break;
      }
    }
  }

  if (!talked && scene.current === 'camp') {
    for (const n of campNPCs) {
      const nd = Math.hypot(player.x - n.x, player.y - n.y);
      if (nd < talkDistance) {
        if (!isTalking || showMessage !== n.dialogue) {
          showMessage = n.dialogue;
          showTypedMessage = '';
          messageIndex = 0;
        }
        talkTarget = n;
        isTalking = true;
        talked = true;
        break;
      }
    }
  }
  if (!talked) {
    if (isTalking) {
      if (talkTarget === hunter) {
        hunterFollowStart = Date.now();
      } else if (talkTarget === daniela && !flower.collected) {
        forgotFlowersStart = Date.now();
      }
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

    if (car.active &&
        player.x < car.x + car.w &&
        player.x + player.w > car.x &&
        player.y < car.y + car.h &&
        player.y + player.h > car.y) {
      player.x -= dx;
      player.y -= dy;
    }

    const inVertRoad = player.x + player.w > 140 && player.x < 160;
    const inHorzRoad = player.y + player.h > 140 && player.y < 160;
    if (player.y <= 0 && inVertRoad) {
      scene.current = 'forest';
      hunterFollowStart = null;
      hunterFollowActive = false;
      player.y = canvas.height - player.h - 1;
      if (bgMusic) bgMusic.pause();
      if (forestMusic) {
        forestMusic.currentTime = 0;
        forestMusic.play().catch(() => {});
      }
      isTalking = false;
      talkTarget = null;
      showTypedMessage = '';
      return;
    }
    if (player.y + player.h >= canvas.height && inVertRoad) {
      scene.current = 'camp';
      hunterFollowStart = null;
      hunterFollowActive = false;
      player.y = 1;
      isTalking = false;
      talkTarget = null;
      showTypedMessage = '';
      return;
    }
    if (player.x <= 0 && inHorzRoad) {
      scene.current = 'farm';
      hunterFollowStart = null;
      hunterFollowActive = false;
      player.x = canvas.width - player.w - 1;
      isTalking = false;
      talkTarget = null;
      showTypedMessage = '';
      return;
    }
    if (player.x + player.w >= canvas.width && inHorzRoad) {
      scene.current = 'town';
      hunterFollowStart = null;
      hunterFollowActive = false;
      player.x = 1;
      isTalking = false;
      talkTarget = null;
      showTypedMessage = '';
      return;
    }
  }
    else if (scene.current === 'forest') {
      const inVertRoad = player.x + player.w > 140 && player.x < 160;
      if (player.y + player.h >= canvas.height && inVertRoad) {
        scene.current = 'outdoor';
        player.y = 1;
        if (forestMusic) forestMusic.pause();
        if (bgMusic && bgMusic.paused) bgMusic.play().catch(() => {});
        isTalking = false;
        talkTarget = null;
        showTypedMessage = '';
        return;
      }
    } else if (scene.current === 'camp') {
    const inVertRoad = player.x + player.w > 140 && player.x < 160;
    if (player.y <= 0 && inVertRoad) {
      scene.current = 'outdoor';
      player.y = canvas.height - player.h - 1;
      isTalking = false;
      talkTarget = null;
      showTypedMessage = '';
      return;
    }
  } else if (scene.current === 'farm') {
    const inHorzRoad = player.y + player.h > 140 && player.y < 160;
    if (player.x + player.w >= canvas.width && inHorzRoad) {
      scene.current = 'outdoor';
      player.x = 1;
      isTalking = false;
      talkTarget = null;
      showTypedMessage = '';
      return;
    }
  } else if (scene.current === 'town') {
    const inHorzRoad = player.y + player.h > 140 && player.y < 160;
    if (player.x <= 0 && inHorzRoad) {
      scene.current = 'outdoor';
      player.x = canvas.width - player.w - 1;
      isTalking = false;
      talkTarget = null;
      showTypedMessage = '';
      return;
    }
  }
}

// === MAIN GAME LOOP ===
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (scene.current === 'outdoor') {
    drawOutdoorWorld();
    updateAndDrawHearts();
  } else if (scene.current === 'forest') {
    drawForestWorld();
  } else if (scene.current === 'town') {
    drawTownWorld();
  } else if (scene.current === 'farm') {
    drawFarmWorld();
  } else if (scene.current === 'camp') {
    drawCampWorld();
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

  const now = Date.now();
  if (forgotFlowersStart && now - forgotFlowersStart >= 2000) {
    forgotFlowersActive = true;
    forgotFlowersEnd = now + 2000;
    forgotFlowersStart = null;
  }
  if (forgotFlowersActive && now >= forgotFlowersEnd) {
    forgotFlowersActive = false;
  }

  if (hunterFollowStart && now - hunterFollowStart >= 2000) {
    hunterFollowActive = true;
    hunterFollowEnd = now + 2000;
    hunterFollowStart = null;
  }
  if (hunterFollowActive && now >= hunterFollowEnd) {
    hunterFollowActive = false;
  }

  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  drawDialogueBubble();
  drawForgotFlowersBubble();
  drawHunterFollowupBubble();

  requestAnimationFrame(gameLoop);
}

updateDialogue();
gameLoop();

  window.startMove = startMove;
  window.stopMove = stopMove;
})();
