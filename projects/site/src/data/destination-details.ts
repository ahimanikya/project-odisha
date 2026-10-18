import crossingEditorial from '../../../../kb/research/destinations/kalijai-crossing-editorial.json';
import birdwatchingEditorial from '../../../../kb/research/destinations/mangalajodi-birdwatching-editorial.json';
import satapadaEditorial from '../../../../kb/research/destinations/satapada-editorial.json';
import kalijaiEditorial from '../../../../kb/research/destinations/kalijai-editorial.json';
import mangalajodiEditorial from '../../../../kb/research/destinations/mangalajodi-editorial.json';
import puriStaysEditorial from '../../../../kb/research/destinations/puri-stays-editorial.json';
import raghurajpurEditorial from '../../../../kb/research/destinations/raghurajpur-editorial.json';
import dhauliEditorial from '../../../../kb/research/destinations/dhauli-editorial.json';
import crafts from '../../../../kb/research/culture/craft-stories.json';
import central from '../../../../kb/research/destinations/central-details.json';
import northern from '../../../../kb/research/destinations/northern-details.json';
import regions from '../../../../kb/research/destinations/regions.json';
import details from '../../../../kb/research/destinations/details.json';
import chilika from '../../../../kb/research/destinations/chilika.json';
import konark from '../../../../kb/research/destinations/konark.json';
import chilikaStory from '../../../../kb/research/stories/narratives/chilika.json';
import konarkStory from '../../../../kb/research/stories/narratives/konark.json';
import notes from './selected.json';
export const pilots={chilika:{destination:chilika,story:chilikaStory},konark:{destination:konark,story:konarkStory}};
export const detailRecords=[...details.records,...northern.records,...central.records];
export const parentUrl=(r)=>pilots[r.parent]?`/knowledge/${r.parent}/`:`/destinations/${r.parent}/`;
export const parentTitle=(r)=>r.parent.charAt(0).toUpperCase()+r.parent.slice(1);
export const detailUrl=(kind:string,slug:string)=>`/visit/${kind}/${slug}/`;
export function detailPhoto(record){if(!pilots[record.parent])return {...regions.assets[record.photo_ref],title:regions.assets[record.photo_ref].caption,caption:record.photo_context};const p=pilots[record.parent];return record.photo_ref==='hero'?{...p.story.image,caption:record.photo_context}:{...p.destination.visuals[record.photo_ref],caption:record.photo_context};}
export function detailSources(record){if(record.kind==='experiences'&&record.slug==='kalijai-crossing')return crossingEditorial.sources.map(s=>({...s,resource:s.url,inspection:s.note}));if(record.kind==='experiences'&&record.slug==='mangalajodi-birdwatching')return birdwatchingEditorial.sources.map(s=>({...s,resource:s.url,inspection:s.note}));if(record.kind==='places'&&record.slug==='satapada')return satapadaEditorial.sources.map(s=>({...s,resource:s.url,inspection:s.note}));if(record.kind==='places'&&record.slug==='kalijai')return kalijaiEditorial.sources.map(s=>({...s,resource:s.url,inspection:s.note}));if(record.kind==='places'&&record.slug==='mangalajodi')return mangalajodiEditorial.sources.map(s=>({...s,resource:s.url,inspection:s.note}));if(record.kind==='stays'&&record.slug==='puri-coast')return puriStaysEditorial.sources.map(s=>({...s,resource:s.url,inspection:s.note}));if(record.kind==='places'&&record.slug==='raghurajpur')return raghurajpurEditorial.sources.map(s=>({...s,resource:s.url,inspection:s.note}));if(record.kind==='places'&&record.slug==='dhauli')return dhauliEditorial.sources.map(s=>({...s,resource:s.url,inspection:s.note}));if(!pilots[record.parent])return record.sources.map(id=>({...regions.sources[id],id,resource:regions.sources[id].url,inspection:regions.sources[id].review}));const p=pilots[record.parent];return [...notes.find(n=>n.slug===record.parent).sources,...p.destination.sources,...p.story.sources].filter(s=>record.sources.includes(s.id));}
export function relatedDetail(key){if(key==='crafts')return {title:crafts.collection.title,href:'/crafts/'};if(key.startsWith('crafts/')){const p=crafts.pages.find(p=>'crafts/'+p.slug===key);return p?{title:p.title,href:'/'+key+'/'}:null;}if(key==='people/subhas-chandra-bose')return {title:'Before Netaji: a Cuttack childhood',href:'/people/subhas-chandra-bose/'};if(key==='food/balasore')return {title:'A meal by Chandipur',href:'/food/balasore/'};if(key==='food/mudhi-mansa')return {title:'Mudhi Mansa in Baripada',href:'/food/mudhi-mansa/'};if(key==='food/cuttack')return {title:'Dahibara Aloodum in Cuttack',href:'/food/cuttack/'};if(key==='food/puri-coast')return {title:'A table by the coast',href:'/food/puri-coast/'};if(key==='food/bhubaneswar')return {title:'A meal in Bhubaneswar',href:'/food/bhubaneswar/'};if(key.startsWith('destinations/'))return {title:'Explore '+parentTitle({parent:key.split('/')[1]}),href:'/'+key+'/'};if(key.startsWith('knowledge/'))return {title:'Explore '+parentTitle({parent:key.split('/')[1]}),href:'/'+key+'/'};const [kind,slug]=key.split('/');const d=detailRecords.find(d=>d.kind===kind&&d.slug===slug);return d?{title:d.title,href:detailUrl(kind,slug)}:null;}

export const detailChapterPhoto=(ref)=>ref?.startsWith("crafts:")?crafts.assets[ref.slice(7)]:regions.assets[ref];
