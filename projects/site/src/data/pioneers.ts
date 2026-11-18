import series from '../../../../kb/research/pioneers/series.json';
import {allowsPage} from './edition';

export interface PioneerSegment {text?:string; emphasis?:string; source_id?:string}
export interface PioneerParagraph {text:string; source_ids:string[]; segments?:PioneerSegment[]}
export interface PioneerSection {id:string; title:string; paragraphs:PioneerParagraph[]}
export interface PioneerSource {id:string; title:string; url:string; note:string}
export interface PioneerImage {src:string; width:number; height:number; alt:string; caption:string; creator:string; source?:string; license?:string; license_url?:string; changes:string}
export interface PioneerProfile {slug:string; name:string; title:string; description:string; author:string; checked_on:string; sections:PioneerSection[]; sources:PioneerSource[]; image?:PioneerImage; further_reading?:{href:string;title:string;description?:string}[]}

export const pioneersSeries=series;
export const pioneerRoute=(slug:string)=>`${series.route}${slug}/`;
// Admission is explicit: research files alone never create a public reading.
const dossiers=import.meta.glob('../../../../kb/research/pioneers/*.json',{eager:true,import:'default'}) as Record<string,PioneerProfile>;
const seen=new Set<string>();
for(const slug of series.included_profiles){
 if(seen.has(slug)||!series.order.some(entry=>entry.slug===slug))throw new Error('Invalid Pioneers admission: '+slug);
 seen.add(slug);
}
export const pioneerProfiles=series.order.filter(entry=>seen.has(entry.slug)).map(entry=>{
 const dossier=dossiers[`../../../../kb/research/pioneers/${entry.slug}.json`];
 if(!dossier||dossier.slug!==entry.slug||!dossier.sections?.length||!dossier.sources?.length)throw new Error('Incomplete admitted Pioneers profile: '+entry.slug);
 const sources=new Set(dossier.sources.map(source=>source.id));
 if(sources.size!==dossier.sources.length)throw new Error('Duplicate Pioneers source: '+entry.slug);
 for(const section of dossier.sections)for(const paragraph of section.paragraphs){
  if(!paragraph.text?.trim()||paragraph.source_ids.some(id=>!sources.has(id)))throw new Error('Invalid Pioneers paragraph: '+entry.slug);
 }
 return {...dossier,sections:dossier.sections.map(section=>({...section,paragraphs:section.paragraphs.map(paragraph=>({...paragraph,segments:paragraph.segments||[{text:paragraph.text}]}))}))};
}).filter(profile=>allowsPage(pioneerRoute(profile.slug)));

const illustrations=import.meta.glob('../../../../kb/research/pioneers/*-image.json',{eager:true,import:'default'}) as Record<string,PioneerImage>;
export const pioneerImage=(profile:PioneerProfile)=>profile.image||illustrations[`../../../../kb/research/pioneers/${profile.slug}-image.json`];
export const pioneerFurtherReading=(profile:PioneerProfile)=>profile.further_reading||(
 profile.slug==='bc-mohanty'?[{href:'/textiles/khandua/',title:'Khandua: words woven into cloth'},{href:'/textiles/sambalpuri-bandha/',title:'Sambalpuri bandha'}]:profile.slug==='charles-fabri'?[{href:'/stories/odissi-abhinaya/',title:'Odissi abhinaya'},{href:'/stories/ekamra-evening/',title:'An Evening in Ekamra'}]:profile.slug==='sanjukta-panigrahi'?[{href:'/stories/odissi-abhinaya/',title:'Odissi abhinaya'}]:[]
);
