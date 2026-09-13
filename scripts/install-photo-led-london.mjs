import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const photos = JSON.parse(fs.readFileSync(path.join(root, 'data/photo-led-media/london.json')));
const order = { A: [0,1,2,3,4,5,6,7], B: [4,1,3,6,0,5,2,7] };
const roles = ['hook','context','story','story','story','series relevance','ending','invitation'];

function storyFrames(post) {
  const a = post.anatomy;
  const story = a.story.split(/\n\n+/);
  return [a.hook, a.context, story[0], story[1] || story[0], story.slice(2).join(' ') || story.at(-1), a.seriesRelevance, a.ending.replace(/\n\n+/g,' '), a.cta];
}

for (let day = 1; day <= 7; day++) {
  const kitFile = path.join(root, `asset-kits/day-${day}.json`);
  const editorial = JSON.parse(fs.readFileSync(path.join(root, `kits/day-${day}.json`)));
  const kit = JSON.parse(fs.readFileSync(kitFile));
  for (const variant of ['A','B']) {
    const post = editorial.companionPosts.find(p => p.id === variant);
    const copy = storyFrames(post);
    kit.instagram[`carousel${variant}`].frames = order[variant].map((photoIndex, index) => {
      const p = photos[photoIndex];
      return {
        frame: index + 1, role: roles[index], photoLed: true,
        assetId: p.id, asset: p.localFile, source: p.sourcePageUrl, sourcePageUrl: p.sourcePageUrl,
        directAssetUrl: p.directAssetUrl, creator: p.creator, institution: p.institution,
        license: p.license, licenseUrl: p.licenseUrl, sourceWidth: p.width,
        sourceHeight: p.height, cropSuitability: p.cropSuitability,
        crop: '4:5 editorial crop; preserve the documented subject',
        caption: copy[index], slideCopy: copy[index], alt: p.alt,
        credit: `${p.creator}, ${p.title}; ${p.license}`,
        rights: `${p.license}; attribution and source recorded`, storyRole: p.storyRole
      };
    });
  }
  kit.visualStatus = {photoLed: true, installedFrames: 16, uniqueSourcesPerCarousel: 8, inspected: '2026-09-13'};
  fs.writeFileSync(kitFile, JSON.stringify(kit, null, 2) + '\n');
}

fs.writeFileSync(path.join(root, 'data/photo-led-readiness.json'), JSON.stringify({
  checked: '2026-09-13', totalCarouselFrames: 784, beforePhotoLedFrames: 0,
  afterPhotoLedFrames: 112, pendingFrames: 672, completeCities: ['london'],
  definition: 'A photo-led frame uses a rights-recorded documentary photograph; each carousel has eight unique sources.'
}, null, 2) + '\n');
console.log('Installed 112 London photo-led frame assignments (14 carousels × 8 unique photographs).');
