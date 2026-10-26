# Odia Cinema · The viewing room

Open `index.html` for the local collection: seven selected viewing routes: four full-film listings, two trailers and an archive song clip. Search, filters, source notes and selection links work without a build or API key. Keep this folder in its current project location for the companion book and reading links to resolve.

**Local files:** use “Open on YouTube”. An iframe is never created on `file:` pages because YouTube requires an HTTP referrer. **When hosted on HTTP/HTTPS:** “Load player” creates one privacy-enhanced YouTube iframe; press its own Play control to begin. Stop removes the iframe. Choosing another title also removes it. Owners may disable embedding; the source link is always available. Nothing has been published or deployed.

The catalogue includes publicly accessible official uploads, not verified public-domain films. No film-level public-domain clearance is established; that filter is deliberately empty. Regional, account and provider conditions may change. Some source pages were checked in a signed-in India browser; this does not establish universal free access. Embedded playback has not been tested.

Thumbnails are remote YouTube source-channel thumbnails, not Project Odisha artwork. No movies or thumbnails are downloaded or rehosted. The page connects to YouTube for thumbnails; loading a player additionally connects to its privacy-enhanced service. No API key, analytics or account integration is used.

`catalogue.json` retains evidence, dates and rights fields. Advanced filters separate access type, source/provider, format, decade, sourced genre and original/dubbed/unknown language status. Counts distinguish viewing entries from distinct titles; separate versions of the same work share a film identifier, while unrelated films with the same title remain separate. `sync-catalogue.py` regenerates the classic-script data from the retained canonical research records. Where used, editorial Odia reading forms are distinguished in source notes from verified on-screen titles.

Run `node --test test.cjs` from this folder (or point Node at its full path). Tests cover validation, filters, DOM contracts with a test double, local-file fallback, player lifecycle and links. DOM test doubles are not browser rendering or playback tests. Browser visual QA was not performed: the prior local-file navigation restriction was respected; no alternate browser or local server was used.

The static files are HTTP-hostable. Publishing, server setup and full browser/playback verification remain separate actions. Relative companion links require the surrounding project outputs to be hosted together or adjusted for the final site.

Provider title pages open externally and never create an iframe or a YouTube thumbnail. Only exact HTTPS provider hosts explicitly listed in core.js are accepted; credentials, host lookalikes and nonstandard ports are rejected. Listing access can require subscription, rental, sign-in or regional eligibility. Provider-listed years are labelled as such rather than independently confirmed release dates. The visible coverage ledger records what was searched and what remains unverified; it is not an exhaustive availability index.

Editorial curation: DAMaN and Biswaprakash are two sourced starting points; Pratikshya and Ananta are clearly labelled trailer explorations. The seven-entry public payload is intentionally narrower than the discovery research. Other discovered titles remain only in the KB archive, not in hidden public filters. Selection is not a quality ranking of omitted films. The compact text catalogue has no thumbnail wall; only the featured official upload uses a remote channel thumbnail.
