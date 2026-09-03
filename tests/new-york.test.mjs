import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=p=>JSON.parse(read(p));
const days=['01-calendar','02-venue-network','03-capture','04-broadcast','05-worker-data','06-production-commerce','07-memory'];
const routes=['new-york','new-york/days','new-york/objects','new-york/kits','new-york/sources',...days.map(x=>'new-york/day/'+x)];
test('New York is a distinct, complete twelve-route edition',()=>{
 assert.equal(routes.length,12);
 for(const route of routes){const html=read(route+'/index.html');assert.match(html,/TFH \/ NYC/);assert.ok(html.includes('canonical" href="https://tech-from-here-fashion-week.vercel.app/'+route));assert.doesNotMatch(html,/TFH \/ LDN/);}
 assert.match(read('index.html'),/href="\/new-york">NYC edition/);
});
test('New York has twenty-one bounded claim records and exact sources',()=>{
 const claims=data('new-york/data/claims.json'),sources=data('new-york/data/sources.json'),ids=new Set(sources.map(s=>s.id));
 assert.equal(claims.length,21);assert.equal(sources.length,19);assert.equal(ids.size,19);assert.equal(new Set(sources.map(s=>s.url)).size,19);
 for(let d=1;d<=7;d++){const set=claims.filter(c=>c.day===d);assert.equal(set.length,3);assert.deepEqual(set.map(c=>c.temporalState),['Then','Now','Next']);}
 for(const c of claims){assert.match(c.id,/^NYC-[A-Z]+-(THEN|NOW|NEXT)$/);assert.ok(c.wording.length>70);assert.ok(c.citations.every(id=>ids.has(id)));if(c.state==='unresolved')assert.match(c.note,/Bounded/);}
 for(const s of sources){assert.match(s.url,/^https:\/\//);assert.doesNotMatch(s.url,/cfda\.com\.com/);assert.ok(s.rights.length>8);}
});
test('seven New York kits contain all substantive platform outputs',()=>{
 const fingerprints=new Set();
 for(let d=1;d<=7;d++){const k=data('new-york/kits/day-'+d+'.json'),md=read('new-york/kits/day-'+d+'.md');assert.equal(k.day,d);assert.equal(k.claims.length,3);assert.equal(k.vertical.spokenScript.length,7);assert.equal(k.carousel.length,7);assert.equal(k.longform.sections.length,4);assert.ok(k.platforms.instagram.length>150);assert.ok(k.platforms.linkedin.length>250);assert.ok(k.platforms.youtube.includes('/new-york/day/'));assert.ok(k.selectedObject.sourceId);assert.ok(k.openReporting.length>80);assert.equal(k.humanGates.length,4);assert.ok(md.length>2500);const f=JSON.stringify([k.hook,k.longform,k.interactive,k.selectedObject]);assert.ok(!fingerprints.has(f));fingerprints.add(f);}
});
test('New York media and rights posture is explicit',()=>{
 const objects=read('new-york/objects/index.html');assert.equal((objects.match(/<img /g)||[]).length,1);assert.equal((objects.match(/youtube-nocookie/g)||[]).length,1);assert.match(objects,/Library of Congress/);assert.ok(fs.statSync(path.join(root,'assets/nyc/liz-claiborne-model.jpg')).size>300000);assert.doesNotMatch(objects,/AI-generated|synthetic hero/i);
});
test('sitemap contains both city systems',()=>{
 const map=read('sitemap.xml');assert.match(map,/<loc>https:\/\/tech-from-here-fashion-week.vercel.app\/day\/07-memory<\/loc>/);for(const route of routes)assert.ok(map.includes('<loc>https://tech-from-here-fashion-week.vercel.app/'+route+'</loc>'));
});
