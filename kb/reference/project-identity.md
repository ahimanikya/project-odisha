---
type: "Project record"
title: "Project identity"
---

# Project identity

The repository-root `utkal.config.json` distinguishes this operating instance. Human authority remains with Ahimanikya Satapathy.

Record status, OKF document type and human approval are distinct. A named persona definition is not an active assignment.

Configuration is an input to repository tooling and is outside this knowledge bundle. The actual team and governance records remain readable here. See [repository boundaries](repository-layout.md).

## Current identity · 14 October 2026

**Project Odisha** is the current project name. The website is https://projectodisha.org/ and the repository is https://github.com/ahimanikya/project-odisha. GitHub Pages uses GitHub Actions with the custom domain `projectodisha.org` and HTTPS enforced. The approved tagline is **Discover Odisha. Imagine the possibilities.**

Utkal Project was renamed Project Odisha on 14 October 2026. Old asset URLs are compatibility aliases; current wordmarks use `assets/brand-v4/project-odisha-*`. At the time of the name change, UTP record IDs, storage keys and the Blueprint configuration filename were retained for continuity. The current project-code policy below supersedes that choice for existing and new record IDs. The separately named Utkal Blueprint, Collective, Unbound and Store are not renamed by this decision.

The earlier domain and hosting statements below are historical snapshots, superseded by this current identity. GoDaddy forwarding from the old domain has been saved; successful HTTPS forwarding is still awaiting verification.

## Current project code · 19 October 2026

**POD** is the three-letter code for **Project Odisha**. The Founder requested both a code change and migration of existing IDs. POD is the coordinator-selected abbreviation. [Change record](../records/project-code-pod-2026-10-19.json): POD-DEC-2026101902.

Existing canonical IDs and their live references now use `POD-` with their original suffixes: for example, `UTP-DEC-225` resolves to `POD-DEC-225`. The same record keeps its meaning, authority, date and status. Use its POD ID when updating it; do not create a duplicate work item. All newly created records also use POD.

The [exact old-to-new identifier map](project-id-aliases.json) keeps earlier UTP references traceable. Its aliases are lookup keys, not additional records. The read-only command `python3 tools/resolve_project_id.py UTP-DEC-225` returns the canonical ID. New canonical register rows and programme items must use the current prefix; an old reference resolves only when the exact alias is declared.

Original changed files are retained byte-for-byte in a checksummed [preservation archive and manifest](../history/evidence/project-id-migration-2026-10-19/manifest.json), tied to the pre-migration Git commit. Historical quote fields, captured evidence, adopted Blueprint materials and external URLs are preserved. Canonical ledgers were migrated at the identifier level; their original bytes remain in the archive. No past approval or completion is newly asserted by changing its ID.

Configuration, register identity and team identity use POD. The `utkal.config.json` filename, browser storage keys, existing URLs and independently named Utkal Blueprint, Collective, Unbound and Store remain unchanged. This change creates no new permissions, memberships or publication authority.

## Domain and hosting history

## Website domain

On 28 September 2026, Ahimanikya Satapathy reported: “I have utkalproject.org now”, and identified GoDaddy as the registrar. Record this as Founder-reported acquisition; account ownership, expiry and DNS have not been independently verified. The selected website domain is `utkalproject.org`.

Cloudflare Pages with Cloudflare DNS is the proposed hosting route for the existing static Astro site. Registration can remain at GoDaddy. Connecting the apex domain to Pages requires a Cloudflare zone and the exact assigned Cloudflare nameservers at the registrar. Preserve any existing mail and verification records when migrating DNS. See [Cloudflare custom-domain instructions](https://developers.cloudflare.com/pages/configuration/custom-domains/).

Next: confirm the hosting choice, inspect the current DNS and prepare a reviewed public build. Registration does not mean the site is deployed. No DNS, hosting, email or publication settings were changed by this record.

### Applied GitHub Pages configuration

The Founder subsequently chose GitHub Pages and authorized “ok make it public”. Browser evidence confirmed `ahimanikya/utkal-project` is public, Pages uses GitHub Actions, and its custom domain is `utkalproject.org`. This supersedes the earlier Cloudflare hosting proposal for the encyclopedia. Utkal Blueprint was not changed.

GoDaddy now has four A records at `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (600-second TTL), plus `www` CNAME to `ahimanikya.github.io` (one-hour TTL). The parked A record and former `www` alias were replaced; nameservers, SOA, domain-connect and DMARC records were preserved. At configuration time GitHub had requested its TLS certificate; HTTPS enforcement and first deployment still needed verification. The current domain expiry shown by GoDaddy is 28 September 2027, with renewal displayed as USD 23.99/year; this registrar-specific price supersedes the earlier illustrative Porkbun quote.

A manual Astro deployment workflow is prepared for a Founder-approved main-branch release. Configuring the connection has not deployed the site or merged the website review branch.

### First public preview · 28 September 2026

Following explicit Founder approval (POD-DEC-023), PR #2 was merged and the 14-page preview deployed successfully to https://utkalproject.org/. HTTPS and the www redirect were verified in the browser. The Store is excluded and unlinked; its source remains in this public repository. This supersedes the earlier first-deployment-pending statements above. [Release evidence](../records/website-first-release.json).
