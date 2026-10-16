import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {test,before,after} from 'node:test';
const require=createRequire(process.env.FIREBASE_TEST_PACKAGE || import.meta.url);
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,deleteDoc,collection,getDocs,serverTimestamp}=require('firebase/firestore');
let env;const ids=Array.from({length:20},(_,i)=>String(i+1).padStart(2,'0'));
const data=()=>({schemaVersion:2,email:'',phone:'',ratings:ids.map(id=>id==='01'?5:0),comments:ids.map(()=> ''),favourite:'01',name:'Synthetic Visitor',comment:'Synthetic test',kit:'unsure',updatedAt:serverTimestamp()});
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-jhula-ratings',firestore:{rules:readFileSync(new URL('firestore.rules',import.meta.url),'utf8')}})});
after(async()=>{await env.cleanup()});
const db=uid=>env.authenticatedContext(uid).firestore();
test('owner can save, restore, update and withdraw',async()=>{const r=doc(db('alice'),'jhulaRatings','alice');await assertSucceeds(setDoc(r,data()));await assertSucceeds(getDoc(r));await assertSucceeds(setDoc(r,{...data(),comment:'Updated'}));await assertSucceeds(deleteDoc(r));});
test('other visitors and unauthenticated callers cannot read or write',async()=>{await setDoc(doc(db('alice'),'jhulaRatings','alice'),data());for(const d of [db('bob'),env.unauthenticatedContext().firestore()]){const r=doc(d,'jhulaRatings','alice');await assertFails(getDoc(r));await assertFails(setDoc(r,data()));await assertFails(deleteDoc(r));}});
test('no visitor can list private responses',async()=>assertFails(getDocs(collection(db('alice'),'jhulaRatings'))));
test('invalid numbers, missing entries, no ratings and excess fields rejected',async()=>{const r=doc(db('alice'),'jhulaRatings','alice');for(const n of [-1,6,1.5,'5']){const d=data();d.ratings[0]=n;await assertFails(setDoc(r,d));}let d=data();d.ratings.pop();await assertFails(setDoc(r,d));d=data();d.ratings[0]=0;await assertFails(setDoc(r,d));await assertFails(setDoc(r,{...data(),unexpected:true}));});
test('overlong comments and invalid favourite rejected',async()=>{const r=doc(db('alice'),'jhulaRatings','alice');let d=data();d.comments[1]='x'.repeat(301);await assertFails(setDoc(r,d));await assertFails(setDoc(r,{...data(),comment:'x'.repeat(1001)}));await assertFails(setDoc(r,{...data(),favourite:'21'}));});
test('existing traveller and investor snapshot permissions preserved',async()=>{for(const kind of ['traveller','investor']){const r=doc(db('existing-user'),'users','existing-user',kind,'test');await assertSucceeds(setDoc(r,{owner:'existing-user',kind,version:1,title:'Test',payload:'{}',createdAt:serverTimestamp()}));await assertSucceeds(getDoc(r));await assertFails(setDoc(r,{owner:'existing-user',kind,version:1,title:'Change',payload:'{}',createdAt:serverTimestamp()}));await assertFails(getDoc(doc(db('other'),'users','existing-user',kind,'test')));}});

test('name required while email and phone remain optional',async()=>{const r=doc(db('details'),'jhulaRatings','details');for(const name of ['', '   ', '\t\r\n'])await assertFails(setDoc(r,{...data(),name}));await assertSucceeds(setDoc(r,{...data(),name:'ରବି'}));await assertSucceeds(setDoc(r,{...data(),email:'test@example.com',phone:'+91 00000 00000'}));await assertFails(setDoc(r,{...data(),email:'not-an-email'}));await assertFails(setDoc(r,{...data(),phone:'1'.repeat(41)}));});
test('additional choices alone can be rated and selected as favourite',async()=>{const d=data();d.ratings[0]=0;d.ratings[17]=4;d.favourite='18';await assertSucceeds(setDoc(doc(db('additional'),'jhulaRatings','additional'),d));});
test('old twelve-choice response remains readable and can be upgraded',async()=>{await env.withSecurityRulesDisabled(async c=>{const old=data();delete old.schemaVersion;delete old.email;delete old.phone;old.name='';old.entries=Object.fromEntries(ids.slice(0,12).map((id,i)=>[id,{rating:old.ratings[i],comment:old.comments[i]}]));delete old.ratings;delete old.comments;await setDoc(doc(c.firestore(),'jhulaRatings','legacy'),old);});const r=doc(db('legacy'),'jhulaRatings','legacy');await assertSucceeds(getDoc(r));await assertSucceeds(setDoc(r,data()));});

test('autosave accepts preferences without identity or comments, including clearing every rating',async()=>{
 const ref=doc(db('auto'),'jhulaPreferences','auto');
 const p={schemaVersion:1,ratings:ids.map(()=>0),favourite:'',kit:'unsure',updatedAt:serverTimestamp()};
 await assertSucceeds(setDoc(ref,p));p.ratings[17]=5;await assertSucceeds(setDoc(ref,p));await assertSucceeds(getDoc(ref));
 await assertFails(setDoc(ref,{...p,name:'Unsubmitted name'}));await assertFails(setDoc(ref,{...p,comment:'Unsubmitted draft'}));
 p.ratings[0]=6;await assertFails(setDoc(ref,p));p.ratings[0]=0;p.ratings.pop();await assertFails(setDoc(ref,p));
 await assertFails(getDoc(doc(db('someone'),'jhulaPreferences','auto')));await assertFails(setDoc(doc(db('someone'),'jhulaPreferences','auto'),p));await assertFails(deleteDoc(doc(db('someone'),'jhulaPreferences','auto')));
 await assertFails(getDocs(collection(db('auto'),'jhulaPreferences')));await assertSucceeds(deleteDoc(ref));
});
test('new comment submission requires name and either valid email or phone, but no rating',async()=>{
 const ref=doc(db('contact'),'jhulaRatings','contact'),d={...data(),schemaVersion:3,ratings:ids.map(()=>0)};
 await assertFails(setDoc(ref,d));await assertFails(setDoc(ref,{...d,email:'invalid'}));await assertFails(setDoc(ref,{...d,phone:'       '}));
 await assertSucceeds(setDoc(ref,{...d,email:'visitor@example.com'}));await assertSucceeds(setDoc(ref,{...d,phone:'+91 98765 43210'}));
 await assertFails(setDoc(ref,{...d,name:'',email:'visitor@example.com'}));
});

test('both Pattachitra options accept ratings, favourites and comments',async()=>{
 for(const index of [18,19]){const d=data();d.ratings=ids.map(()=>0);d.ratings[index]=5;d.favourite=ids[index];d.comments[index]='Love this border';await assertSucceeds(setDoc(doc(db('pattachitra'),'jhulaRatings','pattachitra'),d));d.comments[index]='x'.repeat(301);await assertFails(setDoc(doc(db('pattachitra'),'jhulaRatings','pattachitra'),d));}
});
test('eighteen-choice clients remain supported, but cannot select a missing option',async()=>{
 const d=data();d.ratings=d.ratings.slice(0,18);d.comments=d.comments.slice(0,18);
 const r=doc(db('old18'),'jhulaRatings','old18');await assertSucceeds(setDoc(r,d));await assertFails(setDoc(r,{...d,favourite:'20'}));await assertSucceeds(setDoc(r,data()));
 const p=doc(db('old18'),'jhulaPreferences','old18'),legacy={schemaVersion:1,ratings:d.ratings,favourite:'18',kit:'bag',updatedAt:serverTimestamp()};await assertSucceeds(setDoc(p,legacy));await assertFails(setDoc(p,{...legacy,favourite:'19'}));
 await assertSucceeds(setDoc(p,{...legacy,ratings:ids.map(()=>5),favourite:'20'}));
});
