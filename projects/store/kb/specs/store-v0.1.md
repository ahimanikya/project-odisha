---
type: Project record
title: "Odisha Store PRD v0.1"
---

# Odisha Store PRD v0.1

**Historical baseline · 28 September 2026 ODC · Proposed implementation plan**

## Problem and intended outcome

An Odisha identity needs objects people choose to use every day. Start with a small, coherent collection rather than a large untested catalogue. Establish demand and product quality before expanding.

## Phase 0: delivered review candidate

Standalone Astro site, four concept SKUs (black T-shirt, jhula bag, coffee cup and water bottle), six pages, separate language artwork, proposed size selection and device-local saved selections. No invented price, stock or supplier certification. Product visuals are code-drawn mockups and labelled design studies. A saved selection is not a reservation or order.

Acceptance: local links work; variant/quantity inputs are validated; identical variants merge; corrupt storage is handled; entries can be removed; no payment or personal-data submission occurs. Founder decides design direction, samples and next increment.

## Phase 1: first real sale

Use a Git-maintained catalogue and a provider-hosted checkout/order dashboard as the simplest first live architecture. Choose the provider and review its account, charges and data handling before integration. Customers must see approved prices, delivery coverage, lead time and return terms. A success page is not proof of payment; fulfill against the provider's confirmed order/payment record. Vendor fulfillment can be coordinated manually for the first small batch. Add custom APIs, inventory synchronization or Firebase only when the workflow needs them.

Required launch inputs: vendor identity and sample approval; material/capacity/size-chart/print specifications; costs and approved selling prices; initial quantity or made-to-order lead time; shipping geography and charges; seller identity/contact and return/refund process; payment account and reconciliation method; rights for production artwork. These are missing launch inputs, not defaults to invent.

## Phase 2: learn and expand

Measure interest by design, conversion, gross margin after all fulfillment costs, dispatch time, defects, returns and repeat purchase. Targets follow vendor economics and initial demand. Analytics is deferred until configured; no collection is active in this preview. Consider botanical stories, maker collaborations and new products after the first collection works.

## Editorial and organizational boundaries

Parent: Odisha Collective. The store can reference credited encyclopedia material, but sales do not buy coverage or determine historical conclusions. A Bangalore supplier is not automatically an Odisha artisan; describe actual manufacture accurately. Store product approvals and releases are independent of UTP editorial approvals.

## Persistence and architecture

Catalogue/design metadata: Git. Temporary selection: visitor's browser only, containing SKU/variant/quantity, never PII. Future paid orders: restricted hosted commerce/order system. Payment credentials and customer data stay out of Git. The static client cannot securely verify payment or keep secret credentials. No live provider integration is part of this version.


## Range refinement recorded during implementation

Founder specified “T-shirt, Jhula Bag, Coffee cup and water bottle” and confirmed “Only the T-shirt in black”. These four product types replace the initial two-tee/two-cup studies. Natural bag, paper cup and sea-blue bottle colours remain design proposals. All four carry Utkal branding; English and Odia artwork remain separate. Material, sizing, capacity and price still await vendor evidence.

## Design development v0.2

Sea & Stone is the first coordinated merchandise proposal. Four AI-generated product mockups now replace the CSS placeholders. A seventh page, `/design-review/`, compares each render with its flat outlined SVG artwork. The downloadable review pack includes brand variants, merchandise studies, font licence and [vendor sample brief](vendor-brief-v1.md). These are design candidates; supplier geometry, sample approval and final manufacturing files remain open.

## Sample development v0.3

Founder authorized consistent artwork and four product sheets, then asked for a story on the cup. [Sample pack v2](sample-pack-v2.md) records the proposed specifications, shared vector geometry, exact outlined story copy and current review state.

## Current sample direction

[Sample pack v3](sample-pack-v3.md) supersedes earlier cup copy and bottle construction proposals. The cup has a graphical story and prominent UTKAL lettering. Both matte black and Nila Sagara blue bottle colours are retained; premium vacuum-insulated construction, a carry-loop cap and replaceable seal are proposed for supplier evaluation. No product-performance claim or supplier commitment is made.

## Commerce planning v0.4

[Low-budget launch plan](commerce-launch-v0.1.md) evaluates the existing Astro site, external hosted checkout, Amazon India and staged marketplace expansion. Source remains in GitHub; the store must use a permitted commercial host rather than GitHub Pages. No provider, budget, price or commercial launch is approved by this proposal.

## Tasar Jhula refinement

Founder selected Tasar for the Jhula. [Current sample brief](sample-pack-v3.md) replaces the cotton-canvas outer with a Tasar silk target; lining, reinforcement, print process, composition, provenance and cost require sample confirmation.

## Shared story v0.5

[Current shared story v4](shared-story-v4.md) applies the cup scenes to Tasar bags and the black T-shirt back. New production masters are pending; earlier bag print and blank-back instructions are superseded.
