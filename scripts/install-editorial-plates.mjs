import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const cssFile=path.join(root,'assets','style.css');
let css=fs.readFileSync(cssFile,'utf8').replace(/\/\* editorial-plate:start \*\/[\s\S]*?\/\* editorial-plate:end \*\//g,'').trimEnd();
css+='\n/* editorial-plate:start */.editorial-plate{margin:3rem auto;max-width:100rem}.editorial-plate img{display:block;width:100%;height:auto}.editorial-plate figcaption{font-size:.82rem;line-height:1.45;margin-top:.75rem;max-width:70ch}.editorial-plate figcaption b{display:block;text-transform:uppercase;letter-spacing:.08em}.editorial-plate figcaption span{display:block;opacity:.76}@media(max-width:720px){.editorial-plate{margin:2rem 0}.editorial-plate figcaption{font-size:.78rem}}/* editorial-plate:end */\n';
fs.writeFileSync(cssFile,css);
const specs=[
  ['comparison/index.html','seven-city-comparison.svg','Seven Fashion Week evidence lenses arranged around a shared public-evidence boundary.','Seven lenses. No ranking.','This original comparison graphic shows editorial lenses rather than measurements; position and line length do not encode rank or magnitude.'],
  ['chronology/index.html','chronology-state-map.svg','Then, Now and Next shown as three distinct evidence burdens.','Three states, three burdens.','This original chronology graphic treats Next as a documented trajectory or open assignment—not a prediction. Box size does not encode certainty or progress.'],
  ['systems/index.html','seven-system-relay.svg','Access, stage, capture, circulation, backstage, commerce and memory linked as a reporting relay.','Seven-system relay.','This original systems graphic is an editorial map, not a quantitative model; spacing does not encode influence, speed or value.']
];
for(const [rel,image,alt,title,caption] of specs){
  const file=path.join(root,rel); let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<figure class="editorial-plate"[\s\S]*?<\/figure>/g,'');
  const figure=`<figure class="editorial-plate"><img src="/assets/evidence/${image}" alt="${alt}" width="1600" height="1000" loading="eager" decoding="async"><figcaption><b>${title}</b><span>${caption}</span></figcaption></figure>`;
  html=html.replace(/(<header class="pagehead"[\s\S]*?<\/header>)/,`$1${figure}`);
  fs.writeFileSync(file,html);
}
console.log('Installed three original editorial evidence plates.');
