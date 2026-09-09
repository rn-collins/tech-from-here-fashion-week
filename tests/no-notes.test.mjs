import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const cities=[['london',''],['new-york','new-york'],['milan','milan'],['paris','paris'],['shanghai','shanghai'],['copenhagen','copenhagen'],['tokyo','tokyo']];
const forbidden=[
  'The distinction is material. A polished interface can survive',
  'governing verb is',
  'An unresolved result is not a universal claim of absence',
  'remain explicit human production gates',
  'Editorial state:',
  'commissioning package; production remains open'
];

test('49 public essays contain no cloned process boilerplate',()=>{
  const essays=[];
  for(const [,dir] of cities)for(let day=1;day<=7;day++){
    const prefix=dir?`${dir}/`:'';
    const html=fs.readFileSync(path.join(root,`${prefix}publication/day-${day}/index.html`),'utf8');
    for(const phrase of forbidden)assert.ok(!html.includes(phrase),`${prefix}day ${day} contains stale process copy`);
    const body=html.match(/<article class="essay">([\s\S]*?)<\/article>/)?.[1];
    assert.ok(body,`${prefix}day ${day} has a canonical essay`);
    assert.ok(body.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length>=250,`${prefix}day ${day} has substantive copy`);
    essays.push(body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
  }
  assert.equal(essays.length,49);
  assert.equal(new Set(essays).size,49,'every canonical essay is distinct');
});

test('all editable kits declare finished written scope without faking recorded media',()=>{
  for(const [,dir] of cities)for(let day=1;day<=7;day++){
    const prefix=dir?`${dir}/`:'';
    const md=fs.readFileSync(path.join(root,`${prefix}kits/day-${day}.md`),'utf8');
    const json=JSON.parse(fs.readFileSync(path.join(root,`${prefix}kits/day-${day}.json`),'utf8'));
    assert.match(md,/Version:\*\* 3\.0 finished written edition/);
    assert.match(md,/These are not missing written assets/);
    assert.match(json.publication.status,/separate human-production stages/);
    assert.doesNotMatch(md,/finished (video|audio) file|recorded narration|final cut/i);
  }
  const readiness=JSON.parse(fs.readFileSync(path.join(root,'data/publication-readiness.json'),'utf8'));
  assert.equal(readiness.scope,'49 city/day publication packages');
  assert.match(readiness.rule,/never represented as already-recorded media/);
});
