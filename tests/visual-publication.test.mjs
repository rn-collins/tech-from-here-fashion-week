import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const cities=['london','new-york','milan','paris','shanghai','copenhagen','tokyo'];
const route=(city,day)=>`${city==='london'?'':city+'/'}publication/day-${day}/index.html`;

test('49 publication routes install unique accessible evidence plates and social previews',async()=>{
  const evidenceHashes=new Set(),previewHashes=new Set();
  for(const city of cities)for(let day=1;day<=7;day++){
    const html=fs.readFileSync(path.join(root,route(city,day)),'utf8');
    const svg=`/assets/evidence/${city}-day-${day}.svg`,jpg=`/assets/social/${city}-day-${day}.jpg`;
    assert.match(html,new RegExp(`<img[^>]+src="${svg}"[^>]+alt="[^"]+"[^>]+width="1600"[^>]+height="1000"`));
    assert.match(html,new RegExp(`<meta property="og:image" content="https://tech-from-here-fashion-week\\.vercel\\.app${jpg}"`));
    assert.match(html,/<meta property="og:image:width" content="1200">/);
    assert.match(html,/<meta property="og:image:height" content="630">/);
    assert.match(html,/non-documentary diagram bound to the route claim ledger/);
    const svgBytes=fs.readFileSync(path.join(root,svg.slice(1))),jpgFile=path.join(root,jpg.slice(1));
    evidenceHashes.add(crypto.createHash('sha256').update(svgBytes).digest('hex'));
    previewHashes.add(crypto.createHash('sha256').update(fs.readFileSync(jpgFile)).digest('hex'));
    const meta=await sharp(jpgFile).metadata(); assert.equal(meta.width,1200); assert.equal(meta.height,630); assert.equal(meta.format,'jpeg');
    assert.match(svgBytes.toString(),/not a depiction of an event|original diagram/i);
  }
  assert.equal(evidenceHashes.size,49); assert.equal(previewHashes.size,49);
});

test('three editorial utility routes install precise responsive evidence graphics',()=>{
  const items=[['comparison','seven-city-comparison'],['chronology','chronology-state-map'],['systems','seven-system-relay']];
  for(const [routeName,file] of items){
    const html=fs.readFileSync(path.join(root,routeName,'index.html'),'utf8');
    assert.match(html,new RegExp(`<figure class="editorial-plate"><img src="/assets/evidence/${file}\\.svg" alt="[^"]+" width="1600" height="1000"`));
    assert.match(html,/non-quantitative|does not encode|do not encode|not a quantitative/i);
  }
  const css=fs.readFileSync(path.join(root,'assets/style.css'),'utf8');
  assert.match(css,/\.editorial-plate img\{display:block;width:100%;height:auto\}/);
  assert.match(css,/@media\(max-width:720px\).*\.editorial-plate/s);
});

test('generated plates are original evidence graphics, never documentary imagery',()=>{
  const text=fs.readFileSync(path.join(root,'data','media-assignment-matrix.json'),'utf8');
  assert.doesNotMatch(text,/AI-generated|synthetic documentary/i);
  for(const file of ['seven-city-comparison.svg','chronology-state-map.svg','seven-system-relay.svg']){
    const svg=fs.readFileSync(path.join(root,'assets','evidence',file),'utf8');
    assert.match(svg,/non-quantitative|not a measurement|does not encode/i);
    assert.doesNotMatch(svg,/<image\b|data:image/);
  }
});
