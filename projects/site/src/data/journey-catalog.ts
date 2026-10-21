import enduriEditorial from '../../../../kb/research/food/enduri-editorial.json';
import boseEditorial from '../../../../kb/research/people/bose-editorial.json';
import rasagolaEditorial from '../../../../kb/research/food/rasagola-editorial.json';
import chandipurMealEditorial from '../../../../kb/research/food/chandipur-meal-editorial.json';
import mudhiEditorial from '../../../../kb/research/food/mudhi-mansa-editorial.json';
import chhenaEditorial from '../../../../kb/research/food/chhena-poda-editorial.json';
import similipalStayEditorial from '../../../../kb/research/destinations/similipal-stay-editorial.json';
import balasoreStayEditorial from '../../../../kb/research/destinations/balasore-stay-editorial.json';
import chhauEditorial from '../../../../kb/research/destinations/chhau-editorial.json';
import similipalEditorial from '../../../../kb/research/destinations/similipal-editorial.json';
import chandipurEditorial from '../../../../kb/research/destinations/chandipur-editorial.json';
import mayurbhanjEditorial from '../../../../kb/research/destinations/mayurbhanj-editorial.json';
import balasoreEditorial from '../../../../kb/research/destinations/balasore-editorial.json';
import gangadharEditorial from '../../../../kb/research/voices/gangadhar-editorial.json';
import gopinathEditorial from '../../../../kb/research/voices/gopinath-editorial.json';
import bhimaEditorial from '../../../../kb/research/voices/bhima-editorial.json';
import pratibhaEditorial from '../../../../kb/research/voices/pratibha-editorial.json';
import saralaEditorial from '../../../../kb/research/voices/sarala-editorial.json';
import sixAcresEditorial from '../../../../kb/research/voices/six-acres-editorial.json';
import fakirEditorial from '../../../../kb/research/voices/fakir-editorial.json';
import koyaEditorial from '../../../../kb/research/voices/koya-editorial.json';
import juangEditorial from '../../../../kb/research/voices/juang-editorial.json';
import hoEditorial from '../../../../kb/research/voices/ho-editorial.json';
import saoraEditorial from '../../../../kb/research/voices/saora-editorial.json';
import kuviEditorial from '../../../../kb/research/voices/kuvi-editorial.json';
import kuiEditorial from '../../../../kb/research/voices/kui-editorial.json';
import santaliEditorial from '../../../../kb/research/voices/santali-editorial.json';
import odiaEditorial from '../../../../kb/research/voices/odia-editorial.json';
import cuttackStayEditorial from '../../../../kb/research/destinations/cuttack-stay-editorial.json';
import netajiEditorial from '../../../../kb/research/destinations/netaji-museum-editorial.json';
import barabatiEditorial from '../../../../kb/research/destinations/barabati-editorial.json';
import cuttackEditorial from '../../../../kb/research/destinations/cuttack-editorial.json';
import puriEditorial from '../../../../kb/research/destinations/puri-editorial.json';
import chilikaEditorial from '../../../../kb/research/destinations/chilika-editorial.json';
import konarkEditorial from '../../../../kb/research/destinations/konark-editorial.json';
import maritime from '../../../../kb/research/stories/narratives/maritime-memory.json';
import textiles from '../../../../kb/research/culture/textile-stories.json';
import crafts from '../../../../kb/research/culture/craft-stories.json';
import fire from '../../../../kb/research/food/fire-cooking-stories.json';
import everyday from '../../../../kb/research/food/everyday-stories.json';
import bose from '../../../../kb/research/people/subhas-chandra-bose.json';
import visitQuestions from '../../../../kb/research/destinations/visit-questions.json';
import visitNotebooks from '../../../../kb/research/destinations/visit-notebooks.json';
import aliases from '../../../../kb/research/discovery-aliases.json';
import editionCopy from '../../../../kb/research/destinations/coastal-edition-copy.json';
import {allowsIdea,allowsPage,ideaHref,isCoastalEdition} from './edition';
import {bookPhotos} from './book-photos';
import notes from './selected.json';
import {pilots,detailRecords,detailUrl,detailSources} from './destination-details';
import voices from '../../../../kb/research/voices/collection.json';
import foodCollection from '../../../../kb/research/food/collection.json';
import cuttackMeal from '../../../../kb/research/food/cuttack.json';
import cityMeal from '../../../../kb/research/food/bhubaneswar.json';
import regions from '../../../../kb/research/destinations/regions.json';
const entries=[];
entries.push({id:maritime.save_id,title:maritime.title,kind:'Reading',area:'Odisha and the sea',summary:maritime.lead,href:maritime.href,checked:maritime.reviewed_on,
 practical:[{heading:'Begin with a question',text:maritime.opening},
 ...maritime.chapters.flatMap(c=>[{heading:c.title,text:c.paragraphs.join(' ')},{heading:'A question to carry',text:c.question}]),
 {heading:maritime.visit.title,text:[maritime.visit.intro,...maritime.visit.questions].join(' ')},
 {heading:'How to read this story',text:maritime.editorial_note}],sources:maritime.sources.map(({id,title,url})=>({id,title,url}))});
entries.push({id:textiles.collection.save_id,title:textiles.collection.title,kind:'Reading',area:'Across Odisha',summary:textiles.collection.lead,href:'/textiles/',checked:textiles.collection.checked_on,practical:textiles.collection.questions,sources:textiles.collection.source_ids.map(id=>textiles.sources[id])});
for(const p of textiles.pages)entries.push({id:p.save_id,title:p.title,kind:'Reading',area:p.area,summary:p.lead,href:p.href,checked:p.checked_on,practical:p.sections.map(s=>({heading:s.title,text:s.paragraphs.map(v=>v.text).join(' ')})),sources:[...new Set(p.sections.flatMap(s=>s.paragraphs.flatMap(v=>v.source_ids)))].map(id=>textiles.sources[id])});
entries.push({id:crafts.collection.save_id,title:crafts.collection.title,kind:'Reading',area:'Puri & Cuttack',summary:crafts.collection.lead,href:'/crafts/',checked:crafts.collection.checked_on,practical:crafts.collection.questions,sources:crafts.collection.source_ids.map(id=>crafts.sources[id])});
for(const p of crafts.pages)entries.push({id:p.save_id,title:p.title,kind:'Reading',area:p.area,summary:p.lead,href:'/crafts/'+p.slug+'/',checked:p.checked_on,practical:p.sections.map(s=>({heading:s.title,text:s.paragraphs.map(v=>v.text).join(' ')})),sources:[...new Set(p.sections.flatMap(s=>s.paragraphs.flatMap(v=>v.source_ids)))].map(id=>crafts.sources[id])});
entries.push({id:everyday.save_id,title:everyday.title,kind:'Reading',area:'Across Odisha',summary:everyday.lead,href:'/food/everyday/',checked:everyday.checked_on,practical:everyday.questions.map(text=>({heading:'Ask the maker',text})),sources:[...new Set(everyday.chapters.flatMap(c=>foodCollection.pages.find(p=>p.slug===c.slug).sections.flatMap(s=>s.paragraphs.flatMap(p=>p.source_ids))))].map(id=>foodCollection.sources[id])});
entries.push({id:fire.save_id,title:fire.title,kind:'Reading',area:'Across Odisha',summary:fire.lead,href:'/food/fire-cooking/',checked:fire.checked_on,practical:fire.questions.map(text=>({heading:'Ask the maker',text})),sources:[...new Set(fire.chapters.flatMap(c=>foodCollection.pages.find(p=>p.slug===c.slug).sections.flatMap(s=>s.paragraphs.flatMap(p=>p.source_ids))))].map(id=>foodCollection.sources[id])});
for(const r of regions.regions){
 const regionEditorial=r.slug==='mayurbhanj'?mayurbhanjEditorial:r.slug==='balasore'?balasoreEditorial:r.slug==='puri'?puriEditorial:r.slug==='cuttack'?cuttackEditorial:null;
 const sourcePool=regionEditorial?Object.fromEntries(regionEditorial.sources.map(s=>[s.id,s])):regions.sources;
 const sources=ids=>ids.map(id=>({title:sourcePool[id].title,url:sourcePool[id].url}));
 const href=`/destinations/${r.slug}/`;
 entries.push({id:r.id,...(['cuttack','balasore','mayurbhanj'].includes(r.slug)?{author:regionEditorial.author}:{}),title:r.title,kind:'Place',area:r.title,summary:r.orientation,href,checked:r.checked_on||regions.checked_on,practical:['cuttack','balasore','mayurbhanj'].includes(r.slug)?[...r.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),...(r.visitor_notes||[])]:r.visitor_notes||[],sources:['balasore','mayurbhanj'].includes(r.slug)?regionEditorial.sources.map(({title,url})=>({title,url})):sources([...new Set([...r.source_ids,...(r.visitor_notes||[]).flatMap(n=>n.source_ids)])])});
 for(const i of r.items)entries.push({id:i.id,title:i.title,kind:i.kind,area:r.title,summary:i.summary,href:i.detail_href||href+'#'+i.id.replaceAll(':','-'),checked:r.checked_on||regions.checked_on,access:i.tip,sources:sources(i.source_ids)});
}
for(const [slug,pilot] of Object.entries(pilots)){
 const d=pilot.destination, note=notes.find(n=>n.slug===slug);
 const sourcePool=['konark','chilika'].includes(slug)?(slug==='konark'?konarkEditorial:chilikaEditorial).sources.map(s=>({...s,resource:s.url})):[...note.sources,...d.sources,...pilot.story.sources];
 const sources=(ids)=>sourcePool.filter(s=>ids.includes(s.id)).map(s=>({title:s.title,url:s.resource}));
 entries.push({id:d.id,title:note.label,kind:'Place',area:note.label,summary:d.orientation,href:`/knowledge/${slug}/`,checked:d.checked_on,sources:sources(d.orientation_sources)});
 for(const [key,kind] of [['experiences','Experience'],['foods','Food'],['bases','Stay area']])for(const item of d[key])entries.push({id:item.id,title:item.title,kind,area:item.area||note.label,summary:item.text,href:item.detail_href||`/knowledge/${slug}/#${item.id.replaceAll(':','-')}`,checked:d.checked_on,sources:sources(item.sources)});
}
for(const r of detailRecords.filter(r=>r.kind==='places'&&pilots[r.parent]))entries.push({id:'place:'+r.slug,title:r.title,kind:'Place',area:r.parent==='chilika'?'Chilika':'Konark',summary:r.lead,href:detailUrl(r.kind,r.slug),checked:r.checked_on,sources:detailSources(r).map(s=>({title:s.title,url:s.resource}))});
for(const p of voices.pages.filter(p=>p.path.split('/').length>1)){
 const editorial=p.path==='languages/odia'?odiaEditorial:p.path==='languages/santali'?santaliEditorial:p.path==='languages/kui'?kuiEditorial:p.path==='languages/kuvi'?kuviEditorial:p.path==='languages/saora'?saoraEditorial:p.path==='languages/ho'?hoEditorial:p.path==='languages/juang'?juangEditorial:p.path==='languages/koya'?koyaEditorial:p.path==='people/fakir-mohan-senapati'?fakirEditorial:p.path==='literature/six-acres-and-a-third'?sixAcresEditorial:p.path==='people/sarala-das'?saralaEditorial:p.path==='people/pratibha-ray'?pratibhaEditorial:p.path==='people/bhima-bhoi'?bhimaEditorial:p.path==='people/gopinath-mohanty'?gopinathEditorial:p.path==='people/gangadhar-meher'?gangadharEditorial:null;
 entries.push({id:'reading:'+p.path,title:p.title,kind:'Reading',area:'Culture & language',summary:p.lead,href:'/'+p.path+'/',checked:p.checked_on||voices.checked_on,...(editorial?{author:editorial.author}:{}),practical:editorial?p.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})):p.reading_notes,sources:editorial?editorial.sources.map(({title,url})=>({title,url})):[...new Set([...p.sections.flatMap(s=>s.paragraphs.flatMap(v=>v.source_ids)),...(p.learning_resource?[p.learning_resource.source_id]:[])])].map(id=>({title:voices.sources[id].title,url:voices.sources[id].url}))});
}
for(const p of foodCollection.pages.filter(p=>!entries.some(item=>item.id===p.save_id)))entries.push({id:p.save_id,title:p.title,kind:'Food',area:p.planning_area||p.area,summary:p.lead,href:'/food/'+p.slug+'/',checked:p.checked_on||foodCollection.checked_on,sources:[]});
entries.push({id:bose.save_id,author:boseEditorial.author,title:bose.title,kind:'Reading',area:bose.area,summary:bose.lead,href:'/'+bose.path+'/',checked:boseEditorial.checked_on,practical:bose.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:boseEditorial.sources.map(({title,url})=>({title,url}))});
const pakhala=notes.find(n=>n.slug==='pakhala');
entries.push({id:'food:pakhala',title:pakhala.label,kind:'Food',area:'Odisha',summary:pakhala.dek,href:pakhala.href,checked:'2026-09-29',sources:pakhala.sources.map(s=>({title:s.title,url:s.resource}))});
export const journeyCatalog=entries.filter(item=>allowsIdea(item.id)).map(original=>{
 const item={...original,href:ideaHref(original.id,original.href)};
 if(isCoastalEdition&&item.id==='place:bhubaneswar')item.summary=editionCopy.bhubaneswar.orientation;
 const foodPage=foodCollection.pages.find(p=>p.save_id===item.id);
 if(foodPage&&allowsPage('/food/'+foodPage.slug+'/')){
  item.href='/food/'+foodPage.slug+'/';
  item.title=foodPage.title;
  item.summary=foodPage.lead;
  item.area=foodPage.planning_area||foodPage.area;
 }
 const isEnduri=foodPage?.slug==='enduri-pitha';
 if(isEnduri){item.author=enduriEditorial.author;item.checked=enduriEditorial.checked_on;item.sources=[];}
 const isRasagola=foodPage?.slug==='odisha-rasagola';
 if(isRasagola){item.author=rasagolaEditorial.author;item.checked=rasagolaEditorial.checked_on;item.sources=[];}
 const isChandipurMeal=foodPage?.slug==='balasore';
 if(isChandipurMeal){item.author=chandipurMealEditorial.author;item.checked=chandipurMealEditorial.checked_on;item.sources=[];}
 const isMudhiMansa=foodPage?.slug==='mudhi-mansa';
 if(isMudhiMansa){item.author=mudhiEditorial.author;item.checked=mudhiEditorial.checked_on;item.sources=[];}
 const isChhenaPoda=foodPage?.slug==='chhena-poda';
 if(isChhenaPoda){item.author=chhenaEditorial.author;item.checked=chhenaEditorial.checked_on;item.sources=[];}
 const region=item.href.includes('/balasore/')||item.href.includes('/chandipur/')?'Balasore':item.href.includes('/mayurbhanj/')||item.href.includes('/similipal/')?'Mayurbhanj':item.area==='Culture & language'?'Reading':item.area;
 const access=item.id==='experience:bhubaneswar-fresco'?'A February 2009 photo archive, not a verified current mural route. Exact streets and present condition are unverified.':item.id==='place:chandipur'?'Check local tides and the return route; firm paths and toilets have not been inspected.':item.id==='place:similipal'?'Confirm the gate, permit, vehicle and seasonal opening through the official reserve.':item.kind==='Stay area'?'Confirm the property, facilities and access directly; this is an area suggestion.':item.kind==='Reading'?'A reading idea, not a scheduled visit.':item.access||'Confirm local access, transport and availability before travel.';
 const notebook=visitNotebooks.notebooks.find(n=>n.save_id===item.id);
 const detail=detailRecords.find(r=>detailUrl(r.kind,r.slug)===item.href);
 const isSimilipalStay=detail?.kind==='stays'&&detail.slug==='similipal-gateways';
 if(isSimilipalStay){item.author=similipalStayEditorial.author;item.summary=detail.lead;item.checked=detail.checked_on;item.sources=[];}
 const isBalasoreStay=detail?.kind==='stays'&&detail.slug==='balasore-coast';
 if(isBalasoreStay){item.author=balasoreStayEditorial.author;item.summary=detail.lead;item.checked=detail.checked_on;item.sources=[];}
 const isChhau=detail?.kind==='experiences'&&detail.slug==='mayurbhanj-chhau';
 if(isChhau){item.author=chhauEditorial.author;item.summary=detail.lead;item.checked=detail.checked_on;item.sources=[];}
 const isSimilipal=detail?.kind==='places'&&detail.slug==='similipal';
 if(isSimilipal){item.author=similipalEditorial.author;item.summary=detail.lead;item.checked=detail.checked_on;item.sources=[];}
 const isChandipur=detail?.kind==='places'&&detail.slug==='chandipur';
 if(isChandipur){item.author=chandipurEditorial.author;item.summary=detail.lead;item.checked=detail.checked_on;item.sources=[];}
 const isCuttackStay=detail?.kind==='stays'&&detail.slug==='cuttack';
 if(isCuttackStay){item.author=cuttackStayEditorial.author;item.summary=detail.lead;item.sources=[];}
 const isBarabati=detail?.kind==='places'&&detail.slug==='barabati';
 const isNetaji=detail?.kind==='experiences'&&detail.slug==='cuttack-netaji';
 if(isNetaji){item.author=netajiEditorial.author;item.summary=detail.lead;item.sources=[];}
 if(isBarabati){item.author=barabatiEditorial.author;item.summary=detail.lead;item.checked=detail.checked_on;item.sources=[];}
 if((detail?.kind==='experiences'&&['mangalajodi-birdwatching','kalijai-crossing','satapada-boating'].includes(detail.slug))||(['mangalajodi','kalijai','satapada','mukteswar'].includes(detail?.slug)&&detail.kind==='places')||(detail?.slug==='dhauli'&&detail.kind==='places')||(['puri-coast','mangalajodi','barkul-rambha','rajhans-satapada','bhubaneswar'].includes(detail?.slug)&&detail.kind==='stays')){item.summary=detail.lead;item.sources=[];}
 const mealGuide=item.id==='food:cuttack-dahibara'?cuttackMeal:cityMeal;
 const meal=mealGuide.sections.find(s=>s.save_id===item.id && ['food:pakhala','food:bhubaneswar-dalma','food:cuttack-dahibara'].includes(item.id));
 const practical=foodPage?foodPage.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),...((isEnduri||isRasagola||isChhenaPoda||isMudhiMansa||isChandipurMeal)?{paragraphs:s.paragraphs.map(p=>p.text)}:{})})):detail && (detail.slug==='raghurajpur'||(detail.kind==='stays'&&detail.slug==='puri-coast')||['chilika','bhubaneswar','cuttack','balasore','mayurbhanj'].includes(detail.parent))?detail.sections.flatMap(s=>[{heading:s.heading,text:[s.text,...(s.paragraphs||[])].join(" "),...((isBarabati||isNetaji||isCuttackStay||isChandipur||isSimilipal||isChhau||isBalasoreStay||isSimilipalStay)?{paragraphs:[s.text,...(s.paragraphs||[])]}:{})},...(s.options||[]).map(o=>({heading:o.area,text:[o.fit,o.transport,o.check].join(' ')}))]):meal?[{heading:meal.prompt,text:meal.question},{heading:'Before ordering',text:mealGuide.closing}]:item.practical;
 if(foodPage&&meal)practical.push({heading:'Before ordering',text:mealGuide.closing});
 if(item.id==='food:bhubaneswar-dalma')practical.push(...cityMeal.sections.map(s=>({heading:'Bhubaneswar at the table · '+s.title,text:[s.text,...(s.paragraphs||[])].join(' ')})));
 const sources=[...new Map([...(item.sources||[]),...(isEnduri?enduriEditorial.sources:isRasagola?rasagolaEditorial.sources:isChandipurMeal?chandipurMealEditorial.sources:isMudhiMansa?mudhiEditorial.sources:isChhenaPoda?chhenaEditorial.sources:foodPage?[...new Set(foodPage.sections.flatMap(s=>s.paragraphs.flatMap(p=>p.source_ids)))].map(id=>foodCollection.sources[id]):[]),...(detail && (detail.slug==='raghurajpur'||(detail.kind==='stays'&&detail.slug==='puri-coast')||['chilika','bhubaneswar','cuttack','balasore','mayurbhanj'].includes(detail.parent))?detailSources(detail).map(s=>({title:s.title,url:s.resource})):[]),...(meal?meal.source_ids.map(id=>mealGuide.sources[id]):[]),...(item.id==='food:bhubaneswar-dalma'?Object.values(cityMeal.sources):[]),...(notebook?.planning_sources||[])].map(s=>[isRasagola?JSON.stringify([s.title,s.url]):s.url,{title:s.title,url:s.url}])).values()];
 return {...item,sources,practical,visitQuestions:visitQuestions.guides.find(g=>g.save_id===item.id)?.questions,visitNotebook:notebook,aliases:aliases.entries[item.href.split('#')[0]]||[],title:item.kind==='Stay area'&&detail?detail.title:item.title,photo:bookPhotos[item.id]?Object.fromEntries(['src','alt','width','height','caption','creator','license','license_url','source','changes'].map(key=>[key,bookPhotos[item.id][key]])):undefined,planningArea:item.id==='place:mangalajodi'?'Mangalajodi':region,access};
});
