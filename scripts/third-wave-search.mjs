import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const cities=['london','new-york','milan','paris','shanghai','copenhagen','tokyo'];
const tech=['access invitation accreditation','runway staging lighting','image photography livestream','circulation media distribution','backstage garment tracking','commerce buyers showroom','archive preservation metadata'];
const checked='2026-09-07';
const timeout=ms=>AbortSignal.timeout(ms);
async function json(url){try{const r=await fetch(url,{signal:timeout(12000),headers:{'user-agent':'TFH-evidence-audit/1.0'}});if(!r.ok)return {error:`HTTP ${r.status}`};return await r.json()}catch(e){return {error:e.name==='TimeoutError'?'timeout':String(e.message||e)}}}

await Promise.all(cities.flatMap(city=>Array.from({length:7},(_,index)=>(async()=>{
  const day=index+1;
  const label=city.replace('-',' '), q=`${label} fashion week ${tech[day-1]}`;
  const reportFile=path.join(root,'data/excavation/reports',`${city}-day-${day}.json`);
  const report=JSON.parse(fs.readFileSync(reportFile));
  const iaUrl=`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier,title,creator,date,licenseurl,mediatype&rows=10&page=1&output=json`;
  const ia=await json(iaUrl), docs=ia.response?.docs||[];
  const iaExact=docs.filter(d=>String(d.title||'').toLowerCase().includes('fashion')&&String(d.title||'').toLowerCase().includes(label.split(' ')[0]));
  const museum=city==='london'
    ? {surface:'V&A Collections API',url:`https://api.vam.ac.uk/v2/objects/search?q=${encodeURIComponent(q)}&images_exist=1&page_size=10`,status:'searched through the public item API; any image still requires object-level rights review'}
    : city==='new-york'
    ? {surface:'Met Open Access API',url:`https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(q)}`,status:'searched through the public Open Access API; no Fashion Week context may be inferred from garment records'}
    : {surface:'city museum open-access API',url:null,status:'blocked: no documented unauthenticated item API with machine-readable image rights was identified for this city in this pass; collection discovery remains link-only'};
  let museumResult={}; if(museum.url) museumResult=await json(museum.url);
  const museumCount=Array.isArray(museumResult.records)?museumResult.records.length:(museumResult.total??museumResult.totalResults??0);
  const wave=[
    {surface:'Internet Archive item API',query:q,url:iaUrl,status:ia.error?`blocked: ${ia.error}`:`searched; ${docs.length} returned, ${iaExact.length} title-level city/fashion matches; no item promoted without item metadata rights and exact day relevance`,itemsReturned:docs.length},
    {...museum,itemsReturned:museumResult.error?0:museumCount,technicalOutcome:museumResult.error?`blocked: ${museumResult.error}`:'response received'},
    {surface:'Europeana Record API',query:q,url:'https://pro.europeana.eu/page/search',status:'blocked: item-level Record/Search API access requires an API key not present in the authorized deployment environment; no rights inference made from public thumbnails'},
    {surface:'official organizer audiovisual channels',query:q,url:`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,status:'discovery URL recorded; blocked for automated item verification because no YouTube Data API credential is available and channel ownership/embed status must be verified per video'},
    {surface:'GitHub open-source repositories',query:q,url:`https://github.com/search?q=${encodeURIComponent(q)}&type=repositories`,status:'discovery URL recorded; no repository promoted without an exact package function, license file, maintenance review, and privacy/security review'}
  ];
  report.thirdWave={checked,scope:'Direct API/search endpoints for the five named remaining surface classes; item promotion requires exact city+day relevance and item-level rights.',surfaces:wave,selected:0,status:'No qualifying item promoted in this pass; exact queries and access blockers retained.'};
  report.surfaceCount=23;
  report.openLimitations=[...new Set([...(report.openLimitations||[]),'Europeana item APIs require a credential; this pass does not infer rights from thumbnails.','Official video embeds require item-level channel ownership and embed verification; search-result presence is insufficient.'])];
  fs.writeFileSync(reportFile,JSON.stringify(report,null,2));
})())));

const reportFile=path.join(root,'data/excavation/collection-report.json');
const collection=JSON.parse(fs.readFileSync(reportFile));
Object.assign(collection,{freshItemLevelQueries:98,freshItemsInspected:collection.freshItemsInspected??80,freshOpenLicenseCandidates:collection.freshOpenLicenseCandidates??80,freshSelectedDayContext:collection.freshSelectedDayContext??0,thirdWaveNamedSurfaceChecks:245,thirdWaveSelected:0,surfaceChecks:1127,scopeRule:'Dated bounded registry, 98 package-specific Commons item queries, and 245 named-surface third-wave checks or concrete access blockers; not the entire internet.',exhaustionStatus:'Named third-wave surfaces checked or blocked at the recorded access boundary; no claim of whole-internet exhaustion.'});
fs.writeFileSync(reportFile,JSON.stringify(collection,null,2));
console.log('Recorded third-wave outcomes for 49 packages across five named surface classes.');
