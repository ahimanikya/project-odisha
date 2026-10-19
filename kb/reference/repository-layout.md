---
type: "Architecture decision"
title: "Repository boundaries: configuration, knowledge and source code"
---

# Repository boundaries

Founder direction: the KB contains organizational knowledge and work records. Runtime configuration belongs outside it. Project boilerplate is the starting implementation structure and must be adapted to the work Utkal will do.

## Current correction

`utkal.config.json` at repository root supplies project identity and record-location settings to the maintenance tools. There is no runtime config inside `kb/`. Existing team records retain the actual human/persona types, assignment scope and approval evidence. A configuration entry does not appoint anyone.

`kb/` contains charters, working agreements, roles/JDs, plans, requirements, research, architecture, decisions, registers and history. Structured knowledge data can be JSON; that does not make it executable configuration. The KB can be read on its own; executable checks and build tools require the repository around it.

## Agreed code layout — basic skeleton prepared

Blueprint's `projects/_template/` contains a basic implementation skeleton. It is distinct from the knowledge-document templates under `kb/templates/` and from the configuration template under root `templates/`. The initial contents are a README and empty source, public-assets and test folders. Framework/build files will be added when needed. Automated project creation is not implemented.

For UTP, the agreed layout places the Astro site in `projects/site/`, including `src/` for pages, components and styles; `public/` for reviewed display assets; `tests/` for relevant checks; and its package, lock and Astro/TypeScript build files. Other code projects can be added when needed. Common repository maintenance tools remain in root `tools/`; any future CI workflows belong in root `.github/workflows/`.

```text
repository/
  utkal.config.json             repository settings (implemented)
  kb/                           project knowledge and work (implemented)
  tools/                        maintenance and validation (implemented)
  templates/                    configuration input templates (Blueprint)
  projects/                     implementation workspaces
    _template/                  basic reusable skeleton (Blueprint)
    site/                       basic site skeleton (UTP; Astro move pending)
      src/
      public/
      tests/
      README.md
      # Package, lock and framework/build files follow with implementation.
```

The existing UTP Astro preview is the source to assess for the website move; do not silently replace it with a fresh scaffold. Source code, approved display assets, dependency locks and build instructions belong with that implementation. Research notes, reviews and design decisions belong in the KB. Do not move `node_modules/`, generated `dist/` output, credentials or local caches into Git.

The website publishes selected, reviewed knowledge through an explicit content/build process. Keeping material in the KB does not automatically make it website content. No website code relocation or deployment is included in this config-placement correction.

## Creation contract to complete

A new project needs its own filled root configuration and adapted implementation boilerplate, plus its local charter and working arrangements. Blueprint's real creator and maintenance history must not be inherited as an adopter's operating team/history. Creation must validate identity, preserve unknown settings, reject conflicting or unresolved inputs before writing, and leave human adoption and assignments explicit. A checklist is not a substitute for working creation tooling.

## Layout agreement

Ahimanikya Satapathy responded “That make sense” to the repository layout on this conversation. Recorded as POD-DEC-007. This agrees the separation and directory layout; boilerplate contents and the creation flow still need definition. It does not mark either PR merged, the site moved, or the starter implemented.

## Start basic

The Founder asked “may we start empty or basic”. The review branches now contain a minimal skeleton in Blueprint and UTP. There are no new application dependencies, framework files or deployment jobs. Source migration and automated creation are still future work; the earlier layout agreement above retains its original scope.
