// Assembles the public site in dist/ from data/releases.json.
// Only released pieces are copied. Everything else stays in the source tree
// and is absent from the deployment, so it returns 404 by any URL.
// Shared files are copied only from assets/ and only when a released page
// references them. Links to pages that are not public point to the gallery index.
import fs from 'node:fs';
import path from 'node:path';
import { root, siteBase, releaseState, editionFor, ownedPatterns, CITIES } from './release-gate.mjs';

const out = path.join(root, 'dist');
const { today, pieces, released } = releaseState();
const editions = released.map(entry => ({ entry, ...editionFor(entry.id) }));
const allOwners = pieces.map(entry => ({ id: entry.id, patterns: ownedPatterns(editionFor(entry.id)) }));
const releasedIds = new Set(released.map(entry => entry.id));

const ownerOf = rel => allOwners.find(owner => owner.patterns.some(re => re.test(rel)))?.id ?? null;
// A source file may be published only if a released piece owns it, or it is a
// shared asset under assets/ that no piece owns.
function publishable(rel) {
  const owner = ownerOf(rel);
  if (owner) return releasedIds.has(owner);
  return rel.startsWith('assets/') && !rel.startsWith('assets/social/') && !rel.startsWith('assets/evidence/');
}

const esc = value => String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Plain writing on generated pages: no em or en dashes, no exclamation points.
const plain = value => String(value).replace(/\s*[–—]\s*/g, ', ').replace(/!/g, '.');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const copied = new Set();
const pagesOut = new Set();
const report = { repointed: 0, dropped: 0 };

function resolveLocal(ref, fromRel) {
  if (!ref || ref.startsWith('#') || ref.startsWith('data:') || ref.startsWith('mailto:') || ref.startsWith('javascript:')) return null;
  let url;
  try { url = new URL(ref, `${siteBase}/${fromRel}`); } catch { return null; }
  if (url.origin !== new URL(siteBase).origin) return null;
  const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '').replace(/\/+$/, '');
  return { rel, hash: url.hash };
}

// Returns the published path for a source path, copying it into dist when allowed.
function publish(rel) {
  if (rel === '' || pagesOut.has(rel)) return rel;
  const abs = path.join(root, rel);
  let fileRel = null;
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) fileRel = rel;
  else if (fs.existsSync(path.join(abs, 'index.html'))) fileRel = `${rel}/index.html`;
  if (!fileRel || !publishable(fileRel)) return null;
  if (copied.has(fileRel)) return rel;
  if (fileRel.endsWith('.html')) return null; // pages are emitted only through emitPage
  copied.add(fileRel);
  fs.mkdirSync(path.dirname(path.join(out, fileRel)), { recursive: true });
  if (fileRel.endsWith('.css')) fs.writeFileSync(path.join(out, fileRel), rewriteCss(fs.readFileSync(abs, 'utf8'), fileRel));
  else fs.copyFileSync(abs, path.join(out, fileRel));
  return rel;
}

function rewriteCss(css, fromRel) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (whole, quote, ref) => {
    const local = resolveLocal(ref, fromRel);
    if (!local) return whole;
    return publish(local.rel) !== null ? whole : (report.dropped++, 'url("data:,")');
  });
}

function rewriteHtml(html, fromRel) {
  return html.replace(/\b(href|src|content|poster)="([^"]*)"/g, (whole, attr, ref) => {
    if (attr === 'content' && !/^(https?:)?\/\//.test(ref) && !ref.startsWith('/')) return whole;
    const local = resolveLocal(ref, fromRel);
    if (!local) return whole;
    if (publish(local.rel) !== null) return whole;
    if (attr === 'href') { report.repointed++; return `href="/"`; }
    report.dropped++;
    if (attr === 'content' && publish('assets/media/london-fashion-week.jpg') !== null) return `content="${siteBase}/assets/media/london-fashion-week.jpg"`;
    return `${attr}=""`;
  });
}

function writePage(rel, html) {
  pagesOut.add(rel);
  const file = path.join(out, rel, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const linkBar = ed => {
  const items = [
    ['Gallery', '/'],
    ['This piece in the gallery', `/${ed.galleryPath}`],
    ['Long-form', `/${ed.publicationPath}`],
    ed.dayPath && ['Day page', `/${ed.dayPath}`],
    ['Evidence record', `/${ed.excavationPath}`],
    ed.entry.sourcePageUrl && ['Source page', ed.entry.sourcePageUrl]
  ].filter(Boolean);
  return `<nav class="gallery-links" aria-label="This piece" style="font:14px/1.5 system-ui,sans-serif;padding:10px 16px;display:flex;flex-wrap:wrap;gap:6px 18px;border-bottom:1px solid currentColor">${items.map(([label, href]) => `<a href="${esc(href)}">${esc(label)}</a>`).join('')}</nav>`;
};

// Pages for released pieces must be registered before any rewriting, so that
// links between a piece's own pages resolve.
for (const ed of editions) {
  pagesOut.add(ed.publicationPath);
  if (ed.dayPath) pagesOut.add(ed.dayPath);
  pagesOut.add(ed.excavationPath);
  pagesOut.add(ed.galleryPath);
}

for (const ed of editions) {
  for (const rel of [ed.publicationPath, ed.dayPath, ed.excavationPath].filter(Boolean)) {
    const src = path.join(root, rel, 'index.html');
    if (!fs.existsSync(src)) throw new Error(`Released piece ${ed.id} is missing ${rel}`);
    let html = rewriteHtml(fs.readFileSync(src, 'utf8'), `${rel}/`);
    html = html.replace(/<body([^>]*)>/, (m) => `${m}${linkBar(ed)}`);
    writePage(rel, html);
  }
}

const shell = ({ title, description, canonical, image, body }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
${image ? `<meta property="og:image" content="${esc(image)}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${esc(image)}">` : '<meta name="twitter:card" content="summary">'}
<style>
:root{--bg:#f6f3ee;--fg:#1b1a17;--muted:#5d5a53;--line:#d8d2c7;--accent:#8a3b12}
@media (prefers-color-scheme:dark){:root{--bg:#141311;--fg:#ece8e1;--muted:#a8a298;--line:#35322d;--accent:#e39a6c}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 Georgia,"Times New Roman",serif}
main{max-width:880px;margin:0 auto;padding:40px 16px 64px}
header p,nav,footer,.meta{font:14px/1.5 system-ui,-apple-system,sans-serif;color:var(--muted)}
h1{font-size:2.2rem;line-height:1.15;margin:.2em 0 .4em}
h2{font-size:1.2rem;margin:2em 0 .5em}
a{color:var(--accent)}
ul.cards{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
ul.cards li{border:1px solid var(--line);padding:14px}
ul.cards img,figure img{width:100%;height:auto;display:block}
ul.links li{margin:.35em 0}
nav.pager{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:32px;border-top:1px solid var(--line);padding-top:16px}
footer{margin-top:48px;border-top:1px solid var(--line);padding-top:16px}
</style>
</head>
<body>
<main>
${body}
<footer>Tech From Here by Rayven-Nikkita Collins. Each piece appears here on its release day. <a href="https://rn-selected-work.vercel.app/">RN Collins, selected work</a></footer>
</main>
</body>
</html>
`;

const PLATFORM_NAMES = { instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', tiktok: 'TikTok', beehiiv: 'Newsletter', pinterest: 'Pinterest', x: 'X', threads: 'Threads' };
const socialImage = ed => fs.existsSync(path.join(root, 'assets', 'social', `${ed.slug}.jpg`)) ? `assets/social/${ed.slug}.jpg` : null;

editions.forEach((ed, index) => {
  const { entry } = ed;
  const prev = editions[index - 1];
  const next = editions[index + 1];
  const image = socialImage(ed);
  if (image) publish(image);
  const posts = Object.entries(entry.postUrls || {}).flatMap(([platform, value]) => (Array.isArray(value) ? value : [value]).filter(Boolean).map(url => [PLATFORM_NAMES[platform] || platform, url]));
  const title = plain(entry.title || `${ed.city.name}, day ${ed.day}`);
  const links = [
    ...posts.map(([name, url]) => `<li>Post on ${esc(name)}: <a href="${esc(url)}">${esc(url)}</a></li>`),
    entry.sourcePageUrl ? `<li>Source page: <a href="${esc(entry.sourcePageUrl)}">${esc(entry.sourcePageUrl)}</a></li>` : '',
    entry.longFormUrl ? `<li>Long-form: <a href="${esc(entry.longFormUrl)}">Read the full piece</a></li>` : '',
    ed.dayPath ? `<li>Day page: <a href="/${esc(ed.dayPath)}">${esc(ed.city.name)}, day ${ed.day}</a></li>` : '',
    `<li>Evidence record: <a href="/${esc(ed.excavationPath)}">What was found and what it may be used for</a></li>`
  ].filter(Boolean).join('\n');
  const body = `<header><p><a href="/">Gallery</a> / ${esc(ed.city.name)}, day ${ed.day}</p><h1>${esc(title)}</h1><p class="meta">Released ${esc(entry.releasedAt)}</p></header>
${image ? `<figure><img src="/${esc(image)}" alt="${esc(title)}" width="1200" height="630"></figure>` : ''}
<h2>Links</h2>
<ul class="links">
${links}
</ul>
<nav class="pager" aria-label="More pieces">
<span>${prev ? `<a href="/${esc(prev.galleryPath)}" rel="prev">Previous: ${esc(plain(prev.entry.title))}</a>` : ''}</span>
<a href="/">Gallery index</a>
<span>${next ? `<a href="/${esc(next.galleryPath)}" rel="next">Next: ${esc(plain(next.entry.title))}</a>` : ''}</span>
</nav>`;
  writePage(ed.galleryPath, shell({
    title: `${title}, Tech From Here`,
    description: `${ed.city.name} Fashion Week, day ${ed.day}. A Tech From Here piece by Rayven-Nikkita Collins.`,
    canonical: `${siteBase}/${ed.galleryPath}`,
    image: image ? `${siteBase}/${image}` : null,
    body
  }));
});

// Gallery index
const cards = editions.map(ed => {
  const image = socialImage(ed);
  return `<li><a href="/${esc(ed.galleryPath)}">${image ? `<img src="/${esc(image)}" alt="" width="1200" height="630" loading="lazy">` : ''}<strong>${esc(plain(ed.entry.title))}</strong></a><br><span class="meta">${esc(ed.city.name)}, day ${ed.day}. Released ${esc(ed.entry.releasedAt)}</span></li>`;
}).join('\n');
writePage('', shell({
  title: 'Tech From Here: Fashion Week',
  description: 'Tech From Here follows the technology behind fashion week, city by city. Pieces appear here on their release day.',
  canonical: `${siteBase}/`,
  image: null,
  body: `<header><p>Tech From Here</p><h1>Fashion Week</h1><p>The technology behind fashion week, city by city. Each piece appears here on its release day.</p></header>
${editions.length ? `<h2>Released pieces</h2>\n<ul class="cards">\n${cards}\n</ul>` : '<p>No pieces have been released yet. Please check back soon.</p>'}`
}));

fs.writeFileSync(path.join(out, '404.html'), shell({
  title: 'Not found, Tech From Here',
  description: 'This page is not available.',
  canonical: `${siteBase}/`,
  image: null,
  body: '<header><h1>This page is not available</h1></header><p><a href="/">Go to the gallery index</a></p>'
}).replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex">'));

const urls = ['', ...editions.flatMap(ed => [ed.galleryPath, ed.publicationPath, ed.dayPath, ed.excavationPath].filter(Boolean))];
fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${esc(`${siteBase}/${u}`)}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteBase}/sitemap.xml\n`);

console.log(`Gallery for ${today} (Pacific/Honolulu): ${editions.length} released of ${pieces.length}; ${pieces.length - editions.length} held and absent from dist. Copied ${copied.size} shared or owned files; repointed ${report.repointed} links to non-public pages; dropped ${report.dropped} references.`);
