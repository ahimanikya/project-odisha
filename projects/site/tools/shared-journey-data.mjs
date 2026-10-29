import {createHash} from 'node:crypto';
// Preserve the tested JSON verbatim, sharing only its delivery envelope.
export function shareJourneyData(pages){
 const assets=new Map();
 const output=pages.map(page=>({...page,html:page.html.replace(/<script\b([^>]*\bid="journey-data"[^>]*)>([\s\S]*?)<\/script>/g,(_match,attributes,json)=>{
  const data=JSON.parse(json);
  if(!Array.isArray(data.catalog)||!Array.isArray(data.starters))throw Error('Invalid publication journey payload');
  const body=`document.getElementById('journey-data').textContent=${JSON.stringify(json).replaceAll('<','\\u003c')};\n`;
  const digest=createHash('sha256').update(body).digest('hex');
  const path=`assets/journey-data-${digest}.js`;
  assets.set(path,body);
  // A classic, parser-blocking script completes before deferred module initialization.
  return `<script${attributes}></script><script src="/${path}"></script>`;
 })}));
 return {pages:output,assets};
}
