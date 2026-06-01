import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../../data/cars.json');

let carsCache = null;

function loadCars() {
  if (!carsCache) {
    const raw = readFileSync(DATA_PATH, 'utf-8');
    carsCache = JSON.parse(raw);
  }
  return carsCache;
}

export function getAllCars() {
  return loadCars();
}

export function getAllMakes() {
  return [...new Set(loadCars().map((c) => c.make))].sort((a, b) => a.localeCompare(b));
}

export function getCarById(id) {
  return loadCars().find((c) => c.id === id);
}

export function getCarsByIds(ids) {
  const idSet = new Set(ids);
  return loadCars().filter((c) => idSet.has(c.id));
}
