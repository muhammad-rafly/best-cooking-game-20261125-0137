// Warung Rush — all canvas drawing. One job: turn the state into a
// readable kitchen. Every zone has a fixed rectangle, shared with input.js
// through LAYOUT so clicks land where the art says they do.

import { INGREDIENTS, STATIONS, dishById, ingredientById } from './recipes.js';
import { activeOrder, formatTime, plateReady, remainingSteps } from './state.js';

export const W = 1280;
export const H = 800;

export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 24, y: 80, w: 340, h: 480 },
  stations: {
    wok: { x: 388, y: 80, w: 200, h: 120 },
    grill: { x: 604, y: 80, w: 200, h: 120 },
    pot: { x: 820, y: 80, w: 200, h: 120 },
    chop: { x: 1036, y: 80, w: 220, h: 120 },
  },
  plate: { x: 388, y: 224, w: 416, h: 200 },
  tray: { x: 820, y: 224, w: 200, h: 200 },
  serve: { x: 1036, y: 224, w: 220, h: 200 },
  bins: { x: 24, y: 584, w: 1232, h: 140 },
  message: { x: 24, y: 736, w: 1232, h: 44 },
  startBtn: { x: 490, y: 560, w: 300, h: 72 },
  againBtn: { x: 490, y: 600, w: 300, h: 72 },
};

const INK = '#212529';
const CREAM = '#fff8e7';
const WOOD = '#8d5a2b';
const WOOD_DARK = '#6f4520';
const RED = '#c92a2a';
const GREEN = '#2b8a3e';
const GOLD = '#fab005';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = weight + ' ' + size + 'px system-ui, sans-serif';
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

// Small vector icons for each ingredient, drawn from shapes only.
export function drawIngredientIcon(ctx, id, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, s * 0.06);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  if (id === 'nasi') {
    ctx.fillStyle = '#fff3bf';
    ctx.beginPath();
    ctx.arc(0, s * 0.08, s * 0.42, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e9c46a';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(i * s * 0.14, -s * 0.12, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'mie') {
    ctx.strokeStyle = '#f08c00';
    ctx.lineWidth = s * 0.09;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.36, -s * 0.18 + i * s * 0.2);
      ctx.bezierCurveTo(-s * 0.1, -s * 0.3 + i * s * 0.2, s * 0.1, -s * 0.06 + i * s * 0.2, s * 0.36, -s * 0.18 + i * s * 0.2);
      ctx.stroke();
    }
  } else if (id === 'ayam') {
    ctx.fillStyle = '#d9480f';
    ctx.beginPath();
    ctx.arc(-s * 0.05, s * 0.05, s * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.moveTo(s * 0.22, -s * 0.12);
    ctx.lineTo(s * 0.42, -s * 0.34);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s * 0.44, -s * 0.36, s * 0.08, 0, Math.PI * 2);
    ctx.arc(s * 0.34, -s * 0.44, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.42, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fab005';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#2b8a3e';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(-s * 0.24 + i * s * 0.24, -s * 0.05, s * 0.14, s * 0.3, (i - 1) * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'bumbu') {
    ctx.fillStyle = '#fa5252';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.4);
    ctx.bezierCurveTo(s * 0.3, -s * 0.05, s * 0.26, s * 0.3, 0, s * 0.36);
    ctx.bezierCurveTo(-s * 0.26, s * 0.3, -s * 0.3, -s * 0.05, 0, -s * 0.4);
    ctx.fill();
    ctx.stroke();
  } else if (id === 'kecap') {
    ctx.fillStyle = '#5c3d2e';
    roundRect(ctx, -s * 0.2, -s * 0.3, s * 0.4, s * 0.66, s * 0.08);
    ctx.fill();
    ctx.fillStyle = '#e03131';
    ctx.fillRect(-s * 0.2, -s * 0.05, s * 0.4, s * 0.2);
  } else if (id === 'kuah') {
    ctx.fillStyle = '#1971c2';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.4, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffa94d';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.02, s * 0.34, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDishIcon(ctx, dishId, cx, cy, s) {
  const dish = dishById(dishId);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.12, s * 0.48, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = dish.color;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.06, s * 0.36, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHearts(ctx, hearts, x, y) {
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < hearts ? '#e03131' : '#dee2e6';
    const hx = x + i * 30;
    ctx.beginPath();
    ctx.moveTo(hx + 11, y + 18);
    ctx.bezierCurveTo(hx, y + 6, hx - 2, y - 2, hx + 11, y + 4);
    ctx.bezierCurveTo(hx + 24, y - 2, hx + 22, y + 6, hx + 11, y + 18);
    ctx.fill();
  }
}

function drawHUD(ctx, state) {
  const { hud } = LAYOUT;
  ctx.fillStyle = '#212529';
  ctx.fillRect(hud.x, hud.y, hud.w, hud.h);
  text(ctx, 'WARUNG RUSH', 24, 42, 30, '#ffd43b');
  text(ctx, 'DAPUR KILAT', 282, 42, 16, '#fff');
  const t = formatTime(state.timeLeft);
  const urgent = state.timeLeft <= 30 && state.phase === 'playing';
  ctx.fillStyle = urgent ? '#ff6b6b' : '#fff';
  roundRect(ctx, 560, 10, 160, 44, 8);
  ctx.fill();
  text(ctx, '⏱ ' + t, 640, 42, 28, urgent ? '#c92a2a' : '#212529', 'bold', 'center');
  text(ctx, 'SKOR ' + state.score, 780, 42, 22, '#fff');
  text(ctx, 'Rp ' + state.coins, 950, 42, 22, '#ffd43b');
  drawHearts(ctx, state.hearts, 1100, 22);
  text(ctx, 'SHIFT ' + (state.phase === 'done' ? 'SELESAI' : 'BERJALAN'), 1120, 56, 12, '#adb5bd', 'bold', 'left');
}

function drawOrderBoard(ctx, state) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#fff';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = RED;
  roundRect(ctx, b.x, b.y, b.w, 44, 12);
  ctx.fill();
  ctx.fillRect(b.x, b.y + 32, b.w, 12);
  text(ctx, 'PAPAN PESANAN', b.x + 16, b.y + 30, 20, '#fff');
  if (state.orders.length === 0) {
    text(ctx, 'Belum ada pesanan.', b.x + 16, b.y + 90, 18, '#868e96');
    text(ctx, 'Pesanan pertama', b.x + 16, b.y + 120, 18, '#868e96');
    text(ctx, 'segera datang…', b.x + 16, b.y + 146, 18, '#868e96');
    return;
  }
  state.orders.forEach((order, i) => {
    const y = b.y + 56 + i * 98;
    const active = order.id === state.activeOrderId;
    const dish = dishById(order.dishId);
    ctx.fillStyle = active ? '#fff3bf' : '#f8f9fa';
    roundRect(ctx, b.x + 10, y, b.w - 20, 88, 10);
    ctx.fill();
    ctx.strokeStyle = active ? GOLD : '#dee2e6';
    ctx.lineWidth = active ? 3 : 1;
    ctx.stroke();
    drawDishIcon(ctx, order.dishId, b.x + 44, y + 44, 34);
    text(ctx, dish.name, b.x + 84, y + 28, 20, INK);
    text(ctx, 'Rp ' + dish.price, b.x + 84, y + 52, 16, '#868e96');
    // Patience bar.
    ctx.fillStyle = '#dee2e6';
    roundRect(ctx, b.x + 84, y + 58, 180, 12, 6);
    ctx.fill();
    ctx.fillStyle = order.patience > 0.5 ? GREEN : order.patience > 0.25 ? GOLD : RED;
    roundRect(ctx, b.x + 84, y + 58, Math.max(12, 180 * order.patience), 12, 6);
    ctx.fill();
    if (active) text(ctx, '▶ AKTIF', b.x + 252, y + 30, 13, RED);
    // Recipe steps, names only so the line never clips the ticket edge.
    const done = new Set((order.plate || []).map((p) => p.ing + '@' + p.station));
    const steps = dish.steps.map((s) => {
      const mark = done.has(s.ing + '@' + s.station) ? '✓ ' : '· ';
      return mark + ingredientById(s.ing).name;
    });
    text(ctx, steps.join('   '), b.x + 16, y + 80, 13, '#495057');
  });
  text(ctx, 'Klik tiket untuk memilih pesanan.', b.x + 16, b.y + b.h - 12, 13, '#868e96');
}

function drawStations(ctx, state) {
  for (const key of Object.keys(STATIONS)) {
    const st = STATIONS[key];
    const r = LAYOUT.stations[key];
    const busy = state.processing && state.processing.station === key;
    const trayMatch = state.tray && state.tray.station === key;
    ctx.fillStyle = busy ? '#fff3bf' : '#fff';
    roundRect(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = trayMatch ? GREEN : '#dee2e6';
    ctx.lineWidth = trayMatch ? 4 : 2;
    ctx.stroke();
    ctx.fillStyle = st.color;
    roundRect(ctx, r.x, r.y, r.w, 34, 12);
    ctx.fill();
    ctx.fillRect(r.x, r.y + 22, r.w, 12);
    text(ctx, st.name + '  [' + st.key + ']', r.x + 12, r.y + 24, 17, '#fff');
    text(ctx, st.verb, r.x + r.w / 2, r.y + 78, 26, busy ? '#e8590c' : '#adb5bd', 'bold', 'center');
    if (busy) {
      const p = state.processing;
      ctx.fillStyle = '#dee2e6';
      roundRect(ctx, r.x + 20, r.y + 92, r.w - 40, 12, 6);
      ctx.fill();
      ctx.fillStyle = st.color;
      roundRect(ctx, r.x + 20, r.y + 92, (r.w - 40) * Math.min(1, p.t / p.total), 12, 6);
      ctx.fill();
      text(ctx, ingredientById(p.ing).name + '…', r.x + r.w / 2, r.y + 68, 15, INK, 'bold', 'center');
    } else if (trayMatch) {
      text(ctx, 'SIAP! KLIK UNTUK ' + st.verb, r.x + r.w / 2, r.y + 96, 14, GREEN, 'bold', 'center');
    } else {
      text(ctx, '—', r.x + r.w / 2, r.y + 96, 18, '#adb5bd', 'bold', 'center');
    }
  }
}

function drawPlateZone(ctx, state) {
  const r = LAYOUT.plate;
  const ready = plateReady(state);
  ctx.fillStyle = ready ? '#d3f9d8' : '#fff';
  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.strokeStyle = ready ? GREEN : '#dee2e6';
  ctx.lineWidth = ready ? 4 : 2;
  ctx.stroke();
  const order = activeOrder(state);
  text(ctx, 'PIRING — ' + (order ? dishById(order.dishId).name : '—'), r.x + 16, r.y + 30, 18, INK);
  if (!order) {
    text(ctx, 'Pilih pesanan dulu.', r.x + 16, r.y + 80, 17, '#868e96');
    return;
  }
  const dish = dishById(order.dishId);
  const done = new Set((order.plate || []).map((p) => p.ing + '@' + p.station));
  dish.steps.forEach((s, i) => {
    const x = r.x + 24 + i * 128;
    const y = r.y + 88;
    const isDone = done.has(s.ing + '@' + s.station);
    ctx.fillStyle = isDone ? '#d3f9d8' : '#f1f3f5';
    ctx.beginPath();
    ctx.arc(x + 40, y, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isDone ? GREEN : '#ced4da';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = isDone ? 1 : 0.45;
    drawIngredientIcon(ctx, s.ing, x + 40, y, 52);
    ctx.globalAlpha = 1;
    text(ctx, ingredientById(s.ing).name, x + 40, y + 70, 14, INK, 'bold', 'center');
    if (isDone) text(ctx, '✓', x + 76, y - 30, 22, GREEN, 'bold', 'center');
  });
  if (ready) {
    text(ctx, '✓ SIAP DIANTAR!', r.x + r.w / 2, r.y + 184, 22, GREEN, 'bold', 'center');
  } else {
    const left = remainingSteps(state).length;
    text(ctx, 'Kurang ' + left + ' bahan lagi.', r.x + r.w / 2, r.y + 184, 16, '#868e96', 'bold', 'center');
  }
}

function drawTray(ctx, state) {
  const r = LAYOUT.tray;
  ctx.fillStyle = '#fff';
  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#dee2e6';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'NAMPAN', r.x + 16, r.y + 30, 18, INK);
  if (state.tray) {
    const ing = ingredientById(state.tray.ing);
    drawIngredientIcon(ctx, ing.id, r.x + r.w / 2, r.y + 92, 84);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 150, 18, INK, 'bold', 'center');
    const st = STATIONS[state.tray.station];
    text(ctx, '→ ' + st.name, r.x + r.w / 2, r.y + 178, 15, st.color, 'bold', 'center');
  } else if (state.processing) {
    text(ctx, 'Sedang dimasak…', r.x + r.w / 2, r.y + 100, 16, '#868e96', 'bold', 'center');
  } else {
    text(ctx, 'Kosong.', r.x + r.w / 2, r.y + 100, 17, '#868e96', 'bold', 'center');
    text(ctx, 'Klik bahan di bawah,', r.x + r.w / 2, r.y + 130, 14, '#868e96', 'normal', 'center');
    text(ctx, 'lalu stasiunnya.', r.x + r.w / 2, r.y + 152, 14, '#868e96', 'normal', 'center');
  }
}

function drawServe(ctx, state) {
  const r = LAYOUT.serve;
  const ready = plateReady(state);
  ctx.fillStyle = ready ? '#ffd43b' : '#fff';
  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.strokeStyle = ready ? GOLD : '#dee2e6';
  ctx.lineWidth = ready ? 4 : 2;
  ctx.stroke();
  text(ctx, 'JENDELA ANTAR', r.x + 16, r.y + 30, 18, INK);
  // A little bell.
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2, r.y + 92, 34, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(r.x + r.w / 2 - 44, r.y + 92, 88, 10);
  ctx.fillStyle = '#e8590c';
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2, r.y + 116, 8, 0, Math.PI * 2);
  ctx.fill();
  if (ready) {
    text(ctx, 'KLIK / SPASI', r.x + r.w / 2, r.y + 160, 18, RED, 'bold', 'center');
    text(ctx, 'UNTUK MENGANTAR', r.x + r.w / 2, r.y + 184, 18, RED, 'bold', 'center');
  } else {
    text(ctx, 'Selesaikan piring', r.x + r.w / 2, r.y + 160, 15, '#868e96', 'bold', 'center');
    text(ctx, 'dulu, baru antar.', r.x + r.w / 2, r.y + 184, 15, '#868e96', 'bold', 'center');
  }
}

function drawBins(ctx, state) {
  const b = LAYOUT.bins;
  ctx.fillStyle = WOOD;
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  text(ctx, 'MEJA BAHAN — klik bahan, lalu stasiunnya  (tombol 1–8)', b.x + 16, b.y + 26, 16, '#fff');
  const bw = 146;
  const gap = 8;
  INGREDIENTS.forEach((ing, i) => {
    const x = b.x + 8 + i * (bw + gap);
    const y = b.y + 36;
    const order = activeOrder(state);
    const needed = order
      ? dishById(order.dishId).steps.some((s) => s.ing === ing.id)
      : false;
    ctx.fillStyle = needed ? '#fff3bf' : '#fff';
    roundRect(ctx, x, y, bw, 96, 10);
    ctx.fill();
    ctx.strokeStyle = needed ? GOLD : '#dee2e6';
    ctx.lineWidth = needed ? 3 : 1;
    ctx.stroke();
    drawIngredientIcon(ctx, ing.id, x + bw / 2, y + 40, 56);
    text(ctx, ing.name, x + bw / 2, y + 82, 15, INK, 'bold', 'center');
    ctx.fillStyle = '#868e96';
    ctx.beginPath();
    ctx.arc(x + bw - 16, y + 14, 11, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, ing.key, x + bw - 16, y + 19, 13, '#fff', 'bold', 'center');
  });
}

function drawMessage(ctx, state) {
  const m = LAYOUT.message;
  ctx.fillStyle = '#212529';
  roundRect(ctx, m.x, m.y, m.w, m.h, 8);
  ctx.fill();
  text(ctx, state.message, m.x + 16, m.y + 29, 17, '#fff');
  text(ctx, 'P jeda · M suara · Spasi antar', m.x + m.w - 16, m.y + 29, 14, '#adb5bd', 'bold', 'right');
}

function drawTitle(ctx, state) {
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = RED;
  ctx.fillRect(0, 0, W, 18);
  ctx.fillStyle = '#fff';
  for (let x = 0; x < W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 18);
    ctx.lineTo(x + 40, 18);
    ctx.lineTo(x + 20, 44);
    ctx.closePath();
    ctx.fill();
  }
  text(ctx, 'WARUNG RUSH', W / 2, 190, 84, RED, 'bold', 'center');
  text(ctx, 'DAPUR KILAT — game masak warung kaki lima', W / 2, 240, 26, INK, 'bold', 'center');
  text(ctx, 'Pesanan datang, bahan di meja, wajan panas. Rakit hidangan', W / 2, 300, 20, '#495057', 'normal', 'center');
  text(ctx, 'sesuai resep, antar sebelum pelanggan kehabisan sabar!', W / 2, 330, 20, '#495057', 'normal', 'center');
  // A row of dish icons as a teaser.
  const dishes = ['nasi-goreng', 'mie-goreng', 'sate-ayam', 'soto-ayam', 'gado-gado'];
  dishes.forEach((id, i) => {
    const x = W / 2 - 320 + i * 160;
    drawDishIcon(ctx, id, x, 420, 64);
    text(ctx, dishById(id).name, x, 490, 15, INK, 'bold', 'center');
  });
  const btn = LAYOUT.startBtn;
  ctx.fillStyle = GREEN;
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 14);
  ctx.fill();
  text(ctx, '▶  MULAI MASAK', W / 2, btn.y + 46, 28, '#fff', 'bold', 'center');
  text(ctx, 'Klik / tekan Enter — mouse + keyboard (1–8, Q/W/E/R, Spasi)', W / 2, btn.y + 108, 16, '#868e96', 'normal', 'center');
}

function drawDone(ctx, state) {
  ctx.fillStyle = 'rgba(33,37,41,0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  roundRect(ctx, 340, 150, 600, 480, 16);
  ctx.fill();
  text(ctx, state.over && state.hearts <= 0 ? 'WARUNG TUTUP!' : 'SHIFT SELESAI!', 640, 220, 44, RED, 'bold', 'center');
  text(ctx, 'Hidangan terantar: ' + state.served, 640, 300, 24, INK, 'bold', 'center');
  text(ctx, 'Pesanan hangus: ' + state.failed, 640, 340, 24, INK, 'bold', 'center');
  text(ctx, 'Kombo terbaik: x' + state.bestCombo, 640, 380, 24, INK, 'bold', 'center');
  text(ctx, 'SKOR AKHIR', 640, 450, 20, '#868e96', 'bold', 'center');
  text(ctx, '' + state.score, 640, 510, 64, GOLD, 'bold', 'center');
  text(ctx, 'Rp ' + state.coins + ' masuk kas warung.', 640, 550, 18, '#495057', 'normal', 'center');
  const btn = LAYOUT.againBtn;
  ctx.fillStyle = GREEN;
  roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 14);
  ctx.fill();
  text(ctx, '↻  MASAK LAGI', 640, btn.y + 46, 26, '#fff', 'bold', 'center');
}

export function drawGame(ctx, state) {
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);
  if (state.phase === 'title') {
    drawTitle(ctx, state);
    return;
  }
  drawHUD(ctx, state);
  drawOrderBoard(ctx, state);
  drawStations(ctx, state);
  drawPlateZone(ctx, state);
  drawTray(ctx, state);
  drawServe(ctx, state);
  drawBins(ctx, state);
  drawMessage(ctx, state);
  if (state.phase === 'done') drawDone(ctx, state);
}
