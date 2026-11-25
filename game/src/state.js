// Warung Rush — game state: orders, the plate, the shift clock, scoring.
// Pure logic: no drawing and no DOM here, so the rules can be read alone.

import { DISHES, dishById } from './recipes.js';

export const SHIFT_SECONDS = 180;
export const MAX_ORDERS = 4;
export const MAX_HEARTS = 3;

let nextOrderId = 1;

export function newGame() {
  return {
    phase: 'title', // title | playing | done
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    failed: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    orders: [],
    activeOrderId: null,
    // The plate holds processed ingredients for the active order.
    plate: { dishId: null, done: [] },
    // One ingredient at a time is being processed at a station.
    processing: null, // { ing, station, dishId, t, total }
    // One raw ingredient at a time waits on the tray for its station.
    tray: null, // { ing, station, dishId }
    spawnIn: 1.2,
    message: 'Klik MULAI, lalu layani pesanan secepat mungkin!',
    messageT: 0,
    elapsed: 0,
    over: false,
  };
}

function randomDishId() {
  return DISHES[Math.floor(Math.random() * DISHES.length)].id;
}

export function spawnOrder(state, dishId) {
  const dish = dishById(dishId || randomDishId());
  const order = {
    id: nextOrderId++,
    dishId: dish.id,
    patience: 1,
    // Patience drains over ~45s; later orders drain faster.
    drain: 1 / (45 - Math.min(15, state.served * 2)),
  };
  state.orders.push(order);
  if (state.activeOrderId === null) {
    state.activeOrderId = order.id;
    syncPlateToOrder(state);
  }
  return order;
}

export function activeOrder(state) {
  return state.orders.find((o) => o.id === state.activeOrderId) || null;
}

// The plate always belongs to the active order: switching orders swaps
// the plate to that order's dish (kept progress is per order, on the order).
export function syncPlateToOrder(state) {
  const order = activeOrder(state);
  if (!order) {
    state.plate = { dishId: null, done: [] };
    return;
  }
  if (!order.plate) order.plate = [];
  state.plate = { dishId: order.dishId, done: order.plate };
}

export function selectOrder(state, orderId) {
  if (state.phase !== 'playing') return false;
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return false;
  if (state.processing) return false; // cannot switch mid-process
  state.activeOrderId = orderId;
  syncPlateToOrder(state);
  return true;
}

// What the active order still needs, in recipe order.
export function remainingSteps(state) {
  const order = activeOrder(state);
  if (!order) return [];
  const dish = dishById(order.dishId);
  const done = new Set((order.plate || []).map((p) => p.ing + '@' + p.station));
  return dish.steps.filter((s) => !done.has(s.ing + '@' + s.station));
}

export function plateReady(state) {
  const order = activeOrder(state);
  if (!order) return false;
  return remainingSteps(state).length === 0;
}

// Click an ingredient bin: direct ingredients land on the plate at once,
// others go to the prep tray and wait for a station.
export function takeIngredient(state, ingId) {
  if (state.phase !== 'playing' || state.processing) return 'busy';
  const order = activeOrder(state);
  if (!order) return 'no-order';
  const dish = dishById(order.dishId);
  const step = dish.steps.find((s) => s.ing === ingId);
  if (!step) return 'not-needed';
  const done = new Set((order.plate || []).map((p) => p.ing + '@' + p.station));
  if (done.has(step.ing + '@' + step.station)) return 'already';
  if (step.station === null) {
    order.plate = order.plate || [];
    order.plate.push({ ing: step.ing, station: null });
    syncPlateToOrder(state);
    return 'plated';
  }
  // Raw ingredient waits in the tray; the player picks a station next.
  state.tray = { ing: step.ing, station: step.station, dishId: order.dishId };
  return 'tray';
}

// Click a station: if the tray holds an ingredient that belongs there,
// start processing it. Returns a status word for sound + message.
export function useStation(state, stationId) {
  if (state.phase !== 'playing' || state.processing) return 'busy';
  if (!state.tray) return 'empty';
  if (state.tray.station !== stationId) return 'wrong';
  const tray = state.tray;
  state.tray = null;
  state.processing = { ing: tray.ing, station: stationId, dishId: tray.dishId, t: 0, total: 1.1 };
  return 'cooking';
}

export function finishProcessing(state) {
  const p = state.processing;
  if (!p) return;
  state.processing = null;
  const order = state.orders.find((o) => o.dishId === p.dishId);
  if (!order) return;
  order.plate = order.plate || [];
  order.plate.push({ ing: p.ing, station: p.station });
  if (order.id === state.activeOrderId) syncPlateToOrder(state);
}

export function servePlate(state) {
  if (state.phase !== 'playing' || state.processing) return null;
  if (!plateReady(state)) return null;
  const order = activeOrder(state);
  const dish = dishById(order.dishId);
  const tip = Math.round(dish.price * 0.6 * order.patience);
  const earned = dish.price + tip;
  state.coins += earned;
  state.score += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.activeOrderId = state.orders.length ? state.orders[0].id : null;
  syncPlateToOrder(state);
  state.spawnIn = Math.max(0.6, 1.6 - state.served * 0.08);
  return { dish, earned, tip };
}

export function failOrder(state, order) {
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.failed += 1;
  state.combo = 0;
  state.hearts -= 1;
  if (state.activeOrderId === order.id) {
    state.activeOrderId = state.orders.length ? state.orders[0].id : null;
    syncPlateToOrder(state);
  }
  if (state.hearts <= 0) {
    state.phase = 'done';
    state.over = true;
  }
}

export function tick(state, dt) {
  if (state.phase !== 'playing') return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.phase = 'done';
    state.over = true;
    return;
  }
  if (state.processing) {
    state.processing.t += dt;
    if (state.processing.t >= state.processing.total) finishProcessing(state);
  }
  if (state.messageT > 0) state.messageT -= dt;
  // Patience drains; an expired order fails.
  for (const order of [...state.orders]) {
    order.patience -= order.drain * dt;
    if (order.patience <= 0) {
      order.patience = 0;
      failOrder(state, order);
      state.message = 'Pesanan hangus! Pelanggan pergi kecewa.';
      state.messageT = 2.5;
      if (state.phase !== 'playing') return;
    }
  }
  // New orders arrive while there is room.
  if (state.orders.length < MAX_ORDERS) {
    state.spawnIn -= dt;
    if (state.spawnIn <= 0) {
      spawnOrder(state);
      state.spawnIn = Math.max(2.2, 5.5 - state.served * 0.25);
    }
  }
}

export function setMessage(state, text) {
  state.message = text;
  state.messageT = 2.5;
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
