import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,createHash,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {readFileSync,writeFileSync,mkdirSync,realpathSync,lstatSync,statSync,existsSync,openSync,closeSync} from 'node:fs';
import {resolve,dirname,join,relative,extname,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
const scryptAsync=promisify(scrypt),hash=value=>createHash('sha256').update(value).digest('hex');
const ID=/^[a-z0-9][a-z0-9-]{0,63}$/,validId=value=>typeof value==='string'&&ID.test(value),SESSION_NAME='ods_admin',BODY_LIMIT=16384;
export const CONSENT_TEXT='I agree that Odisha Store may contact me by email about this preorder interest. No payment or stock reservation is made.';
class Failure extends Error{constructor(status,code,message){super(message);this.status=status;this.code=code;}}
const fail=(status,code,message)=>{throw new Failure(status,code,message)};
const insist=(ok,message)=>{if(!ok)fail(400,'invalid_request',message)};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function keys(value,allowed){insist(object(value),'Expected a JSON object.');insist(Object.keys(value).every(k=>allowed.includes(k)),'Unexpected request field.');}
function string(value,max,label){insist(typeof value==='string'&&value.trim().length>0&&value.trim().length<=max&&!/[\u0000-\u001f\u007f]/.test(value),`Invalid ${label}.`);return value.trim();}
function nullableInteger(value,max,label){insist(value===null||(Number.isSafeInteger(value)&&value>=0&&value<=max),`Invalid ${label}.`);return value;}
function note(value){insist(typeof value==='string'&&value.length<=500&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value),'Invalid fulfillment note.');return value.trim();}
function controls(value){return {unit_price_paise:nullableInteger(value.unit_price_paise??null,100000000,'unit price'),currency:value.currency??'INR',available_units:nullableInteger(value.available_units??null,1000000,'available units'),planned_units:nullableInteger(value.planned_units??null,1000000,'planned units'),preorders_open:value.preorders_open??false,fulfillment_note:note(value.fulfillment_note??'')};}
function safeImage(value){return typeof value==='string'&&value.startsWith('/')&&!value.startsWith('//')&&!/[\\\u0000-\u001f]/.test(value)&&!value.split('/').includes('..');}
function imageViewport(input){
 const fields=['image_view','image_width','image_height'];
 if(!fields.some(key=>input[key]!==undefined))return {};
 insist(fields.every(key=>input[key]!==undefined),'Image viewport requires view and both dimensions.');
 const {image_width:width,image_height:height,image_view:view}=input;
 insist(Number.isSafeInteger(width)&&width>0&&width<=20000&&Number.isSafeInteger(height)&&height>0&&height<=20000,'Invalid image dimensions.');
 insist(typeof view==='string'&&view.length<=100&&/^(?:0|[1-9]\d{0,4})(?: (?:0|[1-9]\d{0,4})){3}$/.test(view),'Invalid image viewport.');
 const [x,y,w,h]=view.split(' ').map(Number);
 insist(w>0&&h>0&&x+w<=width&&y+h<=height,'Image viewport lies outside its source image.');
 return {image_view:view,image_width:width,image_height:height};
}
export function validateSeed(input){
 insist(Array.isArray(input)&&input.length>0&&input.length<=100,'Seed must contain 1–100 products.');
 const seen=new Set();
 return input.map(raw=>{
  insist(object(raw)&&validId(raw.id)&&!seen.has(raw.id),'Invalid or duplicate product ID.');seen.add(raw.id);
  const name=string(raw.name,150,'product name'),description=string(raw.description,3000,'description');
  insist(safeImage(raw.image),'Product image must be a local absolute path.');
  insist(Array.isArray(raw.variant_options)&&raw.variant_options.length>0&&raw.variant_options.length<=100,'Invalid variant options.');
  const ids=new Set(),labels=new Set();
  const options=raw.variant_options.map(v=>{
   insist(object(v)&&validId(v.id)&&!ids.has(v.id),'Invalid or duplicate variant ID.');ids.add(v.id);
   const label=string(v.label,150,'variant label');insist(!labels.has(label),'Duplicate variant label.');labels.add(label);
   const c=controls(v);insist(c.currency==='INR'&&typeof c.preorders_open==='boolean','Invalid variant currency/open flag.');
   return {id:v.id,label,...c};
  });
  insist(Array.isArray(raw.variants)&&raw.variants.length===options.length&&raw.variants.every((v,i)=>v===options[i].label),'Variants and option labels must match in order.');
  // Public descriptive metadata is allowlisted; private fields never flow from seed to API.
  const metadata={id:raw.id,name,description,image:raw.image,variants:raw.variants,currency:'INR',status:typeof raw.status==='string'?raw.status:'concept',price:null,...imageViewport(raw)};
  for(const field of ['concept_label','image_label','brand','kind','language','word','line','colour','collection'])if(raw[field]!==undefined){insist(typeof raw[field]==='string'&&raw[field].length<=500&&!/[\u0000-\u001f]/.test(raw[field]),`Invalid ${field}.`);metadata[field]=raw[field];}
  for(const field of ['artwork','proof','current_range_image'])if(raw[field]!==undefined){insist(raw[field]===null||safeImage(raw[field]),`Invalid ${field}.`);metadata[field]=raw[field];}
  if(raw.supplier_approved!==undefined){insist(typeof raw.supplier_approved==='boolean','Invalid supplier approval flag.');metadata.supplier_approved=raw.supplier_approved;}
  if(raw.images!==undefined){insist(Array.isArray(raw.images)&&raw.images.length<=30&&raw.images.every(safeImage),'Invalid images.');metadata.images=raw.images;}
  if(raw.galleries!==undefined){insist(Array.isArray(raw.galleries)&&raw.galleries.length<=30,'Invalid galleries.');metadata.galleries=raw.galleries.map(entry=>{
   if(typeof entry==='string'){insist(safeImage(entry),'Invalid gallery image.');return entry;}
   keys(entry,['src','caption','image_view','image_width','image_height']);insist(safeImage(entry.src),'Invalid gallery image.');return {src:entry.src,caption:string(entry.caption,500,'gallery caption'),...imageViewport(entry)};
  });}
  return {...metadata,variant_options:options};
 });
}
export async function makePasswordHash(password){
 if(typeof password!=='string'||password.length<14||password.length>1024)throw new Error('Password must contain 14–1024 characters.');
 const salt=randomBytes(16).toString('hex');const digest=await scryptAsync(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
 return `scrypt$32768$8$1$${salt}$${digest.toString('hex')}`;
}
function parsePasswordHash(value){
 if(typeof value!=='string')return null;
 const parts=value.split('$');if(parts.length!==6||parts[0]!=='scrypt'||parts[1]!=='32768'||parts[2]!=='8'||parts[3]!=='1'||!/^[a-f0-9]{32}$/.test(parts[4])||!/^[a-f0-9]{128}$/.test(parts[5]))return null;
 return {salt:parts[4],digest:Buffer.from(parts[5],'hex')};
}
function inside(path,root){const rel=relative(root,path);return rel===''||(!rel.startsWith('..'+sep)&&rel!=='..'&&!rel.startsWith(sep));}
function privateDatabase(file,staticRoot){
 if(file===':memory:')throw new Error('A persistent private database path is required.');
 const desired=resolve(file),parent=dirname(desired);mkdirSync(parent,{recursive:true,mode:0o700});
 const realParent=realpathSync(parent);if(inside(realParent,staticRoot))throw new Error('Database must be outside the static directory.');
 for(let p=realParent;;p=dirname(p)){if(existsSync(join(p,'.git')))throw new Error('Database must be outside Git repositories.');if(dirname(p)===p)break;}
 if((statSync(realParent).mode&0o077)!==0)throw new Error('Database directory must be private (mode 0700).');
 if(existsSync(desired)){const stat=lstatSync(desired);if(stat.isSymbolicLink()||!stat.isFile()||stat.nlink!==1||(stat.mode&0o077)!==0)throw new Error('Database must be a private regular file (mode 0600).');}
 else{const fd=openSync(desired,'wx',0o600);closeSync(fd);}
 const actual=realpathSync(desired);if(inside(actual,staticRoot))throw new Error('Database must be outside static directory.');return actual;
}
function initialize(db,seed){
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA secure_delete=ON;
 CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,metadata TEXT NOT NULL,active INTEGER NOT NULL CHECK(active IN(0,1))) STRICT;
 CREATE TABLE IF NOT EXISTS variants(product_id TEXT NOT NULL REFERENCES products(id),id TEXT NOT NULL,label TEXT NOT NULL,unit_price_paise INTEGER CHECK(unit_price_paise>=0),currency TEXT NOT NULL CHECK(currency='INR'),available_units INTEGER CHECK(available_units>=0),planned_units INTEGER CHECK(planned_units>=0),preorders_open INTEGER NOT NULL CHECK(preorders_open IN(0,1)),fulfillment_note TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,active INTEGER NOT NULL CHECK(active IN(0,1)),PRIMARY KEY(product_id,id)) STRICT;
 CREATE TABLE IF NOT EXISTS preorders(id TEXT PRIMARY KEY,idempotency_hash TEXT NOT NULL UNIQUE,payload_hash TEXT NOT NULL,name TEXT NOT NULL,email TEXT NOT NULL,consent_text TEXT NOT NULL,items TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN('interest_received','reviewed','closed')),version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL) STRICT;
 CREATE TABLE IF NOT EXISTS preorder_tombstones(idempotency_hash TEXT PRIMARY KEY,deleted_at TEXT NOT NULL) STRICT;
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,csrf_token TEXT NOT NULL,expires_at INTEGER NOT NULL) STRICT;
 CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires_at INTEGER NOT NULL) STRICT;
 CREATE TABLE IF NOT EXISTS server_meta(key TEXT PRIMARY KEY,value TEXT NOT NULL) STRICT;`);
 db.exec('BEGIN IMMEDIATE');try{
  db.exec('UPDATE products SET active=0; UPDATE variants SET active=0;');
  const product=db.prepare('INSERT INTO products VALUES (?,?,1) ON CONFLICT(id) DO UPDATE SET metadata=excluded.metadata,active=1');
  const variant=db.prepare('INSERT INTO variants(product_id,id,label,unit_price_paise,currency,available_units,planned_units,preorders_open,fulfillment_note,active) VALUES (?,?,?,?,?,?,?,?,?,1) ON CONFLICT(product_id,id) DO UPDATE SET label=excluded.label,active=1');
  for(const p of seed){const {variant_options,...meta}=p;product.run(p.id,JSON.stringify(meta));for(const v of variant_options)variant.run(p.id,v.id,v.label,v.unit_price_paise,v.currency,v.available_units,v.planned_units,Number(v.preorders_open),v.fulfillment_note);}
  db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');throw error;}
}
export function createStoreServer({catalogPath,dataFile,staticPath,origin,adminPasswordHash=process.env.ODS_ADMIN_PASSWORD_HASH,allowInsecureLocalSession=false,sessionTtlMs=8*60*60*1000,now=Date.now,limits={}}={}){
 if(!catalogPath||!dataFile||!staticPath||!origin)throw new Error('catalogPath, dataFile, staticPath and origin are required.');
 const publicOrigin=new URL(origin);if(publicOrigin.origin!==origin||!['http:','https:'].includes(publicOrigin.protocol))throw new Error('origin must be an exact HTTP(S) origin.');
 const isLocal=['127.0.0.1','localhost','[::1]'].includes(publicOrigin.hostname);
 if(publicOrigin.protocol==='http:'&&!isLocal)throw new Error('Non-local origin must use HTTPS.');
 if(allowInsecureLocalSession&&(!isLocal||publicOrigin.protocol!=='http:'))throw new Error('Insecure session exception is only allowed for loopback HTTP.');
 const staticRoot=realpathSync(resolve(staticPath));const dbPath=privateDatabase(dataFile,staticRoot);
 const seed=validateSeed(JSON.parse(readFileSync(catalogPath,'utf8')));
 const db=new DatabaseSync(dbPath,{timeout:3000,allowExtension:false});initialize(db,seed);
 const credentials=parsePasswordHash(adminPasswordHash),cookieSecure=!allowInsecureLocalSession;
 const credentialFingerprint=hash(credentials?adminPasswordHash:'not-configured');
 const previousCredential=db.prepare("SELECT value FROM server_meta WHERE key='credential_fingerprint'").get();
 if(previousCredential?.value!==credentialFingerprint){
  db.exec('BEGIN IMMEDIATE');try{
   db.exec('DELETE FROM sessions');
   db.prepare("INSERT INTO server_meta VALUES ('credential_fingerprint',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(credentialFingerprint);
   db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');db.close();throw error;}
 }
 const rates={login:8,loginGlobal:60,preorder:20,preorderGlobal:600,read:300,...limits};let passwordJobs=0;
 const tx=fn=>{db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}};
 function rate(req,bucket,max,window=15*60*1000,global=false){
  const stamp=now(),key=bucket+':'+(global?'all':hash(req.socket.remoteAddress||'unknown'));
  const denied=tx(()=>{db.prepare('DELETE FROM rate_limits WHERE expires_at<=?').run(stamp);
   let row=db.prepare('SELECT * FROM rate_limits WHERE key=?').get(key);
   if(row){if(row.count>=max)return true;db.prepare('UPDATE rate_limits SET count=count+1 WHERE key=?').run(key);}
   else{if(db.prepare('SELECT COUNT(*) AS n FROM rate_limits').get().n>=10000)return true;db.prepare('INSERT INTO rate_limits VALUES (?,1,?)').run(key,stamp+window);}return false;});
  if(denied)fail(429,'rate_limited','Please wait before trying again.');
 }
 function available(){if(!credentials)fail(503,'not_configured','Preorder administration is not configured.');}
 const option=v=>({id:v.id,label:v.label,unit_price_paise:v.unit_price_paise,currency:v.currency,available_units:v.available_units,planned_units:v.planned_units,preorders_open:Boolean(v.preorders_open),fulfillment_note:v.fulfillment_note,version:v.version});
 function catalog(){return {products:db.prepare('SELECT * FROM products WHERE active=1 ORDER BY rowid').all().map(p=>({...JSON.parse(p.metadata),variant_options:db.prepare('SELECT * FROM variants WHERE product_id=? AND active=1 ORDER BY rowid').all(p.id).map(option)})),mode:'preorder_interest',payment_enabled:false,allocation_enabled:false,accepting_interest:Boolean(credentials)};}
 function session(req){available();const cookies=(req.headers.cookie||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(SESSION_NAME+'='));if(cookies.length!==1)fail(401,'authentication_required','Please sign in.');
  const token=cookies[0].slice(SESSION_NAME.length+1);if(!/^[a-f0-9]{64}$/.test(token))fail(401,'authentication_required','Please sign in.');
  db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now());const row=db.prepare('SELECT * FROM sessions WHERE token_hash=?').get(hash(token));if(!row)fail(401,'authentication_required','Please sign in.');return row;
 }
 function writeGuard(req){if(req.headers.origin!==origin||req.headers['sec-fetch-site']==='cross-site')fail(403,'origin_rejected','This action must originate from this site.');if((req.headers['content-type']||'').split(';')[0].trim().toLowerCase()!=='application/json')fail(415,'json_required','Use application/json.');}
 function csrf(req,current){const value=req.headers['x-csrf-token'];if(typeof value!=='string'||!/^[a-f0-9]{64}$/.test(value)||!timingSafeEqual(Buffer.from(value),Buffer.from(current.csrf_token)))fail(403,'csrf_rejected','Refresh the administrator session and try again.');}
 async function body(req){
  if(Number(req.headers['content-length'])>BODY_LIMIT)fail(413,'body_too_large','Request body is too large.');
  const bytes=await new Promise((yes,no)=>{
   let size=0,chunks=[],done=false;
   req.on('data',part=>{if(done)return;size+=part.length;
    if(size>BODY_LIMIT){done=true;chunks=[];no(new Failure(413,'body_too_large','Request body is too large.'));return;}chunks.push(part);
   });
   req.once('end',()=>{if(!done){done=true;yes(Buffer.concat(chunks));}});
   req.once('error',()=>{if(!done){done=true;no(new Failure(400,'incomplete_body','Request body was incomplete.'));}});
   req.once('aborted',()=>{if(!done){done=true;no(new Failure(400,'incomplete_body','Request body was incomplete.'));}});
  });
  try{return JSON.parse(bytes.toString('utf8'));}catch{fail(400,'invalid_json','Invalid JSON body.');}
 }
 function cookie(value,maxAge){return `${SESSION_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${cookieSecure?'; Secure':''}`;}
 function json(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...(status===413?{'Connection':'close'}:{}),...headers});res.end(JSON.stringify(data));}
 const sessionReply=row=>({authenticated:true,csrf_token:row.csrf_token,expires_at:new Date(row.expires_at).toISOString()});
 function preorder(input){
  keys(input,['name','email','contact_consent','items','idempotency_key']);const name=string(input.name,100,'name'),email=string(input.email,254,'email').toLowerCase();
  insist(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Invalid email.');insist(input.contact_consent===true,'Explicit contact consent is required.');
  insist(typeof input.idempotency_key==='string'&&/^[a-zA-Z0-9_-]{32,128}$/.test(input.idempotency_key),'Invalid idempotency key.');
  insist(Array.isArray(input.items)&&input.items.length>0&&input.items.length<=20,'Choose 1–20 items.');let count=0;const unique=new Set();
  const items=input.items.map(item=>{keys(item,['product_id','variant_id','quantity']);insist(validId(item.product_id)&&validId(item.variant_id),'Invalid product or variant.');insist(Number.isInteger(item.quantity)&&item.quantity>=1&&item.quantity<=20,'Quantity must be 1–20.');count+=item.quantity;const key=item.product_id+'/'+item.variant_id;insist(!unique.has(key),'Duplicate item.');unique.add(key);return {product_id:item.product_id,variant_id:item.variant_id,quantity:item.quantity};}).sort((a,b)=>(a.product_id+'/'+a.variant_id).localeCompare(b.product_id+'/'+b.variant_id));
  insist(count<=100,'Total quantity exceeds 100.');const payloadHash=hash(JSON.stringify({name,email,contact_consent:true,items})),keyHash=hash(input.idempotency_key);
  return tx(()=>{if(db.prepare('SELECT 1 FROM preorder_tombstones WHERE idempotency_hash=?').get(keyHash))fail(410,'interest_deleted','This submission was deleted. A new expression of interest requires a new submission key.');const existing=db.prepare('SELECT id,status,payload_hash FROM preorders WHERE idempotency_hash=?').get(keyHash);if(existing){if(existing.payload_hash!==payloadHash)fail(409,'idempotency_conflict','This submission key has already been used for different details.');return {id:existing.id,status:'interest_received',replayed:true,no_payment:true,no_stock_reserved:true};}
   const snapshot=items.map(item=>{const v=db.prepare('SELECT v.*,p.metadata FROM variants v JOIN products p ON p.id=v.product_id WHERE v.product_id=? AND v.id=? AND v.active=1 AND p.active=1').get(item.product_id,item.variant_id);if(!v)fail(400,'unknown_variant','A selected option is unavailable.');if(!v.preorders_open)fail(409,'interest_closed','Interest collection is closed for a selected option.');return {...item,product_title:JSON.parse(v.metadata).name,variant_label:v.label,unit_price_paise:v.unit_price_paise,currency:v.currency};});
   const id=randomUUID(),time=new Date(now()).toISOString();db.prepare('INSERT INTO preorders(id,idempotency_hash,payload_hash,name,email,consent_text,items,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,\'interest_received\',?,?)').run(id,keyHash,payloadHash,name,email,CONSENT_TEXT,JSON.stringify(snapshot),time,time);
   return {id,status:'interest_received',replayed:false,no_payment:true,no_stock_reserved:true};
  });
 }
 function editCatalog(input){keys(input,['product_id','variant_id','version','unit_price_paise','currency','available_units','planned_units','preorders_open','fulfillment_note']);insist(validId(input.product_id)&&validId(input.variant_id)&&Number.isSafeInteger(input.version)&&input.version>0,'Invalid variant/version.');
  insist(Object.keys(input).some(k=>!['product_id','variant_id','version'].includes(k)),'No changes supplied.');
  return tx(()=>{const old=db.prepare('SELECT * FROM variants WHERE product_id=? AND id=? AND active=1').get(input.product_id,input.variant_id);if(!old)fail(404,'not_found','Option not found.');if(old.version!==input.version)fail(409,'stale_version','This option has changed. Refresh before editing.');
   const v={...option(old),...input};for(const key of ['unit_price_paise','available_units','planned_units'])nullableInteger(v[key],key==='unit_price_paise'?100000000:1000000,key);insist(v.currency==='INR'&&typeof v.preorders_open==='boolean','Invalid currency/open flag.');v.fulfillment_note=note(v.fulfillment_note);
   db.prepare('UPDATE variants SET unit_price_paise=?,currency=?,available_units=?,planned_units=?,preorders_open=?,fulfillment_note=?,version=version+1 WHERE product_id=? AND id=?').run(v.unit_price_paise,v.currency,v.available_units,v.planned_units,Number(v.preorders_open),v.fulfillment_note,input.product_id,input.variant_id);
   return {variant:option(db.prepare('SELECT * FROM variants WHERE product_id=? AND id=?').get(input.product_id,input.variant_id))};});
 }
 function listPreorders(url){const numeric=(key,defaultValue,max)=>{const s=url.searchParams.get(key);if(s===null)return defaultValue;insist(/^\d+$/.test(s),'Invalid pagination.');const n=Number(s);insist(Number.isSafeInteger(n)&&n>=0&&n<=max,'Invalid pagination.');return n;};const limit=numeric('limit',50,100),offset=numeric('offset',0,1000000);insist(limit>0,'Invalid limit.');
  return {preorders:db.prepare('SELECT id,name,email,consent_text,items,status,version,created_at,updated_at FROM preorders ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?').all(limit,offset).map(p=>({...p,items:JSON.parse(p.items),contact_consent:true})),total:db.prepare('SELECT COUNT(*) AS n FROM preorders').get().n,limit,offset};
 }
 function editPreorder(input){keys(input,['id','version','status']);insist(typeof input.id==='string'&&input.id.length===36&&Number.isSafeInteger(input.version)&&input.version>0,'Invalid interest/version.');insist(['reviewed','closed'].includes(input.status),'Only reviewed or closed statuses are supported; allocation is unavailable.');
  return tx(()=>{const old=db.prepare('SELECT status,version FROM preorders WHERE id=?').get(input.id);if(!old)fail(404,'not_found','Interest record not found.');if(old.version!==input.version||old.status==='closed'||old.status===input.status)fail(409,'invalid_transition','Interest status changed or transition is unavailable.');db.prepare('UPDATE preorders SET status=?,version=version+1,updated_at=? WHERE id=?').run(input.status,new Date(now()).toISOString(),input.id);return {id:input.id,status:input.status,version:old.version+1};});
 }
 function deletePreorder(input){
  keys(input,['id','version']);insist(typeof input.id==='string'&&input.id.length===36&&Number.isSafeInteger(input.version)&&input.version>0,'Invalid interest/version.');
  const result=tx(()=>{const old=db.prepare('SELECT version,idempotency_hash FROM preorders WHERE id=?').get(input.id);
   if(!old)fail(404,'not_found','Interest record not found.');if(old.version!==input.version)fail(409,'stale_version','This interest changed. Refresh before deleting.');
   db.prepare('INSERT INTO preorder_tombstones VALUES (?,?)').run(old.idempotency_hash,new Date(now()).toISOString());
   db.prepare('DELETE FROM preorders WHERE id=?').run(input.id);return {id:input.id,deleted:true};
  });
  // secure_delete clears freed database content; checkpoint reduces residual WAL
  // pages. This is not a promise to erase external backups or filesystem copies.
  db.exec('PRAGMA wal_checkpoint(TRUNCATE)');return result;
 }
 const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.webmanifest':'application/manifest+json','.pdf':'application/pdf'};
 function serveStatic(req,res){if(!['GET','HEAD'].includes(req.method))fail(405,'method_not_allowed','Method not allowed.');let path;try{path=decodeURIComponent(req.url.split('?')[0]);}catch{fail(400,'invalid_path','Invalid path.');}
  if(!path.startsWith('/')||/[\\\u0000]/.test(path)||path.split('/').some(x=>x.startsWith('.')))fail(404,'not_found','Not found.');let candidate=resolve(staticRoot,'.'+path);if(!inside(candidate,staticRoot))fail(404,'not_found','Not found.');
  try{candidate=realpathSync(candidate);if(!inside(candidate,staticRoot))fail(404,'not_found','Not found.');if(statSync(candidate).isDirectory())candidate=realpathSync(join(candidate,'index.html'));if(!inside(candidate,staticRoot)||!statSync(candidate).isFile()||!mime[extname(candidate)])fail(404,'not_found','Not found.');
   res.writeHead(200,{'Content-Type':mime[extname(candidate)],'Cache-Control':path.startsWith('/admin')?'no-store':'public, max-age=0, must-revalidate'});res.end(req.method==='HEAD'?undefined:readFileSync(candidate));
  }catch(error){if(error instanceof Failure)throw error;fail(404,'not_found','Not found.');}
 }
 const server=http.createServer({maxHeaderSize:8192,requestTimeout:15000,headersTimeout:10000},async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  try{
   if(req.headers.host!==publicOrigin.host)fail(421,'host_rejected','Unrecognized host.');
   const url=new URL(req.url,origin),path=url.pathname;if(!path.startsWith('/api/'))return serveStatic(req,res);
   rate(req,'read',rates.read,60*1000);
   if(!['GET','POST','PATCH','DELETE'].includes(req.method))fail(405,'method_not_allowed','Method not allowed.');
   if(req.method!=='GET')writeGuard(req);
   if(path==='/api/catalog'&&req.method==='GET')return json(res,200,catalog());
   if(path==='/api/preorders'&&req.method==='POST'){available();rate(req,'preorder',rates.preorder);rate(req,'preorder-global',rates.preorderGlobal,15*60*1000,true);const result=preorder(await body(req));return json(res,result.replayed?200:201,result);}
   if(path==='/api/admin/login'&&req.method==='POST'){
    available();rate(req,'login',rates.login);rate(req,'login-global',rates.loginGlobal,15*60*1000,true);const input=await body(req);keys(input,['password']);insist(typeof input.password==='string'&&input.password.length>0&&input.password.length<=1024,'Invalid password.');if(passwordJobs>=2)fail(429,'rate_limited','Please wait before trying again.');
    passwordJobs++;let digest;try{digest=await scryptAsync(input.password,credentials.salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});}finally{passwordJobs--;}
    if(!timingSafeEqual(digest,credentials.digest))fail(401,'invalid_credentials','Sign-in failed.');
    const token=randomBytes(32).toString('hex'),row={csrf_token:randomBytes(32).toString('hex'),expires_at:now()+sessionTtlMs};db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now());
    // Rotate every successful login: this intentionally supports one administrator session.
    tx(()=>{db.exec('DELETE FROM sessions');db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash(token),row.csrf_token,row.expires_at);});
    return json(res,200,sessionReply(row),{'Set-Cookie':cookie(token,Math.floor(sessionTtlMs/1000))});
   }
   if(path.startsWith('/api/admin/')){
    const current=session(req);if(req.method!=='GET')csrf(req,current);
    if(path==='/api/admin/session'&&req.method==='GET')return json(res,200,sessionReply(current));
    if(path==='/api/admin/logout'&&req.method==='POST'){keys(await body(req),[]);db.prepare('DELETE FROM sessions WHERE token_hash=?').run(current.token_hash);return json(res,200,{authenticated:false},{'Set-Cookie':cookie('',0)});}
    if(path==='/api/admin/catalog'&&req.method==='GET')return json(res,200,catalog());
    if(path==='/api/admin/catalog'&&req.method==='PATCH')return json(res,200,editCatalog(await body(req)));
    if(path==='/api/admin/preorders'&&req.method==='GET')return json(res,200,listPreorders(url));
    if(path==='/api/admin/preorders'&&req.method==='PATCH')return json(res,200,editPreorder(await body(req)));
    if(path==='/api/admin/preorders'&&req.method==='DELETE')return json(res,200,deletePreorder(await body(req)));
    if(path==='/api/admin/allocations')fail(501,'allocation_unavailable','Stock allocation is not implemented. Interest does not reserve stock.');
   }
   fail(404,'not_found','Not found.');
  }catch(error){if(res.headersSent){res.destroy();return;}const known=error instanceof Failure;json(res,known?error.status:500,{error:{code:known?error.code:'internal_error',message:known?error.message:'Request could not be completed.'}},known&&error.status===429?{'Retry-After':'900'}:{});}
 });
 server.keepAliveTimeout=5000;
 return {server,dbPath,async start({port=3000,host='127.0.0.1'}={}){if(!['127.0.0.1','::1','localhost'].includes(host))throw new Error('This candidate binds loopback only.');await new Promise((yes,no)=>{server.once('error',no);server.listen(port,host,()=>{server.off('error',no);yes();});});return server.address();},async close(){if(server.listening)await new Promise((yes,no)=>server.close(error=>error?no(error):yes()));db.close();}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const options={catalogPath:process.env.ODS_CATALOG_PATH,dataFile:process.env.ODS_DATA_FILE,staticPath:process.env.ODS_STATIC_PATH,origin:process.env.ODS_ORIGIN,allowInsecureLocalSession:process.env.ODS_ALLOW_INSECURE_LOCAL_SESSION==='1'};
 try{const app=createStoreServer(options);await app.start({port:Number(process.env.PORT||3000),host:process.env.HOST||'127.0.0.1'});process.stdout.write('Odisha Store candidate listening on loopback. No payment or allocation enabled.\n');for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await app.close();process.exit(0);});}catch{process.stderr.write('Startup failed. Check private data path, catalog, origin and server configuration.\n');process.exitCode=1;}
}
