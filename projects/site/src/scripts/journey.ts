import {createBackupReader} from '../lib/backup-reader.mjs';
import {isReadingCollection,journeyGuidance} from '../lib/journey-reading.mjs';
import {addDayOutline,journeyDayCards,journeyNextStep} from '../lib/journey-coach.mjs';
import {storyTrailPhotos,selectedStoryTrail} from '../lib/story-trails.mjs';
import {addReminder,editReminder,removeReminder,restoreReminder,questionGroups,readinessSummary,selectBookPlan,mergeJourneyIdeas,importIdeasPreview} from '../lib/journey-ready.mjs';
import {setDayNote,addPlanningDay,moveDayIdeas,shiftPlannedDays,dayChangeUndo,undoDayChange,copyIdea,hasJourneyContent,visitPrompts} from '../lib/day-planner.mjs';
import {preparationRows} from '../lib/preparation.mjs';

import {createStarterTrip} from '../lib/journey-starters.mjs';
import {collectBookImages,loadLocalBookImage} from '../lib/book-images.mjs';
import {downloadFile,exportFilename} from '../lib/downloads.mjs';
import {storageSnapshot,saveLibraryChecked} from '../lib/journey-storage.mjs';
import {matchesWords} from '../lib/search.mjs';
import {buildTourBook,buildTextItinerary,planningContext} from '../lib/tour-book.mjs';
const publicData=JSON.parse(document.getElementById('journey-data')?.textContent||'{"catalog":[],"starters":[]}');
const journeyCatalog=publicData.catalog;
const storyTrails=publicData.trails||[];
const starterSelection={starters:publicData.starters};
import {STORAGE_KEY,LIBRARY_KEY,emptyLibrary,loadLibrary,addTrip,removeTrip,dayLabel,validDate,addItem,moveItem,groupItems,duplicateTrip,removeWithUndo,restoreRemoved,transferItem,journeyOverview,togglePreparation} from '../lib/journey.mjs';
const catalog=new Map(journeyCatalog.map(item=>[item.id,item]));
let storage:Storage;
try{storage=window.localStorage;}catch{storage={getItem(){throw Error('unavailable');},setItem(){throw Error('unavailable');}} as unknown as Storage;}
const loaded=loadLibrary(storage);
let baseline=storageSnapshot(storage),dirty=false,photoController:AbortController|null=null;
const includeNotes=()=>document.querySelector<HTMLInputElement>('#include-personal-notes')?.checked!==false;
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
let library=loaded.library;
let plan=library.trips.find(t=>t.id===library.activeId).plan,blocked=loaded.status==='blocked',pending=null;
let lastRemoval=null,lastDayChange=null,lastReminderRemoval=null,bookTrip=library.activeId,pendingTarget=null;
const backupReader=createBackupReader();
const app=document.querySelector('#journey-app');
const status=document.querySelector<HTMLElement>('#journey-status');
const title=document.querySelector<HTMLInputElement>('#journey-title');
const items=document.querySelector('#journey-items');
const empty=document.querySelector<HTMLElement>('#journey-empty');
const print=document.querySelector('#journey-print');
function node(tag:string,text?:string,className?:string){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;if(tag==='button')e.classList.add('utk-button','utk-button--secondary');if(tag==='label')e.classList.add('utk-field');return e;}
function announce(message:string){if(status)status.textContent=message+(dirty&&!message.includes('not saved')?' Changes are not saved in this browser. Export a backup before leaving.':'');}
function download(text:string,name:string,type='application/json'){
 downloadFile(text,name,type);
 const message=`Download requested: ${name}. Check your browser’s downloads. If the file is missing, allow downloads for this site and try again.`;
 const feedback=document.querySelector<HTMLElement>('#download-feedback');if(feedback)feedback.textContent=message;
 announce(message);
}
function save(){
 library.trips.find(t=>t.id===library.activeId).plan=plan;
 const result=saveLibraryChecked(storage,library,baseline);dirty=result.status!=='saved';
 if(result.status==='saved')baseline=result.snapshot;
 if(result.status==='conflict'){setBlocked('Another tab has newer saved data. Export this page’s work before reloading.');return false;}
 announce(dirty?'Changes are not saved in this browser. Download a backup before leaving.':'Saved in this browser.');updateButtons();renderPrint();return !dirty;
}
function updateButtons(){updateStarterButtons();document.querySelectorAll('[data-active-journey]').forEach(e=>e.textContent='Saving to: '+(plan.title||'Untitled journey'));updateTripControls();document.querySelectorAll<HTMLButtonElement>('[data-save-journey]').forEach(b=>{const saved=plan.items.some(i=>i.id===b.dataset.saveJourney);b.disabled=blocked;b.textContent=saved?'Saved to my journey ✓':'Save to my journey +';b.setAttribute('aria-pressed',String(saved));});}
function exportPlan(){const choice=document.querySelector<HTMLSelectElement>('#book-scope')?.value||'all';return selectBookPlan(plan,choice==='all'?'all':Number(choice));}
function updateBookScope(){
 const choice=document.querySelector<HTMLSelectElement>('#book-scope');if(!choice)return;
 const previous=bookTrip===library.activeId?choice.value:'all';bookTrip=library.activeId;
 choice.replaceChildren(new Option('Whole journey','all'));for(const g of groupItems(plan))choice.add(new Option(dayLabel(plan,g.day),String(g.day)));
 choice.value=[...choice.options].some(o=>o.value===previous)?previous:'all';
}
function updateTripControls(){
 if(!app)return;
 const guidance=journeyGuidance(plan,journeyCatalog);
 document.querySelectorAll<HTMLElement>('[data-journey-guidance]').forEach(element=>{element.textContent=guidance[element.dataset.journeyGuidance];});
 document.querySelector<HTMLTextAreaElement>('#new-reminder').placeholder=guidance.reminderPlaceholder;
 updatePreparation();updateBookScope();updateReadySummary();
 for(const id of ['add-planning-day','shift-days','apply-day-shift']){const e=document.getElementById(id) as HTMLInputElement|HTMLButtonElement;if(e)e.disabled=blocked;}
 const dayUndo=document.querySelector<HTMLButtonElement>('#undo-day-change');if(dayUndo){dayUndo.hidden=!lastDayChange||lastDayChange.trip!==library.activeId;dayUndo.disabled=blocked;}

 for(const id of ['offline-book','illustrated-book','plain-itinerary','print-journey']){const button=document.getElementById(id) as HTMLButtonElement;button.disabled=!hasJourneyContent(plan)||(id==='illustrated-book'&&!!photoController);}
 document.querySelector<HTMLElement>('#empty-download-help').hidden=hasJourneyContent(plan);
 const select=document.querySelector<HTMLSelectElement>('#trip-select');select.replaceChildren();
 for(const trip of library.trips){const option=new Option(trip.plan.title||'Untitled journey',trip.id);option.selected=trip.id===library.activeId;select.add(option);}
 select.disabled=blocked;
 const date=document.querySelector<HTMLInputElement>('#journey-date');if(document.activeElement!==date)date.value=plan.startDate||'';
 document.querySelector<HTMLButtonElement>('#delete-trip').disabled=blocked||library.trips.length===1;
 document.querySelector<HTMLButtonElement>('#create-trip').disabled=blocked||library.trips.length>=10;
 document.querySelector<HTMLButtonElement>('#duplicate-trip').disabled=blocked||library.trips.length>=10;
 const undo=document.querySelector<HTMLButtonElement>('#undo-removal');undo.hidden=!lastRemoval||lastRemoval.trip!==library.activeId;undo.disabled=blocked;
 const overview=document.querySelector<HTMLElement>('#journey-overview');const counts=journeyOverview(plan);overview.replaceChildren(node('p',`${counts.ideas} saved ${counts.ideas===1?'idea':'ideas'} · ${counts.scheduledDays} ${counts.scheduledDays===1?'day':'days'} with plans · ${counts.later} for later`));
 const cards=node('ul',undefined,'journey-day-cards');cards.setAttribute('aria-label','Days in this journey');
 for(const day of journeyDayCards(plan,journeyCatalog)){
  const li=node('li'),a=node('a',day.label) as HTMLAnchorElement;a.href='#journey-day-'+day.day;li.append(a);
  if(day.title)li.append(node('p',day.title,'day-card-title'));
  li.append(node('p',day.count?`${day.count} saved ${day.count===1?'idea':'ideas'}`:'A day with room to breathe.'));
  if(day.ideas.length)li.append(node('p',day.ideas.join(' · ')+(day.more?` · +${day.more} more`:'')));
  cards.append(li);
 }
 overview.append(cards);
 const step=journeyNextStep(plan,journeyCatalog);document.querySelector('#journey-coach-heading').textContent=step.title;document.querySelector('#journey-coach-copy').textContent=step.text;
 const next=document.querySelector<HTMLAnchorElement>('#journey-coach-next');next.href=step.href;next.textContent=step.label+' →';
 const addDay=document.querySelector<HTMLButtonElement>('#add-planning-day');addDay.disabled=blocked||groupItems(plan).filter(g=>g.day>0).length>=30;
}
function renderPrint(){
 if(!print)return;const book=exportPlan();print.replaceChildren(node('p','Project Odisha · Discover Odisha. Imagine the possibilities.'),node('h1',book.title||'My Odisha Journey'),node('p','Prepared '+new Date().toLocaleDateString()+'. Personal research plan; no reservations or verified route times. Recheck access, transport and availability.'));
 const days=journeyDayCards(book,journeyCatalog,{includePersonalNotes:includeNotes()});
 if(days.length){print.append(node('h2','Your days at a glance'));for(const day of days)print.append(node('p',day.label+(day.title?' · '+day.title:'')+' — '+(day.ideas.join(' · ')||'Room for a pause')+(day.more?` · +${day.more} more`:'')));}
 const references=new Map();
 const trail=selectedStoryTrail(book,storyTrails);
 if(trail){print.append(node('h2',trail.title+' · a reading companion'),node('p','Chapters related to your selected ideas, not extra stops or a timed itinerary.'));
  for(const chapter of trail.chapters)print.append(node('h3',chapter.title),node('p',chapter.text),node('h4',trail.prompt_label||'Before you go'),node('p',chapter.prompt));
  for(const item of trail.preparation)print.append(node('h4',item.title),node('p',item.text));
  if(trail.editorial_reading){print.append(node('p','By '+trail.author));references.set(trail.href,'Stone, sea and makers · article and full source notes');}else print.append(node('p','Context reviewed '+trail.reviewed_on+'. '+trail.review_scope));
  for(const source of trail.sources)references.set(source.url,source.title);
 }

 for(const group of groupItems(book)){
  print.append(node('h2',dayLabel(book,group.day)));const dayNote=(book.dayNotes||[]).find(n=>n.day===group.day);if(includeNotes()&&dayNote){if(dayNote.title)print.append(node('h3',dayNote.title));if(dayNote.notes)print.append(node('p',dayNote.notes,'print-notes'));}if(group.day>0)print.append(node('p',planningContext(group.items,catalog).message));
  for(const saved of group.items){
   const item=catalog.get(saved.id),section=node('section');section.append(node('h3',item?.title||'Unavailable item: '+saved.id));
   if(item){if(item.author)section.append(node('p','By '+item.author));section.append(node('p',`${item.kind} · ${item.area}`),node('p',item.summary),node('p',item.access||''),node('p',`Research checked ${item.checked}. Editorial preview.`));const a=node('a',new URL(item.href,location.origin).href) as HTMLAnchorElement;a.href=item.href;section.append(a);for(const s of item.sources)references.set(s.url,s.title);}
   else section.append(node('p','This saved ID is no longer in the current collection. Its notes have been preserved.'));
   for(const note of [...(item?.practical||[]),...visitPrompts(item)]){
    const practical=node('div');practical.append(node('h4',note.heading),...(note.paragraphs?.length?note.paragraphs:[note.text]).map(text=>node('p',text)));
    if(note.links?.length){
     const links=node('ul');
     for(const link of note.links){
      try{const url=new URL(link.href,location.origin);if(!['https:','http:'].includes(url.protocol))continue;const li=node('li'),a=node('a',link.label) as HTMLAnchorElement;a.href=url.href;li.append(a);links.append(li);}catch{/* Ignore malformed reading links. */}
     }
     if(links.children.length)practical.append(links);
    }
    section.append(practical);
   }
   if(includeNotes()&&saved.notes)section.append(node('p',saved.notes,'print-notes'));print.append(section);
  }
 }
 const prep=node('section');prep.append(node('h2','Preparation checklist'),node('p','Marked by you, not verified by Project Odisha.'));
 const checks=node('ul');for(const row of preparationRows(book))checks.append(node('li',`${row.done?'Done':'To check'} — ${row.label}`));prep.append(checks);print.append(prep);
 if(includeNotes()&&(book.reminders||[]).length){const section=node('section');section.append(node('h2','Your personal reminders'),node('p','These are your own reminders for the whole trip, not verified arrangements.'));const list=node('ul');for(const r of book.reminders)list.append(node('li',`${r.done?'Done':'To check'} — ${r.text}`));section.append(list);print.append(section);}
 const questions=questionGroups(book,journeyCatalog);if(questions.length){const section=node('section',undefined,'print-questions');section.append(node('h2','Questions to take with you'),node('p','Prompts to ask locally, not verified arrangements.'));for(const g of questions){const group=node('div',undefined,'print-question-group');group.append(node('h3',g.title));const list=node('ul');for(const q of g.questions)list.append(node('li',q.heading+' — '+q.text));group.append(list);section.append(group);}print.append(section);}
 const appendix=node('section',undefined,'print-sources');appendix.append(node('h2','Sources & reading notes'),node('p','Summaries use the Project Odisha collection loaded in this page, not a snapshot from the day you saved. Founder & Editor-in-Chief: Ahimanikya Satapathy. Your notes are your own. Stay areas are research suggestions, not reviewed properties. No photographs, poems or recordings are reproduced in this book.'));
 const process=node('a','Our editorial process') as HTMLAnchorElement;process.href='https://projectodisha.org/about/editorial-process/';const processNote=node('p');processNote.append(process);appendix.append(processNote);
 const list=node('ul');for(const [url,label] of references){const li=node('li',label+' — '+url);list.append(li);}appendix.append(list);print.append(appendix);
}
function render(focusId?:string,focusAction?:string){
 if(!items)return;items.replaceChildren();if(title&&document.activeElement!==title)title.value=plan.title;
 empty.hidden=plan.items.length>0||(plan.dayNotes||[]).length>0;
 for(const group of groupItems(plan)){
  const section=node('section',undefined,'journey-group');section.id='journey-day-'+group.day;section.append(node('h3',dayLabel(plan,group.day)));if(group.day>0)section.append(node('p',planningContext(group.items,catalog).message,'journey-area-note'));
  addDayControls(section,group);
  for(const [index,saved] of group.items.entries()){
   const item=catalog.get(saved.id),card=node('article',undefined,'journey-item');card.dataset.id=saved.id;
   card.append(node('p',item?`${item.kind} · ${item.area}`:'Saved idea unavailable','eyebrow'));
   const heading=node('h3');if(item){const a=node('a',item.title) as HTMLAnchorElement;a.href=item.href;heading.append(a);}else heading.textContent=saved.id;card.append(heading,node('p',item?.summary||'This item is no longer in the collection. Keep its notes or remove it.'));
   if(item?.access)card.append(node('p',item.access,'journey-access'));
   const dayField=node('label','Choose a day'),select=document.createElement('select');select.setAttribute('aria-label','Day for '+(item?.title||saved.id));select.disabled=blocked;
   for(let day=0;day<=30;day++){const option=new Option(dayLabel(plan,day),String(day));option.selected=saved.day===day;select.add(option);}dayField.append(select);card.append(dayField);
   select.addEventListener('change',()=>{const current=plan.items.find(i=>i.id===saved.id);if(!current)return;current.day=Number(select.value);save();render(saved.id,'day');});select.dataset.action='day';
   const noteLabel=node('label','Your notes'),textarea=document.createElement('textarea');textarea.value=saved.notes;textarea.maxLength=3000;textarea.disabled=blocked;textarea.setAttribute('aria-label','Notes for '+(item?.title||saved.id));noteLabel.append(textarea);card.append(noteLabel);
   const noteCount=node('span',`${saved.notes.length} / 3,000 characters`,'note-count');noteCount.id='note-count-'+saved.id.replaceAll(/[^a-z0-9]/g,'-');textarea.setAttribute('aria-describedby',noteCount.id);noteLabel.append(noteCount);
   textarea.addEventListener('input',()=>{const current=plan.items.find(i=>i.id===saved.id);if(!current)return;current.notes=textarea.value;noteCount.textContent=`${current.notes.length} / 3,000 characters`;save();});
   const controls=node('div',undefined,'journey-item-controls');
   for(const [label,action,direction] of [['Move up ↑','up',-1],['Move down ↓','down',1],['Remove','remove',0]] as const){
    const button=node('button',label) as HTMLButtonElement;button.type='button';button.dataset.action=action;button.setAttribute('aria-label',label+' '+(item?.title||saved.id));button.disabled=blocked||(action==='up'&&index===0)||(action==='down'&&index===group.items.length-1);
    button.addEventListener('click',()=>{if(action==='remove'){const removed=removeWithUndo(plan,saved.id);plan=removed.plan;lastRemoval={trip:library.activeId,undo:removed.undo};save();render();announce('Idea removed. Undo is available until your next removal or a collection replacement.');document.querySelector<HTMLButtonElement>('#undo-removal')?.focus();}else{plan=moveItem(plan,saved.id,direction);save();render(saved.id,action);}});controls.append(button);
   }card.append(controls);
   if(library.trips.length>1){const moveLabel=node('label','Move to another journey'),target=document.createElement('select');target.setAttribute('aria-label','Destination journey for '+(item?.title||saved.id));target.disabled=blocked;for(const trip of library.trips.filter(t=>t.id!==library.activeId))target.add(new Option(trip.plan.title||'Untitled journey',trip.id));moveLabel.append(target);const move=node('button','Move idea') as HTMLButtonElement;move.type='button';move.disabled=blocked;move.setAttribute('aria-label','Move '+(item?.title||saved.id)+' to another journey');move.addEventListener('click',()=>{if(blocked)return;try{const destination=library.trips.find(t=>t.id===target.value).plan.title;library=transferItem(library,library.activeId,target.value,saved.id);plan=library.trips.find(t=>t.id===library.activeId).plan;save();render();announce(`Moved to “${destination}”, under Ideas for later. Notes were kept.`);document.querySelector<HTMLHeadingElement>('#plan-heading')?.focus();}catch(error){announce(error.message);}});const copy=node('button','Copy idea') as HTMLButtonElement;copy.type='button';copy.dataset.action='copy';copy.disabled=blocked;copy.setAttribute('aria-label','Copy '+(item?.title||saved.id)+' to another journey');copy.addEventListener('click',()=>{if(blocked)return;try{library=copyIdea(library,library.activeId,target.value,saved.id);plan=library.trips.find(t=>t.id===library.activeId).plan;save();render(saved.id,'copy');announce('Copied to Ideas for later in the other journey. This original and its notes were kept.');}catch(error){announce(error.message);}});card.append(moveLabel,move,copy,node('p','Move transfers the idea; Copy keeps this original too. Item notes travel with it. Day titles and notes stay with this journey.','journey-help'));}
   section.append(card);
  }items.append(section);
 }
 if(focusId){const card=[...items.querySelectorAll<HTMLElement>('[data-id]')].find(c=>c.dataset.id===focusId);const control=card?.querySelector<HTMLElement>(`[data-action="${focusAction}"]`);if(control?.matches(':disabled'))card?.querySelector<HTMLElement>('select')?.focus();else control?.focus();}
 updateButtons();renderReminders();renderQuestions();renderPrint();filterSavedIdeas();
}
function applyDayArrangement(next,dayToFocus?:number){
 const before=plan;lastDayChange={trip:library.activeId,undo:dayChangeUndo(before,next)};plan=next;save();render();
 if(dayToFocus){const field=items?.querySelector<HTMLInputElement>(`[data-day-title="${dayToFocus}"]`);const details=field?.closest('details');if(details)details.open=true;field?.focus();}
}
function addDayControls(section:HTMLElement,group){
 if(group.day>0){
  const reading=isReadingCollection(plan,journeyCatalog),outlineHeading=reading?'My reading outline':'My day outline';
  const meta=(plan.dayNotes||[]).find(n=>n.day===group.day)||{title:'',notes:''};
  const details=node('details',undefined,'day-notebook') as HTMLDetailsElement;details.open=group.items.length===0;
  details.append(node('summary',reading?'Shape this day · reading & reflection':'Shape this day · travel, meals & pauses'));
  const nameLabel=node('label','Day title (optional)'),name=document.createElement('input');name.type='text';name.maxLength=80;name.value=meta.title;name.dataset.dayTitle=String(group.day);name.setAttribute('aria-label','Title for day '+group.day);name.disabled=blocked;nameLabel.append(name);
  const noteLabel=node('label','Day notes (optional)'),notes=document.createElement('textarea');notes.maxLength=2000;notes.value=meta.notes;notes.dataset.dayNotes=String(group.day);notes.setAttribute('aria-label','Notes for day '+group.day);notes.disabled=blocked;noteLabel.append(notes);
  const count=node('span',`${notes.value.length} / 2,000 characters`,'note-count');count.id='day-note-count-'+group.day;notes.setAttribute('aria-describedby',count.id+' day-private-'+group.day);noteLabel.append(count);
  const help=node('p','Day titles and notes stay in this browser. Turn off personal notes before making a copy to share.','day-note-help');help.id='day-private-'+group.day;name.setAttribute('aria-describedby',help.id);
  const update=()=>{if(blocked)return;try{plan=setDayNote(plan,group.day,name.value,notes.value);count.textContent=`${notes.value.length} / 2,000 characters`;save();}catch(error){announce(error.message);}};
  name.addEventListener('input',update);notes.addEventListener('input',update);details.append(nameLabel,noteLabel,help);
  const outline=node('button','Add a day outline') as HTMLButtonElement;outline.type='button';outline.disabled=blocked||meta.notes.includes(outlineHeading);outline.setAttribute('aria-label','Add a planning outline to day '+group.day);notes.addEventListener('input',()=>{outline.disabled=blocked||notes.value.includes(outlineHeading);});
  outline.addEventListener('click',()=>{if(blocked)return;try{const next=addDayOutline(plan,group.day,{reading});applyDayArrangement(next,group.day);items?.querySelector<HTMLTextAreaElement>(`[data-day-notes="${group.day}"]`)?.focus();announce(reading?'Reading outline added after your existing notes. Keep the edition and your own questions together.':'Day outline added after your existing notes. Fill in what you know and keep open questions under Still to confirm.');}catch(error){announce(error.message);}});
  const reminderLink=node('a','Keep a question in personal reminders →') as HTMLAnchorElement;reminderLink.href='#personal-reminders';reminderLink.addEventListener('click',(event)=>{event.preventDefault();const reminders=document.querySelector<HTMLDetailsElement>('#personal-reminders');reminders.open=true;document.querySelector<HTMLTextAreaElement>('#new-reminder')?.focus();});
  const outlineActions=node('div',undefined,'day-outline-actions');outlineActions.append(outline,reminderLink);details.append(outlineActions);section.append(details);
  if(!group.items.length){section.append(node('p','Room for a pause. Save an idea here later, or keep this day open.','day-empty'));const remove=node('button','Remove this empty day') as HTMLButtonElement;remove.type='button';remove.disabled=blocked;remove.addEventListener('click',()=>{if(blocked||!window.confirm('Remove this empty day and its private notes? You can undo until your next edit.'))return;applyDayArrangement({...plan,dayNotes:(plan.dayNotes||[]).filter(n=>n.day!==group.day)});announce('Empty day removed. Undo last day arrangement is available.');const undo=document.querySelector<HTMLButtonElement>('#undo-day-change');const tools=undo?.closest('details');if(tools)tools.open=true;undo?.focus();});section.append(remove);}
 }
 if(group.items.length){
  const controls=node('div',undefined,'day-move'),label=node('label','Move these ideas together'),target=document.createElement('select');target.setAttribute('aria-label','Move ideas from '+dayLabel(plan,group.day));target.disabled=blocked;
  for(let day=0;day<=30;day++)if(day!==group.day)target.add(new Option(dayLabel(plan,day),String(day)));label.append(target);
  const move=node('button','Move these ideas') as HTMLButtonElement;move.type='button';move.disabled=blocked;move.setAttribute('aria-label','Move all ideas from '+dayLabel(plan,group.day));move.addEventListener('click',()=>{if(blocked)return;try{applyDayArrangement(moveDayIdeas(plan,group.day,Number(target.value)));announce('Ideas moved together. Private day notes stay on their original day. Undo last day arrangement is available.');document.querySelector<HTMLElement>('#plan-heading')?.focus();}catch(error){announce(error.message);}});controls.append(label,move);section.append(controls);
 }
}
function filterSavedIdeas(){
 if(!items)return;const input=document.querySelector<HTMLInputElement>('#saved-search');if(!input)return;
 let count=0,days=0;
 items.querySelectorAll<HTMLElement>('.journey-group').forEach(group=>{
  const day=Number(group.id.replace('journey-day-','')),meta=(plan.dayNotes||[]).find(n=>n.day===day),dayMatch=!!input.value&&!!meta&&matchesWords([meta.title,meta.notes].join(' '),input.value);
  group.querySelectorAll<HTMLElement>('.journey-item').forEach(card=>{const saved=plan.items.find(i=>i.id===card.dataset.id),item=catalog.get(card.dataset.id);card.hidden=!dayMatch&&!matchesWords([item?.title,item?.area,saved?.id,saved?.notes].filter(Boolean).join(' '),input.value);if(!card.hidden)count++;});
  group.hidden=!!input.value&&!dayMatch&&![...group.querySelectorAll<HTMLElement>('.journey-item')].some(card=>!card.hidden);if(!group.hidden)days++;
 });
 document.querySelector('#saved-filter-status').textContent=input.value?`${count} of ${plan.items.length} saved ideas in ${days} matching ${days===1?'day group':'day groups'}. Search stays on this device.`:'';
 document.querySelector<HTMLElement>('#saved-clear').hidden=!input.value;
}
function updatePreparation(){
 const fields=[...document.querySelectorAll<HTMLInputElement>('[data-preparation-id]')];if(!fields.length)return;
 const rows=preparationRows(plan),known=new Set(fields.map(f=>f.dataset.preparationId));
 fields.forEach(field=>{field.checked=(plan.checklist||[]).includes(field.dataset.preparationId);field.disabled=blocked;});
 document.querySelector('#preparation-count').textContent=`${rows.filter(r=>r.done).length} of ${rows.length} marked done for “${plan.title||'Untitled journey'}”.`;
 const unknown=rows.filter(r=>!known.has(r.id)),extra=document.querySelector<HTMLUListElement>('#preparation-extra');extra.replaceChildren(...unknown.map(r=>node('li',r.label+' — retained from your backup.')));extra.hidden=unknown.length===0;
}
document.querySelectorAll<HTMLInputElement>('[data-preparation-id]').forEach(field=>field.addEventListener('change',()=>{
 if(blocked)return;try{plan=togglePreparation(plan,field.dataset.preparationId,field.checked);save();}catch(error){announce(error.message);updatePreparation();}
}));
function updateReadySummary(){
 if(!app)return;const counts=readinessSummary(plan,journeyCatalog);
 document.querySelector('#ready-summary').textContent=`${counts.open} personal ${counts.open===1?'reminder':'reminders'} still open · ${counts.later} ideas for later${counts.unavailable?` · ${counts.unavailable} saved ideas outside this collection`:''}. ${counts.hasDate?'Your start date is set.':'Dates can wait until you are ready.'} Your ticks record your own progress.`;
 document.querySelector('#reminder-count').textContent=`${counts.done} of ${counts.reminders} personal reminders marked done.`;
 for(const id of ['new-reminder','add-reminder']){const el=document.getElementById(id) as HTMLInputElement|HTMLButtonElement;el.disabled=blocked||counts.reminders>=40;}
 const undo=document.querySelector<HTMLButtonElement>('#undo-reminder');undo.hidden=!lastReminderRemoval||lastReminderRemoval.trip!==library.activeId;undo.disabled=blocked;
 document.querySelectorAll<HTMLButtonElement>('[data-add-question]').forEach(b=>{const exists=(plan.reminders||[]).some(r=>r.id===b.dataset.addQuestion);b.disabled=blocked||exists||counts.reminders>=40;b.textContent=exists?'Added to reminders ✓':'Add this reminder';});
}
function renderReminders(){
 const list=document.querySelector('#reminder-list');if(!list)return;list.replaceChildren();
 for(const r of plan.reminders||[]){
  const li=node('li');li.dataset.reminder=r.id;
  const label=node('label',undefined,'reminder-check'),tick=document.createElement('input');tick.type='checkbox';tick.checked=r.done;tick.disabled=blocked;tick.setAttribute('aria-label','Done: '+r.text);label.append(tick,node('span',r.text));li.append(label);
  tick.addEventListener('change',()=>{if(blocked)return;try{plan=editReminder(plan,r.id,r.text,tick.checked);save();renderReminders();list.querySelector<HTMLInputElement>(`[data-reminder="${r.id}"] input`)?.focus();}catch(error){announce(error.message);renderReminders();}});
  const edit=node('details',undefined,'reminder-edit'),summary=node('summary','Edit reminder');edit.append(summary);
  const field=node('label','Reminder wording'),input=document.createElement('textarea');input.value=r.text;input.maxLength=500;input.disabled=blocked;input.rows=3;field.append(input);edit.append(field);
  const apply=node('button','Save wording') as HTMLButtonElement;apply.type='button';apply.disabled=blocked;
  apply.addEventListener('click',()=>{if(blocked)return;try{plan=editReminder(plan,r.id,input.value.trim(),r.done);save();renderReminders();list.querySelector<HTMLElement>(`[data-reminder="${r.id}"] summary`)?.focus();}catch(error){announce(error.message);input.focus();}});edit.append(apply);li.append(edit);
  const remove=node('button','Remove reminder') as HTMLButtonElement;remove.type='button';remove.disabled=blocked;remove.setAttribute('aria-label','Remove reminder: '+r.text);remove.addEventListener('click',()=>{if(blocked)return;const result=removeReminder(plan,r.id);plan=result.plan;lastReminderRemoval={trip:library.activeId,undo:result.undo};save();renderReminders();updateReadySummary();announce('Reminder removed. Undo is available for this journey.');document.querySelector<HTMLButtonElement>('#undo-reminder')?.focus();});li.append(remove);list.append(li);
 }
 if(!(plan.reminders||[]).length)list.append(node('li','No personal reminders yet. Write your own or choose a question below.'));
 updateReadySummary();
}
function renderQuestions(){
 const holder=document.querySelector('#question-suggestions');if(!holder)return;holder.replaceChildren();
 const groups=questionGroups(plan,journeyCatalog);
 for(const g of groups){const section=node('section',undefined,'question-group'),heading=node('h3'),a=node('a',g.title) as HTMLAnchorElement;a.href=g.href;heading.append(a);section.append(heading);const list=node('ul');
  for(const q of g.questions){const li=node('li');li.append(node('p',q.heading+' — '+q.text));const add=node('button','Add this reminder') as HTMLButtonElement;add.type='button';add.dataset.addQuestion=q.id;add.setAttribute('aria-label','Add reminder: '+g.title+' — '+q.heading);add.addEventListener('click',()=>{if(blocked)return;try{plan=addReminder(plan,q.id,q.text);save();renderReminders();announce('Question added to your private reminders. You can edit its wording.');const section=document.querySelector<HTMLDetailsElement>('#personal-reminders');section.open=true;section.querySelector<HTMLElement>('summary')?.focus();}catch(error){announce(error.message);}});li.append(add);list.append(li);}section.append(list);holder.append(section);
 }
 if(!groups.length)holder.append(node('p','Save a coastal guide to see its questions here, or write your own reminder above.'));
 updateReadySummary();
}
function setBlocked(message:string){blocked=true;announce(message);document.querySelector<HTMLElement>('#journey-recovery')?.removeAttribute('hidden');document.querySelectorAll<HTMLInputElement|HTMLButtonElement>('#journey-title,#journey-date,#trip-select,#new-trip-name,#create-trip,#duplicate-trip,#undo-removal,#delete-trip,#import-journey,#confirm-import,#merge-import,#replace-library,#replace-ack,#import-source').forEach(e=>e.disabled=true);updateButtons();render();}
if(app){
 document.querySelector('#journey-coach-next')?.addEventListener('click',()=>{const href=document.querySelector<HTMLAnchorElement>('#journey-coach-next').getAttribute('href');if(href==='#personal-reminders'){const reminders=document.querySelector<HTMLDetailsElement>(href);reminders.open=true;reminders.querySelector<HTMLElement>('summary')?.focus();}});
 document.querySelector('#book-scope')?.addEventListener('change',renderPrint);
 document.querySelector('#add-reminder-form')?.addEventListener('submit',event=>{event.preventDefault();if(blocked)return;const field=document.querySelector<HTMLTextAreaElement>('#new-reminder');try{plan=addReminder(plan,'r-'+crypto.randomUUID(),field.value);save();field.value='';renderReminders();field.focus();}catch(error){announce(error.message);}});
 document.querySelector('#undo-reminder')?.addEventListener('click',()=>{if(blocked||lastReminderRemoval?.trip!==library.activeId)return;try{plan=restoreReminder(plan,lastReminderRemoval.undo);lastReminderRemoval=null;save();renderReminders();announce('Reminder restored with its wording and tick.');document.querySelector<HTMLElement>('#personal-reminders summary')?.focus();}catch(error){announce(error.message);}});
 document.querySelector('#add-planning-day')?.addEventListener('click',()=>{if(blocked)return;try{const added=addPlanningDay(plan);applyDayArrangement(added.plan,added.day);announce(`Day ${added.day} added. Give it a name or leave room for a pause.`);}catch(error){announce(error.message);}});
 document.querySelector('#apply-day-shift')?.addEventListener('click',()=>{if(blocked)return;try{const offset=Number((document.querySelector('#shift-days') as HTMLInputElement).value);applyDayArrangement(shiftPlannedDays(plan,offset));announce('Planned days shifted. Your start date is unchanged. Undo last day arrangement is available.');}catch(error){announce(error.message);}});
 document.querySelector('#undo-day-change')?.addEventListener('click',()=>{if(blocked||!lastDayChange||lastDayChange.trip!==library.activeId)return;try{plan=undoDayChange(plan,lastDayChange.undo);lastDayChange=null;save();render();announce('Last day arrangement undone.');document.querySelector<HTMLElement>('#plan-heading')?.focus();}catch(error){announce(error.message);}});
 document.querySelector('#saved-search')?.addEventListener('input',filterSavedIdeas);
 document.querySelector('#saved-clear')?.addEventListener('click',()=>{const input=document.querySelector<HTMLInputElement>('#saved-search');input.value='';filterSavedIdeas();input.focus();});
 document.querySelector('#include-personal-notes')?.addEventListener('change',renderPrint);
 document.querySelector('#cancel-photo-book')?.addEventListener('click',()=>photoController?.abort());
 document.querySelector('#plain-itinerary')?.addEventListener('click',()=>{download(buildTextItinerary(exportPlan(),journeyCatalog,{baseURL:location.origin,trails:storyTrails,includePersonalNotes:includeNotes()}),exportFilename(plan.title,'itinerary','txt'),'text/plain;charset=utf-8');announce('Text itinerary prepared; check your browser’s downloads. JSON backups always keep your full notes.');});
 document.querySelector('#plan-heading')?.setAttribute('tabindex','-1');
 document.querySelectorAll<HTMLInputElement|HTMLButtonElement>('#journey-title,#journey-date,#trip-select,#new-trip-name,#create-trip,#duplicate-trip,#export-journey,#export-all,#offline-book,#illustrated-book,#print-journey,#import-journey').forEach(e=>e.disabled=blocked);
 if(blocked)setBlocked(loaded.message);else announce('Your journey stays on this browser. Export a copy to take it elsewhere.');
 document.querySelector('#offline-book').addEventListener('click',()=>{try{download(buildTourBook(exportPlan(),journeyCatalog,{baseURL:location.origin,trails:storyTrails,includePersonalNotes:includeNotes()}),exportFilename(plan.title,'book','html'),'text/html;charset=utf-8');announce('Offline book prepared using your note-sharing choice; check your browser’s downloads. Keep a JSON backup for editing.');}catch(error){announce(error.message);}});
 document.querySelector('#illustrated-book').addEventListener('click',async()=>{
  if(photoController)return;const button=document.querySelector<HTMLButtonElement>('#illustrated-book'),cancel=document.querySelector<HTMLButtonElement>('#cancel-photo-book');
  photoController=new AbortController();button.disabled=true;button.setAttribute('aria-busy','true');cancel.hidden=false;
  const snapshot=exportPlan(),withNotes=includeNotes();announce('Preparing selected photographs. Your saved plan is unchanged.');
  try{const result=await collectBookImages(snapshot,journeyCatalog,loadLocalBookImage,{additionalPhotos:storyTrailPhotos(snapshot,storyTrails),signal:photoController.signal,onProgress:({completed,total})=>announce(`Preparing photographs: ${completed} of ${total}.`)});
   download(buildTourBook(snapshot,journeyCatalog,{baseURL:location.origin,trails:storyTrails,images:result.images,illustrated:true,omittedImages:result.skipped.length,includePersonalNotes:withNotes}),exportFilename(snapshot.title,'photo-book','html'),'text/html;charset=utf-8');
   announce(`Photo book prepared with ${Object.keys(result.images).length} selected ${Object.keys(result.images).length===1?'photograph':'photographs'}.${result.skipped.length?' Some photographs could not be included; text is preserved.':''} Personal notes ${withNotes?'included':'omitted'}. Check your browser’s downloads.`);
  }catch(error){announce(error?.name==='AbortError'?'Photo book cancelled. Your journey is unchanged.':'The photo book could not be prepared. Download the text book or a JSON backup.');}
  finally{photoController=null;button.disabled=!hasJourneyContent(plan);button.removeAttribute('aria-busy');const returnFocus=document.activeElement===cancel;cancel.hidden=true;if(returnFocus)button.focus();}
 });
 document.querySelector('#export-all').addEventListener('click',()=>download(JSON.stringify(library,null,2),exportFilename(plan.title,'all-journeys','json')));
 document.querySelector('#trip-select').addEventListener('change',event=>{if(blocked)return;library.activeId=(event.target as HTMLSelectElement).value;plan=library.trips.find(t=>t.id===library.activeId).plan;title.value=plan.title;save();render();});
 document.querySelector('#create-trip').addEventListener('click',()=>{if(blocked)return;const name=document.querySelector<HTMLInputElement>('#new-trip-name');if(!name.value.trim()){announce('Give your new journey a name.');name.focus();return;}try{library=addTrip(library,crypto.randomUUID(),{version:1,title:name.value.trim(),items:[]});plan=library.trips.find(t=>t.id===library.activeId).plan;name.value='';save();render();title.focus();}catch(error){announce(error.message);}});
 document.querySelector('#duplicate-trip').addEventListener('click',()=>{if(blocked)return;try{library=duplicateTrip(library,library.activeId,crypto.randomUUID());plan=library.trips.find(t=>t.id===library.activeId).plan;save();render();announce('Independent copy created, including dates and notes.');title.focus();}catch(error){announce(error.message);}});
 document.querySelector('#undo-removal').addEventListener('click',()=>{if(blocked||!lastRemoval||lastRemoval.trip!==library.activeId)return;try{const restoredId=lastRemoval.undo.item.id;plan=restoreRemoved(plan,lastRemoval.undo);lastRemoval=null;save();render(restoredId,'day');announce('Removed idea restored with its day and notes.');}catch(error){announce(error.message);}});
 document.querySelector('#delete-trip').addEventListener('click',()=>{if(blocked||!window.confirm(`Delete “${plan.title}” and its notes? Other journeys will be kept.`))return;library=removeTrip(library,library.activeId);plan=library.trips.find(t=>t.id===library.activeId).plan;save();render();document.querySelector<HTMLSelectElement>('#trip-select').focus();});
 document.querySelector('#journey-date').addEventListener('change',event=>{if(blocked)return;const input=event.target as HTMLInputElement;if(!validDate(input.value)){announce('Choose a valid date or leave it blank.');input.value=plan.startDate||'';return;}plan.startDate=input.value;save();render();});
 title.addEventListener('input',()=>{if(blocked)return;plan.title=title.value;save();});
 document.querySelector('#export-journey').addEventListener('click',()=>download(JSON.stringify(plan,null,2),exportFilename(plan.title,'journey','json')));
 document.querySelector('#print-journey').addEventListener('click',()=>{
 renderPrint();
 const feedback=document.querySelector<HTMLElement>('#print-feedback');
 if(feedback)feedback.textContent='Print requested. If no dialog appears, download the offline book and open it in a browser with Print support. A PDF has not been saved automatically.';
 try{window.print();}catch{
  const message='Printing is unavailable in this browser. Download the offline book and open it in a browser with Print support.';
  if(feedback)feedback.textContent=message;
 }
});
 window.addEventListener('beforeprint',renderPrint);
 document.querySelector('#download-existing').addEventListener('click',()=>{try{download(storage.getItem(LIBRARY_KEY)||storage.getItem(STORAGE_KEY)||'null','utkal-existing-journey.json');announce('Existing data prepared unchanged; check your browser’s downloads.');}catch{announce('Browser storage cannot be read. No existing data could be downloaded.');}});
 document.querySelector('#start-new').addEventListener('click',()=>{if(!window.confirm('Start a new collection? This replaces all saved trips in this browser. Export them first if needed.'))return;lastRemoval=null;lastDayChange=null;lastReminderRemoval=null;baseline=storageSnapshot(storage);library=emptyLibrary();plan=library.trips[0].plan;blocked=false;pending=null;document.querySelector<HTMLElement>('#journey-recovery').hidden=true;document.querySelectorAll<HTMLInputElement|HTMLButtonElement>('#journey-title,#journey-date,#trip-select,#new-trip-name,#create-trip,#duplicate-trip,#export-journey,#export-all,#offline-book,#illustrated-book,#print-journey,#import-journey').forEach(e=>e.disabled=false);save();render();});
 const fileInput=document.querySelector<HTMLInputElement>('#import-journey'),preview=document.querySelector<HTMLElement>('#import-preview');
 const sourceSelect=document.querySelector<HTMLSelectElement>('#import-source'),replaceOptions=document.querySelector<HTMLDetailsElement>('#replace-collection-options'),replaceAck=document.querySelector<HTMLInputElement>('#replace-ack');
 function pendingPlan(){return pending?.version===1?pending:pending?.trips.find(t=>t.id===sourceSelect.value)?.plan;}
 function refreshImportPreview(){
  const source=pendingPlan();if(!source)return;pendingTarget={id:library.activeId,raw:JSON.stringify(plan)};
  document.querySelector('#import-description').textContent=`Add “${source.title}” as an independent journey with ${source.items.length} ${source.items.length===1?'idea':'ideas'}, ${(source.dayNotes||[]).length} ${(source.dayNotes||[]).length===1?'day note':'day notes'} and ${(source.reminders||[]).length} personal ${(source.reminders||[]).length===1?'reminder':'reminders'}. Your other journeys will be kept.`;
  const add=document.querySelector<HTMLButtonElement>('#confirm-import');add.textContent='Add as a new journey';add.disabled=blocked||library.trips.length>=10;document.querySelector<HTMLElement>('#import-limit').hidden=library.trips.length<10;
  const merge=document.querySelector<HTMLButtonElement>('#merge-import');
  try{const counts=importIdeasPreview(plan,source);document.querySelector('#merge-description').textContent=`Or add ${counts.added} new ideas to “${plan.title}”, under Ideas for later. ${counts.kept} existing ideas and their current notes stay unchanged. Imported item notes travel with new ideas. Source day notes (${counts.sourceDayNotes}), reminders (${counts.sourceReminders}), date and checklist are not merged; add an independent journey to keep all source details.`;merge.disabled=blocked||counts.added===0;}
  catch(error){document.querySelector('#merge-description').textContent=error.message+' You can add an independent journey instead.';merge.disabled=true;}
 }
 fileInput.addEventListener('change',async()=>{const file=fileInput.files?.[0];if(!file)return;fileInput.value='';pending=null;pendingTarget=null;preview.hidden=true;announce('Reading your backup for review. Saved journeys are unchanged.');const result=await backupReader.read(file);if(result.status==='superseded')return;try{
  if(result.status==='error')throw Error(result.message);if(blocked)throw Error('Reload before importing; the saved journey changed in another tab.');pending=result.candidate;
  sourceSelect.replaceChildren();if(pending.version===2)for(const trip of pending.trips)sourceSelect.add(new Option(trip.plan.title||'Untitled journey',trip.id));
  document.querySelector<HTMLElement>('#import-source-field').hidden=pending.version===1;sourceSelect.disabled=blocked;replaceOptions.hidden=pending.version!==2;replaceOptions.open=false;replaceAck.checked=false;replaceAck.disabled=blocked;document.querySelector<HTMLButtonElement>('#replace-library').disabled=true;
  refreshImportPreview();preview.hidden=false;document.querySelector<HTMLElement>('#import-preview-heading').focus();announce('Backup ready to review. Saved journeys are unchanged.');
 }catch(error){announce(error instanceof Error?error.message:'Could not read that journey.');fileInput.focus();}});
 sourceSelect.addEventListener('change',refreshImportPreview);
 function finishImport(candidate,message){library=candidate;plan=library.trips.find(t=>t.id===library.activeId).plan;lastRemoval=null;lastDayChange=null;lastReminderRemoval=null;pending=null;pendingTarget=null;preview.hidden=true;save();render();announce(message);title.focus();}
 document.querySelector('#confirm-import').addEventListener('click',()=>{if(!pending||blocked)return;try{finishImport(addTrip(library,crypto.randomUUID(),pendingPlan()),'Added an independent journey, with its private details preserved.');}catch(error){announce(error.message);}});
 document.querySelector('#merge-import').addEventListener('click',()=>{if(!pending||blocked)return;
  if(pendingTarget?.id!==library.activeId||pendingTarget?.raw!==JSON.stringify(plan)){refreshImportPreview();announce('Your selected journey changed. The import preview has been refreshed; review it before adding ideas.');return;}
  try{const result=mergeJourneyIdeas(plan,pendingPlan());plan=result.plan;pending=null;pendingTarget=null;preview.hidden=true;lastDayChange=null;save();render();announce(`${result.added} new ideas added under Ideas for later. Existing notes and day arrangements were kept.`);document.querySelector<HTMLElement>('#plan-heading')?.focus();}catch(error){announce(error.message);}
 });
 replaceAck.addEventListener('change',()=>document.querySelector<HTMLButtonElement>('#replace-library').disabled=blocked||!replaceAck.checked);
 document.querySelector('#replace-library').addEventListener('click',()=>{if(blocked||pending?.version!==2||!replaceAck.checked)return;finishImport(pending,'Collection replaced with the selected backup.');});
 document.querySelector('#cancel-import').addEventListener('click',()=>{backupReader.cancel();pending=null;pendingTarget=null;preview.hidden=true;fileInput.focus();});
 const search=document.querySelector<HTMLInputElement>('#journey-search'),kind=document.querySelector<HTMLSelectElement>('#journey-kind'),moreIdeas=document.querySelector<HTMLButtonElement>('#more-ideas');
 let ideaLimit=3;
 function filterIdeas(){
  let count=0;
  document.querySelectorAll<HTMLElement>('[data-journey-idea]').forEach(card=>{
   const matches=matchesWords(card.dataset.search,search.value)&&(!kind.value||card.dataset.kind===kind.value);
   card.hidden=!matches||++count>ideaLimit;
  });
  document.querySelector('#idea-count').textContent=count?`Showing ${Math.min(count,ideaLimit)} of ${count} ${count===1?'idea':'ideas'}`:'No matching ideas. Try another word or type.';
  moreIdeas.hidden=count<=ideaLimit;
 }
 function resetIdeas(){ideaLimit=3;filterIdeas();}
 search.addEventListener('input',resetIdeas);kind.addEventListener('change',resetIdeas);
 moreIdeas.addEventListener('click',()=>{
  const firstNew=Array.from(document.querySelectorAll<HTMLElement>('[data-journey-idea]')).filter(card=>card.hidden&&matchesWords(card.dataset.search,search.value)&&(!kind.value||card.dataset.kind===kind.value))[0];
  ideaLimit+=3;filterIdeas();firstNew?.querySelector<HTMLAnchorElement>('a')?.focus();
 });
 filterIdeas();
 render();
}
document.querySelectorAll<HTMLButtonElement>('[data-save-journey]').forEach(button=>{
 button.addEventListener('click',()=>{
  const id=button.dataset.saveJourney,feedback=button.parentElement.querySelector<HTMLElement>('[data-save-status]');if(blocked||!catalog.has(id))return;
  try{const existing=plan.items.some(i=>i.id===id);plan=addItem(plan,id);const persisted=save();if(feedback)feedback.textContent=persisted?(existing?'Already in your journey.':'Added. Open My journey to arrange it.'):'Added for this page only. Download your unsaved journey below before leaving.';if(!persisted&&!app&&feedback){const backup=node('button','Download unsaved journey') as HTMLButtonElement;backup.type='button';backup.addEventListener('click',()=>download(JSON.stringify(library,null,2),exportFilename(plan.title,'all-journeys','json')));feedback.append(backup);}render();}
  catch(error){if(feedback)feedback.textContent=error.message;}
 });
 if(blocked){const feedback=button.parentElement.querySelector<HTMLElement>('[data-save-status]');if(feedback)feedback.textContent='Open My journey to recover saved data or start a new journey.';}
});
function updateStarterButtons(){
 document.querySelectorAll<HTMLButtonElement>('[data-journey-starter]').forEach(button=>{
  button.disabled=blocked||button.dataset.created==='true'||library.trips.length>=10;
  const feedback=button.parentElement.querySelector<HTMLElement>('[data-starter-status]');
  if(blocked&&feedback)feedback.textContent='Your saved journeys need attention or changed in another tab. Open My journey to recover them, or reload for the latest copy.';
  else if(library.trips.length>=10&&button.dataset.created!=='true'&&feedback)feedback.textContent='You have ten journeys. Open My journey to export and remove one before adding another.';
 });
}
document.querySelectorAll<HTMLButtonElement>('[data-journey-starter]').forEach(button=>button.addEventListener('click',()=>{
 if(blocked||button.dataset.created==='true')return;
 const feedback=button.parentElement.querySelector<HTMLElement>('[data-starter-status]');
 try{
  const starter=starterSelection.starters.find(s=>s.id===button.dataset.journeyStarter);
  const candidate=createStarterTrip(library,crypto.randomUUID(),starter,catalog.keys());
  const result=saveLibraryChecked(storage,candidate,baseline);
  if(result.status!=='saved'){
   feedback.textContent='Could not save: browser storage is unavailable or full. Existing journeys are unchanged. Download this prepared collection before leaving, or retry.';
   const backup=node('button','Download prepared collection') as HTMLButtonElement;backup.type='button';backup.addEventListener('click',()=>download(JSON.stringify(candidate,null,2),exportFilename(plan.title,'all-journeys','json')));feedback.append(backup);return;
  }
  baseline=result.snapshot;library=candidate;plan=library.trips.find(t=>t.id===library.activeId).plan;
  button.dataset.created='true';button.textContent='Journey created ✓';feedback.textContent='Saved as a separate journey. Your other journeys are kept. ';
  const link=node('a','Open saved journeys →') as HTMLAnchorElement;link.href='/journey/';feedback.append(link);updateButtons();
 }catch(error){feedback.textContent=error instanceof Error?error.message:'Could not create this journey. Your saved journeys are unchanged.';}
}));
updateButtons();
window.addEventListener('storage' ,e=>{if(e.key===LIBRARY_KEY||e.key===STORAGE_KEY||e.key===null){setBlocked('Your journey changed in another tab. Export any unsaved work here, then reload to use the latest copy.');}});
