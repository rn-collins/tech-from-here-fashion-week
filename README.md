# Tech From Here × London Fashion Week

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
- Output directory: `.`
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
