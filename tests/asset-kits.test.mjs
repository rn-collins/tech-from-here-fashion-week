import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const cities=['london','new-york','milan','paris','shanghai','copenhagen','tokyo'];
const seen=new Set();
for(const city of cities)for(let day=1;day<=7;day++)test(`${city} day ${day} has a complete, distinct asset kit`,()=>{
 const dir=city==='london'?'':city+'/';
 const file=path.join(root,dir,'asset-kits',`day-${day}.json`);
 assert.ok(fs.existsSync(file)); const k=JSON.parse(fs.readFileSync(file));
 assert.equal(k.instagram.carouselA.frames.length,8); assert.equal(k.instagram.carouselB.frames.length,8);
 assert.ok(k.verticalVideo.beats.length>=3); assert.ok(k.youtube.timeline.length>=3);
 assert.equal(k.pinterest.pins.length,2); assert.equal(k.inlineMedia.beehiiv.length,2); assert.equal(k.inlineMedia.linkedin.length,2);
 assert.ok(k.interactiveResources.resources.length>=3); assert.ok(k.downloads.length>=5); assert.ok(k.rightsBoundary.includes('No reproduction right'));
 for(const seq of [k.instagram.carouselA.frames,k.instagram.carouselB.frames])for(const f of seq){for(const key of ['asset','source','crop','caption','credit','alt','rights'])assert.ok(f[key],`${key} missing`)}
 const sig=JSON.stringify(k.instagram); assert.ok(!seen.has(sig),'cloned Instagram sequence'); seen.add(sig);
 assert.ok(fs.existsSync(path.join(root,k.assets.originalEvidenceGraphic.file.slice(1))));
 const html=fs.readFileSync(path.join(root,dir,'publication',`day-${day}`,'index.html'),'utf8'); assert.match(html,/PUBLICATION ASSET KIT/); assert.match(html,/Asset kit JSON/);
 const dispositions=k.candidateDestinations; assert.ok(dispositions.length>0); for(const d of dispositions)assert.ok(d.destinations.length||d.exclusion,'candidate without destination or exclusion');
});
