// Personal data stays in the browser or a file explicitly exported by its owner.
export const STORAGE_KEY='utkal.journey.v1';
export const MAX_BYTES=1000000;
export const emptyJourney=()=>({version:1,title:'My Odisha Journey',items:[]});
export function validateJourney(value){
 if(!value||value.version!==1||typeof value.title!=='string'||value.title.length>120||!Array.isArray(value.items)||value.items.length>100)throw Error('This file is not a supported Project Odisha journey (version 1, up to 100 ideas).');
 if(value.storyTrail!==undefined&&(typeof value.storyTrail!=='string'||!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(value.storyTrail)))throw Error('The story trail identifier is invalid. Existing data has not been replaced.');
 const seen=new Set();
 const items=value.items.map(item=>{
  if(!item||typeof item.id!=='string'||!/^[a-z0-9][a-z0-9:/_-]{0,159}$/.test(item.id)||seen.has(item.id)||!Number.isInteger(item.day)||item.day<0||item.day>30||typeof item.notes!=='string'||item.notes.length>3000)throw Error('A journey item is invalid or duplicated. Your existing journey has not been replaced.');
  seen.add(item.id);return {id:item.id,day:item.day,notes:item.notes};
 });
 if(value.startDate!==undefined&&!validDate(value.startDate))throw Error('Choose a real start date from 1900 to 9998, or leave it blank.');
 if(value.checklist!==undefined&&(!Array.isArray(value.checklist)||value.checklist.length>40||value.checklist.some(id=>typeof id!=='string'||!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(id))||new Set(value.checklist).size!==value.checklist.length))throw Error('The journey checklist is invalid. Existing data has not been replaced.');
 let dayNotes;
 if(value.dayNotes!==undefined){
  if(!Array.isArray(value.dayNotes)||value.dayNotes.length>30)throw Error('Keep up to 30 day notes.');
  const days=new Set();dayNotes=value.dayNotes.map(note=>{
   if(!note||!Number.isInteger(note.day)||note.day<1||note.day>30||days.has(note.day)||typeof note.title!=='string'||note.title.length>80||typeof note.notes!=='string'||note.notes.length>2000)throw Error('A day note is invalid or duplicated. Existing data has not been replaced.');
   days.add(note.day);return {day:note.day,title:note.title,notes:note.notes};
  });
 }
 let reminders;
 if(value.reminders!==undefined){
  if(!Array.isArray(value.reminders)||value.reminders.length>40)throw Error('Keep up to 40 personal reminders per journey.');
  const ids=new Set();reminders=value.reminders.map(r=>{
   if(!r||typeof r.id!=='string'||!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(r.id)||ids.has(r.id)||typeof r.text!=='string'||!r.text.trim()||r.text.length>500||typeof r.done!=='boolean')throw Error('A personal reminder is invalid or duplicated. Existing data has not been replaced.');
   ids.add(r.id);return {id:r.id,text:r.text,done:r.done};
  });
 }
 return {version:1,title:value.title,items,...(value.storyTrail?{storyTrail:value.storyTrail}:{}),...(reminders!==undefined?{reminders}:{}),...(dayNotes!==undefined?{dayNotes}:{}),...(value.startDate?{startDate:value.startDate}:{}),...(value.checklist!==undefined?{checklist:[...value.checklist]}:{})};
}
export function parseJourney(raw){if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_BYTES)throw Error('Journey files must be smaller than 1 MB.');return validateJourney(JSON.parse(raw));}
export function loadJourney(storage){
 try {const raw=storage.getItem(STORAGE_KEY);return {plan:raw===null?emptyJourney():parseJourney(raw),status:'ready'};}
 catch(error){return {plan:emptyJourney(),status:'blocked',message:'Saved data could not be opened. Nothing has been overwritten. Download the existing data or start a new journey explicitly.'};}
}
export function persistJourney(storage,plan){
 try{storage.setItem(STORAGE_KEY,JSON.stringify(validateJourney(plan)));return true;}catch{return false;}
}
export function addItem(plan,id){if(plan.items.some(x=>x.id===id))return plan;if(plan.items.length>=100)throw Error('This journey has reached 100 ideas. Export a copy before starting another.');return validateJourney({...plan,items:[...plan.items,{id,day:0,notes:''}]});}
export function moveItem(plan,id,direction){
 const next=validateJourney(plan),index=next.items.findIndex(x=>x.id===id);if(index<0)return next;
 const day=next.items[index].day;
 const group=next.items.map((x,i)=>({x,i})).filter(v=>v.x.day===day).map(v=>v.i);
 const neighbour=group[group.indexOf(index)+direction];
 if(neighbour!==undefined)[next.items[index],next.items[neighbour]]=[next.items[neighbour],next.items[index]];
 return next;
}
export function groupItems(plan){return [...new Set([...plan.items.map(i=>i.day),...(plan.dayNotes||[]).map(n=>n.day)])].sort((a,b)=>a===0?1:b===0?-1:a-b).map(day=>({day,items:plan.items.filter(i=>i.day===day)}));}

// v2 stores separate trips. The v1 key is read for migration, never deleted.
export const LIBRARY_KEY='utkal.journeys.v2';
export const MAX_LIBRARY_BYTES=10000000;
export function validDate(value){
 if(value==='')return true;
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number(value.slice(0,4))<1900||Number(value.slice(0,4))>9998)return false;
 const d=new Date(value+'T00:00:00Z');return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===value;
}
export function dayLabel(plan,day){
 if(day===0)return 'Ideas for later';
 if(!plan.startDate)return 'Day '+day;
 const date=new Date(plan.startDate+'T00:00:00Z');date.setUTCDate(date.getUTCDate()+day-1);
 return 'Day '+day+' · '+new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date);
}
export const emptyLibrary=()=>({version:2,activeId:'first',trips:[{id:'first',plan:emptyJourney()}]});
export function validateLibrary(value){
 if(!value||value.version!==2||!Array.isArray(value.trips)||!value.trips.length||value.trips.length>10)throw Error('Choose a supported journey collection with 1–10 trips.');
 const seen=new Set();const trips=value.trips.map(t=>{if(!t||typeof t.id!=='string'||!/^[a-z0-9_-]{1,80}$/.test(t.id)||seen.has(t.id))throw Error('Trip identifiers are invalid or duplicated.');seen.add(t.id);return {id:t.id,plan:validateJourney(t.plan)};});
 if(!seen.has(value.activeId))throw Error('The selected trip is missing.');
 return {version:2,activeId:value.activeId,trips};
}
export function parseBackup(raw){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_LIBRARY_BYTES)throw Error('Backups must be smaller than 10 MB.');
 const value=JSON.parse(raw);return value?.version===1?validateJourney(value):validateLibrary(value);
}
export function loadLibrary(storage){
 try{const raw=storage.getItem(LIBRARY_KEY);if(raw!==null)return {library:validateLibrary(parseBackup(raw)),status:'ready',migrated:false};
 const legacy=storage.getItem(STORAGE_KEY);return {library:legacy===null?emptyLibrary():{version:2,activeId:'legacy',trips:[{id:'legacy',plan:parseJourney(legacy)}]},status:'ready',migrated:legacy!==null};}
 catch{return {library:emptyLibrary(),status:'blocked',migrated:false,message:'Saved trips could not be opened. Nothing has been overwritten. Download the existing data before starting again.'};}
}
export function persistLibrary(storage,library){try{storage.setItem(LIBRARY_KEY,JSON.stringify(validateLibrary(library)));return true;}catch{return false;}}
export function addTrip(library,id,plan=emptyJourney()){
 const next=validateLibrary(library);if(next.trips.length>=10)throw Error('You can keep up to 10 trips. Export a backup before deleting a trip to make room.');
 return validateLibrary({...next,activeId:id,trips:[...next.trips,{id,plan}]});
}
export function removeTrip(library,id){
 const next=validateLibrary(library);if(next.trips.length===1)throw Error('Keep at least one journey. Create another before deleting this one.');
 next.trips=next.trips.filter(t=>t.id!==id);if(next.activeId===id)next.activeId=next.trips[0].id;return validateLibrary(next);
}

export function duplicateTrip(library,sourceId,newId){
 const next=validateLibrary(library),source=next.trips.find(t=>t.id===sourceId);
 if(!source)throw Error('Choose an existing journey to duplicate.');
 return addTrip(next,newId,{...source.plan,title:(source.plan.title||'My Odisha Journey').slice(0,113)+' (copy)'});
}
export function removeWithUndo(plan,id){
 const current=validateJourney(plan),index=current.items.findIndex(i=>i.id===id);
 if(index<0)throw Error('This idea is no longer in the journey.');
 const item=current.items[index];return {plan:{...current,items:current.items.filter(i=>i.id!==id)},undo:{item,index}};
}
export function restoreRemoved(plan,undo){
 const current=validateJourney(plan);
 if(!undo||!Number.isInteger(undo.index)||undo.index<0)throw Error('No removed idea is available to restore.');
 if(current.items.some(i=>i.id===undo.item?.id))throw Error('That idea is already back in the journey. Its current notes have been kept.');
 current.items.splice(Math.min(undo.index,current.items.length),0,undo.item);return validateJourney(current);
}
export function transferItem(library,sourceId,targetId,itemId){
 const next=validateLibrary(library),source=next.trips.find(t=>t.id===sourceId),target=next.trips.find(t=>t.id===targetId);
 if(!source||!target||sourceId===targetId)throw Error('Choose a different existing journey.');
 const item=source.plan.items.find(i=>i.id===itemId);if(!item)throw Error('The idea is no longer in this journey.');
 if(target.plan.items.some(i=>i.id===itemId))throw Error('The destination already has this idea. Nothing was moved or overwritten.');
 // Validate the entire transaction before returning; no half-move on a full destination.
 target.plan.items.push({...item,day:0});source.plan.items=source.plan.items.filter(i=>i.id!==itemId);
 return validateLibrary(next);
}
export function journeyOverview(plan){
 const valid=validateJourney(plan);return {ideas:valid.items.length,scheduledDays:groupItems(valid).filter(g=>g.day>0).length,later:valid.items.filter(i=>i.day===0).length};
}

export function togglePreparation(value,id,checked){
 const plan=validateJourney(value);
 if(typeof checked!=='boolean'||typeof id!=='string'||!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(id))throw Error('Choose a valid checklist item.');
 const marks=new Set(plan.checklist||[]);if(checked)marks.add(id);else marks.delete(id);
 return validateJourney({...plan,checklist:[...marks]});
}
