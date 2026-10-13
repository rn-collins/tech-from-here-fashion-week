// Release gate for the public gallery.
// data/releases.json is the only record that decides what is public.
// A piece is released when its releasedAt date (Pacific/Honolulu) is today or
// earlier and hold is false. An empty releasedAt means unreleased.
import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve(import.meta.dirname, '..');
export const siteBase = (process.env.PUBLIC_SITE_URL || 'https://tech-from-here-fashion-week.vercel.app').replace(/\/$/, '');
export const TIME_ZONE = 'Pacific/Honolulu';

export const CITIES = [
  { id: 'london', name: 'London', dir: '' },
  { id: 'new-york', name: 'New York', dir: 'new-york' },
  { id: 'milan', name: 'Milan', dir: 'milan' },
  { id: 'paris', name: 'Paris', dir: 'paris' },
  { id: 'shanghai', name: 'Shanghai', dir: 'shanghai' },
  { id: 'copenhagen', name: 'Copenhagen', dir: 'copenhagen' },
  { id: 'tokyo', name: 'Tokyo', dir: 'tokyo' }
];

const ID_PATTERN = /^tfh-fw\/([a-z-]+)-day-([1-7])$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FIELDS = ['id', 'releasedAt', 'hold', 'postUrls', 'longFormUrl', 'sourcePageUrl'];

// Today's date in Hawaii as YYYY-MM-DD. GALLERY_TODAY exists only for local
// verification of the gate; it must never be set on the production project.
export function hawaiiToday(now = new Date()) {
  if (process.env.GALLERY_TODAY) {
    if (!DATE_PATTERN.test(process.env.GALLERY_TODAY)) throw new Error('GALLERY_TODAY must be YYYY-MM-DD');
    return process.env.GALLERY_TODAY;
  }
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function isReleased(entry, today) {
  return entry.hold === false && typeof entry.releasedAt === 'string' && DATE_PATTERN.test(entry.releasedAt) && entry.releasedAt <= today;
}

// Everything a piece owns in the source tree, derived from its id.
export function editionFor(id) {
  const match = ID_PATTERN.exec(id);
  if (!match) throw new Error(`Bad release id: ${id}`);
  const city = CITIES.find(c => c.id === match[1]);
  if (!city) throw new Error(`Unknown city in release id: ${id}`);
  const day = Number(match[2]);
  const prefix = city.dir ? `${city.dir}/` : '';
  const dayRoot = path.join(root, prefix + 'day');
  const dayDir = fs.existsSync(dayRoot) ? fs.readdirSync(dayRoot).find(name => name.startsWith(`0${day}-`)) : undefined;
  const slug = `${city.id}-day-${day}`;
  return {
    id, city, day, slug, prefix,
    publicationPath: `${prefix}publication/day-${day}`,
    dayPath: dayDir ? `${prefix}day/${dayDir}` : null,
    excavationPath: `excavation/${city.id}/day-${day}`,
    kitPath: `${prefix}kits/day-${day}`,
    galleryPath: `gallery/${slug}`
  };
}

// Patterns for every file that belongs to one edition.
export function ownedPatterns(edition) {
  const { prefix, day, slug, city } = edition;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const p = esc(prefix);
  return [
    new RegExp(`^${p}publication/day-${day}(/|$)`),
    new RegExp(`^${p}day/0${day}-[^/]+(/|$)`),
    new RegExp(`^${p}kits/day-${day}\\.[a-z]+$`),
    new RegExp(`^${p}asset-kits/day-${day}\\.[a-z]+$`),
    new RegExp(`^excavation/${esc(city.id)}/day-${day}(/|$)`),
    new RegExp(`^exports/${esc(city.id)}/day-${day}(/|$)`),
    new RegExp(`^assets/social/${esc(slug)}\\.[a-z]+$`),
    new RegExp(`^assets/evidence/${esc(slug)}\\.[a-z]+$`),
    new RegExp(`^data/excavation/(candidates|reports)/${esc(slug)}\\.json$`),
    new RegExp(`^gallery/${esc(slug)}(/|$)`)
  ];
}

export function loadReleases(file = path.join(root, 'data', 'releases.json')) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const pieces = doc.pieces;
  if (!Array.isArray(pieces)) throw new Error('releases.json: pieces must be an array');
  const seen = new Set();
  for (const entry of pieces) {
    for (const field of FIELDS) if (!(field in entry)) throw new Error(`releases.json: ${entry.id || '?'} is missing ${field}`);
    if (seen.has(entry.id)) throw new Error(`releases.json: duplicate id ${entry.id}`);
    seen.add(entry.id);
    editionFor(entry.id);
    if (typeof entry.hold !== 'boolean') throw new Error(`releases.json: ${entry.id} hold must be true or false`);
    if (entry.releasedAt !== '' && !DATE_PATTERN.test(entry.releasedAt)) throw new Error(`releases.json: ${entry.id} releasedAt must be YYYY-MM-DD or empty`);
    if (typeof entry.postUrls !== 'object' || entry.postUrls === null || Array.isArray(entry.postUrls)) throw new Error(`releases.json: ${entry.id} postUrls must be an object of platform to URL`);
  }
  return pieces;
}

export function releaseState(today = hawaiiToday()) {
  const pieces = loadReleases();
  const released = pieces.filter(entry => isReleased(entry, today));
  const held = pieces.filter(entry => !isReleased(entry, today));
  return { today, pieces, released, held };
}
