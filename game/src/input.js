// Warung Rush — mouse and keyboard input. Hit-testing uses the same
// rectangles render.js draws, so a click lands where the art says it does.
// Every handler returns an action object; main.js turns it into sounds,
// messages and state changes. No drawing happens here.

import { INGREDIENTS, STATIONS } from './recipes.js';
import { LAYOUT } from './render.js';
import {
  selectOrder,
  servePlate,
  takeIngredient,
  useStation,
} from './state.js';

function inside(x, y, r) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

function binRect(i) {
  return { x: LAYOUT.bins.x + 8 + i * 154, y: LAYOUT.bins.y + 36, w: 146, h: 96 };
}

function ticketRect(i) {
  return { x: LAYOUT.board.x + 10, y: LAYOUT.board.y + 56 + i * 98, w: LAYOUT.board.w - 20, h: 88 };
}

export function handleClick(state, x, y) {
  if (state.phase === 'title') {
    if (inside(x, y, LAYOUT.startBtn)) return { type: 'start' };
    return { type: 'none' };
  }
  if (state.phase === 'done') {
    if (inside(x, y, LAYOUT.againBtn)) return { type: 'restart' };
    return { type: 'none' };
  }
  // Serve window first: it is the big yellow target.
  if (inside(x, y, LAYOUT.serve)) {
    const result = servePlate(state);
    return result ? { type: 'serve', result } : { type: 'serve-miss' };
  }
  // Order tickets.
  for (let i = 0; i < state.orders.length; i++) {
    if (inside(x, y, ticketRect(i))) {
      const ok = selectOrder(state, state.orders[i].id);
      return ok ? { type: 'select', orderId: state.orders[i].id } : { type: 'none' };
    }
  }
  // Stations.
  for (const key of Object.keys(STATIONS)) {
    if (inside(x, y, LAYOUT.stations[key])) {
      return { type: 'station', station: key, result: useStation(state, key) };
    }
  }
  // Ingredient bins.
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (inside(x, y, binRect(i))) {
      return { type: 'ingredient', ing: INGREDIENTS[i].id, result: takeIngredient(state, INGREDIENTS[i].id) };
    }
  }
  return { type: 'none' };
}

export function handleKey(state, key) {
  const k = key.toLowerCase();
  if (state.phase === 'title') {
    if (k === 'enter' || k === ' ') return { type: 'start' };
    return { type: 'none' };
  }
  if (state.phase === 'done') {
    if (k === 'enter' || k === ' ') return { type: 'restart' };
    return { type: 'none' };
  }
  if (k === ' ') {
    const result = servePlate(state);
    return result ? { type: 'serve', result } : { type: 'serve-miss' };
  }
  if (k === 'p') return { type: 'pause' };
  if (k === 'm') return { type: 'mute' };
  const ing = INGREDIENTS.find((i) => i.key === key);
  if (ing) {
    return { type: 'ingredient', ing: ing.id, result: takeIngredient(state, ing.id) };
  }
  const station = Object.values(STATIONS).find((s) => s.key === k.toUpperCase());
  if (station) {
    return { type: 'station', station: station.id, result: useStation(state, station.id) };
  }
  return { type: 'none' };
}
