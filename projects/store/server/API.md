# Odisha Store preorder interest API (scratch candidate)

No payment, address collection, email sending, stock reservation or allocation. This is a single-process Node 24.15+ backend with private SQLite storage. Same-origin JSON requests only; all responses under `/api/` are `Cache-Control: no-store`.

## Catalog seed and responses

Seed is the existing `products.json` **array**, preserving each product's `id`, `name`, `description`, `image`, `variants` (strings), `currency`, `status`, optional `images` (local paths), `galleries` (`{src,caption}` entries or local paths), `concept_label`, `image_label`, `current_range_image`, `brand`, and existing descriptive/provenance fields. Add `variant_options:[{id:"black-m",label:"Black / M",unit_price_paise:null,currency:"INR",available_units:null,planned_units:null,preorders_open:true,fulfillment_note:"Not yet confirmed"}]`. The option labels must exactly match `variants` in order. Existing cart variant labels remain usable; resolve the selected label to an option ID when submitting interest.

IDs use lowercase ASCII letters/digits/hyphens, max64 characters. Option IDs must be unique within a product. Prices/supply are **null when unconfirmed**, not zero. Seed adds missing products/options on startup; it never overwrites an administrator's saved controls. Product descriptive metadata updates from the reviewed seed. Removed products/options become inactive without erasing prior interest records.

`GET /api/catalog` → `{products:[...],mode:"preorder_interest",payment_enabled:false,allocation_enabled:false,accepting_interest:true}`. Each product has `variant_options`, whose entries include `version` for optimistic editing. No private preorder data appears here. `accepting_interest` is false when admin credentials are missing/malformed; the frontend must not promise submission then.

`POST /api/preorders` JSON `{name,email,contact_consent:true,items:[{product_id,variant_id,quantity}],idempotency_key}`. Name 1–100 characters, email max254, max20 distinct items, quantity1–20 and total≤100. UUID-style random key of 32–128 ASCII URL-safe characters; use `crypto.randomUUID()`. Explicit contact consent is mandatory. Extra fields (including address/payment) rejected. Server validates selected variants are open. Interest does not reduce stock, even if available units are zero/unknown.

Success201 (replay200): `{id,status:"interest_received",replayed:false,no_payment:true,no_stock_reserved:true}`. Response does not echo personal data. Same key/same normalized payload returns same ID; a different payload conflicts409. Preserve the key until the request is known to succeed; change it when the form contents change.

## Private administration

`POST /api/admin/login` JSON `{password}` → `{authenticated:true,csrf_token,expires_at}` and session cookie. Cookie is Secure, HttpOnly, SameSite=Strict, Path=/, no Domain. No username exists: single authorized administrator. Missing/malformed server credential configuration returns503 and also disables public interest collection.

`GET /api/admin/session` → same session JSON. `POST /api/admin/logout` JSON `{}` invalidates session.

All admin writes except login require `X-CSRF-Token` matching the current session. **Every write**, including login and public interest, requires exact `Origin` equal to configured public origin and `Content-Type: application/json`. No CORS wildcard/credential sharing. Login is protected by exact origin and JSON content type before a session exists.

`GET /api/admin/catalog` → public catalog shape. `PATCH /api/admin/catalog` JSON `{product_id,variant_id,version,unit_price_paise,currency,available_units,planned_units,preorders_open,fulfillment_note}`. Only fields being changed need inclusion, except IDs/version. Nullable numbers are nonnegative integers (paise≤100000000, units≤1000000). Currency only INR. Note max500characters. Success `{variant:{...}}`; stale version409. IDs/titles cannot be changed here.

`GET /api/admin/preorders?limit=50&offset=0` → `{preorders:[{id,name,email,contact_consent:true,consent_text,created_at,updated_at,status,version,items:[{product_id,variant_id,quantity,product_title,variant_label,unit_price_paise,currency}]}],total,limit,offset}`. Price is the interest-time snapshot, not a charge or quote guarantee.

`PATCH /api/admin/preorders` JSON `{id,version,status}`. Status is `reviewed` or `closed`; transitions interest_received→reviewed/closed, reviewed→closed. No transition to confirmed/allocated/paid/shipped is implemented. Success `{id,status,version}`. Stale/conflicting transition409. `/api/admin/allocations` returns501 after authentication/CSRF; do not present allocation as available.

`DELETE /api/admin/preorders` JSON `{id,version}` requires the same authenticated session, exact Origin and CSRF token. Success `{id,deleted:true}` removes the entire private interest record (name, email, consent and item snapshot). Stale version409; already absent404. Only SHA-256 of its random idempotency key plus deletion time remains as a tombstone. Reusing that key returns410 `interest_deleted` after deletion/restart, even with changed details; it cannot silently recreate the record. A deliberate new expression of interest must use a fresh key. This does not send an email. SQLite secure-delete and a WAL checkpoint are applied; external backups/copies require their own retention/deletion procedure.

Errors: `{error:{code,message}}`, never request bodies, SQL or stack traces. 400invalid/unknown fields; 401no session;403origin/CSRF;404unknownroute/item;409closed variant/idempotency/stale state;410deleted submission key;413body>16KiB;415wrong type;429rate limit;503credentials unavailable.

Private data remains outside static output and Git repositories. TLS reverse-proxy configuration, backups, retention/removal policy and operational review must precede public use. Built-in rate limits are single-process defenses, not distributed anti-abuse infrastructure.
