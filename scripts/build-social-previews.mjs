import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root=path.resolve(import.meta.dirname,'..');
const cities=['london','new-york','milan','paris','shanghai','copenhagen','tokyo'];
const out=path.join(root,'assets','social');
fs.mkdirSync(out,{recursive:true});
for(const city of cities){
  for(let day=1;day<=7;day++){
    const source=path.join(root,'assets','evidence',`${city}-day-${day}.svg`);
    const target=path.join(out,`${city}-day-${day}.jpg`);
    if(!fs.existsSync(source))throw new Error(`Missing evidence plate: ${source}`);
    await sharp(source,{density:144}).resize(1200,630,{fit:'cover',position:'centre'}).jpeg({quality:90,mozjpeg:true}).toFile(target);
  }
}
console.log('Rendered 49 route-specific 1200×630 social previews.');
