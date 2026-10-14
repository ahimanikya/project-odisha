import {readingQuery} from './reading-room-search.mjs';
import {boundedQuery} from './search.mjs';
import {discoveryQuery} from './discovery.mjs';

// Only allowlisted rendered discovery controls may contribute query values. Never forward
// arbitrary URL parameters, fragments, contribution drafts or journey data.
export function pageShareURL(location, {q='',topic='All',region='All',sort='collection',language='',residence='total',district='',collection=''}={}, {topics=[],regions=[],languages=[],collections=[]}={}) {
 const url=new URL(location.pathname,location.origin);
 if(url.pathname==='/explore/')url.search=discoveryQuery({
  q:boundedQuery(q),
  topic:topics.includes(topic)?topic:'All',
  region:regions.includes(region)?region:'All',
  sort:sort==='title'?'title':'collection'
 });
 if(url.pathname==='/reading-room/')url.search=readingQuery({q,collection},collections);
 if(url.pathname==='/languages/atlas/') {
  if(languages.includes(language))url.searchParams.set('language',language);
  url.searchParams.set('residence',['total','rural','urban'].includes(residence)?residence:'total');
  url.searchParams.set('sort',['count','share','name'].includes(sort)?sort:'count');
  const query=boundedQuery(district).trim();
  if(query)url.searchParams.set('district',query);
 }
 return url.href;
}
