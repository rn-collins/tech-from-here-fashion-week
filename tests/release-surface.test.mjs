import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const origin='https://tech-from-here-fashion-week.vercel.app';
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const routes=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const fileFor=urlPath=>{
  const decoded=decodeURIComponent(urlPath).replace(/^\//,'');
  const exact=path.join(root,decoded);
  if(fs.existsSync(exact)&&fs.statSync(exact).isFile())return exact;
  const index=path.join(exact,'index.html');
  return fs.existsSync(index)?index:null;
};

test('all sitemap routes have route-bound social metadata',()=>{
  assert.equal(routes.length,198);
  for(const route of routes){
    const html=fs.readFileSync(fileFor(route),'utf8');
    assert.match(html,/<meta property="og:title"/);
    assert.match(html,/<meta property="og:image" content="https:\/\/tech-from-here-fashion-week\.vercel\.app\/assets\/(?:media|social)\//);
    assert.match(html,new RegExp(`<meta property="og:url" content="${origin.replaceAll('.','\\.')}${route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"`));
    assert.match(html,/<meta name="twitter:card" content="summary_large_image">/);
    assert.match(html,/<meta name="twitter:image"/);
  }
});

test('every same-origin route, asset and download target exists',()=>{
  for(const route of routes){
    const html=fs.readFileSync(fileFor(route),'utf8');
    for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
      const value=match[1];
      if(value.startsWith('#')||value.startsWith('mailto:')||value.startsWith('data:'))continue;
      const url=new URL(value,origin);
      if(url.origin!==origin)continue;
      assert.ok(fileFor(url.pathname),`${route} -> ${url.pathname}`);
    }
  }
});

test('search-result hiding cannot be overridden by grid layout',()=>{
  const css=fs.readFileSync(path.join(root,'assets','style.css'),'utf8');
  const app=fs.readFileSync(path.join(root,'assets','app.js'),'utf8');
  assert.match(css,/\[hidden\]\{display:none!important\}/);
  assert.match(app,/x\.hidden=!show/);
});

test('media assignment matrix covers every public route exactly once',()=>{
  const matrix=JSON.parse(fs.readFileSync(path.join(root,'data','media-assignment-matrix.json'),'utf8'));
  assert.equal(matrix.rows.length,198);
  assert.deepEqual(new Set(matrix.rows.map(x=>x.route)),new Set(routes));
  assert.equal(new Set(matrix.rows.map(x=>x.route)).size,198);
  assert.ok(matrix.rows.every(x=>x.editorialJudgment&&x.status&&Array.isArray(x.acquisitionGaps)));
});
