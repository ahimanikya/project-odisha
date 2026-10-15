import {initializeApp} from 'firebase/app';
import {getAuth, setPersistence, browserLocalPersistence, signInAnonymously} from 'firebase/auth';
import {getFirestore, doc, getDoc, setDoc, deleteDoc, serverTimestamp} from 'firebase/firestore/lite';

const app=initializeApp({apiKey:'AIzaSyCcNSm5Mhb3L27XT0XGBZqyQpR88zA6dK4',authDomain:'utkal-project.firebaseapp.com',projectId:'utkal-project',appId:'1:1091060731108:web:6c36e74785b825303df0f1'},'jhula-survey');
const auth=getAuth(app),db=getFirestore(app);
const ids=Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0'));
let identity:Promise<string>|undefined;
function owner(){
 if(!identity)identity=(async()=>{
  await setPersistence(auth,browserLocalPersistence);
  await auth.authStateReady();
  return (auth.currentUser || (await signInAnonymously(auth)).user).uid;
 })().catch(error=>{identity=undefined;throw error;});
 return identity;
}
async function performRequest(method:string,body?:any){
 const ref=doc(db,'jhulaRatings',await owner());
 if(method==='GET'){
  const saved=await getDoc(ref);
  if(!saved.exists())return {response:null};
  const data=saved.data();
  return {response:{...data,entries:ids.map(id=>({id,rating:data.entries[id].rating||null,comment:data.entries[id].comment}))}};
 }
 if(method==='POST'){
  const entries=Object.fromEntries(ids.map(id=>{const e=body.entries.find((e:any)=>e.id===id);return [id,{rating:e?.rating||0,comment:e?.comment||''}];}));
  await setDoc(ref,{entries,favourite:body.favourite,name:body.name,comment:body.comment,kit:body.kit,updatedAt:serverTimestamp()});
  return {saved:true};
 }
 if(method==='DELETE'){await deleteDoc(ref);return {deleted:true};}
 throw new Error('Unsupported feedback action.');
}

export async function requestRatings(method:string,body?:any){
 let timer:ReturnType<typeof setTimeout>;
 try {
  return await Promise.race([performRequest(method,body),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('The connection is taking too long. Your entries are still here. Retry to confirm the saved response.')),15000);})]);
 } finally {clearTimeout(timer!);}
}
