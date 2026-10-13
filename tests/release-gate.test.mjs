import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { isReleased, loadReleases, editionFor, ownedPatterns, CITIES, root } from '../scripts/release-gate.mjs';

test('a piece is released only on or after its Hawaii date and only without a hold', () => {
  const today = '2026-10-13';
  assert.equal(isReleased({ releasedAt: '2026-10-13', hold: false }, today), true);
  assert.equal(isReleased({ releasedAt: '2026-10-01', hold: false }, today), true);
  assert.equal(isReleased({ releasedAt: '2026-10-14', hold: false }, today), false);
  assert.equal(isReleased({ releasedAt: '2026-10-01', hold: true }, today), false);
  assert.equal(isReleased({ releasedAt: '', hold: false }, today), false);
  assert.equal(isReleased({ releasedAt: 'soon', hold: false }, today), false);
});

test('releases.json has one valid entry for each of the 49 editions', () => {
  const pieces = loadReleases();
  assert.equal(pieces.length, 49);
  const ids = new Set(pieces.map(p => p.id));
  for (const city of CITIES) for (let day = 1; day <= 7; day++) {
    const id = `tfh-fw/${city.id}-day-${day}`;
    assert.ok(ids.has(id), id);
    const ed = editionFor(id);
    assert.ok(fs.existsSync(path.join(root, ed.publicationPath, 'index.html')), ed.publicationPath);
    assert.ok(ed.dayPath && fs.existsSync(path.join(root, ed.dayPath, 'index.html')), id);
    assert.ok(fs.existsSync(path.join(root, ed.excavationPath, 'index.html')), ed.excavationPath);
  }
});

test('each edition owns its pages, kits, exports and previews and nothing of another edition', () => {
  const owned = ownedPatterns(editionFor('tfh-fw/tokyo-day-3'));
  const owns = rel => owned.some(re => re.test(rel));
  for (const rel of ['tokyo/publication/day-3/index.html', 'tokyo/day/03-streaming-stage/index.html', 'excavation/tokyo/day-3/index.html', 'tokyo/kits/day-3.json', 'tokyo/asset-kits/day-3.md', 'exports/tokyo/day-3/instagram-a-01.png', 'assets/social/tokyo-day-3.jpg', 'assets/evidence/tokyo-day-3.svg', 'data/excavation/reports/tokyo-day-3.json']) assert.ok(owns(rel), rel);
  for (const rel of ['tokyo/publication/day-4/index.html', 'publication/day-3/index.html', 'exports/tokyo/day-30/x.png', 'tokyo/kits/index.html', 'assets/style.css']) assert.ok(!owns(rel), rel);
});
