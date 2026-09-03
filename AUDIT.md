# Publication audit

**Release:** Signal / Seam evidence preview  
**Reviewed:** 29 August 2026  
**Publication posture:** indexable; documentary interface; incomplete research is visibly labeled

**Deployment preflight repeated:** 3 September 2026 — deterministic build/tests,
26 local HTTP route/asset/download targets, issue-form YAML, and four critical
official source checks passed.

## Inventory

- 19 static routes
- 7 London technology days
- 21 point-of-claim records: exactly one Then, Now, and Next record per day
- 15 public source-family records
- 7 substantively day-specific commissioning packages in JSON and Markdown; production remains visibly open
- 3 interactives: chronology filter, full-record search, evidence-linked system relay
- public source, rights, accessibility, watch, field-note, object, method, and search-trail desks
- 7 named deterministic test suites covering route canonicals, alternate hostname, claims, sources, reproducible gaps, kit depth/distinctiveness, and media posture
- live release-gate checks for the four repaired key official sources
- public GitHub correction/takedown issue form with a sensitive-information warning

## Media and rights

No third-party or AI-generated image, audio, or video is reproduced. All external sources are link-only in this release. The object gallery intentionally renders seven rights-pending voids. It must not be populated until an individual object clears:

1. canonical holding page;
2. exact displayed rights statement;
3. creator, date, holding institution, and credit line;
4. permitted treatment and modification scope;
5. evidence use tied to a claim ID;
6. accessibility treatment.

## Claim integrity

- Unsupported “first,” adoption, impact, audience, sustainability, and future claims are excluded.
- ESPR is described as EU regulatory context, not a BFC plan.
- ESPR uses the stable EUR-Lex CELEX `32024R1781` document page; the live release gate verifies document identity against the official EU Publications RDF, including both the CELEX identifier and Regulation 2024/1781 marker.
- Vendor availability is explicitly not treated as adoption evidence.
- The early livestream chronology, June 2020 interface residue, supplier stack, backstage platform, event-level impact methodology, and BFC-owned futures remain unresolved.
- `data/search-trail.json` assigns stable gap IDs and records scope, operator, date, exact query, searched surface, result URL, decision, and needed evidence. Every unresolved claim maps to one or more gap IDs.

## UX and accessibility

- Mobile-first evidence cards; rights and citations never depend on hover.
- Keyboard-operable navigation, filters, search, details, and links.
- Visible focus follows browser defaults; status is expressed in text as well as color.
- Reduced motion respected; no autoplay, parallax, or media payload.
- Semantic landmarks, headings, disclosure controls, and live search-result count.

## Deployment

The build is dependency-free and Vercel-compatible. `PUBLIC_SITE_URL` configures 19 distinct route-level canonicals and sitemap URLs; alternate-host behavior is tested. GitHub-to-Vercel auto-deployment must be connected in the owner’s authenticated Vercel project; credentials are not stored in the repository.

Required Vercel settings are documented in `README.md`. The repository root is
the output directory because the dependency-free build generates the static site
in place. GitHub Issues must be enabled for the public correction URL to work.

## Release gate

**Pass as evidence preview. Not yet pass as completed historical exhibition.** The explicit gaps are the remaining reporting commission, not defects to be cosmetically filled.
