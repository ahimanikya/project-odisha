export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function paragraphHTML(text, section, paragraph) {
  let occurrence=0;
  return escapeHTML(text).replace(/\[(\d+)\]/g,(_,number)=>`<sup><a id="cite-${number}-${section}-${paragraph}-${occurrence++}" href="#source-${number}" aria-label="Source ${number}">${number}</a></sup>`);
}
export function firstCitation(chapter, number) {
  for(let s=0;s<chapter.sections.length;s++)for(let p=0;p<chapter.sections[s].paragraphs.length;p++){
    const refs=[...chapter.sections[s].paragraphs[p].matchAll(/\[(\d+)\]/g)];
    const occurrence=refs.findIndex(match=>Number(match[1])===number);
    if(occurrence!==-1)return `#cite-${number}-${s}-${p}-${occurrence}`;
  }
  return '#chapter-title';
}
