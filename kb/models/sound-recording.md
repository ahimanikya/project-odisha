---
type: "Content Model"
title: "Sound recording: from a listening idea to a reviewed clip"
status: "draft"
---

# Sound recording: from a listening idea to a reviewed clip

A clip needs a person, a place and a reason to listen. This model extends the [Sankha collection proposal](../research/sources/sankha-research.md#proposed-collection-record) into a practical intake path. The [eight recording briefs](../records/sound-recording-briefs.json) are ideas, not acquired recordings or confirmed engagements.

## Start small

Choose one willing contributor and one explainable phrase. Ask how they want to be credited, what the sound means in this setting and what should stay unrecorded. Agree the intended use before capture; an introduction or an invitation to listen is not permission to publish.

These are questions for a future authorised contributor conversation. This package does not send invitations, collect personal consent records or activate a public archive.

## What each record carries

| Field | Information to retain |
| --- | --- |
| Identity | Stable clip ID, linked article and exact source IDs; local names confirmed by the contributor. |
| Purpose | What this short clip helps the listener understand; a focused capture brief. |
| Provenance | `field_recording`, `licensed_archive` or `synthetic`; reconstructed sound must never be labelled field evidence. |
| Capture | Date, named place, community/occasion where relevant, recorder credit, participant credit and the language actually heard. Unknown fields remain explicit. |
| Asset | Repository-relative file, SHA256, duration in seconds and editing notes. Preserve the original separately where authorised; trimming/noise processing belongs in the record. |
| Context review | Reviewer and bounded confirmation of place, event, names and description; no invented practitioner sign-off. |
| Rights review | Reviewer, permission basis and an evidence reference covering the recording, performers, underlying words/music, venue/event restrictions and public use. A research citation or image licence does not license audio. |
| Accessibility | Plain-language sound description, speech/lyrics status, transcript or summary and reviewed translation when one is supplied. Instrumental audio still needs a useful description. |
| Editorial review | Named actual reviewer and scope; independent/human review cannot be inferred from passing checks. |
| Publication authority | Separate human release decision covering the chosen clip/version; clearance for review is not publication. |

Keep participant contact details, signed permissions and restricted recordings out of public Git. Public evidence references should be non-sensitive IDs or already public licence pages; the responsible human retains the underlying permission evidence in appropriate storage. Do not invent a private evidence repository that has not been established.

## Three working states

**Planned:** questions and source pointers only. Asset, capture and reviews are null. All eight initial records are here.

**Captured:** a real asset, checksum and capture context exist. Rights or editorial review may still be unresolved. Capture does not establish permission to distribute.

**Cleared for review:** the asset, context, rights and accessibility records pass the structural check. Synthetic clips are excluded from this documentary collection. This remains a review candidate; human publication authority and an actual delivery receipt are separate.

Use withdrawal or restrictions as a reason to hold the affected clip. Do not convert a restriction into a convenient “public domain” label. Agree handling with the responsible human before promising deletion from third-party copies.

## Before a visitor can press Play

Show the place, occasion, performer/recorder credits and a short explanation beside a deliberate Play control. Avoid autoplay and looping a sacred phrase as decoration. Provide pause, volume and a text alternative. Preserve sources and detailed credits at the end of the story. Never use a stock or synthetic clip as evidence that a named ceremony was recorded.

A documentary recording and background music have different purposes and rights. The source of one cannot clear the other. Website playback, device/accessibility testing and human release review are future work; this model changes no live page.

## Check the preparation

Run `python3 tools/check_sound_collection.py`. It checks source links, honest states, asset hashes and required review fields. It cannot hear a file, verify consent, identify a language or confer publication authority. Negative cases exercise false readiness, missing rights and mismatched assets.
