import fs from 'node:fs';import path from 'node:path';const root=path.resolve(import.meta.dirname,'..');
for(const city of ['london','new-york','milan','paris','shanghai','copenhagen','tokyo'])for(let day=1;day<=7;day++){
 const report=JSON.parse(fs.readFileSync(path.join(root,'data/excavation/reports',`${city}-day-${day}.json`)));
 if(report.freshSearch?.selectedDayContext)continue;
 const file=path.join(root,'excavation',city,`day-${day}`,'index.html');let html=fs.readFileSync(file,'utf8').replace('</head>','<link rel="stylesheet" href="/assets/fresh-media.css"></head>');
 html=html.replace(/<section class="fresh-shelf[^>]*">[\s\S]*?<\/section><section class="report">/,`<section class="fresh-shelf empty"><header><p>FRESH ITEM-LEVEL SEARCH</p><h2>No additional day-specific open-license item promoted.</h2><p>${report.freshSearch?.itemsInspected||0} results were inspected across the two package queries. Open-license but irrelevant results remain in the downloadable candidate ledger with rejection reasons; they are not used as visual filler.</p></header></section><section class="report">`);
 fs.writeFileSync(file,html);
 const publication=path.join(root,city==='london'?'':city,'publication',`day-${day}`,'index.html');
 let pub=fs.readFileSync(publication,'utf8'),route=`/excavation/${city}/day-${day}`;
 if(!pub.includes(route))pub=pub.replace('</main>',`<section class="excavation-callout"><p>MEDIA + RESOURCE EXCAVATION</p><h2>See every retained candidate, rights decision, exclusion reason, and dated search boundary for this package.</h2><a href="${route}">Open Media Library + Resources Room →</a></section></main>`).replace('</head>','<link rel="stylesheet" href="/assets/excavation-callout.css"></head>');
 fs.writeFileSync(publication,pub);
}
{
 const file=path.join(root,'sitemap.xml');let map=fs.readFileSync(file,'utf8');
 const routes=['/excavation',...['london','new-york','milan','paris','shanghai','copenhagen','tokyo'].flatMap(city=>Array.from({length:7},(_,i)=>`/excavation/${city}/day-${i+1}`))];
 map=map.replace('</urlset>',routes.map(route=>`<url><loc>https://tech-from-here-fashion-week.vercel.app${route}</loc></url>`).join('')+'</urlset>');
 fs.writeFileSync(file,map);
}
