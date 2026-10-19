import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rupeesToPaise,priceLabel} from '../src/lib/store-api.mjs';
import {validateSeed,CONSENT_TEXT} from '../server/server.mjs';
const seed=JSON.parse(readFileSync('src/data/products.json','utf8'));
test('reviewed catalogue includes maritime merchandise and all twenty poetry Jhulas without invented supply',()=>{
 const products=validateSeed(seed);assert.equal(products.length,24);assert.equal(products.flatMap(p=>p.variant_options).length,51);
 for(const p of products){assert.ok(p.name.length>0);assert.equal(p.supplier_approved,false);for(const v of p.variant_options){assert.equal(v.unit_price_paise,null);assert.equal(v.available_units,null);assert.equal(v.planned_units,null);}}
});
test('price entry preserves exact paise and distinguishes blank from confirmed zero',()=>{
 assert.equal(rupeesToPaise(''),null);assert.equal(rupeesToPaise('0'),0);assert.equal(rupeesToPaise('699.99'),69999);assert.equal(rupeesToPaise('0.01'),1);assert.equal(rupeesToPaise('45.5'),4550);
 for(const invalid of ['-1','1.001','1e3','NaN','1000001','Infinity'])assert.throws(()=>rupeesToPaise(invalid));assert.match(priceLabel(null),/confirmed/);assert.match(priceLabel(0),/0\.00/);
});
test('public request consent matches stored wording and requires an unchecked choice',()=>{
 const html=readFileSync('dist/bag/index.html','utf8');assert.ok(html.includes(CONSENT_TEXT));assert.match(html,/name="contact_consent"[^>]*required/);assert.doesNotMatch(html,/name="contact_consent"[^>]*checked/);
 const admin=readFileSync('dist/admin/index.html','utf8');assert.match(admin,/id="admin-content" hidden/);assert.doesNotMatch(admin,/csrf_token|scrypt\$/);
});

test('ambiguous submission survives reload without storing contact details and changed payload gets a new token',async()=>{
 const {retryKey,clearRetryKey}=await import('../src/lib/retry-key.mjs');const values=new Map();const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const payload={name:'Synthetic Person',email:'SYNTHETIC@example.invalid',contact_consent:true,items:[{product_id:'utkal-tee',variant_id:'m',quantity:2}]};
 const first=await retryKey(storage,payload);const reloaded=await import('../src/lib/retry-key.mjs?reload-test');assert.equal(await reloaded.retryKey(storage,{...payload,email:'synthetic@example.invalid'}),first);
 assert.ok(!JSON.stringify([...values]).includes('Synthetic'));assert.ok(!JSON.stringify([...values]).includes('example.invalid'));
 assert.notEqual(await retryKey(storage,{...payload,items:[{...payload.items[0],quantity:3}]}),first);clearRetryKey(storage);assert.equal(values.size,0);
});
test('blocked session storage retains retry protection within the current page',async()=>{
 const {retryKey,clearRetryKey}=await import('../src/lib/retry-key.mjs');const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};clearRetryKey(blocked);const payload={name:'Test',email:'test@example.invalid',contact_consent:true,items:[{product_id:'utkal-tee',variant_id:'s',quantity:1}]};assert.equal(await retryKey(blocked,payload),await retryKey(blocked,payload));clearRetryKey(blocked);
});

test('poetry collection keeps twenty bags and only eighteen evidenced kits',()=>{
 const poetry=seed.filter(p=>p.kind==='poetry-jhula');assert.equal(poetry.length,20);assert.equal(poetry.filter(p=>p.variant_options.some(v=>v.id==='poetry-kit')).length,18);
 for(const id of ['19','20'])assert.equal(poetry.find(p=>p.id==='poetry-jhula-'+id).variant_options.length,1);
 const page=readFileSync('dist/kabi-jhulas/index.html','utf8');assert.match(page,/Poet’s Classic/);assert.match(page,/Pattachitra/);assert.doesNotMatch(page,/firebase|jhula-feedback/);
});
