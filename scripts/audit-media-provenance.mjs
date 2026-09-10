import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const walk=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${d}/${e.name}`):[`${d}/${e.name}`]);
const cityMedia=JSON.parse(read('data/city-media.json'));
const records=[];

for(const m of cityMedia){
  const local=m.file.slice(1);
  records.push({
    id:`DOC-${m.slug.toUpperCase()}`,
    localPath:m.file,
    sha256:hash(local),
    mediaClass:'found-documentary-photograph',
    title:m.title,creator:m.creator,date:m.date,institution:'Wikimedia Commons',
    canonicalUrl:m.source,rights:m.license,rightsUrl:m.licenseUrl,
    reuseDisposition:'installed-local-copy-with-attribution',
    relevance:`Directly documents ${m.city} Fashion Week or its public operating environment. It is a recurring city witness only; it is not day-specific proof. ${m.caption}`,
    aiStatus:'not-ai-generated',
    aiEvidence:`The canonical repository record identifies a photographer/rights holder, capture date, license and file history. The dated photographic record is treated as documentary context, not as proof of every depicted event or claim.`,
    modification:'Repository copy may be resized and recompressed for web delivery; no generative fill, synthetic content or documentary alteration is authorized or claimed.',
    alt:m.alt,credit:`${m.creator} · ${m.date} · ${m.license} · web-delivery resize/compression may apply`,
    verified:'2026-09-09'
  });
}

records.push({
  id:'DOC-NYC-LOC-CLAIBORNE',localPath:'/assets/nyc/liz-claiborne-model.jpg',
  sha256:hash('assets/nyc/liz-claiborne-model.jpg'),mediaClass:'found-archival-photograph',
  title:'Liz Claiborne with model',creator:'Bernard Gotfryd',date:'1982',
  institution:'Library of Congress, Bernard Gotfryd photograph collection',
  canonicalUrl:'https://www.loc.gov/resource/gtfy.00717/',rights:'No known restrictions on publication per item record',
  rightsUrl:'https://www.loc.gov/pictures/collection/gtfy/rights.html',reuseDisposition:'installed-local-access-copy-with-library-credit',
  relevance:'Directly depicts New York designer Liz Claiborne beside a model and is installed only in the New York capture/object context; it does not document NYFW or RUNWAY360.',
  aiStatus:'not-ai-generated',aiEvidence:'Library of Congress archival item from 1982 with named photographer, collection provenance and physical-negative record; predates generative-image systems.',
  modification:'Repository access copy is resized for web delivery; no generative fill, synthetic content or documentary alteration is authorized or claimed.',alt:'Designer Liz Claiborne stands beside a model wearing one of her garments in New York in 1982.',
  credit:'Bernard Gotfryd · Library of Congress · 1982 · no known restrictions',verified:'2026-09-09'
});

const embeds=[
 ['PH3vHLeAyjs','LFW Digital Highlights, June 2020','British Fashion Council','London / circulation'],
 ['S5dwtat6Wp8','London Fashion Week Highlights February 2018 — 360 VR','British Fashion Council','London / stage'],
 ['V0yz5_ZB8AE','London Fashion Week June 2021 — Everything Is Temporary','British Fashion Council','London / capture'],
 ['vRJbrfgrAUs','Designer Fashion Fund Episode 3: London Fashion Week','British Fashion Council','London / backstage'],
 ['47VXPor-deI','Official CFDA RUNWAY360 webinar','Council of Fashion Designers of America','New York / circulation'],
 ['PKMQCwTfcaE','CNMI multibrand virtual showroom','Camera Nazionale della Moda Italiana','Milan / circulation']
];
for(const [id,title,institution,relevance] of embeds) records.push({
  id:`EMBED-YT-${id}`,localPath:null,mediaClass:'official-authorized-video-embed',title,creator:institution,date:'see canonical record',institution,
  canonicalUrl:`https://www.youtube.com/watch?v=${id}`,rights:'YouTube authorized player only; no download, frame extraction or derivative reuse',
  rightsUrl:'https://www.youtube.com/static?template=terms',reuseDisposition:'privacy-enhanced-authorized-embed',
  relevance:`Directly relevant official/institutional demonstration for ${relevance}; used as a player, not downloaded evidence.`,
  aiStatus:'not-presented-as-generated-visual-evidence',aiEvidence:'Published on the named institution\'s official channel and used only through YouTube\'s player. No claim is made about every production technique within the video.',
  alt:title,credit:`${institution} · YouTube authorized embed`,verified:'2026-09-09'
});

for(const p of walk('assets/evidence').filter(p=>p.endsWith('.svg'))){
  const name=path.basename(p,'.svg');
  const match=name.match(/^(london|new-york|milan|paris|shanghai|copenhagen|tokyo)-day-(\d)$/);
  const sourcePath=match?`/asset-kits/${match[2]}.json`:null;
  records.push({id:`GRAPHIC-${name.toUpperCase()}`,localPath:`/${p}`,sha256:hash(p),mediaClass:'original-editorial-evidence-graphic',
    title:name.replaceAll('-',' '),creator:'Rayven-Nikkita Collins',date:'2026',institution:'Tech From Here × Fashion Week',canonicalUrl:sourcePath,
    rights:'© 2026 Rayven-Nikkita Collins',rightsUrl:null,reuseDisposition:'installed-original-editorial-work',
    relevance:match?`Route-specific non-quantitative evidence diagram for ${match[1]}, day ${match[2]}; its propositions trace to the page claim cards and asset-kit source list.`:'Site-level non-quantitative editorial map; labels and limits are visible in its caption.',
    aiStatus:'not-ai-generated',aiEvidence:'Deterministically rendered from repository source code and claim data; SVG contains authored vector text/shapes and no embedded raster image.',
    alt:`Original editorial evidence graphic: ${name.replaceAll('-',' ')}.`,credit:'Original editorial evidence graphic · © 2026 Rayven-Nikkita Collins',verified:'2026-09-09'});
}

for(const p of walk('assets/social').filter(p=>p.endsWith('.jpg'))){
  const name=path.basename(p,'.jpg');
  const m=name.match(/^(london|new-york|milan|paris|shanghai|copenhagen|tokyo)-day-(\d)$/);
  records.push({id:`SOCIAL-${name.toUpperCase()}`,localPath:`/${p}`,sha256:hash(p),mediaClass:'derived-editorial-social-preview',title:`${name.replaceAll('-',' ')} social preview`,creator:'Rayven-Nikkita Collins',date:'2026',institution:'Tech From Here × Fashion Week',canonicalUrl:`/${m?.[1]}/publication/day-${m?.[2]}`.replace('/london/','/'),rights:'© 2026 Rayven-Nikkita Collins',rightsUrl:null,reuseDisposition:'installed-original-editorial-work',relevance:`Route-specific social rendering of the ${m?.[1]} day ${m?.[2]} evidence graphic; not documentary photography.`,aiStatus:'not-ai-generated',aiEvidence:'Deterministically rasterized by scripts/build-social-previews.mjs from the corresponding repository-authored SVG; source and output hashes are release-tested.',alt:`Original non-documentary evidence preview for ${m?.[1]}, day ${m?.[2]}.`,credit:'Original editorial preview · © 2026 Rayven-Nikkita Collins',verified:'2026-09-09'});
}

for(const p of walk('exports').filter(p=>p.endsWith('.png'))){
  const m=p.match(/^exports\/(london|new-york|milan|paris|shanghai|copenhagen|tokyo)\/day-(\d)\/(.+)\.png$/);
  if(!m) throw new Error(`Unclassified export: ${p}`);
  records.push({id:`EXPORT-${m[1].toUpperCase()}-D${m[2]}-${m[3].toUpperCase()}`,localPath:`/${p}`,sha256:hash(p),mediaClass:'derived-platform-editorial-frame',title:`${m[1]} day ${m[2]} ${m[3]}`,creator:'Rayven-Nikkita Collins',date:'2026',institution:'Tech From Here × Fashion Week',canonicalUrl:`/${m[1]}/publication/day-${m[2]}`.replace('/london/','/'),rights:'© 2026 Rayven-Nikkita Collins',rightsUrl:null,reuseDisposition:'downloadable-original-editorial-work',relevance:`Platform-tailored frame for the ${m[1]} day ${m[2]} package; typography/evidence graphic, not a found documentary image.`,aiStatus:'not-ai-generated',aiEvidence:'Deterministically rendered from repository-authored package data and vector layout code; no generative-image system or synthetic documentary asset is used.',alt:`Editorial platform frame for ${m[1]}, day ${m[2]}: ${m[3]}.`,credit:'Original editorial frame · © 2026 Rayven-Nikkita Collins',verified:'2026-09-09'});
}

const byPath=new Map(records.filter(r=>r.localPath).map(r=>[r.localPath,r]));
if(byPath.size!==records.filter(r=>r.localPath).length) throw new Error('Duplicate local media provenance path');
for(const r of records){
  for(const key of ['id','mediaClass','title','creator','institution','rights','reuseDisposition','relevance','aiStatus','aiEvidence','alt','credit','verified']) if(!r[key]) throw new Error(`${r.id} missing ${key}`);
  if(r.mediaClass.startsWith('found-')&&!/^https:\/\//.test(r.canonicalUrl)) throw new Error(`${r.id} lacks canonical online source`);
  if(r.mediaClass.startsWith('found-')&&!r.aiEvidence.match(/photograph|archival|predates/i)) throw new Error(`${r.id} lacks documentary non-AI evidence`);
}
const allHtml=walk('.').filter(p=>p.endsWith('.html')).map(read).join('\n');
for(const m of allHtml.matchAll(/<(?:img|video|audio|source)\b[^>]*(?:src|poster)=["'](\/[^"']+)/gi)){
  const p=m[1]; if((p.match(/\.(?:jpg|jpeg|png|svg|webp|gif)$/i))&&!byPath.has(p)) throw new Error(`Installed media lacks provenance: ${p}`);
}
for(const m of allHtml.matchAll(/youtube-nocookie\.com\/embed\/([\w-]+)/g)) if(!records.some(r=>r.id===`EMBED-YT-${m[1]}`)) throw new Error(`Embed lacks provenance: ${m[1]}`);

const counts=Object.fromEntries([...new Set(records.map(r=>r.mediaClass))].sort().map(k=>[k,records.filter(r=>r.mediaClass===k).length]));
const output={generated:'2026-09-09',policy:'Every installed media object is either found documentary media with an exact online source and rights record, an official authorized embed, or transparently labeled original/derived editorial work. No editorial graphic is presented as documentary evidence.',counts,total:records.length,unresolvedPermissionDependentInstalled:0,records};
fs.writeFileSync(path.join(root,'data/media-provenance.json'),JSON.stringify(output,null,2)+'\n');
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const publicRecords=records.filter(r=>r.mediaClass.startsWith('found-')||r.mediaClass==='official-authorized-video-embed');
const cards=publicRecords.map(r=>`<article><p>${esc(r.mediaClass.replaceAll('-',' '))}</p><h2>${esc(r.title)}</h2><dl><dt>Creator / institution</dt><dd>${esc(r.creator)} · ${esc(r.institution)}</dd><dt>Rights</dt><dd>${esc(r.rights)}</dd><dt>Direct relevance + limit</dt><dd>${esc(r.relevance)}</dd><dt>Non-AI evidence</dt><dd>${esc(r.aiEvidence)}</dd>${r.modification?`<dt>Web-copy treatment</dt><dd>${esc(r.modification)}</dd>`:''}</dl><a href="${esc(r.canonicalUrl)}">Open canonical online record ↗</a></article>`).join('');
const page=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Asset-level provenance and no-AI register for Tech From Here × Fashion Week"><link rel="canonical" href="https://tech-from-here-fashion-week.vercel.app/rights/media-provenance"><link rel="stylesheet" href="/assets/style.css"><title>Media provenance — Tech From Here × Fashion Week</title><style>.ledger{display:grid;gap:1rem}.ledger article{border:1px solid currentColor;padding:clamp(1rem,3vw,2rem)}.ledger dl{display:grid;grid-template-columns:minmax(9rem,.35fr) 1fr;gap:.6rem 1rem}.ledger dt{font-weight:700}.ledger dd{margin:0}@media(max-width:680px){.ledger dl{grid-template-columns:1fr}.ledger dd{margin-bottom:.8rem}}</style></head><body><nav aria-label="Primary"><a class="wordmark" href="/">TFH</a><a href="/rights">Rights desk</a><a href="/data/media-provenance.json">Download full JSON</a></nav><main><header class="pagehead"><p>MEDIA PROVENANCE · VERIFIED 09.09.26</p><h1>Found online. Rights stated. Relevance bounded.</h1><p>${records.length.toLocaleString()} media records are covered by the machine-readable ledger: ${counts['found-documentary-photograph']} documentary city photographs, ${counts['found-archival-photograph']} archival photograph, ${counts['official-authorized-video-embed']} official authorized embeds, ${counts['original-editorial-evidence-graphic']} original evidence graphics, ${counts['derived-editorial-social-preview']} social previews and ${counts['derived-platform-editorial-frame']} platform frames.</p><p>Found photographs and embeds appear below. Repository-authored diagrams and derivative platform frames are not described as found photography or archival evidence.</p></header><section class="ledger">${cards}</section><section class="prose"><h2>Permission boundary</h2><p>Zero permission-dependent assets are installed. Protected invitations, screenshots, films and documents remain link-only until item-level authorization exists. A recurring city witness provides context only and never proves a day-specific claim.</p><h2>Audit the complete ledger</h2><p>The JSON register supplies SHA-256 hashes, origin class, creator, institution, canonical URL, license or embed disposition, relevance boundary, alt text, credit language and non-AI evidence for every installed or downloadable media file.</p><a class="download" href="/data/media-provenance.json" download>Download complete media-provenance JSON ↓</a></section></main><footer><span>Rayven-Nikkita Collins · Tech From Here</span><a href="https://github.com/rn-collins/tech-from-here-fashion-week/issues/new?template=correction-or-takedown.yml">Corrections + takedowns</a></footer></body></html>`;
fs.mkdirSync(path.join(root,'rights/media-provenance'),{recursive:true});
fs.writeFileSync(path.join(root,'rights/media-provenance/index.html'),page);
console.log(JSON.stringify({total:records.length,counts},null,2));
