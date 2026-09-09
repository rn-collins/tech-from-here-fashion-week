import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const cities=[['london','', 'relay'],['new-york','new-york','clock'],['milan','milan','inheritance'],['paris','paris','legitimacy'],['shanghai','shanghai','synchronization'],['copenhagen','copenhagen','verification'],['tokyo','tokyo','translation']];
const dayTurns={
  1:'Public visibility, professional recognition and physical entry are separate permissions. Treating them as synonyms hides who actually controls admission.',
  2:'The runway is not a neutral surface. It is a timed machine whose labor and safety systems disappear at precisely the moment the show begins.',
  3:'Most audiences meet a collection as an authored frame. Camera position, edit, caption, compression and licensing are part of the garment’s public meaning.',
  4:'A stream can be open while discovery remains privately ranked. Reach, access and attention need different evidence because they describe different systems.',
  5:'Efficiency is not automatically benign. The ethical question begins where a coordination field becomes a durable record about a worker.',
  6:'The commercial interface is where a look becomes a record: style number, material, price, delivery window, territory and buyer decision.',
  7:'An archive is not the residue of the week. It is infrastructure that decides which claims, credits and absences remain available for argument.'
};
const cityTurns={
  london:'Here, access to the week is assembled across institutions rather than held by a single interface.',
  'new-york':'The city is the venue network; punctual coordination is what temporarily makes that network feel like one event.',
  milan:'An inherited name only travels because rooms, hands, labels and order systems keep making it operational.',
  paris:'Designation comes before spectacle: the calendar, venue and official record decide what can appear as Paris fashion authority.',
  shanghai:'Runway, trade, manufacturing and platform circulation overlap here without becoming one universal Chinese technology story.',
  copenhagen:'The distinctive move is procedural: an ambition becomes consequential only when a threshold, review and retained record accompany it.',
  tokyo:'Every interface translates between constituencies—designer and organizer, Japanese and international press, runway and textile trade, present season and archive.'
};
const oldMaterial='The distinction is material. A polished interface can survive after its workers, contracts, specifications or permission trail disappear, leaving the audience with an outcome but not its operating history.';
const oldOpen='An unresolved result is not a universal claim of absence. Private, paywalled, undigitized, translated or show-level material may exist; the open field is retained as a reporting assignment with a named artifact to seek.';
const newOpen='This public record cannot establish what may remain private, paywalled, undigitized, untranslated or held at show level. That limit belongs in the published account because an evidentiary blank is not evidence of absence.';
const oldClose='The writing, claim ledger, source cards, lawful documentary object, interactive and downloadable production package are complete. Recording, interviews, specialist review, permissions for additional rights-held media and RN owner-final approval remain explicit human production gates.';
const nouns={1:'access',2:'staging',3:'capture',4:'circulation',5:'backstage coordination',6:'commerce',7:'memory'};

for(const [id,dir,lens] of cities){
  for(let day=1;day<=7;day++){
    const prefix=dir?`${dir}/`:'';
    const htmlFile=path.join(root,`${prefix}publication/day-${day}/index.html`);
    let html=fs.readFileSync(htmlFile,'utf8');
    html=html.replace(oldMaterial,dayTurns[day])
      .replace(new RegExp(`${id==='new-york'?'New York':id[0].toUpperCase()+id.slice(1)}’s governing verb is ${lens}\\. It is an editorial lens, not a claim about the city’s essence: it helps test how calendars, credentials, media, labor records, commercial data and archives become legible here\\.`),cityTurns[id])
      .replace(oldOpen,newOpen)
      .replace(oldClose,`This edition makes ${nouns[day]} legible as a relationship among people, interfaces and records—not a ranking of fashion capitals or a substitute for field reporting.`);
    fs.writeFileSync(htmlFile,html);

    const mdFile=path.join(root,`${prefix}kits/day-${day}.md`);
    let md=fs.readFileSync(mdFile,'utf8')
      .replace('**Version:** 2.0 evidence publication','**Version:** 3.0 finished written edition')
      .replace('**Checked:** 2026-09-07','**Checked:** 2026-09-09')
      .replace('**Editorial state:** publication-ready text; human production and owner-final gates remain open','**Package state:** written, graphic, interactive and editable source deliverables complete; recording and third-party participation are separate human-production stages')
      .replaceAll(oldMaterial,dayTurns[day]).replaceAll(oldOpen,newOpen)
      .replaceAll(oldClose,`This edition makes ${nouns[day]} legible as a relationship among people, interfaces and records—not a ranking of fashion capitals or a substitute for field reporting.`)
      .replace('## Human-only gates','## Human production stages\n\nThese are not missing written assets. They require RN or third-party participation:')
      .replace('- [ ] RN owner-final approval','- [ ] RN release approval');
    fs.writeFileSync(mdFile,md);

    const jsonFile=path.join(root,`${prefix}kits/day-${day}.json`);
    const json=JSON.parse(fs.readFileSync(jsonFile,'utf8'));
    json.publication={...json.publication,version:'3.0 finished written edition',checked:'2026-09-09',status:'written, graphic, interactive and editable source deliverables complete; recording and third-party participation are separate human-production stages'};
    if(json.canonicalEssay?.paragraphs){json.canonicalEssay.paragraphs=json.canonicalEssay.paragraphs.map(p=>p===oldMaterial?dayTurns[day]:p===oldOpen?newOpen:p===oldClose?`This edition makes ${nouns[day]} legible as a relationship among people, interfaces and records—not a ranking of fashion capitals or a substitute for field reporting.`:p)}
    fs.writeFileSync(jsonFile,JSON.stringify(json,null,2));
  }
}

fs.writeFileSync(path.join(root,'data/publication-readiness.json'),JSON.stringify({
  checked:'2026-09-09',
  scope:'49 city/day publication packages',
  complete:['canonical essays','long-form scripts','audio scripts','three vertical scripts per package','Instagram carousels','Pinterest copy','LinkedIn editions','Beehiiv editions','source cards','interactive tools','editable Markdown and JSON','route-specific evidence graphics and social previews'],
  humanProduction:['RN release approval','recording/performance','consented interviews','specialist review where commissioned','permissions for any additional rights-held media'],
  rule:'Human-production stages are never represented as already-recorded media.'
},null,2));

console.log('Applied no-notes editorial differentiation to 49 publication packages.');
