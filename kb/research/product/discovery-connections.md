---
type: implementation-brief
---

# Discovery connections — local implementation brief

Status: locally implemented and checked; awaiting Founder review. Founder’s “OK, lets go” authorizes continued local website work. Human editorial and publication review remain separate.

## Outcome

Help visitors move from a photograph to a destination guide, then assemble an editable personal journey from existing research.

## Five bounded items

1. A visual directory of the seven existing destination guides.
2. Homepage destination cards, with links from collection search.
3. Three journey starters that create separate editable journeys without replacing saved plans.
4. Curated reading connections for the ten newest entries.
5. Odia search aliases for Bhubaneswar, Puri and Cuttack, using names already present in their guides.

## Acceptance

Reuse sourced content and licensed photographs; retain quiet image credits. Starter ideas are unscheduled, not verified itineraries. Existing plans and notes survive, invalid IDs and collection limits are rejected, and failed storage never claims success. Check phone, tablet and wide layouts, keyboard interaction, Odia search, local links, tests and the knowledge bundle. Store remains unlinked; no public deployment.

## Design learning

Use the established card, button, field and disclosure foundations. A visual entrance should lead into useful detail; a starter should show its contents before a visitor saves it. Record any changes to the shared design practice after verification.

## Review desk

| Item | Preview | Result |
| --- | --- | --- |
| POD-WORK-065 | [Destination directory](http://127.0.0.1:4324/destinations/) | Seven guides, real photographs, English and Odia names, quiet credits. |
| POD-WORK-066 | [Homepage](http://127.0.0.1:4324/) | Bhubaneswar, Puri and Cuttack cards; directory and starter paths also accessible from Explore. |
| POD-WORK-067 | [Journey starters](http://127.0.0.1:4324/journey-starters/) | Three editable selections; separate journeys; unscheduled ideas; storage failures preserve the prior collection and offer a download. |
| POD-WORK-068 | [Bhubaneswar example](http://127.0.0.1:4324/destinations/bhubaneswar/) | Twenty reading connections across the ten newest entries. |
| POD-WORK-069 | [Puri in Odia search](http://127.0.0.1:4324/explore/?q=%E0%AC%AA%E0%AD%81%E0%AC%B0%E0%AD%80) | Three city aliases reuse the Odia guide headings; topic and area filters still apply. |

64 pages build; 58 website tests and six design-system tests pass. Twelve page/viewport checks found no horizontal overflow at 360, 769 and 1440 CSS pixels. Browser interaction created two starters on a separate test origin, preserved an existing dated note, and retained a new note after navigation and reload. The main preview’s saved plans were not changed.

[Review evidence](../../records/discovery-connections-review.json) · [Output manifest](../../records/discovery-connections-manifest.json)

No new external factual research was required: these are connections and selections from the existing sourced collection. Native-language proofreading and current travel arrangements remain for editorial and field review. No public deployment performed.
