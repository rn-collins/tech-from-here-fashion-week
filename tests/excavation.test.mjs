import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const cities=['london','new-york','milan','paris','shanghai','copenhagen','tokyo'];
test('all 49 packages expose dated excavation rooms and machine-readable ledgers',()=>{
 let total=0;
  for(const city of cities)for(let d=1;d<=7;d++){
  const report=json(`data/excavation/reports/${city}-day-${d}.json`);
  const candidates=json(`data/excavation/candidates/${city}-day-${d}.json`);
  const html=read(`excavation/${city}/day-${d}/index.html`);
  assert.equal(report.searchedAt,'2026-09-07');
  assert.equal(report.surfaceCount,16);
  assert.ok(candidates.length>=4);
  assert.match(html,/Media Library/);
  assert.match(html,/Resources Room/);
  assert.match(html,/Diminishing-return stop/);
  assert.match(html,/Download candidate ledger/);
  for(const c of candidates){
   for(const key of ['id','title','creator','canonicalUrl','claimRelevance','rightsStatement','rightsClass','decision','decisionReason','accessed'])assert.ok(c[key],`${c.id} ${key}`);
   assert.match(c.canonicalUrl,/^https:\/\//);
  }
  total++;
 }
 assert.equal(total,49);
});
test('collection report is explicit about scope and publication pages point to excavation',()=>{
 const c=json('data/excavation/collection-report.json');
 assert.equal(c.packageCount,49);
 assert.equal(c.surfaceChecks,784);
 assert.match(c.scopeRule,/not the entire internet/i);
 for(const city of cities)for(let d=1;d<=7;d++){
  const p=city==='london'?`publication/day-${d}/index.html`:`${city}/publication/day-${d}/index.html`;
   assert.match(read(p),new RegExp(`/excavation/${city}/day-${d}`));
   assert.match(read('sitemap.xml'),new RegExp(`/excavation/${city}/day-${d}`));
  }
});
