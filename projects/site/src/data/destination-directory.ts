import {allowsPage} from './edition';
import regions from '../../../../kb/research/destinations/regions.json';
import notes from './selected.json';
import {bookPhotos} from './book-photos';
import {hillDestinationGuides} from './hill-destinations';
export const destinationGuides=[
 ...hillDestinationGuides,
 ...regions.regions.map(r=>({title:r.title,odia:r.odia,summary:r.orientation,href:`/destinations/${r.slug}/`,photo:regions.assets[r.hero]})),
 ...['chilika','konark'].map(slug=>{const n=notes.find(n=>n.slug===slug);return {title:n.label,odia:slug==='chilika'?'ଚିଲିକା':'କୋଣାର୍କ',summary:n.dek,href:n.href,photo:bookPhotos['place:'+slug]};})
].filter(guide=>allowsPage(guide.href));
