import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {normaliseCart,addItem,loadCart,saveCart,CART_KEY} from '../src/lib/cart.mjs';
const products=JSON.parse(readFileSync('src/data/products.json','utf8'));
const item={id:'utkal-tee',variant:'M',quantity:2};
test('selection rejects unknown products, invalid variants and invalid quantities',()=>{
 assert.deepEqual(normaliseCart([null,{...item,id:'unknown'},{...item,variant:'bad'},{...item,quantity:0},{...item,quantity:1.5},{...item,quantity:11}],products),[]);
 assert.throws(()=>addItem([], {...item,quantity:-1},products));
});
test('same variant merges; different sizes stay separate; quantity limit is enforced',()=>{
 let cart=addItem([],item,products);cart=addItem(cart,item,products);
 assert.equal(cart[0].quantity,4);cart=addItem(cart,{...item,variant:'L'},products);assert.equal(cart.length,2);
 assert.throws(()=>addItem(cart,{...item,quantity:7},products),/up to 10/);
});
test('saved selections survive a reload; corrupted and unavailable storage are handled',()=>{
 const values=new Map();const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 saveCart(storage,[item]);assert.deepEqual(loadCart(storage,products),[item]);
 storage.setItem(CART_KEY,'bad-json');assert.deepEqual(loadCart(storage,products),[]);
 assert.throws(()=>saveCart({setItem(){throw Error('blocked')}},[item]),/could not save/);
});
test('thirty-one static pages resolve local links and do not include a payment checkout',()=>{
 const root=resolve('dist');const pages=readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.html')&&statSync(join(root,f)).isFile());assert.equal(pages.length,31);
 for(const file of pages){const html=readFileSync(join(root,file),'utf8');assert.match(html,/noindex, nofollow/);assert.ok(!/https?:[^" ]*(stripe|razorpay|checkout)/.test(html));for(const [,raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(https?:|data:)/.test(raw))continue;const u=new URL(raw.replaceAll('&amp;','&'),'https://preview.invalid/'+file);let path=decodeURIComponent(u.pathname).slice(1);if(!path||path.endsWith('/'))path+='index.html';assert.ok(existsSync(join(root,path)),path);if(u.hash&&path.endsWith('.html'))assert.ok(readFileSync(join(root,path),'utf8').includes('id="'+u.hash.slice(1)+'"'));}}
 const bag=readFileSync(join(root,'bag/index.html'),'utf8');assert.match(bag,/disabled/);
 assert.ok(products.every(p=>p.price===null&&p.status==='concept'&&!p.supplier_approved));
});
