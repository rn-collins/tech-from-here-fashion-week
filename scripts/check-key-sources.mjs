import fs from 'node:fs';
const sources=JSON.parse(fs.readFileSync(new URL('../data/sources.json',import.meta.url)));
const keyIds=['SRC-BFC-PRESS','SRC-MET-OA','SRC-EU-ESPR','SRC-EQUITY'];
const headers={'user-agent':'Signal-Seam-Publication-Audit/1.0'};

async function check(id){
 const source=sources.find(s=>s.id===id);if(!source)throw new Error(`Missing key source ${id}`);
 if(id==='SRC-EU-ESPR'){
  const expected='https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1781';
  if(source.url!==expected||source.documentId!=='CELEX:32024R1781')throw new Error(`ESPR source is not the canonical CELEX 32024R1781 document page: ${source.url}`);
  const authority='https://publications.europa.eu/resource/celex/32024R1781';
  const [endpoint,identity]=await Promise.all([
   fetch(source.url,{redirect:'manual',signal:AbortSignal.timeout(25000),headers}),
   fetch(authority,{redirect:'follow',signal:AbortSignal.timeout(25000),headers:{...headers,accept:'application/rdf+xml'}})
  ]);
  if(endpoint.status<200||endpoint.status>=400)throw new Error(`Canonical EUR-Lex CELEX endpoint returned HTTP ${endpoint.status}: ${source.url}`);
  const body=await identity.text();
  if(identity.status<200||identity.status>=300||!identity.url.includes('/resource/cellar/')||!body.includes('32024R1781')||!body.includes('2024/1781'))throw new Error(`ESPR identity failure: HTTP ${identity.status}, final ${identity.url}, CELEX/title markers ${body.includes('32024R1781')}/${body.includes('2024/1781')}`);
  return `PASS ${id} canonical endpoint HTTP ${endpoint.status}; CELEX 32024R1781 identified by official EU Publications RDF (${identity.status}, ${identity.url})`;
 }
 const response=await fetch(source.url,{redirect:'follow',signal:AbortSignal.timeout(25000),headers});
 if(response.status<200||response.status>=400)throw new Error(`${id} returned HTTP ${response.status}: ${source.url}`);
 return `PASS ${id} HTTP ${response.status} ${response.url}`;
}

const results=await Promise.all(keyIds.map(check));
for(const result of results)console.log(result);
