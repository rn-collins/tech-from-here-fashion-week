import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const cities=[['london',''],['new-york','new-york'],['milan','milan'],['paris','paris'],['shanghai','shanghai'],['copenhagen','copenhagen'],['tokyo','tokyo']];
const anatomy=['hook','context','story','seriesRelevance','ending','cta'];

test('every carousel has a distinct complete editable companion post',()=>{
  const drafts=new Set();
  for(const [city,dir] of cities)for(let day=1;day<=7;day++){
    const prefix=dir?`${dir}/`:'';
    const kit=JSON.parse(fs.readFileSync(path.join(root,`${prefix}kits/day-${day}.json`),'utf8'));
    assert.equal(kit.companionPosts.length,2,`${city} day ${day}`);
    assert.deepEqual(kit.companionPosts.map(post=>post.id),['A','B']);
    for(const post of kit.companionPosts){
      assert.deepEqual(Object.keys(post.anatomy),anatomy);
      assert.ok(Object.values(post.anatomy).every(value=>value.trim().length>30));
      assert.ok(post.fullText.length>800);
      assert.match(post.fullText,/Tech From Here/);
      assert.match(post.editableDownload,/\.txt$/);
      assert.ok(!drafts.has(post.fullText),`${city} day ${day} carousel ${post.id} duplicates another post`);
      drafts.add(post.fullText);
    }
  }
  assert.equal(drafts.size,98);
});

test('all story pages expose the editor and hide private production scaffolding',()=>{
  for(const [city,dir] of cities)for(let day=1;day<=7;day++){
    const prefix=dir?`${dir}/`:'';
    const html=fs.readFileSync(path.join(root,`${prefix}publication/day-${day}/index.html`),'utf8');
    assert.equal((html.match(/data-post-editor/g)||[]).length,2,`${city} day ${day}`);
    assert.equal((html.match(/<textarea/g)||[]).length,2);
    assert.match(html,/data-copy/);
    assert.match(html,/data-download/);
    assert.match(html,/data-reset/);
    assert.match(html,/Sources behind this story/);
    assert.doesNotMatch(html,/Evidence Fitting|PUBLICATION ASSET KIT|Evidence plates|Production desk|Recurring edition witness|not a day-specific record/i);
    assert.doesNotMatch(html,/assets\/evidence\/[^"']+\.svg/);
  }
});

test('editor controls are responsive, keyboard-native and downloadable',()=>{
  const css=fs.readFileSync(path.join(root,'assets/publication.css'),'utf8');
  const js=fs.readFileSync(path.join(root,'assets/publication.js'),'utf8');
  assert.match(css,/\.post-grid\{display:grid/);
  assert.match(css,/@media\(max-width:800px\).*\.post-grid\{grid-template-columns:1fr\}/s);
  assert.match(css,/\.post-editor textarea\{[^}]*font:1rem\/1\.6/s);
  assert.match(js,/navigator\.clipboard\.writeText/);
  assert.match(js,/new Blob/);
  assert.match(js,/link\.download=editor\.dataset\.filename/);
});
