// Writes data/release-state.json: the ids that are released today (Pacific/Honolulu).
// The daily workflow commits this file only when the list changes, and that
// push makes Vercel rebuild, so each piece appears on its day with no hand edit.
// The build does not read this file; data/releases.json alone decides.
import fs from 'node:fs';
import path from 'node:path';
import { root, releaseState } from './release-gate.mjs';

const { released, pieces } = releaseState();
const file = path.join(root, 'data', 'release-state.json');
const next = JSON.stringify({ note: 'Written by scripts/release-state.mjs. Not read by the build.', released: released.map(p => p.id), total: pieces.length }, null, 2) + '\n';
const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
if (before !== next) fs.writeFileSync(file, next);
console.log(`${released.length} of ${pieces.length} released; ${before === next ? 'unchanged' : 'updated'}.`);
