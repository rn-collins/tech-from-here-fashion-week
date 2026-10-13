# Tech From Here × London Fashion Week

## Media and resource excavation

The public `/excavation` index contains 49 package-level Media Libraries and Resources Rooms. Each record exposes the finite source-surface registry, candidate ledger, rights class, use or exclusion decision, downloadable lawful witness, dated search boundary, and diminishing-return stop rule. “Exhaustive” means exhaustive against that declared registry and date—not every page on the internet.

**Signal / Seam** is a documentary interface for seven technologies that organize London Fashion Week. It distinguishes verified fact, attributed claim, editorial inference, proposal, and unresolved research. It does not claim completeness and does not use generated imagery.

## Run

```bash
npm run check
npx serve .
```

The repository is dependency-free. `npm run build` deterministically generates 19 static routes, seven editable content kits, the publication audit, sitemap, and machine-readable data copies.

## Hostname

Set `PUBLIC_SITE_URL` during build, for example:

```bash
PUBLIC_SITE_URL=https://your-project.vercel.app npm run build
```

Without it, canonical URLs use `https://tech-from-here-fashion-week.vercel.app`.

`PUBLIC_REPOSITORY_URL` may be set if the final GitHub repository differs from
`https://github.com/rn-collins/tech-from-here-fashion-week`. It controls the
public correction/takedown links and must point to a repository with Issues enabled.

## Vercel project settings

- Framework preset: Other
- Root directory: repository root (`.`)
- Build command: `npm run build`
- Output directory: `dist` (the gallery; see Release gate below)
- Install command: leave blank (the project has no dependencies)
- Production branch: `main`
- Environment: set `PUBLIC_SITE_URL` to the final production origin if it differs
  from `https://tech-from-here-fashion-week.vercel.app`

## Editorial rules

- Every public claim resolves to a claim ID and at least one source.
- “Next” means a documented trajectory; an absence is published as an absence.
- Vendor statements are attributed, never converted into independent proof.
- Public availability is not reuse permission. Media requires item-level rights.
- Link-only and unresolved states are designed states.
- No AI-generated images, invented archives, synthetic quotations, or unsupported “first” claims.

See `AUDIT.md`, `data/claims.json`, `data/sources.json`, and `data/search-trail.json`.

## Release gate and gallery

The public site is the gallery in `dist/`, built by `scripts/build-gallery.mjs` at the end of `npm run build`. Vercel serves `dist/` only (`vercel.json`), so the source tree, kits, exports, data, README and scripts are not served.

`data/releases.json` is the only record that decides what is public. Each of the 49 editions has one entry: `id` (`tfh-fw/<city>-day-<n>`), `releasedAt` (a Pacific/Honolulu date, `YYYY-MM-DD`, or empty), `hold`, `postUrls` (platform to URL), `longFormUrl` and `sourcePageUrl`. An edition is public when `releasedAt` is today or earlier in Hawaii and `hold` is false. Until then its publication, day and evidence pages, kits, asset kits, exports, previews and sitemap entries are absent from `dist/` and return 404 by any URL.

To release an edition, set its `releasedAt` and `hold: false`, and add its post URLs. `scripts/verify-gallery.mjs` fails the build if any held piece, or any file outside the allowed set, reaches `dist/`.

The `Daily release` workflow runs at 00:10 Hawaii time. When an edition reaches its date, it commits `data/release-state.json`, and Vercel rebuilds from that push.
