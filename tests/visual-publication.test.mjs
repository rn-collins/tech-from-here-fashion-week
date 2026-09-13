import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..');
const cities=['london','new-york','milan','paris','shanghai','copenhagen','tokyo'];
const route=(city,day)=>`${city==='london'?'':city+'/'}publication/day-${day}/index.html`;

test('49 publication routes keep generated diagrams off the public story surface and retain unique social previews',async()=>{
  const previewHashes=new Set();
  for(const city of cities)for(let day=1;day<=7;day++){
    const html=fs.readFileSync(path.join(root,route(city,day)),'utf8');
    const svg=`/assets/evidence/${city}-day-${day}.svg`,jpg=`/assets/social/${city}-day-${day}.jpg`;
    assert.doesNotMatch(html,new RegExp(`<img[^>]+src="${svg}"`));
    assert.match(html,new RegExp(`<meta property="og:image" content="https://tech-from-here-fashion-week\\.vercel\\.app${jpg}"`));
    assert.match(html,/<meta property="og:image:width" content="1200">/);
    assert.match(html,/<meta property="og:image:height" content="630">/);
    assert.match(html,/non-documentary diagram bound to the route claim ledger/);
    const jpgFile=path.join(root,jpg.slice(1));
    previewHashes.add(crypto.createHash('sha256').update(fs.readFileSync(jpgFile)).digest('hex'));
    const meta=await sharp(jpgFile).metadata(); assert.equal(meta.width,1200); assert.equal(meta.height,630); assert.equal(meta.format,'jpeg');
  }
  assert.equal(previewHashes.size,49);
});

test('three utility diagrams remain available as internal editable source assets',()=>{
  for(const file of ['seven-city-comparison.svg','chronology-state-map.svg','seven-system-relay.svg']){
    assert.ok(fs.existsSync(path.join(root,'assets','evidence',file)));
  }
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
