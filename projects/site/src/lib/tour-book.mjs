import {journeyDayCards} from './journey-coach.mjs';
import {selectedStoryTrail} from './story-trails.mjs';
import {questionGroups} from './journey-ready.mjs';
import {visitPrompts} from './day-planner.mjs';
import {preparationRows} from './preparation.mjs';
import {validBookImage} from './book-images.mjs';
import {validateJourney,groupItems,dayLabel} from './journey.mjs';

export function planningContext(items,catalog){
 if(!items.length)return {areas:[],message:"A day left open. Add your own notes or keep room for a pause."};
 const areas=[...new Set(items.map(saved=>catalog.get(saved.id)).filter(i=>i&&i.kind!=='Reading').map(i=>i.planningArea||i.area).filter(a=>a&&a!=='Odisha'))];
 return {areas,message:areas.length>1?`Several areas: ${areas.join(' · ')}. Check transfers and leave time between stops; this day is not a verified route.`:areas.length===1?`${areas[0]} · Check local access and transport. Travel times have not been calculated.`:'Reading or unlocated ideas · Add travel arrangements separately.'};
}
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeURL(value,base){try{const url=new URL(value,base);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}}

// Standalone text edition: no scripts, network requests, fonts or images required.
export function buildTourBook(value,entries,{baseURL='https://projectodisha.org',generatedAt=new Date().toISOString().slice(0,10),trails=[],images={},illustrated=false,omittedImages=0,includePersonalNotes=true}={}){
 const plan=validateJourney(value),catalog=new Map(entries.map(i=>[i.id,i])),references=new Map(),photoCredits=new Map(),e=escapeHTML;
 const trail=selectedStoryTrail(plan,trails);
 const story=trail?`<section class="story-companion"><h2>${e(trail.title)} · a reading companion</h2>${trail.editorial_reading?`<p>By ${e(trail.author)}</p>`:''}<p>These chapters relate to your selected ideas. They are not extra stops or a timed itinerary; your days and choices follow below.</p>${trail.chapters.map(chapter=>{
  const photo=chapter.photo,data=photo&&images[photo.src];let picture='';
  if(illustrated&&photo&&validBookImage(data)){photoCredits.set(photo.src,photo);picture=`<figure><img src="${data}" alt="${e(photo.alt)}" width="${e(photo.width)}" height="${e(photo.height)}"><figcaption>${e(photo.caption)}</figcaption></figure>`;}
  return `<section><h3>${e(chapter.title)}</h3>${picture}<p>${e(chapter.text)}</p><h4>${e(trail.prompt_label||'Before you go')}</h4><p>${e(chapter.prompt)}</p><p>Selected ideas: ${chapter.selectedIdeas.map(id=>e(catalog.get(id)?.title||id)).join(' · ')}</p></section>`;
 }).join('')}<h3>Prepare at your own pace</h3>${trail.preparation.map(p=>`<h4>${e(p.title)}</h4><p>${e(p.text)}</p>`).join('')}${trail.editorial_reading?`<p><a href="${e(safeURL(trail.href,baseURL)||baseURL)}">Read the article and full source notes</a>.</p>`:`<p>Context reviewed ${e(trail.reviewed_on)}. ${e(trail.review_scope)}</p>`}</section>`:'';
 if(trail)for(const source of trail.sources){const url=safeURL(source.url,baseURL);if(url)references.set(url,source.title);}
 const groups=groupItems(plan).map(group=>{
  const context=planningContext(group.items,catalog),dayNote=(plan.dayNotes||[]).find(n=>n.day===group.day);
  const cards=group.items.map(saved=>{
   const item=catalog.get(saved.id);let body=`<h3>${e(item?.title||'Unavailable item: '+saved.id)}</h3>`;
   if(item){
    const photo=item.photo,data=photo&&images[photo.src];
    if(photo&&validBookImage(data)&&!photoCredits.has(photo.src)){
     photoCredits.set(photo.src,photo);
     body+=`<figure><img src="${data}" alt="${e(photo.alt)}" width="${e(photo.width)}" height="${e(photo.height)}"><figcaption>${e(photo.caption)}</figcaption></figure>`;
    }
    body+=`${item.author?`<p class="byline">By ${e(item.author)}</p>`:''}<p class="kind">${e(item.kind)} · ${e(item.area)}</p><p>${e(item.summary)}</p><p class="access">${e(item.access||'Check access and arrangements before travel.')}</p><p class="date">Research checked ${e(item.checked)} · Editorial preview</p>`;
    for(const note of [...(item.practical||[]),...visitPrompts(item)]){
     const links=(note.links||[]).map(link=>{const url=safeURL(link.href,baseURL);return url?`<li><a href="${e(url)}">${e(link.label)}</a></li>`:'';}).join('');
     body+=`<div class="practical"><h4>${e(note.heading)}</h4>${(note.paragraphs?.length?note.paragraphs:[note.text]).map(p=>`<p>${e(p)}</p>`).join('')}${links?`<ul>${links}</ul>`:''}</div>`;
    }
    const href=safeURL(item.href,baseURL);if(href)body+=`<p><a href="${e(href)}">Read the entry online</a></p>`;
    for(const source of item.sources||[]){const url=safeURL(source.url,baseURL);if(url)references.set(url,source.title);}
   }else body+='<p>This saved item is not in the current collection. Its identifier and your notes are preserved.</p>';
   if(includePersonalNotes&&saved.notes)body+=`<div class="notes"><h4>Your notes</h4><p>${e(saved.notes)}</p></div>`;
   return `<section class="stop">${body}</section>`;
  }).join('');
  return `<section id="day-${group.day}"><h2>${e(dayLabel(plan,group.day))}</h2>${includePersonalNotes&&dayNote?`<div class="notes day-notes">${dayNote.title?`<h3>${e(dayNote.title)}</h3>`:''}${dayNote.notes?`<p>${e(dayNote.notes)}</p>`:''}</div>`:''}<p class="area">${e(group.day===0?'Ideas to arrange. '+context.message:context.message)}</p>${cards}</section>`;
 }).join('');
 const imageCredits=[...photoCredits.values()].map(p=>{
  const source=safeURL(p.source,baseURL),licence=safeURL(p.license_url,baseURL);
  return `<li>${e(p.caption)} · ${e(p.creator)} · ${licence?`<a href="${e(licence)}">${e(p.license)}</a>`:e(p.license)}. ${e(p.changes)} ${source?`<a href="${e(source)}">Original source</a>`:''}</li>`;
 }).join('');
 const preparation=`<section class="preparation"><h2>Preparation checklist</h2><p>Marked by you, not verified by Project Odisha.</p><ul>${preparationRows(plan).map(row=>`<li>${row.done?'Done':'To check'} — ${e(row.label)}</li>`).join('')}</ul></section>`;
 const questions=questionGroups(plan,entries);
 const questionSection=questions.length?`<section class="questions"><h2>Questions to take with you</h2><p>Prompts to ask locally, not verified arrangements.</p>${questions.map(g=>`<section><h3>${e(g.title)}</h3><ul>${g.questions.map(q=>`<li><strong>${e(q.heading)}</strong> — ${e(q.text)}</li>`).join('')}</ul></section>`).join('')}</section>`:'';
 const reminders=includePersonalNotes&&(plan.reminders||[]).length?`<section class="personal-reminders"><h2>Your personal reminders</h2><p>These ticks record your choices, not verification by Project Odisha. These reminders apply to the whole trip.</p><ul>${plan.reminders.map(r=>`<li>${r.done?'Done':'To check'} — ${e(r.text)}</li>`).join('')}</ul></section>`:'';
 const contents=journeyDayCards(plan,entries,{includePersonalNotes}).map(g=>`<li><a href="#day-${g.day}">${e(g.label)}</a>${g.title?' · '+e(g.title):''}<p>${e(g.ideas.join(' · ')||'Room for a pause')}${g.more?` · +${g.more} more`:''}</p></li>`).join('');
 const sources=[...references].map(([url,title])=>`<li><a href="${e(url)}">${e(title)}</a><br><span>${e(url)}</span></li>`).join('');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><meta name="referrer" content="no-referrer"><title>${e(plan.title||'My Odisha Journey')} · Project Odisha</title><style>
*{box-sizing:border-box}body{margin:0;background:#fbf6ec;color:#302e28;font:17px/1.7 system-ui,sans-serif}main{max-width:880px;padding:40px 24px;margin:auto}h1,h2,h3{font-family:Georgia,serif;color:#1d4658;line-height:1.2}h1{font-size:48px;overflow-wrap:anywhere}h2{margin-top:45px;font-size:32px}h3{font-size:25px}a{color:#1d4658;overflow-wrap:anywhere}.eyebrow,.date{font-size:13px;color:#74633b}figure{margin:20px 0;break-inside:avoid}figure img{display:block;width:100%;height:auto;max-height:340px;object-fit:contain}figcaption{font-size:13px;margin-top:10px}h3{overflow-wrap:anywhere}.stop{padding:22px 0;border-bottom:1px solid #c9b99b}.notes{border-left:3px solid #91462f;padding:0 18px}.notes p{white-space:pre-wrap;overflow-wrap:anywhere}.area,.access{background:#f2e6d0;padding:14px}.personal-reminders li,.questions li{white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0}.credits{margin-top:45px;font-size:14px}.credits li{margin-bottom:18px;overflow-wrap:anywhere}h4{margin-bottom:6px}@media print{@page{size:auto;margin:18mm}figure img{max-height:65mm}body{background:white;font-size:11pt}main{padding:0;max-width:none}h1{font-size:30pt}h2{font-size:22pt}h3{font-size:16pt}h2,h3,h4{break-after:avoid}p{orphans:3;widows:3}.credits{break-before:page;margin-top:0}.credits>:last-child{margin-bottom:0}.practical,.preparation{break-inside:avoid}.area,.access{background:none;padding:0}}
</style></head><body><main><header><p class="eyebrow">PROJECT ODISHA · DISCOVER ODISHA. IMAGINE THE POSSIBILITIES.</p><h1>${e(plan.title||'My Odisha Journey')}</h1><p>Offline ${illustrated?'illustrated':'text'} edition · prepared ${e(generatedAt)}</p><p>This file contains your selected summaries, dates and access notes.${includePersonalNotes?' Your personal notes are included.':' Personal notes have been omitted from this copy.'} It can be read without a connection.${illustrated?` ${photoCredits.size} selected ${photoCredits.size===1?'photograph is':'photographs are'} embedded.${omittedImages?` ${omittedImages} photographs could not be included; their entries remain readable.`:''}`:''} External reading links require the internet; preview entries may not yet be published.</p><p>A personal research plan, not a booking or verified itinerary. Recheck access, transport and availability before setting out. Anyone you share this file with can read the notes it contains.</p>${contents?`<nav aria-label="In this tour book"><h2>Your days at a glance</h2><ul>${contents}</ul></nav>`:''}</header>${story}${groups||'<p>No saved choices yet.</p>'}${preparation}${reminders}${questionSection}<section class="credits"><h2>Sources & further reading</h2><p>Founder & Editor-in-Chief: Ahimanikya Satapathy. <a href="https://projectodisha.org/about/editorial-process/">Our editorial process</a>. Summaries reflect the collection loaded in the page used to make this book, not a snapshot from the day you saved. Keep your JSON backup if you want to edit the plan later. ${illustrated?'Photographs retain their individual licences and credits below. No audio or maps are included.':'This text edition does not include photographs, poems, audio or maps.'}</p><ul>${sources}</ul>${imageCredits?`<h2>Photograph credits</h2><ul>${imageCredits}</ul>`:''}</section></main></body></html>`;
}

export function buildTextItinerary(value,entries,{includePersonalNotes=true,baseURL='https://projectodisha.org',trails=[]}={}){
 const plan=validateJourney(value),catalog=new Map(entries.map(e=>[e.id,e]));
 const lines=[plan.title||'My Odisha Journey','Project Odisha · Discover Odisha. Imagine the possibilities.','Personal research plan; confirm travel arrangements separately.',includePersonalNotes?'Personal notes included.':'Personal notes omitted from this copy.',''];
 const days=journeyDayCards(plan,entries,{includePersonalNotes});
 if(days.length){lines.push('Your days at a glance');for(const day of days)lines.push(day.label+(day.title?' · '+day.title:'')+' — '+(day.ideas.join(' · ')||'Room for a pause')+(day.more?` · +${day.more} more`:''));lines.push('');}
 const trail=selectedStoryTrail(plan,trails);
 if(trail){lines.push(trail.title+' · a reading companion','Chapters related to your selected ideas, not extra stops or a timed itinerary.','');for(const chapter of trail.chapters)lines.push(chapter.title,chapter.text,(trail.prompt_label||'Before you go')+': '+chapter.prompt,'Selected ideas: '+chapter.selectedIdeas.map(id=>catalog.get(id)?.title||id).join(' · '),'');for(const p of trail.preparation)lines.push(p.title+': '+p.text);if(trail.editorial_reading)lines.push('By '+trail.author,'Article and full source notes: '+(safeURL(trail.href,baseURL)||baseURL));else lines.push('Context reviewed '+trail.reviewed_on+'. '+trail.review_scope);for(const source of trail.sources){const url=safeURL(source.url,baseURL);if(url)lines.push('Source: '+source.title+' — '+url);}lines.push('');}
 for(const group of groupItems(plan)){
  lines.push(dayLabel(plan,group.day),planningContext(group.items,catalog).message,'');
  const dayNote=(plan.dayNotes||[]).find(n=>n.day===group.day);if(includePersonalNotes&&dayNote)lines.push(dayNote.title,dayNote.notes,'');
  for(const saved of group.items){const item=catalog.get(saved.id);lines.push(item?.title||'Unavailable item: '+saved.id);
   if(item){if(item.author)lines.push('By '+item.author);lines.push(item.summary,item.access||'Confirm local access.');for(const note of [...(item.practical||[]),...visitPrompts(item)]){lines.push(note.heading+': '+(note.paragraphs?.length?note.paragraphs.join('\n\n'):note.text));for(const link of note.links||[]){const url=safeURL(link.href,baseURL);if(url)lines.push(link.label+' — '+url);}}const url=safeURL(item.href,baseURL);if(url)lines.push(url);for(const source of item.sources||[]){const url=safeURL(source.url,baseURL);if(url)lines.push('Source: '+source.title+' — '+url);}}
   if(includePersonalNotes&&saved.notes)lines.push('Your notes: '+saved.notes);lines.push('');
  }
 }
 lines.push('Preparation checklist (marked by you):',...preparationRows(plan).map(row=>(row.done?'Done':'To check')+' — '+row.label),'','Keep a JSON backup to edit this plan later.');
 if(includePersonalNotes&&(plan.reminders||[]).length){lines.push('','Your personal reminders — whole trip');for(const r of plan.reminders)lines.push(`${r.done?'Done':'To check'} — ${r.text}`);}
 const questions=questionGroups(plan,entries);if(questions.length){lines.push('','Questions to take with you — ask locally; arrangements are not verified.');for(const g of questions){lines.push(g.title);for(const q of g.questions)lines.push(q.heading+': '+q.text);}}
 lines.push('','Our editorial process: https://projectodisha.org/about/editorial-process/');
 return lines.join('\n');
}
