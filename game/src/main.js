// Warung Rush — entry point: canvas setup, the game loop, wiring input
// to state, and the demo states used for screenshots. The game itself is
// the state + render + input modules; this file only connects them.

import { drawGame, W, H } from './render.js';
import { handleClick, handleKey } from './input.js';
import {
  failOrder,
  newGame,
  setMessage,
  spawnOrder,
  tick,
} from './state.js';
import { sfx, toggleMute } from './audio.js';
import { dishById } from './recipes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

let state = newGame();
let paused = false;
let frozen = false;
let lastTs = 0;
let lastTickSecond = -1;

function playAction(action) {
  if (!action || action.type === 'none') return;
  if (action.type === 'start') {
    state = newGame();
    state.phase = 'playing';
    spawnOrder(state, 'nasi-goreng');
    spawnOrder(state, 'mie-goreng');
    state.spawnIn = 4;
    setMessage(state, 'Pesanan pertama: NASI GORENG. Klik bahannya di meja bawah!');
    sfx.start();
    return;
  }
  if (action.type === 'restart') {
    state = newGame();
    state.phase = 'playing';
    spawnOrder(state, 'nasi-goreng');
    spawnOrder(state, 'mie-goreng');
    state.spawnIn = 4;
    setMessage(state, 'Shift baru! Layani pesanan secepat mungkin!');
    sfx.start();
    return;
  }
  if (action.type === 'pause') {
    paused = !paused;
    setMessage(state, paused ? 'Jeda. Tekan P untuk lanjut.' : 'Lanjut masak!');
    return;
  }
  if (action.type === 'mute') {
    const m = toggleMute();
    setMessage(state, m ? 'Suara mati.' : 'Suara hidup.');
    return;
  }
  if (action.type === 'select') {
    sfx.click();
    setMessage(state, 'Pesanan dipilih: ' + dishById(state.orders.find((o) => o.id === action.orderId).dishId).name);
    return;
  }
  if (action.type === 'ingredient') {
    if (action.result === 'plated') {
      sfx.plated();
      setMessage(state, 'Bahan langsung ke piring.');
    } else if (action.result === 'tray') {
      sfx.pickup();
      setMessage(state, 'Bahan di nampan — klik stasiun yang tepat!');
    } else if (action.result === 'not-needed') {
      sfx.error();
      setMessage(state, 'Bahan itu tidak ada di resep pesanan aktif.');
    } else if (action.result === 'already') {
      sfx.error();
      setMessage(state, 'Bahan itu sudah ada di piring.');
    } else if (action.result === 'busy') {
      sfx.error();
      setMessage(state, 'Tunggu masakan selesai dulu.');
    } else if (action.result === 'no-order') {
      setMessage(state, 'Belum ada pesanan.');
    }
    return;
  }
  if (action.type === 'station') {
    if (action.result === 'cooking') {
      const st = action.station;
      if (st === 'wok') sfx.sizzle();
      else if (st === 'grill') sfx.grill();
      else if (st === 'pot') sfx.boil();
      else sfx.chop();
      setMessage(state, 'Memasak…');
    } else if (action.result === 'wrong') {
      sfx.error();
      setMessage(state, 'Salah stasiun! Lihat resep di tiket pesanan.');
    } else if (action.result === 'empty') {
      sfx.error();
      setMessage(state, 'Nampan kosong — ambil bahan dulu.');
    } else if (action.result === 'busy') {
      sfx.error();
      setMessage(state, 'Masih ada yang dimasak.');
    }
    return;
  }
  if (action.type === 'serve') {
    sfx.serve();
    const r = action.result;
    setMessage(state, 'Terantar! ' + r.dish.name + ' +Rp ' + r.earned + ' (tip Rp ' + r.tip + ').');
    return;
  }
  if (action.type === 'serve-miss') {
    sfx.error();
    setMessage(state, 'Piring belum lengkap — cek resep di tiket.');
  }
}

function toCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (W / rect.width),
    y: (e.clientY - rect.top) * (H / rect.height),
  };
}

canvas.addEventListener('click', (e) => {
  const p = toCanvasCoords(e);
  playAction(handleClick(state, p.x, p.y));
});

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') e.preventDefault();
  playAction(handleKey(state, e.key));
});

// Demo states: fixed mid-game snapshots rendered by the game's own code,
// used for screenshots. The clock is frozen so every shot is identical.
function applyDemo(kind) {
  frozen = true;
  state = newGame();
  state.phase = 'playing';
  if (kind === 'busy') {
    state.timeLeft = 134;
    state.coins = 145;
    state.score = 145;
    state.served = 3;
    state.combo = 2;
    state.bestCombo = 3;
    const o1 = spawnOrder(state, 'nasi-goreng');
    o1.plate = [
      { ing: 'nasi', station: 'wok' },
      { ing: 'telur', station: 'wok' },
    ];
    o1.patience = 0.72;
    const o2 = spawnOrder(state, 'mie-goreng');
    o2.patience = 0.55;
    const o3 = spawnOrder(state, 'sate-ayam');
    o3.patience = 0.38;
    state.activeOrderId = o1.id;
    state.plate = { dishId: o1.dishId, done: o1.plate };
    setMessage(state, 'Piring hampir siap — tambah KECAP, lalu antar!');
  } else if (kind === 'serve') {
    state.timeLeft = 118;
    state.coins = 210;
    state.score = 210;
    state.served = 5;
    state.combo = 4;
    state.bestCombo = 4;
    const o1 = spawnOrder(state, 'sate-ayam');
    o1.plate = [
      { ing: 'ayam', station: 'grill' },
      { ing: 'bumbu', station: null },
      { ing: 'kecap', station: null },
    ];
    o1.patience = 0.81;
    const o2 = spawnOrder(state, 'soto-ayam');
    o2.patience = 0.6;
    state.activeOrderId = o1.id;
    state.plate = { dishId: o1.dishId, done: o1.plate };
    setMessage(state, 'SATE AYAM siap! Klik JENDELA ANTAR atau tekan Spasi!');
  } else if (kind === 'rush') {
    state.timeLeft = 41;
    state.coins = 320;
    state.score = 320;
    state.served = 9;
    state.combo = 5;
    state.bestCombo = 6;
    state.hearts = 2;
    const o1 = spawnOrder(state, 'mie-goreng');
    o1.patience = 0.12;
    const o2 = spawnOrder(state, 'soto-ayam');
    o2.patience = 0.34;
    o2.plate = [{ ing: 'ayam', station: 'pot' }];
    const o3 = spawnOrder(state, 'gado-gado');
    o3.patience = 0.5;
    const o4 = spawnOrder(state, 'nasi-goreng');
    o4.patience = 0.66;
    state.activeOrderId = o2.id;
    state.plate = { dishId: o2.dishId, done: o2.plate };
    setMessage(state, 'RUSH! Satu pesanan hampir hangus — cepat!');
  } else if (kind === 'done') {
    state.phase = 'done';
    state.over = true;
    state.timeLeft = 0;
    state.coins = 486;
    state.score = 486;
    state.served = 14;
    state.failed = 2;
    state.bestCombo = 5;
    state.hearts = 1;
  }
}

const params = new URLSearchParams(window.location.search);
const demo = params.get('demo');
if (demo) applyDemo(demo);

// Test hook: lets automated checks read the live state.
window.__warung = {
  get state() {
    return state;
  },
};

function frame(ts) {
  const dt = Math.min(0.1, (ts - lastTs) / 1000 || 0);
  lastTs = ts;
  if (!frozen && !paused && state.phase === 'playing') {
    const before = state.phase;
    tick(state, dt);
    const sec = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 30 && state.timeLeft > 0 && sec !== lastTickSecond) {
      lastTickSecond = sec;
      sfx.tick();
    }
    if (before === 'playing' && state.phase === 'done') {
      if (state.hearts <= 0) setMessage(state, 'Reputasi habis — warung tutup!');
      else setMessage(state, 'Shift selesai! Skor: ' + state.score);
      sfx.done();
    }
  }
  drawGame(ctx, state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
