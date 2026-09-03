import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const readJson=f=>JSON.parse(fs.readFileSync(path.join(root,f)));
const claims=readJson('data/claims.json');
const sources=readJson('data/sources.json');
const trail=readJson('data/search-trail.json');
const sourceIds=new Set(sources.map(s=>s.id));
const gapIds=new Set(trail.map(g=>g.id));
const days=['01-access','02-stage','03-capture','04-circulation','05-backstage','06-commerce','07-memory'];
const routes=['.','chronology','search','systems','objects','field-notes','watch','sources','rights','accessibility','about','kits',...days.map(d=>`day/${d}`)];
const routePaths=['/','/chronology','/search','/systems','/objects','/field-notes','/watch','/sources','/rights','/accessibility','/about','/kits',...days.map(d=>`/day/${d}`)];
const canon=html=>html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];

test('route and canonical contract',()=>{
 assert.equal(routes.length,19);
 const seen=new Set();
 routes.forEach((route,i)=>{
  const f=path.join(root,route,'index.html');assert.ok(fs.existsSync(f),`${route} exists`);
  const html=fs.readFileSync(f,'utf8');assert.match(html,/<!doctype html>/i);assert.match(html,/<main>/);assert.match(html,/<nav/);assert.doesNotMatch(html,/noindex/i);
  const expected=`https://tech-from-here-fashion-week.vercel.app${routePaths[i]}`;
  assert.equal(canon(html),expected,`${route} canonical`);assert.ok(!seen.has(canon(html)),`unique canonical: ${route}`);seen.add(canon(html));
 });
 assert.equal(seen.size,19);
 const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');for(const p of routePaths)assert.ok(sitemap.includes(`<loc>https://tech-from-here-fashion-week.vercel.app${p}</loc>`));
});

test('alternate hostname preserves all route-specific canonicals',()=>{
 const build=path.join(root,'scripts/build.mjs'),alt='https://signal-seam.example.org';
 try{
  const result=spawnSync(process.execPath,[build],{cwd:root,env:{...process.env,PUBLIC_SITE_URL:alt},encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  routes.forEach((route,i)=>assert.equal(canon(fs.readFileSync(path.join(root,route,'index.html'),'utf8')),`${alt}${routePaths[i]}`));
  assert.match(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),new RegExp(`${alt.replace(/[.]/g,'\\.')}\/day\/07-memory`));
 } finally {
  const restore=spawnSync(process.execPath,[build],{cwd:root,env:{...process.env,PUBLIC_SITE_URL:'https://tech-from-here-fashion-week.vercel.app'},encoding:'utf8'});assert.equal(restore.status,0,restore.stderr);
 }
});

test('21 point-of-claim evidence records',()=>{
 assert.equal(claims.length,21);
 for(const c of claims){
  assert.match(c.id,/^LON-[A-Z]+-(THEN|NOW|NEXT)$/);assert.ok(Number.isInteger(c.day)&&c.day>=1&&c.day<=7);
  assert.ok(['Then','Now','Next'].includes(c.temporalState));assert.ok(['verified fact','attributed claim','editorial inference','proposal','unresolved'].includes(c.state));assert.ok(['high','medium','low'].includes(c.confidence));
  assert.ok(c.wording.length>40);assert.ok(c.citations.length>=1);assert.ok(c.citations.every(id=>sourceIds.has(id)));assert.ok(c.rights.length>8);
  assert.doesNotMatch(c.wording,/\b(first ever|revolutionary|will transform|democratized)\b/i);assert.doesNotMatch(c.rights,/publicly available therefore reusable/i);
  if(c.state==='unresolved'){assert.ok(c.gapIds?.length,`${c.id} maps to gap`);assert.ok(c.gapIds.every(id=>gapIds.has(id)));assert.match(c.wording,/bounded/i);}
 }
 for(let d=1;d<=7;d++){const cs=claims.filter(c=>c.day===d);assert.equal(cs.length,3);for(const state of ['Then','Now','Next'])assert.equal(cs.filter(c=>c.temporalState===state).length,1);}
});

test('source integrity and repaired official URLs',()=>{
 assert.equal(new Set(sources.map(s=>s.id)).size,sources.length);
 assert.equal(new Set(sources.map(s=>s.url)).size,sources.length,'source URLs cannot duplicate');
 const expected={
  'SRC-BFC-PRESS':'https://www.britishfashioncouncil.co.uk/news',
  'SRC-MET-OA':'https://www.metmuseum.org/policies/terms-and-conditions#openaccess',
  'SRC-EU-ESPR':'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1781',
  'SRC-EQUITY':'https://www.equity.org.uk/get-involved/networks/models-network'
 };
 for(const [id,url] of Object.entries(expected))assert.equal(sources.find(s=>s.id===id)?.url,url,`${id} canonical source`);
 const forbidden=['/pressreleases','/policies/open-access','ecodesign-sustainable-products-regulation_en','/networks/equity-models-network','/eli/reg/2024/1781/oj'];
 for(const s of sources){assert.match(s.url,/^https:\/\//);assert.ok(['2026-08-29','2026-09-03'].includes(s.accessed));assert.ok(s.rights.length>5);for(const dead of forbidden)assert.ok(!s.url.includes(dead),`${s.id} cannot restore known-dead URL`);}
 const esp=claims.find(c=>c.id==='LON-COMMERCE-NEXT'),espSource=sources.find(s=>s.id==='SRC-EU-ESPR');assert.equal(esp.state,'verified fact');assert.ok(esp.citations.includes('SRC-EU-ESPR'));assert.equal(espSource.documentId,'CELEX:32024R1781');assert.match(espSource.title,/2024\/1781.*32024R1781/);
});

test('negative searches are reproducible and mapped',()=>{
 assert.equal(trail.length,7);assert.equal(gapIds.size,7);
 for(const g of trail){assert.match(g.id,/^G-[A-Z]+-\d{2}$/);assert.equal(g.status,'open');assert.ok(g.scope.length>20);assert.equal(g.searchedAt,'2026-08-29');assert.ok(g.operator);assert.ok(g.searches.length>=2);assert.ok(g.needed.length>20);
  for(const s of g.searches){assert.ok(sourceIds.has(s.surfaceId));assert.ok(s.query.length>8);assert.ok(s.resultUrls.length);assert.ok(s.resultUrls.every(u=>u.startsWith('https://')));assert.ok(s.decision.length>20);}
 }
 for(const c of claims.filter(c=>c.state==='unresolved'))for(const id of c.gapIds)assert.ok(trail.some(g=>g.id===id));
});

test('seven production kits contain finished, distinct deliverables',()=>{
 const fingerprints=new Set();
 for(let d=1;d<=7;d++){
  const jsonPath=path.join(root,'kits',`day-${d}.json`),mdPath=path.join(root,'kits',`day-${d}.md`);assert.ok(fs.existsSync(jsonPath));assert.ok(fs.existsSync(mdPath));
  const k=JSON.parse(fs.readFileSync(jsonPath,'utf8')),md=fs.readFileSync(mdPath,'utf8');assert.equal(k.day,d);assert.equal(k.claimIds.length,3);assert.equal(Object.keys(k.evidenceState).length,3);assert.ok(k.editorialHook.length>25);assert.ok(k.longformOutline.length>70);assert.ok(k.verticalScriptBrief.length>60);assert.equal(k.carouselFrames.length,5);assert.ok(k.interactiveSpecification.length>60);assert.equal(k.interviewTargets.length,3);assert.ok(k.selectedObject?.sourceId);assert.ok(k.selectedObject?.caption.length>60);assert.ok(k.objectAndRightsBrief.length>60);assert.ok(k.teachingPrompt.length>40);assert.ok(k.communityCallout.length>50);assert.ok(k.openGapIds.every(id=>gapIds.has(id)));assert.equal(k.releaseGates.length,4);assert.match(k.status,/remain open/);assert.match(k.mediaPolicy,/selected documentary object/);
  assert.ok(k.finishedLongform.opening.length>120);assert.equal(k.finishedLongform.sections.length,4);assert.equal(k.finishedVertical.spokenScript.length,7);assert.equal(k.finishedCarousel.length,7);assert.ok(k.platformCopy.instagram.length>150);assert.ok(k.platformCopy.linkedin.length>250);assert.match(k.platformCopy.youtubeDescription,/Claims, rights treatments, transcript and sources/);assert.match(md,/## Finished long-form copy/);assert.match(md,/## Finished vertical script/);assert.match(md,/## Finished seven-frame carousel/);assert.ok(md.length>3000,`day ${d} production markdown depth`);
  const fingerprint=JSON.stringify([k.editorialHook,k.longformOutline,k.verticalScriptBrief,k.carouselFrames,k.interactiveSpecification,k.interviewTargets,k.objectAndRightsBrief,k.teachingPrompt,k.communityCallout]);assert.ok(!fingerprints.has(fingerprint),`day ${d} cannot duplicate another kit`);fingerprints.add(fingerprint);
 }
 assert.equal(fingerprints.size,7);
});

test('media and public release posture',()=>{
 const all=routes.map(r=>fs.readFileSync(path.join(root,r,'index.html'),'utf8')).join('\n');assert.doesNotMatch(all,/<img\b/i,'no uncleared imagery');assert.doesNotMatch(all,/AI-generated hero|synthetic hero/i);assert.match(fs.readFileSync(path.join(root,'robots.txt'),'utf8'),/Allow: \//);assert.equal((all.match(/youtube-nocookie\.com\/embed\//g)||[]).length,8,'four embeds appear on their day and object-desk routes');assert.match(all,/AUTHORIZED EMBED via YouTube player/);
 assert.match(all,/https:\/\/github\.com\/rn-collins\/tech-from-here-fashion-week\/issues\/new\?template=correction-or-takedown\.yml/);
 assert.ok(fs.existsSync(path.join(root,'.github','ISSUE_TEMPLATE','correction-or-takedown.yml')),'public correction form exists');
});
