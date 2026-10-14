import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,copyFileSync,symlinkSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const html=(body='',catalog=[])=>'<meta name="robots" content="noindex"><script id="journey-data" type="application/json">'+JSON.stringify({catalog,starters:[]})+'</script>'+body;
function fixture(run){const dir=mkdtempSync(join(tmpdir(),'utkal-finalizer-'));try{for(const d of ['tools','editions','.coast-staging','dist-coast'])mkdirSync(join(dir,d));copyFileSync('tools/finalize-edition.py',join(dir,'tools/finalize-edition.py'));writeFileSync(join(dir,'dist-coast/index.html'),'Previous good edition');const config={routes:['/'],journey_ids:[],starter_ids:[]};const execute=()=>{writeFileSync(join(dir,'editions/coast.json'),JSON.stringify(config));return spawnSync('python3',[join(dir,'tools/finalize-edition.py')],{encoding:'utf8'});};run({dir,config,execute,put:(path,text)=>{const target=join(dir,'.coast-staging',path);mkdirSync(target.slice(0,target.lastIndexOf('/')),{recursive:true});writeFileSync(target,text);}});}finally{rmSync(dir,{recursive:true,force:true});}}
test('edition validation rejects duplicate route configuration before changing output',()=>fixture(({dir,config,execute,put})=>{config.routes.push('/');put('index.html',html());const result=execute();assert.notEqual(result.status,0);assert.match(result.stderr,/Duplicate edition configuration/);assert.equal(readFileSync(join(dir,'dist-coast/index.html'),'utf8'),'Previous good edition');}));
test('relative links and their fragments resolve within selected routes',()=>fixture(({dir,config,execute,put})=>{config.routes.push('/story/');put('index.html',html('<a href="story/#detail">Story</a>'));put('story/index.html',html('<h1 id="detail">Story</h1><a href="../">Home</a>'));const result=execute();assert.equal(result.status,0,result.stderr);assert.ok(existsSync(join(dir,'dist-coast/story/index.html')));}));
test('srcset candidates and stylesheet resources remain in the promoted edition',()=>fixture(({dir,execute,put})=>{put('index.html',html('<img src="/images/a.jpg" srcset="/images/a.jpg 1x, /images/b.jpg 2x" alt="Coast"><link rel="stylesheet" href="/style.css">'));put('images/a.jpg','a');put('images/b.jpg','b');put('style.css','body{background:url("/images/c.jpg")}');put('images/c.jpg','c');assert.equal(execute().status,0);for(const f of ['a','b','c'])assert.ok(existsSync(join(dir,'dist-coast/images/'+f+'.jpg')));}));
test('journey links must resolve their fragments before the candidate is promoted',()=>fixture(({dir,config,execute,put})=>{config.journey_ids=['place:test'];put('index.html',html('',[{id:'place:test',href:'/#missing'}]));const result=execute();assert.notEqual(result.status,0);assert.match(result.stderr,/Missing fragment/);assert.equal(readFileSync(join(dir,'dist-coast/index.html'),'utf8'),'Previous good edition');}));
test('duplicate catalogue IDs cannot pass a set-only comparison',()=>fixture(({config,execute,put})=>{config.journey_ids=['place:test'];put('index.html',html('',[{id:'place:test',href:'/'},{id:'place:test',href:'/'}]));assert.match(execute().stderr,/duplicate IDs/);}));
test('asset symlinks are refused without touching the previous preview',()=>fixture(({dir,execute,put})=>{put('index.html',html('<img src="/other.txt" alt="x">'));symlinkSync(join(dir,'dist-coast/index.html'),join(dir,'.coast-staging/other.txt'));assert.match(execute().stderr,/Symlinks/);assert.equal(readFileSync(join(dir,'dist-coast/index.html'),'utf8'),'Previous good edition');}));
test('only an explicitly declared text download is retained; undeclared files and fragments fail',()=>fixture(({dir,config,execute,put})=>{
 put('index.html',html('<a href="/assets/field-pack.txt" download>Download</a>'));put('assets/field-pack.txt','A blank field pack');put('assets/private-draft.txt','Held');
 assert.match(execute().stderr,/Link outside scope/);
 config.downloads=['/assets/field-pack.txt'];assert.equal(execute().status,0);assert.ok(existsSync(join(dir,'dist-coast/assets/field-pack.txt')));assert.ok(!existsSync(join(dir,'dist-coast/assets/private-draft.txt')));
 put('index.html',html('<a href="/assets/field-pack.txt#missing">Download</a>'));assert.match(execute().stderr,/Download must not contain a fragment/);
 config.downloads=['/assets/../private.txt'];assert.match(execute().stderr,/Invalid edition configuration/);
}));

test('only declared archive PDFs survive publication, with reader page fragments preserved',()=>fixture(({dir,config,execute,put})=>{
 put('index.html',html('<a href="/archive/poem.pdf#page=45">Poem</a>'));put('archive/poem.pdf','%PDF-1.4 sample');put('archive/private.pdf','Held');
 assert.match(execute().stderr,/Link outside scope/);
 config.documents=['/archive/poem.pdf'];assert.equal(execute().status,0);assert.ok(existsSync(join(dir,'dist-coast/archive/poem.pdf')));assert.ok(!existsSync(join(dir,'dist-coast/archive/private.pdf')));
 put('index.html',html());config.documents=['/archive/../private.pdf'];assert.match(execute().stderr,/Invalid edition configuration/);
 config.documents=['/archive/missing.pdf'];put('index.html',html('<a href="/archive/missing.pdf">Missing</a>'));assert.match(execute().stderr,/Missing asset/);
}));
