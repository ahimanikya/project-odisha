# Cultural chapter preservation

Compared the 47 unaffected cultural-book article fragments in the completed local full build with the observed production pages before horn-craft publication. All requests returned HTTP 200. Forty-six fragments matched byte-for-byte. The modern-art chapter matched after replacing one directly observed responsive-image URL pair for the same Binchana source and 480-pixel width. No prose, credits, layout, whitespace or arbitrary hashes were normalized.

`report.json` contains all routes, response statuses and fragment SHA-256 hashes. Only the differing chapter’s two fragments are retained. `recheck.py` can repeat the read-only comparison against an existing build; subsequent live changes may differ from this dated observation.

The observed image pair is the previously inspected local `5358a16ba141b6ae-480.webp` and live `f4e4108ab5b2cde9-480.webp`. This normalization does not assert byte or pixel equality of the two image encodings.

Limit: these are observed pre-publication production fragments, not a cryptographically bound historical deployment snapshot. The deliberately changed material-crafts chapter is excluded. Shell/footer changes are outside the compared article fragments.

Focused validation: `node --test tests/build.test.mjs tests/search-launch.test.mjs` passed 9 tests, 0 failures (62.8 seconds). The article route has an explicit search hold; the 11 proposed indexing routes remain unchanged.
