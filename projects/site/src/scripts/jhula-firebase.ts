import {initializeApp} from 'firebase/app';
import {getAuth, setPersistence, browserLocalPersistence, signInAnonymously} from 'firebase/auth';
import {getFirestore, doc, getDoc, setDoc, writeBatch, serverTimestamp} from 'firebase/firestore/lite';

const app=initializeApp({apiKey:'AIzaSyCcNSm5Mhb3L27XT0XGBZqyQpR88zA6dK4',authDomain:'utkal-project.firebaseapp.com',projectId:'utkal-project',appId:'1:1091060731108:web:6c36e74785b825303df0f1'},'jhula-survey');
const auth=getAuth(app),db=getFirestore(app);
const ids=Array.from({length:18},(_,i)=>String(i+1).padStart(2,'0'));
let identity:Promise<string>|undefined;
function owner(){
 if(!identity)identity=(async()=>{
  await setPersistence(auth,browserLocalPersistence);
  await auth.authStateReady();
  return (auth.currentUser || (await signInAnonymously(auth)).user).uid;
 })().catch(error=>{identity=undefined;throw error;});
 return identity;
}
// Preferences and explicitly submitted comments have separate write paths so a
// star click can never transmit an unfinished comment or contact field.
export async function requestRatings(method:string,body?:any){
 const uid=await owner(),ref=doc(db,'jhulaRatings',uid),preferences=doc(db,'jhulaPreferences',uid);
 if(method==='GET'){
  const [saved,prefs]=await Promise.all([getDoc(ref),getDoc(preferences)]);
  if(!saved.exists()&&!prefs.exists())return {response:null};
  const data=saved.data()||{},choices=prefs.data()||data;
  return {response:{...data,...(prefs.exists()?{favourite:choices.favourite,kit:choices.kit}:{}),entries:ids.map((id,index)=>({id,rating:(choices.ratings?.[index]??choices.entries?.[id]?.rating)||null,comment:(data.comments?.[index]??data.entries?.[id]?.comment)||''}))}};
 }
 if(method==='PREFERENCES'){
  await setDoc(preferences,{schemaVersion:1,ratings:ids.map(id=>body.entries.find((e:any)=>e.id===id)?.rating||0),favourite:body.favourite,kit:body.kit,updatedAt:serverTimestamp()});
  return {saved:true};
 }
 if(method==='POST'){
  const entries=ids.map(id=>body.entries.find((e:any)=>e.id===id));
  await setDoc(ref,{schemaVersion:3,ratings:entries.map(e=>e?.rating||0),comments:entries.map(e=>e?.comment||''),favourite:body.favourite,name:body.name,email:body.email,phone:body.phone,comment:body.comment,kit:body.kit,updatedAt:serverTimestamp()});
  return {saved:true};
 }
 if(method==='DELETE'){
  const batch=writeBatch(db);batch.delete(ref);batch.delete(preferences);await batch.commit();return {deleted:true};
 }
 throw new Error('Unsupported feedback action.');
}
