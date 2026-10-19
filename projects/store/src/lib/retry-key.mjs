let memoryRecord=null;
const STORAGE_KEY='ods-interest-retry-v1';
// Only a random token and a token-salted digest persist; name/email stay in the form.
export async function retryKey(storage,payload,cryptoApi=globalThis.crypto){
 let saved=memoryRecord;try{saved=JSON.parse(storage?.getItem(STORAGE_KEY)||'null')||memoryRecord;}catch{}
 if(!saved||typeof saved.key!=='string'||!/^[a-f0-9-]{36}$/.test(saved.key)||!/^([a-f0-9]{64})$/.test(saved.digest||''))saved=null;
 const normalized={name:payload.name.trim(),email:payload.email.trim().toLowerCase(),contact_consent:payload.contact_consent,items:payload.items.map(i=>({...i})).sort((a,b)=>(a.product_id+'/'+a.variant_id).localeCompare(b.product_id+'/'+b.variant_id))};
 const digest=async key=>Array.from(new Uint8Array(await cryptoApi.subtle.digest('SHA-256',new TextEncoder().encode(key+'\n'+JSON.stringify(normalized))))).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(saved&&saved.digest===await digest(saved.key))return saved.key;
 const key=cryptoApi.randomUUID();memoryRecord={key,digest:await digest(key)};try{storage?.setItem(STORAGE_KEY,JSON.stringify(memoryRecord));}catch{}
 return key;
}
export function clearRetryKey(storage){memoryRecord=null;try{storage?.removeItem(STORAGE_KEY);}catch{}}
