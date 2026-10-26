import reviewedCulture from './reviewed-culture.json';
import {soundDiscoveryEntries} from './sounds-discovery';
import textiles from '../../../../kb/research/culture/textile-stories.json';
import crafts from '../../../../kb/research/culture/craft-stories.json';
import fire from '../../../../kb/research/food/fire-cooking-stories.json';
import everyday from '../../../../kb/research/food/everyday-stories.json';
import bose from '../../../../kb/research/people/subhas-chandra-bose.json';
import editionCopy from '../../../../kb/research/destinations/coastal-edition-copy.json';
import {allowsPage,isCoastalEdition} from './edition';
import chilikaStory from '../../../../kb/research/stories/narratives/chilika.json';
import konarkStory from '../../../../kb/research/stories/narratives/konark.json';
import aliases from '../../../../kb/research/discovery-aliases.json';
import notes from './selected.json';
import voices from '../../../../kb/research/voices/collection.json';
import regions from '../../../../kb/research/destinations/regions.json';
import coastalFood from '../../../../kb/research/food/puri-coast.json';
import cuttackFood from '../../../../kb/research/food/cuttack.json';
import cityFood from '../../../../kb/research/food/bhubaneswar.json';
import foods from '../../../../kb/research/food/collection.json';
import {detailRecords,detailUrl,detailPhoto} from './destination-details';
const locations={chilika:['Chilika'],konark:['Konark & Puri'],kotpad:['Koraput'],pakhala:['Across Odisha'],'boita-bandana':['Across Odisha']};
const voiceAreas={'languages/ho':['Mayurbhanj','Keonjhar','Angul'],'languages/juang':['Keonjhar','Angul','Dhenkanal'],'languages/koya':['Malkangiri'],'people/gangadhar-meher':['Bargarh'],'people/fakir-mohan-senapati':['Balasore'],'people/pratibha-ray':['Jagatsinghpur'],'people/bhima-bhoi':['Sambalpur & Subarnapur'],'people/gopinath-mohanty':['Cuttack','Koraput'],'languages/kui':['Kandhamal'],'languages/kuvi':['Rayagada'],'languages/saora':['Southern Odisha'],'languages/santali':['Mayurbhanj']};
const collectionEntries=[
 {"label": "Buddhist Udayagiri in Jajpur: monasteries and daily life", "category": "Places", "dek": "Named monasteries, shrines, drains and sacred inscriptions in Jajpur’s Buddhist settlement.", "href": "/stories/udayagiri-buddhist/", "regions": ["Jajpur"], "aliases": ["Simhaprastha", "Madhavapura", "Buddhist Diamond Triangle"], "image": {"src": "/assets/buddhist-triangle/udayagiri.jpg", "alt": "Brick monastery walls and a carved stone doorway at Buddhist Udayagiri in Jajpur.", "width": 1440, "height": 818}},
 {"label": "Ratnagiri: a place built for learning", "category": "Places", "dek": "Monasteries, sculpture, inscriptions and the excavation evidence behind a Buddhist centre in Jajpur.", "href": "/stories/ratnagiri/", "regions": ["Jajpur"], "aliases": ["Ratnagiri Mahavihara", "Buddhist Diamond Triangle"], "image": {"src": "/assets/buddhist-triangle/ratnagiri.jpg", "alt": "Stupas at Ratnagiri, photographed by Satyabrata Nanda.", "width": 1440, "height": 960}},
 {"label": "A Week in Bhubaneswar: Conversations and New Beginnings", "category": "Literature", "dek": "A personal essay by Ahimanikya Satapathy on poetry, a new foundation, and conversations with writers, filmmakers and a heritage storyteller.", "href": "/stories/bhubaneswar-week/", "image": {"src": "/assets/bhubaneswar-week/mentis-films.jpg", "alt": "Three people beneath the Mentis Films sign and film posters.", "width": 5712, "height": 3213}, "regions": ["Bhubaneswar"], "aliases": ["Pravakar Satapathy Foundation", "Kabita Poet Studio", "Pradeep Biswal", "Paresh Patnaik", "Shakti Badjena", "Daman"]},
 ...reviewedCulture,
 {label:"Paika: service, community and Odia heritage",category:"Living culture",dek:"Military service, land, the 1817 rebellion and living tradition: why Paika history cannot be reduced to one caste origin.",href:"/communities/paika/",regions:["Khordha","Across Odisha"],aliases:["Paik","Paika Akhada","Khandayat","ପାଇକ"]},
 {label:"Khandayat: land, service and community history",category:"Living culture",dek:"Dated records, inherited roles and regional meanings behind a community name.",href:"/communities/khandayat/",regions:["Across Odisha"],aliases:["Khandayata","ଖଣ୍ଡାୟତ"]},
 {label:"Chasa: cultivation and community history",category:"Living culture",dek:"Cultivation, village histories and the distinction between shared agrarian heritage and community identity.",href:"/communities/chasa/",regions:["Across Odisha"],aliases:[]},
 {label:"Tanti: weaving and community histories",category:"Living culture",dek:"A recorded weaving name, changing work in Bhadrak and a named Bomkai maker’s account.",href:"/communities/tanti/",regions:["Across Odisha"],aliases:[]},
 {label:"Bhulia: remembered journeys, weaving households",category:"Living culture",dek:"Migration traditions, household labour and changing weaving knowledge in western Odisha.",href:"/communities/bhulia/",regions:["Across Odisha"],aliases:[]},
 {label:"Kumbhara: clay, community and temple service",category:"Living culture",dek:"Origin traditions, Puri temple-service records and Bhadrak household pottery.",href:"/communities/kumbhara/",regions:["Across Odisha"],aliases:[]},
 {label:"Karana: keeping records, remembering Odisha",category:"Living culture",dek:"Scribal work, land accounts and Puri temple records.",href:"/communities/karana/",regions:["Across Odisha"],aliases:[]},
 {label:"Kaibarta: rivers, work and community memory",category:"Living culture",dek:"River and estuary work, changing institutions and Chaiti Ghoda traditions.",href:"/communities/kaibarta/",regions:["Across Odisha"],aliases:[]},
 {label:"Nolia: making a home on the Odisha coast",category:"Living culture",dek:"Regional names, multilingual belonging and shared work along the shore.",href:"/communities/nolia/",regions:["Across Odisha"],aliases:[]},
 {label:"Kansari: learning and changing metalwork",category:"Living culture",dek:"Family workshops, movement into silversmithy and a maker’s specialisation.",href:"/communities/kansari/",regions:["Across Odisha"],aliases:[]},
 {label:"Gopala: cattle work and Dola traditions",category:"Living culture",dek:"Regional names, changing livelihoods and the songs of Dola.",href:"/communities/gopala/",regions:["Across Odisha"],aliases:[]},
 {label:"Chitrakara: service, households and changing work",category:"Living culture",dek:"Temple responsibilities, shared work and changing access to markets.",href:"/communities/chitrakara/",regions:["Across Odisha"],aliases:[]},
 {label:"Teli: oil, transport and changing work",category:"Living culture",dek:"Oil pressing, transport and regional accounts of changing work.",href:"/communities/teli/",regions:["Across Odisha"],aliases:[]},
 {label:"Bhandari: ceremonial service and changing livelihoods",category:"Living culture",dek:"Ceremonial service, women’s contributions, salons and bands.",href:"/communities/bhandari/",regions:["Across Odisha"],aliases:[]},
 {label:"Mali: gardens, water and regional names",category:"Living culture",dek:"Gardens, seasonal water, flower markets and regional temple roles.",href:"/communities/mali/",regions:["Across Odisha"],aliases:[]},
 {label:"Dhoba: washing, payment and ceremonial work",category:"Living culture",dek:"Village payments, ceremonial water, Gandi worship and changing work.",href:"/communities/dhoba/",regions:["Across Odisha"],aliases:[]},
 {label:"Patara: yarn, trade and temple craft",category:"Living culture",dek:"Yarn supplies, silk-rope skills and Gamha Purnima craft.",href:"/communities/patara/",regions:["Across Odisha"],aliases:[]},
 {label:"Kamar: iron, household work and village tools",category:"Living culture",dek:"Household smelting, village tools and changing access to materials.",href:"/communities/kamar/",regions:["Across Odisha"],aliases:[]},
  {label:"Sunari: ornaments, family learning and changing work",category:"Living culture",dek:"Regional ornament work, household learning and changing markets.",href:"/communities/sunari/",regions:["Across Odisha"],aliases:[]},
 {label:"Sweets and the places they carry",category:"Food",dek:"Nimapada Jhili, Kendrapara Rasabali and the local traditions behind Odisha’s sweets.",href:"/food/sweets-and-places/",image:foods.assets["pahala-rasagola"],regions:["Across Odisha"],aliases:["Nimapara Jhili","Kendrapada Rasabali","Palua Ladu","Magji","Khaja","Korakhai"]},
 {label:'Odia Poetry Jhula',category:'Literature',dek:'A story in cloth: twelve Jhula designs, matching Poetry Kits and an invitation to choose the first samples.',href:'/odia-poetry-jhula/',regions:['Across Odisha'],aliases:['Jhula','Poetry Kit','cloth bag','design survey']},
 {label:'Ahimanikya and Sashisena at Nimuhi Temple',category:'Literature',dek:'An Odia poem, a doorless memorial and a love story remembered in Sonepur. Read the source texts and explore where literature, memory and history meet.',href:'/stories/nimuhi-temple/',regions:['Subarnapur']},
 {label:'Boita: trade, craft and the crossing of a sea',category:'Living culture',dek:'Cargo coming home, the craft of a wooden hull, monsoon sailing and the debated maritime origins of Munda languages.',href:'/stories/maritime-memory/',image:regions.assets['jobra-boat-display'],regions:['Cuttack','Chilika'],aliases:['Boita Bandana','Bali Jatra','Bali Yatra','Manikapatna','maritime history']},
 {label:'An Odia reading journey',category:'Literature',dek:'Four writers, three reading questions and an illustrated companion to save and carry.',href:'/literature/reading-journey/',image:voices.assets.manuscript,regions:['Across Odisha']},
 {label:'Tourism opportunities in Odisha',category:'Living culture',dek:'Official guidance, cultural ideas and local knowledge: useful starting points for visitors and tourism enterprises.',href:'/opportunities/',image:regions.assets['kala-bhoomi-grounds'],regions:['Across Odisha','Bhubaneswar','Cuttack','Puri']},
 {label:'Three tastes to remember',category:'Food',dek:'Dalma, Dahibara Aloodum and Machha Besara: three illustrated stories to save together and carry in a tour book.',href:'/food/three-tastes/',image:foods.assets['dalma-alternate'],regions:['Bhubaneswar','Cuttack','Konark & Puri']},
 {label:'Global Connections',category:'Living culture',dek:'Odisha and the world: documented city links, lessons from across India, and possibilities we can build together.',href:'/global-connections/',image:regions.assets.mukteswar,regions:['Bhubaneswar','Across Odisha']},
 {label:textiles.collection.title,category:'Living culture',dek:textiles.collection.lead,href:'/textiles/',image:textiles.assets[textiles.collection.hero],regions:['Across Odisha']},
 ...textiles.pages.map(p=>({label:p.title,category:'Living culture',dek:p.lead,href:p.href,image:textiles.assets[p.hero],regions:p.regions})),
 {label:crafts.collection.title,category:'Living culture',dek:crafts.collection.lead,href:'/crafts/',image:crafts.assets[crafts.collection.hero],regions:['Puri','Cuttack']},
 ...crafts.pages.map(p=>({label:p.title,category:'Living culture',dek:p.lead,href:'/crafts/'+p.slug+'/',image:crafts.assets[p.hero],regions:p.regions})),
 {label:fire.title,category:"Food",dek:fire.lead,href:"/food/fire-cooking/",image:foods.assets[fire.hero],regions:["Across Odisha"]},
 {label:everyday.title,category:"Food",dek:everyday.lead,href:"/food/everyday/",image:foods.assets[everyday.hero],regions:["Across Odisha"]},
 {label:'Languages by district',category:'Languages',dek:'Start with a place: compare Census 2011 mother tongues across all 30 districts and follow the stories behind the numbers.',href:'/languages/districts/',regions:['Across Odisha']},
 {label:'Multilingual Odisha',category:'Languages',dek:'A mother tongue is one question. Explore additional languages and the limits of population statistics.',href:'/languages/multilingual-odisha/',regions:['Across Odisha']},
 {label:'Languages of Odisha · population atlas',category:'Languages',dek:'Explore Census 2011 mother-tongue counts across 30 districts, with rural and urban comparisons.',href:'/languages/atlas/',image:voices.assets.manuscript,regions:['Across Odisha']},
 {label:bose.name,category:'People',dek:bose.lead,href:'/'+bose.path+'/',image:{...bose.assets[bose.hero],fit:'cover'},regions:[bose.area]},
 {label:coastalFood.title,category:'Food',dek:coastalFood.lead,href:'/food/puri-coast/',image:foods.assets[coastalFood.hero],regions:['Puri','Konark & Puri']},
 {label:cityFood.title,category:'Food',dek:cityFood.lead,href:'/food/bhubaneswar/',image:foods.assets[cityFood.hero],regions:['Bhubaneswar']},
 {label:cuttackFood.title,category:'Food',dek:cuttackFood.lead,href:'/food/cuttack/',image:foods.assets[cuttackFood.hero],regions:['Cuttack']},
 ...regions.regions.map(r=>({label:r.title,category:'Places',dek:r.orientation,href:`/destinations/${r.slug}/`,image:regions.assets[r.hero],regions:[r.title]})),
 ...detailRecords.map(r=>({label:r.title,category:r.kind==='places'?'Places':r.kind==='stays'?'Stay areas':'Experiences',dek:r.lead,href:detailUrl(r.kind,r.slug),image:detailPhoto(r),regions:[r.parent==='konark'?'Konark & Puri':r.parent==='chilika'?'Chilika':regions.regions.find(region=>region.slug===r.parent)?.title||'Across Odisha']})),
 {label:'Places, voices & stories',category:'Literature',dek:'Cultural reading trails through Chilika, Balasore and Mayurbhanj.',href:'/stories/culture-trails/',regions:['Chilika','Balasore','Mayurbhanj']},
 {label:'Samanta Chandrasekhar',category:'People',dek:'Pathani Samanta: an astronomer, his observations and the work he left behind.',href:'/people/samanta-chandrasekhar/',regions:['Across Odisha']},
 {label:'Bhubaneswar Fresco · Painted Streets',category:'Living culture',dek:'A photographic walk through Bhubaneswar in February 2009, by Ahimanikya Satapathy.',href:'/stories/bhubaneswar-fresco/',image:regions.assets['fresco-procession'],regions:['Bhubaneswar']},
 ...notes.filter(n=>n.slug!=='kotpad').map(n=>({...n,image:({chilika:chilikaStory.image,konark:konarkStory.image})[n.slug],regions:locations[n.slug]||['Across Odisha']})),
 ...voices.pages.map(p=>({label:p.title,category:p.path.startsWith('languages')?'Languages':p.path.startsWith('people')?'People':'Literature',dek:p.lead,href:'/'+p.path+'/',image:voices.assets[p.hero_asset],regions:voiceAreas[p.path]||['Across Odisha']})),
 ...soundDiscoveryEntries,
 ...foods.pages.map(p=>({label:p.title,category:'Food',dek:p.lead,href:'/food/'+p.slug+'/',image:foods.assets[p.hero],regions:p.regions||(p.slug==='mudhi-mansa'?['Mayurbhanj']:p.slug==='balasore'?['Balasore']:['Nayagarh','Across Odisha'])}))
];
export const discoveryEntries=collectionEntries.filter(e=>allowsPage(e.href)).map(e=>({...e,dek:isCoastalEdition&&e.href==='/destinations/bhubaneswar/'?editionCopy.bhubaneswar.orientation:e.dek,aliases:aliases.entries[e.href]||[]}));
export const discoveryTopics=isCoastalEdition?['All',...new Set(discoveryEntries.map(e=>e.category))]:['All','People','Places','Experiences','Stay areas','Living culture','Food','Maritime connections','Languages','Literature'];
export const discoveryRegions=['All',...new Set(discoveryEntries.flatMap(e=>e.regions))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b));
