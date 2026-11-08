import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const stage=process.env.CHARACTER_IMAGE_STAGE||'dist';
assert.ok(['source','dist','dist-coast','dist-publish'].includes(stage));
const hash=b=>createHash('sha256').update(b).digest('hex');
const mappings=[
  {
    "page": "/characters/films/malati-stay-a-moment/first-cut-v1.html",
    "alias": "/characters/films/malati-stay-a-moment/first-cut-v1/pencil-storyboard-v3.png",
    "canonical": "/characters/films/malati-stay-a-moment/pencil-storyboard-v3.png",
    "count": 2,
    "source_sha256": "aaf46b90dab40725a2d72e88aa83ce4777683d908e55e711734140516be0921f"
  },
  {
    "page": "/characters/films/malati-stay-a-moment/revised-cut-v2.html",
    "alias": "/characters/films/malati-stay-a-moment/revised-cut-v2/pencil-storyboard-v3.png",
    "canonical": "/characters/films/malati-stay-a-moment/pencil-storyboard-v3.png",
    "count": 2,
    "source_sha256": "aaf46b90dab40725a2d72e88aa83ce4777683d908e55e711734140516be0921f"
  },
  {
    "page": "/characters/films/nilu-hold-this-end/first-cut-v1.html",
    "alias": "/characters/films/nilu-hold-this-end/first-cut-v1/pencil-storyboard-v4.png",
    "canonical": "/characters/films/nilu-hold-this-end/pencil-storyboard-v4.png",
    "count": 2,
    "source_sha256": "6b052a0fc5320c902fc59ac0d9a8691e8904c4c4a96cf0f282289cee54cf34ee"
  },
  {
    "page": "/characters/films/nilu-hold-this-end/revised-cut-v2.html",
    "alias": "/characters/films/nilu-hold-this-end/revised-cut-v2/pencil-storyboard-v4.png",
    "canonical": "/characters/films/nilu-hold-this-end/pencil-storyboard-v4.png",
    "count": 2,
    "source_sha256": "6b052a0fc5320c902fc59ac0d9a8691e8904c4c4a96cf0f282289cee54cf34ee"
  },
  {
    "page": "/characters/films/chiku-round-the-stone/revised-cut-v2.html",
    "alias": "/characters/films/chiku-round-the-stone/revised-cut-v2/colour-storyboard-v1.png",
    "canonical": "/characters/films/chiku-round-the-stone/first-cut-v1/colour-storyboard-v1.png",
    "count": 2,
    "source_sha256": "7d183d6b09b1f15f78d0a8fe914549f8214f9cbdd6f73c208eb279de95899cb3"
  },
  {
    "page": "/characters/films/chiku-round-the-stone/film-v3.html",
    "alias": "/characters/films/chiku-round-the-stone/film-v3/colour-storyboard-v1.png",
    "canonical": "/characters/films/chiku-round-the-stone/first-cut-v1/colour-storyboard-v1.png",
    "count": 2,
    "source_sha256": "7d183d6b09b1f15f78d0a8fe914549f8214f9cbdd6f73c208eb279de95899cb3"
  },
  {
    "page": "/characters/films/saanta-wrong-ending/first-cut-v1.html",
    "alias": "/characters/films/saanta-wrong-ending/first-cut-v1/colour-storyboard-v1.png",
    "canonical": "/characters/films/saanta-wrong-ending/colour-storyboard-v1.png",
    "count": 2,
    "source_sha256": "acbc378a69cc7300e7c550c4c843921a4153b8682ab7b4b90e536c006e5b8653"
  },
  {
    "page": "/characters/films/dinu-wait-a-moment/first-cut-v1.html",
    "alias": "/characters/films/dinu-wait-a-moment/first-cut-v1/pencil-storyboard-v1.png",
    "canonical": "/characters/films/dinu-wait-a-moment/pencil-storyboard-v1.png",
    "count": 2,
    "source_sha256": "e24d5957040a5295f8c71d522a63abb21d64cda1e7a11fd7fb900474db265793"
  },
  {
    "page": "/characters/films/benu-my-story-first/first-cut-v1.html",
    "alias": "/characters/films/benu-my-story-first/first-cut-v1/pencil-storyboard-v1.png",
    "canonical": "/characters/films/benu-my-story-first/pencil-storyboard-v1.png",
    "count": 2,
    "source_sha256": "2a97c03fd9b91917d2af1d6755ebe37ca52fd04e079b5353a3082321c76d03ca"
  },
  {
    "page": "/characters/films/koeli-little-sound/first-cut-v1.html",
    "alias": "/characters/films/koeli-little-sound/first-cut-v1/colour-storyboard-v2.png",
    "canonical": "/characters/films/koeli-little-sound/colour-storyboard-v2.png",
    "count": 2,
    "source_sha256": "977bb6401bb756ddeef1e30df94f49aa1990a732c77ede954c4286bf70104f61"
  },
  {
    "page": "/characters/films/boita-small-bundle/index.html",
    "alias": "/characters/films/boita-small-bundle/references/cast-natural-v2.png",
    "canonical": "/characters/boita-sadhaba/assets/cast-natural-v2.png",
    "reference": "references/cast-natural-v2.png",
    "count": 1,
    "source_sha256": "96fb9d38c99213f57c04440cfa15754cad8a7f40fe3a743e736711827f1e8c6b"
  }
];
test('eight storyboard groups retain byte-identical originals and21 canonical HTML image links',()=>{
 const coast=JSON.parse(readFileSync('editions/coast.json','utf8'));let count=0;
 for(const m of mappings){
  const original=readFileSync('public'+m.alias),canonical=readFileSync('public'+m.canonical);
  assert.equal(hash(original),m.source_sha256);assert.ok(original.equals(canonical),m.alias);
  assert.ok(!coast.downloads.includes(m.alias));assert.ok(coast.downloads.includes(m.canonical));
  const html=readFileSync('public'+m.page,'utf8');assert.ok(!html.includes(m.alias));
  if(m.reference)assert.ok(!html.includes('"'+m.reference+'"'));
  const refs=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].filter(x=>x[1]===m.canonical);
  assert.equal(refs.length,m.count,m.page);count+=refs.length;
 }
 assert.equal(count,21);assert.equal(new Set(mappings.map(m=>m.canonical)).size,8);
});
test(`published canonical images resolve and duplicated deliveries are absent (${stage})`,{skip:stage==='source'},()=>{
 for(const m of mappings){assert.ok(existsSync(stage+m.canonical),m.canonical);if(stage!=='dist')assert.ok(!existsSync(stage+m.alias),m.alias);}
 const files=[];function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())walk(p);else if(e.name.endsWith('.html'))files.push(p);}}walk(stage);
 for(const file of files){
  const html=readFileSync(file,'utf8'),page='/'+file.slice(stage.length+1);
  for(const m of mappings)assert.ok(!html.includes(m.alias),file+' stale alias');
  for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
   const url=new URL(ref.replaceAll('&amp;','&'),'https://projectodisha.org'+page);
   if(url.origin!=='https://projectodisha.org'||!url.pathname.startsWith('/characters/')||!/[.](?:png|jpe?g|webp)$/i.test(url.pathname))continue;
   assert.ok(existsSync(stage+decodeURIComponent(url.pathname)),file+' missing '+ref);
  }
 }
});
