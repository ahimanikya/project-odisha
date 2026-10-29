import maniabandha from '../../../../kb/research/culture/maniabandha.json';
import dhagaArticleRaw from '../../../../kb/research/culture/odia-dhaga.md?raw';
import multilingualEditorial from '../../../../kb/research/voices/multilingual-editorial.json';
import languagePopulation from '../../../../kb/research/voices/population-2011.json';
import {selection,districtRows,multilingualTotals,count as languageCount,percent as languagePercent} from '../lib/language-atlas.mjs';
import sunari from '../../../../kb/research/communities/sunari.json';
import kamar from '../../../../kb/research/communities/kamar.json';
import patara from '../../../../kb/research/communities/patara.json';
import dhoba from '../../../../kb/research/communities/dhoba.json';
import mali from '../../../../kb/research/communities/mali.json';
import bhandari from '../../../../kb/research/communities/bhandari.json';
import teli from '../../../../kb/research/communities/teli.json';
import chitrakara from '../../../../kb/research/communities/chitrakara.json';
import gopala from '../../../../kb/research/communities/gopala.json';
import kansari from '../../../../kb/research/communities/kansari.json';
import nolia from '../../../../kb/research/communities/nolia.json';
import kaibarta from '../../../../kb/research/communities/kaibarta.json';
import karana from '../../../../kb/research/communities/karana.json';
import kumbhara from '../../../../kb/research/communities/kumbhara.json';
import bhulia from '../../../../kb/research/communities/bhulia.json';
import tanti from '../../../../kb/research/communities/tanti.json';
import chasa from '../../../../kb/research/communities/chasa.json';
import khandayat from '../../../../kb/research/communities/khandayat.json';
import paika from '../../../../kb/research/communities/paika.json';
import podaEditorial from '../../../../kb/research/food/poda-editorial.json';
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
import desiaEditorial from '../../../../kb/research/voices/desia-editorial.json';
import sambalpuriEditorial from '../../../../kb/research/voices/sambalpuri-editorial.json';
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
entries.push({id:maniabandha.save_id,title:maniabandha.title,author:maniabandha.author,kind:'Reading',area:'Cuttack',summary:maniabandha.lead,href:maniabandha.href,checked:maniabandha.checked_on,practical:maniabandha.passages.map(p=>({heading:'',text:p.text})),sources:maniabandha.sources});
const dhagaBody=dhagaArticleRaw.replace(/^---[\s\S]*?---\s*/, '');
const dhagaPlain=(text:string)=>text.replace(/^#{1,6}\s+/gm,'').replace(/\[\^[^\]]+\]/g,'').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'$1 ($2)').replace(/^> ?/gm,'').replace(/\*\*/g,'').replace(/\*([^*]+)\*/g,'$1').trim();
const dhagaSections=dhagaBody.split(/^## /m).map((chunk,index)=>{const lines=chunk.split('\n');const heading=index?lines.shift()!:'The Poetry We Speak';const paragraphs=lines.join('\n').split(/\n\s*\n/).filter(p=>p.trim()).map(p=>dhagaPlain(p.replace(/^\[\^[^\]]+\]:\s*/,'')));return {heading,paragraphs,text:paragraphs.join(' ')};}).filter(s=>s.paragraphs.length);
const dhagaSources=[...dhagaBody.matchAll(/\[([^\]]+)\]\((https?:[^)]+)\)/g)].map(m=>({title:m[1].replace(/\*/g,''),url:m[2]}));
entries.push({id:'reading:stories/odia-dhaga',author:'Ahimanikya Satapathy',title:'The Poetry We Speak: Why Odia Dhaga Matter',kind:'Reading',area:'Odisha',summary:'Odia sayings carry images, humour and ways of judging everyday life.',href:'/stories/odia-dhaga/',practical:dhagaSections,sources:[...new Map(dhagaSources.map(s=>[s.url,s])).values()]});

entries.push({id:'reading:paika',author:paika.author,title:paika.title,kind:'Reading',area:'Odisha',summary:paika.lead,href:'/communities/paika/',checked:paika.checked_on,practical:paika.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:paika.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:khandayat',author:khandayat.author,title:khandayat.title,kind:'Reading',area:'Odisha',summary:khandayat.lead,href:'/communities/khandayat/',checked:khandayat.checked_on,practical:khandayat.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:khandayat.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:chasa',author:chasa.author,title:chasa.title,kind:'Reading',area:'Odisha',summary:chasa.lead,href:'/communities/chasa/',checked:chasa.checked_on,practical:chasa.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:chasa.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:tanti',author:tanti.author,title:tanti.title,kind:'Reading',area:'Odisha',summary:tanti.lead,href:'/communities/tanti/',checked:tanti.checked_on,practical:tanti.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:tanti.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:bhulia',author:bhulia.author,title:bhulia.title,kind:'Reading',area:'Odisha',summary:bhulia.lead,href:'/communities/bhulia/',checked:bhulia.checked_on,practical:bhulia.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:bhulia.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:kumbhara',author:kumbhara.author,title:kumbhara.title,kind:'Reading',area:'Odisha',summary:kumbhara.lead,href:'/communities/kumbhara/',checked:kumbhara.checked_on,practical:kumbhara.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:kumbhara.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:karana',author:karana.author,title:karana.title,kind:'Reading',area:'Odisha',summary:karana.lead,href:'/communities/karana/',checked:karana.checked_on,practical:karana.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:karana.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:kaibarta',author:kaibarta.author,title:kaibarta.title,kind:'Reading',area:'Odisha',summary:kaibarta.lead,href:'/communities/kaibarta/',checked:kaibarta.checked_on,practical:kaibarta.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:kaibarta.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:nolia',author:nolia.author,title:nolia.title,kind:'Reading',area:'Odisha',summary:nolia.lead,href:'/communities/nolia/',checked:nolia.checked_on,practical:nolia.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:nolia.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:kansari',author:kansari.author,title:kansari.title,kind:'Reading',area:'Odisha',summary:kansari.lead,href:'/communities/kansari/',checked:kansari.checked_on,practical:kansari.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:kansari.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:gopala',author:gopala.author,title:gopala.title,kind:'Reading',area:'Odisha',summary:gopala.lead,href:'/communities/gopala/',checked:gopala.checked_on,practical:gopala.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:gopala.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:chitrakara',author:chitrakara.author,title:chitrakara.title,kind:'Reading',area:'Odisha',summary:chitrakara.lead,href:'/communities/chitrakara/',checked:chitrakara.checked_on,practical:chitrakara.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:chitrakara.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:teli',author:teli.author,title:teli.title,kind:'Reading',area:'Odisha',summary:teli.lead,href:'/communities/teli/',checked:teli.checked_on,practical:teli.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:teli.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:bhandari',author:bhandari.author,title:bhandari.title,kind:'Reading',area:'Odisha',summary:bhandari.lead,href:'/communities/bhandari/',checked:bhandari.checked_on,practical:bhandari.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:bhandari.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:mali',author:mali.author,title:mali.title,kind:'Reading',area:'Odisha',summary:mali.lead,href:'/communities/mali/',checked:mali.checked_on,practical:mali.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:mali.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:dhoba',author:dhoba.author,title:dhoba.title,kind:'Reading',area:'Odisha',summary:dhoba.lead,href:'/communities/dhoba/',checked:dhoba.checked_on,practical:dhoba.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:dhoba.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:patara',author:patara.author,title:patara.title,kind:'Reading',area:'Odisha',summary:patara.lead,href:'/communities/patara/',checked:patara.checked_on,practical:patara.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:patara.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:kamar',author:kamar.author,title:kamar.title,kind:'Reading',area:'Odisha',summary:kamar.lead,href:'/communities/kamar/',checked:kamar.checked_on,practical:kamar.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:kamar.sources.map(({title,url})=>({title,url}))});
const multilingualCounts=multilingualTotals(languagePopulation);
const multilingualChartParagraphs=[`Denominator: ${languageCount(multilingualCounts.population)} people, Odisha, Census 2011.`,`At least one additional language reported: ${languageCount(multilingualCounts.atLeastTwo)} (${languagePercent(multilingualCounts.atLeastTwo,multilingualCounts.population)}). Within that total: two additional languages, ${languageCount(multilingualCounts.three)} (${languagePercent(multilingualCounts.three,multilingualCounts.population)}).`,...[['No additional language reported',multilingualCounts.noAdditionalReported],['One additional language reported',multilingualCounts.exactlyTwoReported],['Two additional languages reported',multilingualCounts.three]].map(([label,value])=>`${label}: ${languageCount(value)} (${languagePercent(value,multilingualCounts.population)}).`),multilingualEditorial.chart_text.note];
entries.push({id:'reading:languages/multilingual-odisha',author:multilingualEditorial.author,title:multilingualEditorial.title,kind:'Reading',area:'Odisha',summary:multilingualEditorial.lead,href:'/languages/multilingual-odisha/',checked:multilingualEditorial.checked_on,practical:multilingualEditorial.sections.flatMap(s=>[{heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)},...(s.id==='counting'?[{heading:'Three distinct slices of the same population',text:multilingualChartParagraphs.join(' '),paragraphs:multilingualChartParagraphs}]:[])]),sources:multilingualEditorial.sources.map(({title,url})=>({title,url}))});
entries.push({id:'reading:sunari',author:sunari.author,title:sunari.title,kind:'Reading',area:'Odisha',summary:sunari.lead,href:'/communities/sunari/',checked:sunari.checked_on,practical:sunari.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),sources:sunari.sources.map(({title,url})=>({title,url}))});
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
 const editorial=p.path==='languages/odia'?odiaEditorial:p.path==='languages/santali'?santaliEditorial:p.path==='languages/kui'?kuiEditorial:p.path==='languages/kuvi'?kuviEditorial:p.path==='languages/saora'?saoraEditorial:p.path==='languages/ho'?hoEditorial:p.path==='languages/juang'?juangEditorial:p.path==='languages/koya'?koyaEditorial:p.path==='languages/sambalpuri'?sambalpuriEditorial:p.path==='languages/desia'?desiaEditorial:p.path==='people/fakir-mohan-senapati'?fakirEditorial:p.path==='literature/six-acres-and-a-third'?sixAcresEditorial:p.path==='people/sarala-das'?saralaEditorial:p.path==='people/pratibha-ray'?pratibhaEditorial:p.path==='people/bhima-bhoi'?bhimaEditorial:p.path==='people/gopinath-mohanty'?gopinathEditorial:p.path==='people/gangadhar-meher'?gangadharEditorial:null;
 const populationReading=['languages/sambalpuri','languages/desia'].includes(p.path)?(()=>{const profile=languagePopulation.profiles[p.path.split('/')[1]],value=selection(languagePopulation,profile.code);return [{heading:'Where the voices were counted · Census 2011',paragraphs:[`Recorded as ${value.label.label}: ${languageCount(value.persons)} people in Odisha; ${value.share} of Odisha’s 2011 population.`, 'This is the individual mother-tongue entry in the Census table. It counts reported mother tongues in 2011, not everyone who can speak the language today.',profile.note,`Largest recorded counts: ${districtRows(languagePopulation,profile.code).filter(d=>d.persons>0).slice(0,3).map(d=>`${d.name} (${languageCount(d.persons)})`).join('; ')}.`,`Census C-16 · Sheet1, row ${value.sourceRow}.`].filter(Boolean)}];})():[];
 entries.push({id:'reading:'+p.path,title:p.title,kind:'Reading',area:'Culture & language',summary:p.lead,href:'/'+p.path+'/',checked:p.checked_on||voices.checked_on,...(editorial?{author:editorial.author}:{}),practical:editorial?[...p.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),paragraphs:s.paragraphs.map(p=>p.text)})),...populationReading]:p.reading_notes,sources:editorial?editorial.sources.map(({title,url})=>({title,url})):[...new Set([...p.sections.flatMap(s=>s.paragraphs.flatMap(v=>v.source_ids)),...(p.learning_resource?[p.learning_resource.source_id]:[])])].map(id=>({title:voices.sources[id].title,url:voices.sources[id].url}))});
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
 const isPodaPitha=foodPage?.slug==='poda-pitha';
 if(isPodaPitha){item.author=podaEditorial.author;item.checked=podaEditorial.checked_on;item.sources=[];}
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
 const practical=foodPage?foodPage.sections.map(s=>({heading:s.title,text:s.paragraphs.map(p=>p.text).join(' '),...((isPodaPitha||isEnduri||isRasagola||isChhenaPoda||isMudhiMansa||isChandipurMeal)?{paragraphs:s.paragraphs.map(p=>p.text)}:{})})):detail && (detail.slug==='raghurajpur'||(detail.kind==='stays'&&detail.slug==='puri-coast')||['chilika','bhubaneswar','cuttack','balasore','mayurbhanj'].includes(detail.parent))?detail.sections.flatMap(s=>[{heading:s.heading,text:[s.text,...(s.paragraphs||[])].join(" "),...((isBarabati||isNetaji||isCuttackStay||isChandipur||isSimilipal||isChhau||isBalasoreStay||isSimilipalStay)?{paragraphs:[s.text,...(s.paragraphs||[])]}:{})},...(s.options||[]).map(o=>({heading:o.area,text:[o.fit,o.transport,o.check].join(' ')}))]):meal?[{heading:meal.prompt,text:meal.question},{heading:'Before ordering',text:mealGuide.closing}]:item.practical;
 if(foodPage&&meal)practical.push({heading:'Before ordering',text:mealGuide.closing});
 if(item.id==='food:bhubaneswar-dalma')practical.push(...cityMeal.sections.map(s=>({heading:'Bhubaneswar at the table · '+s.title,text:[s.text,...(s.paragraphs||[])].join(' ')})));
 const sources=[...new Map([...(item.sources||[]),...(isPodaPitha?podaEditorial.sources:isEnduri?enduriEditorial.sources:isRasagola?rasagolaEditorial.sources:isChandipurMeal?chandipurMealEditorial.sources:isMudhiMansa?mudhiEditorial.sources:isChhenaPoda?chhenaEditorial.sources:foodPage?[...new Set(foodPage.sections.flatMap(s=>s.paragraphs.flatMap(p=>p.source_ids)))].map(id=>foodCollection.sources[id]):[]),...(detail && (detail.slug==='raghurajpur'||(detail.kind==='stays'&&detail.slug==='puri-coast')||['chilika','bhubaneswar','cuttack','balasore','mayurbhanj'].includes(detail.parent))?detailSources(detail).map(s=>({title:s.title,url:s.resource})):[]),...(meal?meal.source_ids.map(id=>mealGuide.sources[id]):[]),...(item.id==='food:bhubaneswar-dalma'?Object.values(cityMeal.sources):[]),...(notebook?.planning_sources||[])].map(s=>[isRasagola?JSON.stringify([s.title,s.url]):s.url,{title:s.title,url:s.url}])).values()];
 return {...item,sources,practical,visitQuestions:visitQuestions.guides.find(g=>g.save_id===item.id)?.questions,visitNotebook:notebook,aliases:aliases.entries[item.href.split('#')[0]]||[],title:item.kind==='Stay area'&&detail?detail.title:item.title,photo:bookPhotos[item.id]?Object.fromEntries(['src','alt','width','height','caption','creator','license','license_url','source','changes'].map(key=>[key,bookPhotos[item.id][key]])):undefined,planningArea:item.id==='place:mangalajodi'?'Mangalajodi':region,access};
});
