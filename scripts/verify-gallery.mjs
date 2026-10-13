// Checks the built dist/ against data/releases.json and fails the build on any leak.
import fs from 'node:fs';
import path from 'node:path';
import { root, siteBase, releaseState, editionFor, ownedPatterns } from './release-gate.mjs';

const out = path.join(root, 'dist');
const { today, pieces, released, held } = releaseState();
const failures = [];
const fail = message => failures.push(message);

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
const files = walk(out).map(f => path.relative(out, f).split(path.sep).join('/'));
const fileSet = new Set(files);
const exists = rel => fileSet.has(rel) || fileSet.has(`${rel ? rel + '/' : ''}index.html`);

const owners = pieces.map(entry => ({ entry, ed: editionFor(entry.id), patterns: ownedPatterns(editionFor(entry.id)) }));
const releasedIds = new Set(released.map(e => e.id));
const generated = new Set(['index.html', '404.html', 'sitemap.xml', 'robots.txt']);

// 1. Every file in dist is allowed.
for (const rel of files) {
  const owner = owners.find(o => o.patterns.some(re => re.test(rel)));
  if (owner) { if (!releasedIds.has(owner.entry.id)) fail(`held piece ${owner.entry.id} has ${rel} in dist`); continue; }
  if (generated.has(rel)) continue;
  if (rel.startsWith('assets/') && !rel.startsWith('assets/social/') && !rel.startsWith('assets/evidence/')) continue;
  fail(`file not allowed in dist: ${rel}`);
}

// 2. Held pieces leave no page and no title in dist.
const textFiles = files.filter(f => /\.(html|xml|txt|json|md|css|js)$/.test(f));
const corpus = textFiles.map(f => [f, fs.readFileSync(path.join(out, f), 'utf8')]);
for (const { entry, ed } of owners.filter(o => !releasedIds.has(o.entry.id))) {
  for (const rel of [ed.publicationPath, ed.dayPath, ed.excavationPath, ed.galleryPath, ed.kitPath + '.json', ed.kitPath + '.md'].filter(Boolean)) {
    if (exists(rel)) fail(`held piece ${entry.id} is reachable at /${rel}`);
  }
  const title = entry.title || '';
  if (title.length >= 12) for (const [f, text] of corpus) if (text.includes(title)) fail(`held piece ${entry.id} title appears in ${f}`);
  for (const [f, text] of corpus) for (const p of [ed.publicationPath, ed.excavationPath, ed.dayPath].filter(Boolean)) {
    if (text.includes(`"/${p}"`) || text.includes(`${siteBase}/${p}"`)) fail(`${f} links to held page /${p}`);
  }
}

// 3. Released pieces are present with their links.
const order = released.map(e => editionFor(e.id));
released.forEach((entry, i) => {
  const ed = order[i];
  for (const rel of [ed.galleryPath, ed.publicationPath, ed.dayPath, ed.excavationPath].filter(Boolean)) if (!exists(rel)) fail(`released piece ${entry.id} is missing /${rel}`);
  const page = path.join(out, ed.galleryPath, 'index.html');
  if (!fs.existsSync(page)) return;
  const html = fs.readFileSync(page, 'utf8');
  const need = [
    'href="/"',
    entry.longFormUrl && `href="${entry.longFormUrl}"`,
    entry.sourcePageUrl && `href="${entry.sourcePageUrl}"`,
    ...Object.values(entry.postUrls || {}).flat().filter(Boolean).map(u => `href="${u}"`),
    i > 0 && `href="/${order[i - 1].galleryPath}"`,
    i < order.length - 1 && `href="/${order[i + 1].galleryPath}"`
  ].filter(Boolean);
  for (const n of need) if (!html.includes(n)) fail(`gallery page for ${entry.id} lacks ${n}`);
  if (!entry.sourcePageUrl) console.warn(`note: ${entry.id} has no source page URL yet`);
  for (const rel of [ed.publicationPath, ed.dayPath, ed.excavationPath].filter(Boolean)) {
    const f = path.join(out, rel, 'index.html');
    if (fs.existsSync(f) && !fs.readFileSync(f, 'utf8').includes(`href="/${ed.galleryPath}"`)) fail(`/${rel} does not link back to its gallery page`);
  }
});

// 4. Every same-origin link and asset in dist resolves inside dist.
for (const [f, text] of corpus.filter(([f]) => f.endsWith('.html'))) {
  for (const m of text.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)) {
    const v = m[1];
    if (/^(#|data:|mailto:|javascript:)/.test(v)) continue;
    let url; try { url = new URL(v, `${siteBase}/${f}`); } catch { continue; }
    if (url.origin !== new URL(siteBase).origin) continue;
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '').replace(/\/+$/, '');
    if (!exists(rel)) fail(`${f} -> /${rel} does not exist in dist`);
  }
}

// 5. Sitemap lists exactly the public pages.
const sitemap = fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const expected = [`${siteBase}/`, ...order.flatMap(ed => [ed.galleryPath, ed.publicationPath, ed.dayPath, ed.excavationPath].filter(Boolean).map(p => `${siteBase}/${p}`))];
if (JSON.stringify(locs) !== JSON.stringify(expected)) fail(`sitemap lists ${locs.length} URLs, expected ${expected.length}`);
for (const loc of locs) if (!exists(new URL(loc).pathname.replace(/^\/+/, '').replace(/\/+$/, ''))) fail(`sitemap URL missing from dist: ${loc}`);

// 6. Generated pages use plain writing.
for (const f of ['index.html', '404.html', ...order.map(ed => `${ed.galleryPath}/index.html`)]) {
  if (!fileSet.has(f)) continue;
  const visible = fs.readFileSync(path.join(out, f), 'utf8').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  if (/[–—!]/.test(visible)) fail(`${f} has an em dash, en dash or exclamation point`);
}

if (failures.length) {
  console.error(`Gallery check failed (${failures.length}):\n` + failures.slice(0, 50).join('\n'));
  process.exit(1);
}
console.log(`Gallery check passed for ${today}: ${released.length} released present with links; ${held.length} held absent; ${files.length} files in dist.`);
