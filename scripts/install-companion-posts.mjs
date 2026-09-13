import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const base=(process.env.PUBLIC_SITE_URL||'https://tech-from-here-fashion-week.vercel.app').replace(/\/$/,'');
const cities=[
  {id:'london',name:'London',dir:'',lens:'relay',context:'London makes the week visible as a relay among schedule, temporary room, camera, platform, labor, commerce and archive.'},
  {id:'new-york',name:'New York',dir:'new-york',lens:'clock',context:'New York makes time itself operational across calendars, venues, cameras, production, orders and memory.'},
  {id:'milan',name:'Milan',dir:'milan',lens:'inheritance',context:'Milan joins inherited house authority to contemporary systems of staging, craft, distribution, wholesale and traceability.'},
  {id:'paris',name:'Paris',dir:'paris',lens:'legitimacy',context:'Paris exposes how calendars, monumental rooms, official images, showrooms and archives produce legitimacy.'},
  {id:'shanghai',name:'Shanghai',dir:'shanghai',lens:'synchronization',context:'Shanghai compresses schedule, manufacturing, social image, cloud runway, buyer order and product identity into synchronized platform time.'},
  {id:'copenhagen',name:'Copenhagen',dir:'copenhagen',lens:'verification',context:'Copenhagen turns participation into a question of thresholds, review, documentation and proof.'},
  {id:'tokyo',name:'Tokyo',dir:'tokyo',lens:'translation',context:'Tokyo makes translation infrastructural across permission, place, moving image, language, textiles, recognition and memory.'}
];
const days={
  1:{noun:'access',actors:'organizer, accrediting body, publicist, security team and guest',turn:'Public visibility, professional recognition and physical entry are separate permissions. Treating them as synonyms hides who actually controls admission.',test:'Ask what the interface announces, what credential it recognizes and which final permission actually opens the room.'},
  2:{noun:'staging',actors:'designer, producer, venue, technical supplier, operator and safety lead',turn:'The runway is not a neutral surface. It is a timed machine whose labor and safety systems disappear at precisely the moment the show begins.',test:'Read one show from load-in to strike and insist that the production credits travel with the spectacle.'},
  3:{noun:'capture',actors:'designer, photographer, videographer, editor, image agency and archive',turn:'Most audiences meet a collection as an authored frame. Camera position, edit, caption, compression and licensing are part of the garment’s public meaning.',test:'For every remembered look, identify the frame-maker, owner, distribution channel and surviving file.'},
  4:{noun:'circulation',actors:'organizer, broadcaster, platform, press desk, creator and viewer',turn:'A stream can be open while discovery remains privately ranked. Reach, access and attention describe different systems.',test:'Separate the room, signal, feed, recommendation layer and archive instead of treating “online” as one place.'},
  5:{noun:'backstage coordination',actors:'model, dresser, casting team, producer, agent and software operator',turn:'Efficiency is not automatically benign. The ethical question begins where a coordination field becomes a durable record about a worker.',test:'Inventory the data field, operational need, person affected, retention period and route for correction or deletion.'},
  6:{noun:'commerce',actors:'brand, showroom, buyer, retailer, platform and regulator',turn:'The commercial interface is where a look becomes a record: style number, material, price, delivery window, territory and buyer decision.',test:'Separate enacted rule, technical standard, vendor promise, pilot and verified deployment.'},
  7:{noun:'memory',actors:'organizer, photographer, institution, web archivist, rights holder and researcher',turn:'An archive is not the residue of the week. It decides which claims, credits and absences remain available for argument.',test:'Trace what survived, in whose custody, under which metadata and reuse terms—and record what did not.'}
};
const esc=value=>String(value).replace(/[&<>\"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[char]));
const readJson=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const writeJson=(file,value)=>fs.writeFileSync(path.join(root,file),JSON.stringify(value,null,2)+'\n');

function companionPosts(city,day,kit,claims){
  const d=days[day],url=`${base}/${city.dir?city.dir+'/':''}publication/day-${day}`;
  const variants=[
    {
      id:'A',label:'The system story',
      anatomy:{
        hook:`Fashion Week has an operating system. In ${city.name}, ${d.noun} is where you can see it.`,
        context:city.context,
        story:`${claims[0].wording}\n\n${claims[1].wording}\n\nThose are not background details. They shape who enters, what becomes visible and which version of the week travels.`,
        seriesRelevance:`This is what Tech From Here follows: place first, people first, technology after. The point is not novelty. It is what a system reorganizes in a particular city, and for whom.`,
        ending:`${d.turn}\n\nIn ${city.name}, the finished show makes that system look seamless. I am interested in the seam.`,
        cta:`Read the full story, then save the carousel for the next time technology is presented as neutral: ${url}`
      }
    },
    {
      id:'B',label:'The human story',
      anatomy:{
        hook:d.turn,
        context:`Look behind “${kit.title}” and the finished image opens into a chain of decisions.`,
        story:`In ${city.name}, that chain runs through the ${d.actors}.\n\n${claims[1].wording}\n\nWhat happens next is not yet public. That uncertainty belongs in the story because it tells us where power still disappears from view.`,
        seriesRelevance:`Tech From Here asks what technology becomes in a particular place, in the hands of particular people. ${city.name} makes that question visible through ${city.lens}.`,
        ending:`${d.test}\n\nThe real story is not that fashion uses technology. It is that every seamless experience has a seam—and somebody is working inside it.`,
        cta:`Which seam should I trace next? The complete story and sources are here: ${url}`
      }
    }
  ];
  return variants.map(post=>({...post,platform:'LinkedIn / Instagram',fullText:Object.values(post.anatomy).join('\n\n'),editableDownload:`${city.id}-day-${day}-carousel-${post.id.toLowerCase()}-post.txt`}));
}

function postPanel(posts){
  return `<section class="companion-studio" aria-labelledby="companion-title"><header><p>COMPANION POST STUDIO</p><h2 id="companion-title">Two carousels. Two complete posts.</h2><p>Each draft has its own hook, context, story, connection to Tech From Here, ending and invitation. Edit directly, copy it, or download plain text.</p></header><div class="post-grid">${posts.map(post=>`<article class="post-editor" data-post-editor data-filename="${esc(post.editableDownload)}"><div class="post-heading"><span>CAROUSEL ${post.id}</span><h3>${esc(post.label)}</h3></div><ol class="post-anatomy" aria-label="Post anatomy">${Object.keys(post.anatomy).map(key=>`<li>${esc(key.replace(/([A-Z])/g,' $1'))}</li>`).join('')}</ol><textarea spellcheck="true" aria-label="Editable companion post for carousel ${post.id}">${esc(post.fullText)}</textarea><div class="post-actions"><button type="button" data-copy>Copy post</button><button type="button" data-download>Download .txt</button><button type="button" data-reset>Reset draft</button></div><p class="post-status" aria-live="polite"></p></article>`).join('')}</div></section>`;
}

function sourceSection(claims,sourceBy){
  return `<section class="claims"><h2>Sources behind this story</h2>${claims.map((claim,index)=>`<article data-state="${claim.temporalState}"><header><b>${claim.temporalState}</b></header><h3>${esc(index===2?'What would need to become public before we could see whether this system is changing?':claim.wording)}</h3><ul>${claim.citations.map(id=>`<li><a href="${esc(sourceBy[id]?.url||'#')}">${esc(sourceBy[id]?.title||id)} ↗</a></li>`).join('')}</ul></article>`).join('')}</section>`;
}

let count=0;
for(const city of cities){
  const prefix=city.dir?`${city.dir}/`:'';
  const claims=readJson(`${prefix}data/claims.json`),sources=readJson(`${prefix}data/sources.json`),sourceBy=Object.fromEntries(sources.map(source=>[source.id,source]));
  for(let day=1;day<=7;day++){
    const kitFile=`${prefix}kits/day-${day}.json`,kit=readJson(kitFile),dayClaims=claims.filter(claim=>claim.day===day);
    const posts=companionPosts(city,day,kit,dayClaims);
    kit.companionPosts=posts;
    kit.linkedin=posts[0].fullText;
    writeJson(kitFile,kit);

    const mdFile=path.join(root,`${prefix}kits/day-${day}.md`);
    let markdown=fs.readFileSync(mdFile,'utf8');
    const block=`## Companion posts — one per carousel\n\n${posts.map(post=>`### Carousel ${post.id} — ${post.label}\n\n${Object.entries(post.anatomy).map(([key,text])=>`**${key.replace(/([A-Z])/g,' $1')}:** ${text}`).join('\n\n')}`).join('\n\n')}\n\n`;
    markdown=markdown.replace(/## Companion posts — one per carousel[\s\S]*?(?=## Long-form video script)/,block).replace('## Long-form video script',block+'## Long-form video script');
    if((markdown.match(/## Companion posts — one per carousel/g)||[]).length>1)markdown=markdown.replace(block,'');
    fs.writeFileSync(mdFile,markdown);

    const htmlFile=path.join(root,`${prefix}publication/day-${day}/index.html`);
    let html=fs.readFileSync(htmlFile,'utf8');
    html=html.replace(/<section class="companion-studio"[\s\S]*?<\/section>(?=<section class="downloads">)/,'')
      .replace(/<section class="tool"[\s\S]*?<\/section>/,'')
      .replace(/<section class="asset-kit"[\s\S]*?<\/section>/,'')
      .replace(/<section class="claims">[\s\S]*?<\/section>/,sourceSection(dayClaims,sourceBy))
      .replaceAll('Evidence plates','Sources behind this story')
      .replaceAll('Production desk','Post studio')
      .replaceAll('Recurring edition witness · not a day-specific record','City portrait')
      .replaceAll('canonical object ↗','Photograph and credit ↗')
      .replace(/<small>Additional invitations,[\s\S]*?<\/small>/,'')
      .replace('<section class="downloads">',postPanel(posts)+'<section class="downloads">')
      .replace('<h2>Take the complete package</h2>','<h2>Keep the story editable.</h2>');
    fs.writeFileSync(htmlFile,html);
    count++;
  }
}

const cssFile=path.join(root,'assets','publication.css');
const cssBlock=`/* companion-studio:start */\n.hero h1{font-size:clamp(3rem,7vw,6rem);line-height:.94;max-width:14ch}.hero blockquote{font-size:clamp(1.25rem,2.2vw,2rem)}.essay .lead{font-size:clamp(1.6rem,3vw,2.25rem)}.claims h3{font-size:clamp(1.15rem,1.8vw,1.5rem)}.downloads h2{font-size:clamp(2.25rem,5vw,4rem)}.object-frame{display:grid;place-items:center}.documentary-object img{width:auto;max-width:100%;height:auto;max-height:760px;object-fit:cover}.documentary-object.compact img{width:auto;height:auto;max-width:100%;max-height:660px}.companion-studio{padding:clamp(3.5rem,7vw,7rem) 4vw;background:#fff;border-top:1px solid}.companion-studio>header{max-width:780px;margin-bottom:2.5rem}.companion-studio>header>p:first-child,.post-heading span{font:700 .75rem/1.4 Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:var(--accent)}.companion-studio h2{font:400 clamp(2.25rem,5vw,4.5rem)/.95 Georgia,serif;margin:.3em 0}.post-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--ink);border:1px solid var(--ink)}.post-editor{background:var(--paper);padding:clamp(1.25rem,3vw,2.5rem)}.post-heading h3{font:400 clamp(1.6rem,2.6vw,2.4rem)/1 Georgia,serif;margin:.3rem 0 1.25rem}.post-anatomy{display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;padding:0;margin:0 0 1rem}.post-anatomy li{border:1px solid;padding:.35rem .55rem;font:700 .72rem/1 Arial,sans-serif;text-transform:uppercase}.post-editor textarea{display:block;width:100%;min-height:34rem;resize:vertical;border:1px solid var(--ink);background:#fff;color:var(--ink);padding:1.25rem;font:1rem/1.6 Georgia,serif}.post-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.75rem}.post-actions button{min-height:44px;border:1px solid var(--ink);background:transparent;color:var(--ink);padding:.65rem .9rem;font:700 .8rem Arial,sans-serif}.post-actions button:first-child{background:var(--ink);color:var(--paper)}.post-status{min-height:1.5em;font:italic .9rem Georgia,serif}.object-frame:after{content:"CITY PORTRAIT"!important}@media(max-width:800px){.hero h1{font-size:clamp(2.8rem,13vw,4.8rem)}.post-grid{grid-template-columns:1fr}.post-editor textarea{min-height:29rem}.documentary-object img,.documentary-object.compact img{width:auto;height:auto;max-height:none}.companion-studio{padding:3.5rem 1.5rem}}\n/* companion-studio:end */`;
const css=fs.readFileSync(cssFile,'utf8').replace(/\/\* companion-studio:start \*\/[\s\S]*?\/\* companion-studio:end \*\//g,'').trimEnd();
fs.writeFileSync(cssFile,`${css}\n${cssBlock}\n`);

const jsFile=path.join(root,'assets','publication.js');
const jsBlock=`/* companion-studio:start */\nfor(const editor of document.querySelectorAll('[data-post-editor]')){const area=editor.querySelector('textarea'),status=editor.querySelector('.post-status'),original=area.value;editor.querySelector('[data-copy]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(area.value);status.textContent='Copied.'}catch{area.select();document.execCommand('copy');status.textContent='Copied.'}});editor.querySelector('[data-download]').addEventListener('click',()=>{const blob=new Blob([area.value],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=editor.dataset.filename;link.click();URL.revokeObjectURL(url);status.textContent='Downloaded editable text.'});editor.querySelector('[data-reset]').addEventListener('click',()=>{area.value=original;status.textContent='Draft reset.'})}\n/* companion-studio:end */`;
const js=fs.readFileSync(jsFile,'utf8').replace(/\/\* companion-studio:start \*\/[\s\S]*?\/\* companion-studio:end \*\//g,'').trimEnd();
fs.writeFileSync(jsFile,`${js}\n${jsBlock}\n`);

console.log(`Installed ${count*2} distinct editable companion posts across ${count} publication packages.`);
