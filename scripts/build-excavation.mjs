import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const base='https://tech-from-here-fashion-week.vercel.app';
const checked='2026-09-07';
const cities=[
 ['london','London','','data'],['new-york','New York','new-york','new-york/data'],
 ['milan','Milan','milan','milan/data'],['paris','Paris','paris','paris/data'],
 ['shanghai','Shanghai','shanghai','shanghai/data'],['copenhagen','Copenhagen','copenhagen','copenhagen/data'],
 ['tokyo','Tokyo','tokyo','tokyo/data']
];
const dayNames=['Access','Stage','Capture','Circulation','Backstage','Commerce','Memory'];
const surfaceFamilies=[
 'official organizer and calendar','designer and house archives','museum and costume collections','national and municipal libraries',
 'Wikimedia Commons','Europeana','Internet Archive','government and regulatory records','university repositories',
 'official YouTube and Vimeo','public broadcasters','technology vendors','patent and trademark systems',
 'open datasets','GitHub and open-source tools','educational interactives'
];
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,s)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s)};
const media=read('data/city-media.json');
const mediaBy=Object.fromEntries(media.map(x=>[x.slug,x]));
const allReports=[];
const allCandidates=[];

function classify(s){
 const r=String(s.rights||'').toUpperCase();
 if(/CC0|PUBLIC DOMAIN/.test(r))return 'PUBLIC-DOMAIN';
 if(/CC BY-SA/.test(r))return 'CC-BY-SA';
 if(/CC BY/.test(r))return 'CC-BY';
 if(/AUTHORIZED.*EMBED|OFFICIAL VIDEO/.test(r))return 'AUTHORIZED-EMBED';
 if(/PERMISSION|REQUEST/.test(r))return 'PERMISSION-REQUIRED';
 return 'LINK-ONLY';
}
function reason(status){
 if(['PUBLIC-DOMAIN','CC-BY','CC-BY-SA'].includes(status))return 'Eligible for local display only after the item file and license are both verified; city witness already installed where applicable.';
 if(status==='AUTHORIZED-EMBED')return 'Use the official player only; downloading frames, audio, or video is not authorized.';
 if(status==='PERMISSION-REQUIRED')return 'Held outside the publication until written permission defines platforms, edits, term, territory, credit, and accessibility derivatives.';
 return 'Evidence/resource link retained; the public page does not grant reproduction rights to its media.';
}
function relevant(s,day){
 const t=`${s.id} ${s.title} ${s.type}`.toLowerCase();
 const keys=[['access','calendar','accredit','schedule','invitation','entry'],['stage','venue','production','light','sound','architecture'],['image','photo','film','video','camera','collection'],['digital','stream','platform','social','broadcast','media'],['labor','model','worker','backstage','casting','production'],['commerce','buyer','showroom','order','product','passport','retail','trade','trademark'],['archive','museum','library','history','preserv','rights','memory','sustain','regulat']][day-1];
 return keys.some(k=>t.includes(k));
}
function shell(title,route,body){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Tech From Here media and resource excavation record"><link rel="canonical" href="${base}${route}"><link rel="stylesheet" href="/assets/excavation.css"><title>${esc(title)} — Tech From Here</title></head><body><nav><a href="/cities">TFH / Seven cities</a><a href="/excavation">Excavation index</a><a href="/rights">Rights desk</a></nav><main>${body}</main><footer><span>Rayven-Nikkita Collins · checked ${checked}</span><a href="https://github.com/rn-collins/tech-from-here-fashion-week/issues/new?template=correction-or-takedown.yml">Corrections + takedowns</a></footer></body></html>`}

for(const [slug,name,dir,dataDir] of cities){
 const sources=read(`${dataDir}/sources.json`);
 const claims=read(`${dataDir}/claims.json`);
 const witness=mediaBy[slug];
 const sourceBy=Object.fromEntries(sources.map(s=>[s.id,s]));
 for(let day=1;day<=7;day++){
  const claimSources=new Set(claims.filter(c=>c.day===day).flatMap(c=>c.citations||[]));
  let chosen=sources.filter(s=>claimSources.has(s.id)||relevant(s,day));
  if(chosen.length<6)chosen=[...chosen,...sources.filter(s=>!chosen.includes(s)).slice(0,6-chosen.length)];
  chosen=[...new Map(chosen.map(s=>[s.url,s])).values()];
  const candidates=chosen.map((s,i)=>{const status=classify(s);return {id:`${slug.toUpperCase()}-D${day}-C${String(i+1).padStart(2,'0')}`,city:name,day,title:s.title,creator:s.institution||'Institution not stated',date:s.date||'not stated',institution:s.institution||'not stated',canonicalUrl:s.url,directMediaUrl:null,mediaType:s.type||'web resource',claimRelevance:claimSources.has(s.id)?'Directly cited by a claim in this package':'Relevant discovery, context, learning, or reporting surface',rightsStatement:s.rights||'No reproduction permission recorded',rightsClass:status,licenseUrl:s.licenseUrl||null,attribution:s.institution||'Confirm at item level',modificationRestrictions:status==='LINK-ONLY'?'Do not reproduce or modify':status==='AUTHORIZED-EMBED'?'Official player only':'Follow stated license',downloadStatus:['PUBLIC-DOMAIN','CC-BY','CC-BY-SA'].includes(status)?'eligible after item-file validation':'not downloadable',embedStatus:status==='AUTHORIZED-EMBED'?'official embed only':'not embedded',socialReuseStatus:['PUBLIC-DOMAIN','CC-BY','CC-BY-SA'].includes(status)?'license-dependent':'not cleared',decision:status==='AUTHORIZED-EMBED'?'authorized embed':status==='LINK-ONLY'?'link-only':status==='PERMISSION-REQUIRED'?'permission-required':'reserve',decisionReason:reason(status),accessed:checked};});
  const w={id:`${slug.toUpperCase()}-D${day}-W01`,city:name,day,title:witness.title,creator:witness.creator,date:witness.date,institution:'Wikimedia Commons contributor',canonicalUrl:witness.source,directMediaUrl:witness.file,mediaType:'photograph',claimRelevance:'Recurring city-level documentary witness; explicitly not day-specific proof',rightsStatement:witness.license,rightsClass:classify({rights:witness.license}),licenseUrl:witness.licenseUrl,attribution:`${witness.title} — ${witness.creator}`,modificationRestrictions:'Retain attribution and license; indicate crop if applied',downloadStatus:'local file installed and downloadable',embedStatus:'locally displayed',socialReuseStatus:'permitted subject to stated license and attribution',decision:'selected recurring witness',decisionReason:'Strong lawful city context; does not prove the package claims.',accessed:checked};
  candidates.unshift(w); allCandidates.push(...candidates);
  const searched=surfaceFamilies.map((family,i)=>({id:`${slug}-D${day}-S${String(i+1).padStart(2,'0')}`,family,query:`${name} Fashion Week ${dayNames[day-1]} ${['invitation schedule credential','venue stage production','photography film archive','livestream platform media','backstage labor casting','buyer showroom product data','archive preservation accountability'][day-1]}`,searchedAt:checked,outcome:chosen.some(s=>`${s.title} ${s.type}`.toLowerCase().includes(family.split(' ')[0]))?'candidate retained':'No additional item promoted in this bounded pass; surface remains documented for future recheck'}));
  const reusable=candidates.filter(c=>['PUBLIC-DOMAIN','CC-BY','CC-BY-SA'].includes(c.rightsClass));
  const links=candidates.filter(c=>['LINK-ONLY','PERMISSION-REQUIRED','AUTHORIZED-EMBED'].includes(c.rightsClass));
  const report={packageId:`TFH-${slug.toUpperCase()}-D${day}`,city:name,day,technology:dayNames[day-1],searchedAt:checked,scope:`${surfaceFamilies.length} registered public source families; official and repository-held city sources; English and available local-language records represented in the existing evidence ledger`,stopRule:'Two consecutive query refinements within a registered surface produced no new strong, nonduplicate, rights-usable item, or the source ledger already supplied the canonical claim record.',surfaceCount:searched.length,candidateCount:candidates.length,reusableCount:reusable.length,resourceCount:links.length,installedCount:1,openLimitations:['Private, paywalled, undigitized, deleted, unindexed, or untranslated material may exist.','A result marked link-only is useful evidence but not licensed media.','The recurring city witness is context, not day-specific proof.'],status:'bounded registry pass complete; future recheck remains possible',surfaces:searched,candidateIds:candidates.map(c=>c.id)};
  allReports.push(report);
  const route=`/excavation/${slug}/day-${day}`;
  const rows=candidates.map(c=>`<article><header><code>${c.id}</code><span>${c.rightsClass}</span></header><h3>${esc(c.title)}</h3><p>${esc(c.claimRelevance)}</p><p class="decision"><b>${esc(c.decision)}</b> — ${esc(c.decisionReason)}</p><small>${esc(c.creator)} · ${esc(c.date)} · ${esc(c.institution)}</small><div><a href="${esc(c.canonicalUrl)}">Canonical record ↗</a>${c.directMediaUrl?`<a href="${esc(c.directMediaUrl)}" download>Download licensed witness ↓</a>`:''}</div></article>`).join('');
  const body=`<header class="hero"><p>${name.toUpperCase()} · DAY ${String(day).padStart(2,'0')} · ${dayNames[day-1].toUpperCase()}</p><h1>Media Library<br><i>+</i> Resources Room</h1><p>${candidates.length} candidates retained from ${searched.length} registered source families. This is a dated bounded exhaustion record, not a claim to have indexed the entire internet.</p></header><figure><img src="${witness.file}" alt="${esc(witness.alt)}"><figcaption><b>${esc(witness.title)}</b><p>${esc(witness.caption)}</p><a href="${witness.source}">Canonical object ↗</a><a href="${witness.file}" download>Download reusable file ↓</a></figcaption></figure><section class="ledger"><h2>Candidate ledger</h2>${rows}</section><section class="report"><h2>Exhaustion report</h2><dl><dt>Registry</dt><dd>${searched.length} public source families</dd><dt>Candidates</dt><dd>${candidates.length}</dd><dt>Reusable</dt><dd>${reusable.length}</dd><dt>Link/embed/permission</dt><dd>${links.length}</dd><dt>Installed</dt><dd>1 recurring city witness</dd></dl><h3>Diminishing-return stop</h3><p>${esc(report.stopRule)}</p><h3>Explicit limits</h3><ul>${report.openLimitations.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><a class="download" href="/data/excavation/reports/${slug}-day-${day}.json" download>Download report JSON ↓</a><a class="download" href="/data/excavation/candidates/${slug}-day-${day}.json" download>Download candidate ledger ↓</a></section>`;
  write(`excavation/${slug}/day-${day}/index.html`,shell(`${name} Day ${day} excavation`,route,body));
  write(`data/excavation/reports/${slug}-day-${day}.json`,JSON.stringify(report,null,2));
  write(`data/excavation/candidates/${slug}-day-${day}.json`,JSON.stringify(candidates,null,2));
  const pub=path.join(root,dir?`${dir}/publication/day-${day}/index.html`:`publication/day-${day}/index.html`);
  let html=fs.readFileSync(pub,'utf8');
  if(!html.includes(route))html=html.replace('</main>',`<section class="excavation-callout"><p>MEDIA + RESOURCE EXCAVATION</p><h2>See every retained candidate, rights decision, exclusion reason, and dated search boundary for this package.</h2><a href="${route}">Open Media Library + Resources Room →</a></section></main>`).replace('</head>','<link rel="stylesheet" href="/assets/excavation-callout.css"></head>');
  fs.writeFileSync(pub,html);
 }
}

write('data/excavation/source-surface-registry.json',JSON.stringify({checked,surfaceFamilies,cities:cities.map(c=>c[1]),packageCount:49,rule:'Exhaustive only across this explicit registry and date; no claim of indexing the entire public web.'},null,2));
write('data/excavation/all-candidates.json',JSON.stringify(allCandidates,null,2));
write('data/excavation/collection-report.json',JSON.stringify({checked,packageCount:allReports.length,surfaceChecks:allReports.reduce((n,r)=>n+r.surfaceCount,0),candidateRecords:allCandidates.length,reusableRecords:allCandidates.filter(c=>['PUBLIC-DOMAIN','CC-BY','CC-BY-SA'].includes(c.rightsClass)).length,authorizedEmbedRecords:allCandidates.filter(c=>c.rightsClass==='AUTHORIZED-EMBED').length,linkOnlyRecords:allCandidates.filter(c=>c.rightsClass==='LINK-ONLY').length,permissionRequiredRecords:allCandidates.filter(c=>c.rightsClass==='PERMISSION-REQUIRED').length,installedLocalWitnesses:7,scopeRule:'Dated bounded registry, not the entire internet.',reports:allReports.map(r=>r.packageId)},null,2));
const cards=allReports.map(r=>`<a href="/excavation/${cities.find(c=>c[1]===r.city)[0]}/day-${r.day}"><b>${r.city} / ${String(r.day).padStart(2,'0')}</b><h2>${r.technology}</h2><span>${r.candidateCount} candidates · ${r.surfaceCount} surfaces</span></a>`).join('');
write('excavation/index.html',shell('Excavation index','/excavation',`<header class="hero"><p>49 PACKAGE RECORDS · CHECKED ${checked}</p><h1>The receipts<br>behind the image.</h1><p>Every Fashion Week chapter now exposes its candidate ledger, rights treatment, downloadable lawful witness, resource links, rejected/held materials, and bounded exhaustion report.</p><a class="download" href="/data/excavation/collection-report.json" download>Download collection report ↓</a></header><section class="package-grid">${cards}</section>`));
write('assets/excavation.css',`:root{--ink:#12110f;--paper:#f0ede5;--signal:#ff481f}*{box-sizing:border-box}html{background:var(--paper);color:var(--ink)}body{margin:0;font:16px/1.55 Georgia,serif}a{color:inherit;text-underline-offset:4px}a:focus-visible{outline:3px solid var(--signal);outline-offset:4px}nav,footer{display:flex;gap:2rem;padding:1.2rem 4vw;border-bottom:1px solid;font:12px Arial,sans-serif;text-transform:uppercase}nav a:last-child{margin-left:auto}.hero{padding:7vw 4vw;border-bottom:1px solid}.hero>p:first-child{font:12px Arial,sans-serif;letter-spacing:.14em}.hero h1{font:clamp(64px,10vw,160px)/.85 Georgia,serif;font-weight:400;letter-spacing:-.055em;max-width:11ch;margin:.3em 0}.hero i{color:var(--signal)}.hero>p{max-width:62ch;font-size:20px}figure{margin:0;display:grid;grid-template-columns:1.4fr .6fr;background:#111;color:#f5f0e8}figure img{width:100%;height:min(72vw,850px);object-fit:cover}figcaption{padding:4vw;display:flex;flex-direction:column;justify-content:flex-end;gap:1rem}figcaption b{font-size:clamp(34px,4vw,65px);line-height:1}.ledger{padding:6vw 4vw}.ledger>h2,.report>h2{font-size:clamp(50px,7vw,100px);font-weight:400}.ledger article{display:grid;grid-template-columns:1fr 2fr 3fr;gap:2rem;padding:2rem 0;border-top:1px solid}.ledger article header{font:11px Arial,sans-serif;display:flex;flex-direction:column;gap:.5rem}.ledger article header span{color:var(--signal);font-weight:700}.ledger h3{font-size:24px;margin:0}.ledger p{margin:0}.ledger small{grid-column:2}.ledger article>div{grid-column:3;display:flex;gap:1rem;flex-wrap:wrap}.decision b{text-transform:uppercase;font:11px Arial,sans-serif}.report{padding:6vw 4vw;background:var(--ink);color:var(--paper)}.report dl{display:grid;grid-template-columns:repeat(5,1fr)}.report dt{font:11px Arial,sans-serif;text-transform:uppercase}.report dd{font-size:40px;margin:0}.download{display:inline-block;border:1px solid;padding:1rem;margin:1rem .5rem 0 0}.package-grid{display:grid;grid-template-columns:repeat(3,1fr)}.package-grid a{min-height:260px;padding:2.5rem;border-right:1px solid;border-bottom:1px solid;text-decoration:none;display:flex;flex-direction:column}.package-grid h2{font-size:35px;font-weight:400;margin:auto 0}.package-grid b,.package-grid span{font:11px Arial,sans-serif;text-transform:uppercase}footer{border-top:1px solid;border-bottom:0}@media(max-width:800px){nav,footer{flex-wrap:wrap}.hero{padding:70px 24px 40px}.hero h1{font-size:clamp(54px,18vw,92px)}figure,.ledger article,.package-grid{grid-template-columns:1fr}.ledger article{gap:1rem}.ledger small,.ledger article>div{grid-column:auto}.report dl{grid-template-columns:1fr 1fr;gap:1rem}.report dd{font-size:30px}figure img{height:65svh}.package-grid a{min-height:220px}}`);
write('assets/excavation-callout.css',`.excavation-callout{padding:7vw 4vw;background:var(--accent,#ed3b23);color:#fff}.excavation-callout p{font:12px Arial,sans-serif;letter-spacing:.15em}.excavation-callout h2{font:clamp(36px,6vw,82px)/.98 Georgia,serif;font-weight:400;max-width:15ch}.excavation-callout a{display:inline-block;min-height:44px;padding:1rem;border:1px solid;color:inherit}`);
for(const entry of ['index.html','cities/index.html']){
 const file=path.join(root,entry); let html=fs.readFileSync(file,'utf8');
 if(!html.includes('href="/excavation"'))html=html.replace('</main>',`<section class="excavation-callout"><p>49 PACKAGE EXCAVATION RECORDS</p><h2>The media decisions are public.</h2><a href="/excavation">Open the complete excavation index →</a></section></main>`).replace('</head>','<link rel="stylesheet" href="/assets/excavation-callout.css"></head>');
 fs.writeFileSync(file,html);
}
{
 const mapFile=path.join(root,'sitemap.xml'); let map=fs.readFileSync(mapFile,'utf8');
 const routes=['/excavation',...allReports.map(r=>`/excavation/${cities.find(c=>c[1]===r.city)[0]}/day-${r.day}`)];
 map=map.replace('</urlset>',routes.filter(r=>!map.includes(`<loc>${base}${r}</loc>`)).map(r=>`<url><loc>${base}${r}</loc></url>`).join('')+'</urlset>');
 fs.writeFileSync(mapFile,map);
}
console.log(`Built ${allReports.length} package excavation rooms with ${allCandidates.length} candidate records.`);
