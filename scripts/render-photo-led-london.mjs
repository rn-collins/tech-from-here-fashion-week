import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function wrap(value, max = 31) {
  const words = String(value).replace(/https?:\/\/\S+/g, '').trim().split(/\s+/), lines=[]; let line='';
  for (const word of words) { if (line && `${line} ${word}`.length > max) { lines.push(line); line=word; } else line += `${line?' ':''}${word}`; }
  if (line) lines.push(line); return lines;
}
function overlay(kit, frame, variant) {
  const lines=wrap(frame.slideCopy), size=lines.length>8?30:lines.length>6?34:lines.length>4?40:lines.length>3?44:54, y=1350-(lines.length*size*1.2)-125;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".42" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".92"/></linearGradient></defs><rect y="430" width="1080" height="920" fill="url(#g)"/><g fill="#fff" font-family="Arial,Helvetica,sans-serif"><text x="64" y="72" font-size="22" font-weight="700" letter-spacing="3">TECH FROM HERE · LONDON · DAY ${String(kit.day).padStart(2,'0')} · ${variant}${frame.frame}</text>${lines.map((l,i)=>`<text x="64" y="${y+i*size*1.2}" font-size="${size}" font-family="Georgia,serif">${esc(l)}</text>`).join('')}<text x="64" y="1300" font-size="18">${esc(frame.creator)} · ${esc(frame.license)}</text></g></svg>`);
}

for (let day=1; day<=7; day++) {
  const kit=JSON.parse(fs.readFileSync(path.join(root,`asset-kits/day-${day}.json`))), base=path.join(root,`exports/london/day-${day}`);
  const rendered=[];
  for (const variant of ['A','B']) for (const frame of kit.instagram[`carousel${variant}`].frames) {
    const dest=path.join(base,`instagram-${variant.toLowerCase()}-${String(frame.frame).padStart(2,'0')}.png`);
    await sharp(path.join(root,frame.asset.slice(1))).rotate().resize(1080,1350,{fit:'contain',background:'#111111',withoutEnlargement:true}).extend({top:0,bottom:0,left:0,right:0,background:'#111111'}).composite([{input:overlay(kit,frame,variant)}]).png({quality:92,compressionLevel:9}).toFile(dest);
    rendered.push({file:`/exports/london/day-${day}/${path.basename(dest)}`,kind:`Instagram carousel ${variant}`,width:1080,height:1350,photoLed:true,assetId:frame.assetId,sourcePageUrl:frame.sourcePageUrl,directAssetUrl:frame.directAssetUrl,creator:frame.creator,institution:frame.institution,license:frame.license,licenseUrl:frame.licenseUrl,sourceWidth:frame.sourceWidth,sourceHeight:frame.sourceHeight,cropSuitability:frame.cropSuitability,rights:frame.rights,credit:frame.credit,alt:frame.alt});
  }
  for (const variant of ['a','b']) {
    const zip=path.join(base,`instagram-carousel-${variant}.zip`); if(fs.existsSync(zip)) fs.rmSync(zip);
    execFileSync('zip',['-j','-q',zip,...Array.from({length:8},(_,i)=>path.join(base,`instagram-${variant}-${String(i+1).padStart(2,'0')}.png`))]);
  }
  const metaFile=path.join(base,'metadata.json'), meta=JSON.parse(fs.readFileSync(metaFile));
  meta.files=[...rendered,...meta.files.slice(16)]; meta.version='2.0 photo-led London exports'; meta.checked='2026-09-13';
  fs.writeFileSync(metaFile,JSON.stringify(meta,null,2)+'\n');
}
const manifestFile=path.join(root,'exports/manifest.json'), manifest=JSON.parse(fs.readFileSync(manifestFile));
manifest.checked='2026-09-13'; manifest.photoLedCarouselFrames=112;
for(const set of manifest.sets.filter(s=>s.packageId.startsWith('london-'))){const day=Number(set.packageId.split('-day-')[1]);set.files=JSON.parse(fs.readFileSync(path.join(root,`exports/london/day-${day}/metadata.json`))).files;set.version='2.0 photo-led London exports';}
fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n');
console.log('Rendered 112 photo-led London exports and rebuilt 14 editable ZIP archives.');
