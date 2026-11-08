// Builds src/data/exercises.json from free-exercise-db (The Unlicense / public domain).
// Usage: node scripts/build-exercises.mjs [path/to/exercises.json]
// Without a path it downloads the dataset from GitHub.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SRC = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'src/data/exercises.json');

const raw = process.argv[2]
  ? JSON.parse(await readFile(process.argv[2], 'utf8'))
  : await (await fetch(SRC)).json();

const KEEP_CATEGORIES = new Set(['strength', 'plyometrics', 'powerlifting']);
const DROP_EQUIPMENT = new Set(['foam roll']);

const exercises = raw
  .filter((e) => KEEP_CATEGORIES.has(e.category))
  .filter((e) => e.level !== 'expert')
  .filter((e) => !DROP_EQUIPMENT.has(e.equipment))
  .filter((e) => e.images?.length)
  .map((e) => ({
    id: e.id,
    name: e.name,
    equipment: e.equipment ?? 'body only',
    level: e.level,
    mechanic: e.mechanic ?? null,
    primary: e.primaryMuscles,
    secondary: e.secondaryMuscles,
    instructions: e.instructions,
    images: e.images,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

await writeFile(out, JSON.stringify(exercises));
console.log(`wrote ${exercises.length} exercises to ${path.relative(root, out)}`);
