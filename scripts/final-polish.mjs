import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const media=JSON.parse(fs.readFileSync(path.join(root,'data/city-media.json'),'utf8'));
const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const figure=(m,compact=false)=>`<figure class="documentary-object${compact?' compact':''}"><img src="${m.file}" alt="${esc(m.alt)}" width="1200" height="900" loading="lazy" decoding="async"><figcaption><b>${esc(m.title)}</b><span>${esc(m.caption)}</span><small>${esc(m.creator)} · ${esc(m.date)} · <a href="${m.source}">source ↗</a> · <a href="${m.licenseUrl}">${esc(m.license)}</a></small></figcaption></figure>`;
for(const m of media){
 const homePath=path.join(root,m.slug==='london'?'':m.slug,'index.html');
 if(!fs.existsSync(homePath))continue;
 let html=fs.readFileSync(homePath,'utf8');
 html=html.replace(/Evidence preview/gi,'Documentary edition').replace(/evidence preview, not a completed historical exhibition/gi,'public evidence publication with unresolved reporting fields');
 if(!html.includes(m.file))html=html.replace('</main>',`<section class="city-witness">${figure(m)}</section></main>`);
 fs.writeFileSync(homePath,html);
}
const cityIndex=path.join(root,'cities','index.html');let index=fs.readFileSync(cityIndex,'utf8');
if(!index.includes('city-photo-strip'))index=index.replace('</main>',`<section class="city-photo-strip" aria-label="Documentary city witnesses">${media.map(m=>`<a href="/${m.slug==='london'?'':m.slug}"><img src="${m.file}" alt="${esc(m.alt)}" width="480" height="640" loading="lazy"><span>${esc(m.city)}</span></a>`).join('')}</section></main>`);
fs.writeFileSync(cityIndex,index);
const objectsPath=path.join(root,'objects','index.html');let objects=fs.readFileSync(objectsPath,'utf8');
if(!objects.includes('city-media-gallery'))objects=objects.replace('</main>',`<section class="city-media-gallery"><header><p>Seven lawful documentary witnesses</p><h2>Fashion Week, materially present.</h2><p>These works are installed under explicit Creative Commons terms. Each caption limits what the image can establish; none substitutes for a claim source.</p></header>${media.map(m=>figure(m,true)).join('')}</section></main>`);
fs.writeFileSync(objectsPath,objects);
fs.writeFileSync(path.join(root,'assets','media.css'),`.city-photo-strip{display:grid;grid-template-columns:repeat(7,1fr);background:#111;color:#f4f0e8}.city-photo-strip a{position:relative;min-height:440px;overflow:hidden;border-right:1px solid #f4f0e855}.city-photo-strip img{width:100%;height:100%;object-fit:cover;filter:grayscale(.18) contrast(1.04);transition:transform .45s ease}.city-photo-strip span{position:absolute;inset:auto 0 0;padding:1rem;background:linear-gradient(transparent,#000c);font:12px Arial,sans-serif;text-transform:uppercase}.city-photo-strip a:hover img{transform:scale(1.035)}.city-witness{border-top:1px solid}.city-media-gallery>header{padding:6vw 4vw}.city-media-gallery>header h2{font:clamp(48px,8vw,120px)/.9 Georgia,serif;font-weight:400;max-width:10ch}@media(max-width:900px){.city-photo-strip{grid-template-columns:repeat(2,1fr)}.city-photo-strip a{min-height:360px}.city-photo-strip a:last-child{grid-column:1/-1}}@media(max-width:520px){.city-photo-strip{grid-template-columns:1fr}.city-photo-strip a:last-child{grid-column:auto}.city-photo-strip a{min-height:72svh}}`);
for(const f of ['index.html','cities/index.html','objects/index.html','new-york/index.html','milan/index.html','paris/index.html','shanghai/index.html','copenhagen/index.html','tokyo/index.html']){
 const file=path.join(root,f);let html=fs.readFileSync(file,'utf8');
 if(!html.includes('/assets/media.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/publication.css"><link rel="stylesheet" href="/assets/media.css"></head>');
 fs.writeFileSync(file,html);
}
console.log('Installed seven licensed documentary city witnesses and final gallery styling');
