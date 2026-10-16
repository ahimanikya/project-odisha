// Use the rendered entry: coastal filtering can change which card sources appear.
export function voiceSources(entry, sources){
 const ids=[...new Set([...entry.sections.flatMap(s=>s.paragraphs.flatMap(p=>p.source_ids)),...entry.cards.flatMap(c=>c.source_ids),...(entry.roster_sources||[]),...(entry.learning_resource?[entry.learning_resource.source_id]:[])])];
 return ids.map(id=>{if(!sources[id])throw new Error(`Unknown Voices source: ${id}`);return {id,...sources[id]};});
}
