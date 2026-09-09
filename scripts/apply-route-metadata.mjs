import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const origin=(process.env.PUBLIC_SITE_URL||'https://tech-from-here-fashion-week.vercel.app').replace(/\/$/,'');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const routes=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
const cities=['new-york','milan','paris','shanghai','copenhagen','tokyo'];
const cityFor=route=>cities.find(city=>route===`/${city}`||route.startsWith(`/${city}/`))||'london';
const media={
  london:'/assets/media/london-fashion-week.jpg',
  'new-york':'/assets/media/nyc-fashion-week.jpg',
  milan:'/assets/media/milan-fashion-week.jpg',
  paris:'/assets/media/paris-fashion-week.jpg',
  shanghai:'/assets/media/shanghai-fashion-week.jpg',
  copenhagen:'/assets/media/copenhagen-fashion-week.jpg',
  tokyo:'/assets/media/tokyo-fashion-week.jpg'
};
const labels={london:'London','new-york':'New York',milan:'Milan',paris:'Paris',shanghai:'Shanghai',copenhagen:'Copenhagen',tokyo:'Tokyo'};

for(const route of routes){
  const file=path.join(root,route.slice(1),'index.html');
  if(!fs.existsSync(file))throw new Error(`Sitemap route is missing: ${route}`);
  let html=fs.readFileSync(file,'utf8');
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description=html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if(!title||description===undefined)throw new Error(`Title or description missing: ${route}`);
  const city=cityFor(route),image=`${origin}${media[city]}`,url=`${origin}${route}`;
  html=html.replace(/<!-- tfh-social:start -->[\s\S]*?<!-- tfh-social:end -->/g,'').replace(/<meta (?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/g,'');
  const social='<!-- tfh-social:start -->'+[
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Tech From Here × Fashion Week">`,
    `<meta property="og:title" content="${title.replaceAll('&','&amp;').replaceAll('"','&quot;')}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:alt" content="Documentary witness from the ${labels[city]} Fashion Week evidence edition; route-specific social artwork remains an acquisition and design task.">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${title.replaceAll('&','&amp;').replaceAll('"','&quot;')}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${image}">`,
    `<meta name="twitter:image:alt" content="Documentary witness from the ${labels[city]} Fashion Week evidence edition; route-specific social artwork remains an acquisition and design task.">`
  ].join('')+'<!-- tfh-social:end -->';
  html=html.replace('</head>',`${social}</head>`);
  fs.writeFileSync(file,html);
}
console.log(`Applied social metadata to ${routes.length} routes.`);
