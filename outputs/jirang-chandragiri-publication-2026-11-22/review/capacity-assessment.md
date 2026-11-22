# Jirang–Chandragiri capacity assessment

Samanta,22 November2026. Input39da6cb89f49558148676b7162f7aab04a644c2e. Read-only assessment; only this report is written inside the checkout. No source changes, allowlist changes, build, Git mutation or publication.

## Finding

The23 delivered PNG paths outside the current optimizer scope save only **280,075 bytes combined** under the existing verified lossless method. Seven save nothing. There is no approximately1MB saving among these remaining PNGs. Adding every positive candidate would increase the stated73,938-byte headroom to354,013 bytes before the new article/image; that is insufficient as a general1MB margin and expands scope across16 assets.

Recommendation: do not expand the PNG allowlist broadly for this small saving. If the selected new image and route do not fit354KB, consider the single untouched Mentis Films JPEG described below, subject to explicit scope expansion and separate visual/delivery review. No transformation is implemented by this report.

Root subsequently measured the authentic monastery photograph: a960px WebP at quality85 plus the existing480/960px responsive variants totals391,234 bytes; the1200px choice totals465,908 bytes. These coordinator-reported measurements exceed the354,013-byte maximum PNG-only headroom before HTML growth. Root therefore selected continued assessment of the single Mentis JPEG alternative rather than broad PNG changes. I have not independently regenerated the new monastery derivatives in this scope.

## Existing boundaries and method

- Current PNG eligibility: characters/, images/poetry-jhula/, images/stories/ and41 exact additional paths. Those already eligible were excluded from this candidate search; no already-realized saving is counted again.
- Current JPEG allowlist has4 exact paths; Mentis Films is absent. Existing JPEG method is aspect-preserving3072px maximum,quality95,4:4:4,mozjpeg,keepMetadata, unique page-caption guard.
- Enumerated all23 remaining PNGs in actual local dist-publish, ordered by bytes; applied the existing exported losslessPNG function to in-memory input. Only temporary candidate files/measurements were written under /private/tmp/jirang-png-candidates.
- Every current public source and coastal file matched the delivered input bytes/hash for all23 candidates. Successful candidates retain dimensions, decodedRGBA buffers and every original non-IDAT chunk byte-for-byte; the function validates these before reporting success. It also checks equality of inflated scanlines during final IDAT recompression. No crop, colour change, metadata removal, URL change, markup change or book-content modification.
- Saved applicable modern-web guidance and repository standard remain in force; no frontend API change proposed and previously rejected unpinned CLI was not executed.

## Exact measured PNG candidates

| Delivery path | Current bytes | Candidate bytes | Saved bytes | Status |
| --- | ---: | ---: | ---: | --- |
| `assets/nimuhi/user-supplied-memorial.png` | 2327874 | 2251718 | 76156 | losslessly-recompressed |
| `assets/cinema/lipika-film-letter.png` | 959887 | 850767 | 109120 | losslessly-recompressed |
| `assets/cinema/literature-page-to-screen-20261030.png` | 703411 | 692740 | 10671 | losslessly-recompressed |
| `assets/cultural-book/author.png` | 635867 | 615403 | 20464 | losslessly-recompressed |
| `assets/cinema/pramod-paper-movement.png` | 601976 | 573227 | 28749 | losslessly-recompressed |
| `assets/cinema/shared-story-table-20261030.png` | 361541 | 340127 | 21414 | losslessly-recompressed |
| `assets/cultural-book/front-cover.png` | 347742 | 346125 | 1617 | losslessly-recompressed |
| `images/mirgan-kotpad/front-cover.png` | 284132 | 283299 | 833 | losslessly-recompressed |
| `assets/book-covers/cinema-back.png` | 234981 | 233661 | 1320 | losslessly-recompressed |
| `assets/nimuhi/gazetteer-1968.png` | 168639 | 165189 | 3450 | losslessly-recompressed |
| `images/mirgan-kotpad/back-cover.png` | 164368 | 163418 | 950 | losslessly-recompressed |
| `assets/cultural-book/back-cover.png` | 162491 | 161658 | 833 | losslessly-recompressed |
| `assets/book-covers/dongria-back.png` | 144576 | 143902 | 674 | losslessly-recompressed |
| `assets/odissi-abhinaya/abhinaya-reading.png` | 107829 | 107829 | 0 | not-smaller |
| `assets/odissi-tala-and-changing-cycles/tala-counts.png` | 92031 | 92031 | 0 | not-smaller |
| `assets/bhanita-and-poet-signatures/voices-and-signature.png` | 90562 | 90562 | 0 | not-smaller |
| `assets/balakati-metalcraft/process-overview.png` | 69205 | 69205 | 0 | not-smaller |
| `assets/abana-rasataranga/abana-script.png` | 67302 | 67302 | 0 | not-smaller |
| `assets/alankara-and-bhanja/alankara-reading.png` | 56667 | 56667 | 0 | not-smaller |
| `assets/dongria-book/hairpins.png` | 40443 | 39739 | 704 | losslessly-recompressed |
| `assets/dongria-book/cloth-band.png` | 34439 | 32053 | 2386 | losslessly-recompressed |
| `assets/book-covers/culture-spine.png` | 17882 | 17148 | 734 | losslessly-recompressed |
| `assets/utkal-favicon-64.png` | 3536 | 3536 | 0 | not-smaller |

Largest savings are lipika-film-letter109120B, supplied Nimuhi memorial76156B, Pramod illustration28749B, shared-story-table21414B and cultural-book author20464B. The two top assets alone save185276B; even all remaining assets do not reach1MB.

## Routes and preservation evidence

### `assets/nimuhi/user-supplied-memorial.png`
- Dimensions: 1080×1440; current public/coast/delivery bytes identical.
- Source/current SHA256: `aee7c57247e6613f32406a82cc332dea3516f1e2c26ca0b018413beb16ba2cc8`.
- Candidate SHA256: `507fda41769bf0bc6ac9aeffc705c5747fbab0c15d6c8015418f790f2b80ac02`.
- Equal decodedRGBA SHA256: `3c27e71d9b0cc059fd9b37254d47a91335100f3289479eaddef1dc09bd20aaeb`.
- Equal concatenated non-IDAT chunks SHA256: `c8751317d184de1620a8f56b230da30bed237dfc2ab4ed60f9c34e6a2f0de61a`.
- Inflated filtered scanline SHA256 at final compression step: `557f384d863f0916d6aacc16df7bb0ebf8167c567e94005dd7418165817a75d0`.
- Emitted HTML references: `/stories/nimuhi-temple/`.

### `assets/cinema/lipika-film-letter.png`
- Dimensions: 1536×1024; current public/coast/delivery bytes identical.
- Source/current SHA256: `4938de61df7e58d2ca274c1c6d90d92a9b3989b515918d1157d17259cfdcf206`.
- Candidate SHA256: `e6cedb9284a741843ae0e78c1787bad1de99d7f6af7e46a6406321af2138caa5`.
- Equal decodedRGBA SHA256: `f180a77bf1594f92f47aaea47da1674bc5a1a62a85c98c218939af322b931e1d`.
- Equal concatenated non-IDAT chunks SHA256: `e7eab47918fcf4700a2de1b58e42ec8d96ff0b01004b22dddd0f9eef7489b63d`.
- Inflated filtered scanline SHA256 at final compression step: `2562555bddc38b295a5b16534fbc8e467984e2caf19cf50a7c023ee7f6bff258`.
- Emitted HTML references: `/people/lipika-singh-darai/`.

### `assets/cinema/literature-page-to-screen-20261030.png`
- Dimensions: 1774×887; current public/coast/delivery bytes identical.
- Source/current SHA256: `5ef6ffe37cb9a46951cb2b72a7448cb90d4ac2855c82e63b5201d8d19f37136c`.
- Candidate SHA256: `3c44271e59cf94e1a4364d684fb10b4e33579b61353a51f4cdb27b3c93c88dbd`.
- Equal decodedRGBA SHA256: `3d5e64ce7cae31be21cef92b1488259be4b7c631cf2c835c54ad113195cc9bac`.
- Equal concatenated non-IDAT chunks SHA256: `1d1f51d31cc00189bfa95b903151960f26ff0e894af31f8503f8305bb7547467`.
- Inflated filtered scanline SHA256 at final compression step: `e8325fa7af7a58a1b1320e9ae5b744d3e85aa8a5f44e0e54d2b51ca0a1f65cad`.
- Emitted HTML references: `/cinema/literature-and-screen/`.

### `assets/cultural-book/author.png`
- Dimensions: 600×600; current public/coast/delivery bytes identical.
- Source/current SHA256: `49b203a4c68f277d80b5e3204fcf73175d74576dd6f24a26d4ebb4736457d616`.
- Candidate SHA256: `71e242a06f3ea39e119c1732e0b4d30168b5f0f54ef1846aebf0217a3c4cc8be`.
- Equal decodedRGBA SHA256: `c7da257f7bbb7c0385d8beb517ad7923893a79ce51aa555333e2c5056ff81185`.
- Equal concatenated non-IDAT chunks SHA256: `c8b28cf90ac0121da8b1a671829d81d251495790f405a52d33dfc723299a2cc8`.
- Inflated filtered scanline SHA256 at final compression step: `15ab3e0a22f81f95018cc64abb015777a17b3985e0834f96951a2ba68e6ec050`.
- Emitted HTML references: `/books/odisha-culture-memory-and-living-traditions/`.

### `assets/cinema/pramod-paper-movement.png`
- Dimensions: 1959×803; current public/coast/delivery bytes identical.
- Source/current SHA256: `1e036503944e86ed001458d8b00df76c6e914d6058285f25c947baf897412f3c`.
- Candidate SHA256: `11aebaaeebef7a5f405c72d98670fb5d46af24edfd9ac1a4d2db535ef4f87b34`.
- Equal decodedRGBA SHA256: `e8bc37187239929c2b2af3673a447b8be62454028cfd95825afe400586cc6dff`.
- Equal concatenated non-IDAT chunks SHA256: `bb6e049b7c070808d1216ceb3835f11a2e1a54f64a8e97cdd8d294aef5333c51`.
- Inflated filtered scanline SHA256 at final compression step: `bff31e4a1681fc07718fabbb021dc066f4aa79ac68578f3699971adca9bda8a3`.
- Emitted HTML references: `/people/pramod-pati/`.

### `assets/cinema/shared-story-table-20261030.png`
- Dimensions: 1774×887; current public/coast/delivery bytes identical.
- Source/current SHA256: `23c6d33e3304641fccfa5e937e7f2d6bce9a1d9d59d801c491ce1ac0ae9cf4ef`.
- Candidate SHA256: `1d903876f8f8f013382e3dc46d67b92fbadcd8dad885c9aa0160a4db4de3480b`.
- Equal decodedRGBA SHA256: `8c11e1a8d57f9dbca143f06c1d7e1fd5dd48aae5ec31432f83d83ea5289b8dcd`.
- Equal concatenated non-IDAT chunks SHA256: `532f7cf42ad03daa28f5e1a3aa71f3d2ca3fd538f6b6a64cf3c205b8b588e803`.
- Inflated filtered scanline SHA256 at final compression step: `77afddf6a3d2da2b78d9bfa840bfda476c98982eb7b11b1ae748e2a6db792093`.
- Emitted HTML references: `/cinema/cinema-futures/`.

### `assets/cultural-book/front-cover.png`
- Dimensions: 700×1000; current public/coast/delivery bytes identical.
- Source/current SHA256: `2226c724b6d38e88422670ebf06f9e4b003f07fc361ad3af571cf3b92421fa69`.
- Candidate SHA256: `c7dff26abc9a690d891b7d888741f91160326506ae173dc19d353086b9921a10`.
- Equal decodedRGBA SHA256: `b4cde5b85ee0ee76731e4b51dee0cadf9d0a0acba90d19e6e1385b3e04c841fd`.
- Equal concatenated non-IDAT chunks SHA256: `a165ddb66d9dda28ae20910136da55ba41d589e48c6e94da48f0e86ea1b240c9`.
- Inflated filtered scanline SHA256 at final compression step: `4e53c2332fcc5538a458db8440cb336932fa56fb953bdc71b2360f144f06d2f1`.
- Emitted HTML references: `/books/`, `/books/odisha-culture-memory-and-living-traditions/`, `/books/odisha-culture-memory-and-living-traditions/a-land-of-many-languages/`, `/books/odisha-culture-memory-and-living-traditions/rice-millets-and-the-agricultural-year/`, `/books/odisha-culture-memory-and-living-traditions/caste-labour-and-access-to-cultural-life/`, `/books/odisha-culture-memory-and-living-traditions/adivasi-worlds-and-community-knowledge/`, `/books/odisha-culture-memory-and-living-traditions/changing-towns-and-rural-lives/`, `/books/odisha-culture-memory-and-living-traditions/pala-daskathia-and-the-singing-story/`, `/books/odisha-culture-memory-and-living-traditions/pitha-sweets-and-the-festival-kitchen/`, `/books/odisha-culture-memory-and-living-traditions/cities-villages-and-cultural-landscapes/`, `/books/odisha-culture-memory-and-living-traditions/homes-courtyards-and-everyday-design/`, `/books/odisha-culture-memory-and-living-traditions/ports-boats-and-ocean-crossings/`, `/books/odisha-culture-memory-and-living-traditions/many-odishas/`, `/books/odisha-culture-memory-and-living-traditions/the-stage-the-street-and-the-festival/`, `/books/odisha-culture-memory-and-living-traditions/dhaga-dhamali-riddles-and-everyday-wit/`, `/books/odisha-culture-memory-and-living-traditions/keeping-culture-alive/`, `/books/odisha-culture-memory-and-living-traditions/growing-up-in-odisha/`, `/books/odisha-culture-memory-and-living-traditions/archives-libraries-and-the-digital-page/`, `/books/odisha-culture-memory-and-living-traditions/jagannath-and-the-many-worlds-of-puri/`, `/books/odisha-culture-memory-and-living-traditions/threads-of-place/`, `/books/odisha-culture-memory-and-living-traditions/places-to-learn-together/`, `/books/odisha-culture-memory-and-living-traditions/buddhist-and-jain-histories/`, `/books/odisha-culture-memory-and-living-traditions/odisha-beyond-its-borders/`, `/books/odisha-culture-memory-and-living-traditions/odia-in-manuscript-print-and-public-life/`, `/books/odisha-culture-memory-and-living-traditions/muslim-and-christian-lives-in-odisha/`, `/books/odisha-culture-memory-and-living-traditions/odissi-gotipua-and-expressive-performance/`, `/books/odisha-culture-memory-and-living-traditions/the-everyday-odia-table/`, `/books/odisha-culture-memory-and-living-traditions/the-craft-of-the-poem/`, `/books/odisha-culture-memory-and-living-traditions/odia-cinema-and-the-worlds-it-makes/`, `/books/odisha-culture-memory-and-living-traditions/modern-art-photography-and-public-heritage/`, `/books/odisha-culture-memory-and-living-traditions/stories-passed-from-voice-to-voice/`, `/books/odisha-culture-memory-and-living-traditions/mahima-dharma-and-the-poetry-of-bhima-bhoi/`, `/books/odisha-culture-memory-and-living-traditions/kalinga-utkala-and-odisha/`, `/books/odisha-culture-memory-and-living-traditions/poets-storytellers-and-the-changing-literary-world/`, `/books/odisha-culture-memory-and-living-traditions/the-seasonal-calendar/`, `/books/odisha-culture-memory-and-living-traditions/forest-hill-river-and-coast/`, `/books/odisha-culture-memory-and-living-traditions/temples-goddesses-and-local-shrines/`, `/books/odisha-culture-memory-and-living-traditions/chhau-dalkhai-ghumura-and-dhemsa/`, `/books/odisha-culture-memory-and-living-traditions/languages-on-new-screens/`, `/books/odisha-culture-memory-and-living-traditions/markets-makers-and-cultural-livelihoods/`, `/books/odisha-culture-memory-and-living-traditions/birth-marriage-mourning-and-remembrance/`, `/books/odisha-culture-memory-and-living-traditions/silver-metal-clay-stone-and-applique/`, `/books/odisha-culture-memory-and-living-traditions/radio-recordings-and-television/`, `/books/odisha-culture-memory-and-living-traditions/palm-leaf-paper-and-the-work-of-the-hand/`, `/books/odisha-culture-memory-and-living-traditions/women-as-makers-and-keepers-of-culture/`, `/books/odisha-culture-memory-and-living-traditions/listening-to-odisha/`, `/books/odisha-culture-memory-and-living-traditions/odissi-music-and-its-literary-worlds/`, `/books/odisha-culture-memory-and-living-traditions/sacred-food-and-shared-meals/`, `/books/odisha-culture-memory-and-living-traditions/pattachitra-and-the-painted-story/`, `/books/odisha-culture-memory-and-living-traditions/cloth-in-everyday-and-ceremonial-life/`.

### `images/mirgan-kotpad/front-cover.png`
- Dimensions: 767×1200; current public/coast/delivery bytes identical.
- Source/current SHA256: `91789c9bd8485afd5efb4951d1cc18e170c27515fdc0d1c5a094b60a6ab2f291`.
- Candidate SHA256: `24f2af94c23e09a52a288442d161beccd3955db23bf52389a4e52457bacf07b3`.
- Equal decodedRGBA SHA256: `d45429cbc995c86049d88c4722cc995c0df44bcfb7a67c5f439639160d491628`.
- Equal concatenated non-IDAT chunks SHA256: `86dddf1610b6c6a346e88e64b4d6e2e17b5bc74ff78b05935e9c5db192fa75a2`.
- Inflated filtered scanline SHA256 at final compression step: `12fd8bb6e769e9d4c8e10442d66cf481832682ecbae5791038ad9ddacdb0f741`.
- Emitted HTML references: `/destinations/deomali/`, `/books/`, `/explore/`, `/stories/kotpad/`, `/stories/kotpad/mirgan-households-and-geography/`, `/stories/kotpad/what-a-sari-price-reveals/`, `/stories/kotpad/water-roots-fuel/`, `/stories/kotpad/people-behind-a-textile/`, `/stories/kotpad/learning-and-the-future/`, `/stories/kotpad/book/`, `/stories/kotpad/support-programmes/`, `/stories/kotpad/historical-traces/`, `/stories/kotpad/where-cloth-travels/`, `/stories/kotpad/making-colour/`.

### `assets/book-covers/cinema-back.png`
- Dimensions: 801×1200; current public/coast/delivery bytes identical.
- Source/current SHA256: `1e3fda12b0020fa8a66dec6fc775c178f11561c415fb184440616542622fe8a0`.
- Candidate SHA256: `3caeb36f7fd6be718299306b46bfc70804e3308e1ef4b02ad63ade1169f93bc4`.
- Equal decodedRGBA SHA256: `12498a4dff641a92d261b66c55d53562af5114508149e46b1b5e2c91eeca6a0c`.
- Equal concatenated non-IDAT chunks SHA256: `6df4cd9e85dcf688e53eae01b307f1cf32170c25448e09135003613c9afeb71f`.
- Inflated filtered scanline SHA256 at final compression step: `87ef344c69aa471e2d71cb6511671fcb9ce80113c33d247724fe77711430c44e`.
- Emitted HTML references: `/books/`.

### `assets/nimuhi/gazetteer-1968.png`
- Dimensions: 1038×1600; current public/coast/delivery bytes identical.
- Source/current SHA256: `af0ae4dac453a3ead3660c26a960f744192c4d7f7198801a22b6167d8e5053d6`.
- Candidate SHA256: `7d348766c5612d0fac37961c8f3f38a3efbefee56a9e060410837da7a23478bc`.
- Equal decodedRGBA SHA256: `19ac939a379be8396af6de809607ab3fb41682b489c37895a4ebce4e4e03baa8`.
- Equal concatenated non-IDAT chunks SHA256: `e71e8e74fd3e1993961dbfb67407434fe058b8cd16970d8903147dcd8381a625`.
- Inflated filtered scanline SHA256 at final compression step: `7ea0502ea2a9a818f2a1a699c9386af9407af84ed0a7543d3d91a7bef46c5ac2`.
- Emitted HTML references: `/stories/nimuhi-temple/`.

### `images/mirgan-kotpad/back-cover.png`
- Dimensions: 767×1200; current public/coast/delivery bytes identical.
- Source/current SHA256: `0db2bc3f6dcc26574512805c290b7479c3c2e9862a72f59a1703f5845c761781`.
- Candidate SHA256: `49e8ccd0a58549dbc378975e987018f7941af2db3dfc2da616e7c0799e044813`.
- Equal decodedRGBA SHA256: `78dbd9dd6f6d5a40292368a07f4b3d0a57e43e70c09466f47f44b7e4b3f52ed5`.
- Equal concatenated non-IDAT chunks SHA256: `86dddf1610b6c6a346e88e64b4d6e2e17b5bc74ff78b05935e9c5db192fa75a2`.
- Inflated filtered scanline SHA256 at final compression step: `03130ca1a33cfc7cb0eefcbaf10da58ea10ab4ee6d2e7f9c307cd726926744e0`.
- Emitted HTML references: `/books/`.

### `assets/cultural-book/back-cover.png`
- Dimensions: 700×1000; current public/coast/delivery bytes identical.
- Source/current SHA256: `495059a0e58d14e86a17f8e7e59b4601e14f30cade3b94f6e8f8810f09a235cf`.
- Candidate SHA256: `cfb7f3ca19e12c01019c161a9121da77ba86ab5f6517cd91b63f74516aa8303e`.
- Equal decodedRGBA SHA256: `c277523e437e55475a7d2dbeac805409b6333ca8b0c7d4d521d5175f27184f25`.
- Equal concatenated non-IDAT chunks SHA256: `a165ddb66d9dda28ae20910136da55ba41d589e48c6e94da48f0e86ea1b240c9`.
- Inflated filtered scanline SHA256 at final compression step: `74ecf770ba3040e60ce5b913447c4e3e071d7a0548599b0bdb59c6b7e439947c`.
- Emitted HTML references: `/books/`.

### `assets/book-covers/dongria-back.png`
- Dimensions: 800×1000; current public/coast/delivery bytes identical.
- Source/current SHA256: `a126aaab837f8d1a5a88a2c0ca28ca628a807d855d68df9152d3331262852ea7`.
- Candidate SHA256: `22d20cd12d7d8fa215f2199d26083ddb7a53330a473a51a29fa15cc50ae9875e`.
- Equal decodedRGBA SHA256: `b36308387bf75bffe64be9b3e94498bb38e82cea6941d65ab7891080d3c9535b`.
- Equal concatenated non-IDAT chunks SHA256: `dc7ac51d859a67958736bce1dc3482c27def881db5c59234d3f9012d92703429`.
- Inflated filtered scanline SHA256 at final compression step: `3866b3810406ac2d9b453ddd51ee11489cafedf6597cd6efe093b707f422f8a9`.
- Emitted HTML references: `/books/`.

### `assets/dongria-book/hairpins.png`
- Dimensions: 600×365; current public/coast/delivery bytes identical.
- Source/current SHA256: `2b9db4dde741a8d54482fa6b5ff9cb8b0f20d2b8485d9a27ce581c7a6c984ae0`.
- Candidate SHA256: `e09fcef48776d955be201daca3f0c8f5c41626ae119a396c4890b23c1e91f1fc`.
- Equal decodedRGBA SHA256: `3bab0ecd93b442128d6a58427ece4a0176afb151f94a2f9e62162db03d0c4bb7`.
- Equal concatenated non-IDAT chunks SHA256: `aeafa8c0e571bae34c21e89f23ac0506a9576aa6fccb54128a133634ba8306c1`.
- Inflated filtered scanline SHA256 at final compression step: `adeee270dce6ce9eeb9daca1b6f8d2ba171d909eb9d00faa1056c98209e516fd`.
- Emitted HTML references: `/stories/dongria/ornaments-in-use/`.

### `assets/dongria-book/cloth-band.png`
- Dimensions: 600×355; current public/coast/delivery bytes identical.
- Source/current SHA256: `6fd503ce4bd64a58de3ea794960a1e3e6b2bbb59698f710d014d27a0dc225e2b`.
- Candidate SHA256: `84a847772b02a301bbb31bbd901277ff6058f3882925e4077a35f2ec55600549`.
- Equal decodedRGBA SHA256: `9ef6d9c49c25501a6a9be6dc241d30c2ac4498b389dba6db3b93ae6fa2327cc3`.
- Equal concatenated non-IDAT chunks SHA256: `28eb18aad9b4729e5ed1f7a474cf134b837497a9d08c15ad4d1a7e0cdbedb053`.
- Inflated filtered scanline SHA256 at final compression step: `6d792d5b8f87b2cbef91b96153b15e5387202fe0f8416c19c5dc4ad653b75a51`.
- Emitted HTML references: `/stories/dongria/kapadaganda/`.

### `assets/book-covers/culture-spine.png`
- Dimensions: 104×1440; current public/coast/delivery bytes identical.
- Source/current SHA256: `f178accadb02c62f1da39ba5c26c082c417dc20f0f3fd42c1d2dbc9dc4b64bae`.
- Candidate SHA256: `eb7b5ed3f55d9aec414e8348ea7d89bafdbc614fb94364bbb76949c075eea499`.
- Equal decodedRGBA SHA256: `10e20983bd4955a2f1db44c56f7e17cd3190f287f8e58a385bc662a09ac72048`.
- Equal concatenated non-IDAT chunks SHA256: `8d18faf2ac5ad8d74bdf0f347b28cbffc67bb1157e7250e28c90b8aec8935bad`.
- Inflated filtered scanline SHA256 at final compression step: `d5b1d5b1d8eb128cf53bac522de9f82f957119084484e96c2cc4b24eec07f001`.
- Emitted HTML references: `/books/`.

## Single-photo alternative requiring separate authorization

`assets/bhubaneswar-week/mentis-films.jpg` remains unoptimized and byte-identical in public, coastal and delivered copies. Existing source is3737818B,5712×3213; previously generated existing-settings candidate is1279563B,3072×1728. **Verified saving2,458,255B**. Current hashes match the earlier measured originals/candidate exactly.

- Original/current SHA256: `798bc7eb53ac2fe76b29305d8c6d979952b32aa673156d7112291c94d11c1734`.
- Candidate SHA256: `49d0b2418bff5216afe5dd907acd7fcb0ff79b452a01bea97e702a29cf832d6d`.
- Source use: second photograph in `/stories/bhubaneswar-week/`; page sharing image remains the separate poem illustration. Unique caption: “At Mentis Films during the week in Bhubaneswar. Photograph supplied by Ahimanikya Satapathy.”
- This is a lossy resized delivery derivative, never a lossless claim. Original public/coastal image and source download remain preserved; delivered URL stays unchanged. Add a full-frame resized/compressed statement only to this unique caption. Preserve existing conversations caption and sharing metadata.
- Earlier measured ICC/IPTC/XMP and orientation preservation; current file hashes bind the candidate to those measurements. RGB RMSE1.5457489676/255,PSNR44.3480243065dB compared with original resized to the same derivative geometry. These metrics do not measure downsampling information loss.
- I re-inspected the retained display comparison at695px per image and native-scale face/fabric/poster detail comparison. No conspicuous visual degradation observed. A separate reviewer should inspect the same comparisons before selection.
- Evidence remains `/private/tmp/mahendragiri-capacity/mentis-films-3072-q95.jpg`, `mentis-films-display-comparison.png`, `mentis-films-detail-comparison.png`, and `measurements.json`; no copied evidence asset is added to this checkout in this scope.
- Projected baseline after this one JPEG saving:997467807B; projected headroom2532193B before new image/article and tiny caption change. This is an arithmetic projection, not a new build result.

## Minimal later scope and gates

If root chooses one PNG or a bounded subset: edit only `projects/site/tools/optimize-publication-png.mjs` exact additional paths and the matching exact-list regression in `projects/site/tests/publication-png.test.mjs`. Existing algorithm and strict gate stay unchanged. The measured amount cannot provide1MB regardless of subset.

If root chooses the single JPEG: reserve only `projects/site/tools/optimize-publication-jpeg.mjs` and `projects/site/tests/publication-jpeg.test.mjs`, adding the exact Mentis path/full-caption guard and a regression preserving source, sibling photo caption and sharing metadata. No global quality change or blanket asset rule.

Run the relevant targeted regression, then coordinated local/coastal/publication and actualLinux gates. Verify final emitted hashes, decoded dimensions/profile metadata, unchanged originals, credit text and live image. Platform encoders can differ slightly: use actualLinux payload, never assume local candidate bytes are the final published hash. All public book URLs/content and retained originals must remain.

Assessment scope released. Root selection and authorization required before implementation.
