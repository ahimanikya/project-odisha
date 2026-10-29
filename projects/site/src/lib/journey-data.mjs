export function readJourneyData(doc){
 try{
  const data=JSON.parse(doc.getElementById('journey-data')?.textContent||'');
  if(!Array.isArray(data.catalog)||!Array.isArray(data.starters)||!data.catalog.every(item=>item&&typeof item.id==='string'))throw Error('Invalid journey data');
  return data;
 }catch{
  const message='Journey tools could not load. Your saved journeys are unchanged. Reload this page to try again.';
  for(const target of doc.querySelectorAll('[data-save-status], #journey-status, #download-feedback'))target.textContent=message;
  return null;
 }
}
