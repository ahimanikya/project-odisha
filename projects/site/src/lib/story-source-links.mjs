import {revealFragment,focusFragment} from './fragment-navigation.mjs';
export function bindStorySourceLinks(group,doc){
 for(const link of group.querySelectorAll('a[href^="#"]'))link.addEventListener('click',event=>{
  if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button>0)return;
  const result=revealFragment(link.getAttribute('href'),doc);
  if(!result)return;
  // Align after the disclosure has opened and native fragment navigation has run.
  // This also handles a second visit to the same source after closing its notes.
  doc.defaultView.requestAnimationFrame(()=>{
   result.target.scrollIntoView({behavior:'instant',block:'start'});
   focusFragment(result.target);
  });
 });
}
