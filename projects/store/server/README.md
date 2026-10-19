# Odisha Store: private preorder-interest backend candidate

This implementation uses Node **24.15+**, `node:sqlite`, `node:http` and `node:crypto`; no packages. The runtime SQLite module is release-candidate status in Node 24.15. The source follows the [versioned SQLite documentation](https://nodejs.org/download/release/v24.15.0/docs/api/sqlite.html) and [scrypt documentation](https://nodejs.org/download/release/v24.15.0/docs/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback).

Read `API.md` for the frontend contract. The server serves the built Store frontend and same-origin APIs. Run `npm run build`, then `npm start` with the settings below.

## Local use

Required environment settings: `ODS_CATALOG_PATH` (reviewed JSON array), `ODS_STATIC_PATH` (built site), `ODS_DATA_FILE` (private SQLite path **outside static output and Git**), `ODS_ORIGIN` (exact origin, e.g. `http://localhost:3000`) and `ODS_ADMIN_PASSWORD_HASH`. Optional `HOST` defaults127.0.0.1; only loopback hosts are accepted. `PORT` defaults3000. The private data directory must have0700 permissions and DB file0600; a new dedicated directory/file is created with these modes.

Generate a credential with exported async `makePasswordHash(password)`. It returns `scrypt$32768$8$1$<salt>$<digest>` using a random16-byte salt and64-byte result. Supply the password through protected local input/secret tooling; do not put raw passwords in shell history or Git. The application accepts the hash only. Hash format/parameters are validated. A missing/malformed hash disables admin access and public interest submissions; the catalog remains readable.

Start: `node server.mjs`. Startup logs a fixed loopback message only; HTTP handlers do not log request bodies, identifiers, cookies or customer details. Errors sent to clients do not include stack traces or SQL.

Sessions use Secure/HttpOnly/SameSite=Strict cookies by default. The normal deployment requires a TLS endpoint/proxy, preserving the configured Host header and same origin. For an explicitly local HTTP-only browser preview, set `ODS_ALLOW_INSECURE_LOCAL_SESSION=1`; this removes only Secure and is rejected for non-loopback origins. This preview exception is not a production deployment setting. No proxy IP headers are trusted: behind a proxy, per-address limits apply to the proxy, conservatively; reviewed proxy trust is future work.

## Verification

`node --test server.test.mjs` starts temporary loopback servers using synthetic test data in private OS temp directories. It tests catalog retention, idempotent/concurrent submissions, price snapshots, origin/CSRF/authentication, session rotation/expiry/logout, rate-limit persistence, invalid payloads, optimistic editing, status transitions, no stock decrement, static/path isolation and SQL binding. Test data is removed afterwards. No actual customer submissions or outgoing emails occur.

## Deliberate limits

- Interest is neither an order nor a reservation. No payment, address, fulfillment, allocation, stock decrement or email system exists. Admin statuses only track review/closure. Allocation API explicitly returns501.
- SQLite operations are synchronous and bounded. One backend process is intended. Reverse-proxy/TLS production configuration, load/penetration review, backups, backup retention/deletion procedures and operational readiness are not supplied or claimed.
- Names/email/consent are private plaintext within the database; file permissions are access control, not encryption at rest. Keep backups private and encrypted according to the eventual operating policy. No DB or real personal data belongs in Git.
- Contact consent text/version is persisted with every submission. The frontend should display the exact `CONSENT_TEXT` exported by server.mjs before the user checks consent. No checkbox may be preselected.
- An authenticated, CSRF/version-protected delete operation removes customer details and snapshots at request. It retains only a random-key hash tombstone to prevent replay; this is logical application deletion with SQLite secure-delete/checkpoint, not forensic erasure of backups or storage copies.
- There is no user account or public lookup endpoint. Admin has one account and one active session, with absolute eight-hour expiry; signing in again invalidates the old session, and changing the configured credential invalidates persisted sessions on restart.
- Catalog controls persist across restart, while reviewed metadata/active inventory follows the seed. Initial unknown price/available/planned units remain null. Admin-edited supply is a reported figure; no provider confirmation is inferred.

Browser retry protection retains only a random token and token-salted digest in sessionStorage; raw contact fields are not persisted there. It survives same-tab reload, not a new browser session. With session storage blocked, retries are protected only until reload. Catalogue descriptions, image provenance and variant definitions remain reviewed source data; the dashboard edits price, available/planned units, open state and timing notes.
