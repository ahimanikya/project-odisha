import {journeyCatalog} from './journey-catalog';
import {detailRecords,detailUrl,detailPhoto} from './destination-details';
import {allowsPage} from './edition';
import regions from '../../../../kb/research/destinations/regions.json';
const copy={
 food:{kind:'Food',title:'Food & flavours',headline:'Leave room for',highlight:'one more taste.',lead:'Meet a dish, learn its story, then keep a meal idea for your journey.',note:'Explore dish stories, regional meals and places to eat. Discuss ingredients and dietary needs directly with your host or restaurant.',questions:['Which dishes would I like to learn about?','What ingredients or dietary needs should I discuss?','Where will I confirm a suitable place to eat?']},
 'things-to-do':{kind:'Experience',title:'Things to do',headline:'A closer look.',highlight:'A richer visit.',lead:'A painted street, a carved surface, a moment by the water. Find something you want to spend time with.',note:'Ideas to research, not bookable activities. Confirm permission, timing and a suitable local contact before planning a visit.',questions:['What needs permission or advance arrangement?','Who can confirm whether an activity is available?','How much unplanned time do I want to leave?']},
 'stay-areas':{kind:'Stay area',title:'Where to base yourself',headline:'Choose a base.',highlight:'Find your own pace.',lead:'Begin with an area that suits the places you want to explore. Then research the individual stay and its facilities.',note:'Area guides only. No property here has been inspected or endorsed, and these pages do not provide availability or booking.',questions:['Does this base suit the places I want to visit?','Have I confirmed the room, facilities and access directly?','What are the payment, cancellation and arrival arrangements?']}
};
export const planningCollections=Object.entries(copy).map(([slug,content])=>({slug,...content,entries:journeyCatalog.filter(i=>i.kind===content.kind&&allowsPage(i.href)).map(item=>{
 const detail=detailRecords.find(r=>detailUrl(r.kind,r.slug)===item.href);
 const regionalItem=regions.regions.flatMap(r=>r.items).find(i=>i.id===item.id);
 const photo=item.photo||(detail?detailPhoto(detail):regionalItem?.asset?regions.assets[regionalItem.asset]:null);
 const parent=detail?.parent||(item.id.includes(':chilika-')?'chilika':item.id.includes(':konark-')?'konark':null);
 const group=parent==='chilika'?'Chilika':parent==='konark'?'Puri & Konark':item.area==='Puri'||item.area==='Konark Sun Temple'?'Puri & Konark':item.area;
 return {...item,group,photoFit:photo?.fit==='contain'||regionalItem?.asset==='fakir'||item.id==='experience:mayurbhanj-chhau'?'contain':'cover',photo,photoNote:content.kind==='Stay area'?'Landscape context · not a property photograph':null};
})}));
