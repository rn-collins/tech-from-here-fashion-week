import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const file=path.join(root,'sitemap.xml');
const xml=fs.readFileSync(file,'utf8');
const urls=[...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]))];
fs.writeFileSync(file,`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>${url}</loc></url>`).join('')}</urlset>`);
console.log(`Normalized sitemap to ${urls.length} unique routes.`);
