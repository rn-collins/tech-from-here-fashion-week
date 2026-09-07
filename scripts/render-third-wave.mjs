import fs from 'node:fs';import path from 'node:path';const root=path.resolve(import.meta.dirname,'..');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const city of ['london','new-york','milan','paris','shanghai','copenhagen','tokyo'])for(let day=1;day<=7;day++){
 const report=JSON.parse(fs.readFileSync(path.join(root,'data/excavation/reports',`${city}-day-${day}.json`))); const w=report.thirdWave;
 const rows=w.surfaces.map(s=>`<li><b>${esc(s.surface)}</b><span>${esc(s.status)}</span>${s.url?`<a href="${esc(s.url)}">Open exact search surface ↗</a>`:''}</li>`).join('');
 const section=`<section class="third-wave"><p>THIRD-WAVE GAP SEARCH · ${esc(w.checked)}</p><h2>Named collection surfaces</h2><p>${esc(w.scope)}</p><ul>${rows}</ul><strong>${esc(w.status)}</strong></section>`;
 const file=path.join(root,'excavation',city,`day-${day}`,'index.html');let html=fs.readFileSync(file,'utf8');
 html=html.replace(/<section class="third-wave">[\s\S]*?<\/section>/,section); if(!html.includes('class="third-wave"'))html=html.replace('<section class="report">',section+'<section class="report">');
 if(!html.includes('/assets/third-wave.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/third-wave.css"></head>');fs.writeFileSync(file,html);
}
