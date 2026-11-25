// Warung Rush — recipes, ingredients and stations.
// Everything the kitchen knows: what a dish needs, where each ingredient
// is processed, and what it costs. No game state lives here, only data.

export const STATIONS = {
  wok: { id: 'wok', name: 'WAJAN', verb: 'GORENG', color: '#e8590c', key: 'Q' },
  grill: { id: 'grill', name: 'PANGGANGAN', verb: 'PANGGANG', color: '#c2255c', key: 'W' },
  pot: { id: 'pot', name: 'PANCI', verb: 'REBUS', color: '#1971c2', key: 'E' },
  chop: { id: 'chop', name: 'TALENAN', verb: 'POTONG', color: '#2b8a3e', key: 'R' },
};

export const INGREDIENTS = [
  { id: 'nasi', name: 'NASI', color: '#fff3bf', key: '1', station: 'wok' },
  { id: 'mie', name: 'MIE', color: '#ffd43b', key: '2', station: 'wok' },
  { id: 'ayam', name: 'AYAM', color: '#e67700', key: '3', station: null },
  { id: 'telur', name: 'TELUR', color: '#fff9db', key: '4', station: 'wok' },
  { id: 'sayur', name: 'SAYUR', color: '#69db7c', key: '5', station: 'chop' },
  { id: 'bumbu', name: 'BUMBU', color: '#fa5252', key: '6', station: null },
  { id: 'kecap', name: 'KECAP', color: '#5c3d2e', key: '7', station: null },
  { id: 'kuah', name: 'KUAH', color: '#ffa94d', key: '8', station: null },
];

// station: null means the ingredient goes straight onto the plate (direct).
// ayam is the flexible one: its station depends on the dish that needs it.
export const DISHES = [
  {
    id: 'nasi-goreng',
    name: 'NASI GORENG',
    price: 18,
    color: '#fab005',
    steps: [
      { ing: 'nasi', station: 'wok' },
      { ing: 'telur', station: 'wok' },
      { ing: 'kecap', station: null },
    ],
  },
  {
    id: 'mie-goreng',
    name: 'MIE GORENG',
    price: 20,
    color: '#ffd43b',
    steps: [
      { ing: 'mie', station: 'wok' },
      { ing: 'ayam', station: 'wok' },
      { ing: 'sayur', station: 'chop' },
    ],
  },
  {
    id: 'sate-ayam',
    name: 'SATE AYAM',
    price: 24,
    color: '#e8590c',
    steps: [
      { ing: 'ayam', station: 'grill' },
      { ing: 'bumbu', station: null },
      { ing: 'kecap', station: null },
    ],
  },
  {
    id: 'soto-ayam',
    name: 'SOTO AYAM',
    price: 22,
    color: '#ffa94d',
    steps: [
      { ing: 'ayam', station: 'pot' },
      { ing: 'kuah', station: null },
      { ing: 'telur', station: 'wok' },
    ],
  },
  {
    id: 'gado-gado',
    name: 'GADO-GADO',
    price: 16,
    color: '#69db7c',
    steps: [
      { ing: 'sayur', station: 'chop' },
      { ing: 'telur', station: 'wok' },
      { ing: 'bumbu', station: null },
    ],
  },
];

export function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

export function ingredientById(id) {
  return INGREDIENTS.find((i) => i.id === id);
}

export function ingredientName(id) {
  const ing = ingredientById(id);
  return ing ? ing.name : id;
}
