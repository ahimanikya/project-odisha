import {boundedQuery, matchesWords} from './search.mjs';

export function readingSelection({q='',collection=''}={}, collections=[]) {
 return {q:boundedQuery(q).trim(),collection:collections.includes(collection)?collection:''};
}
export function readingQuery(state, collections=[]) {
 const selected=readingSelection(state,collections), params=new URLSearchParams();
 if(selected.q)params.set('q',selected.q);
 if(selected.collection)params.set('collection',selected.collection);
 return params.toString();
}
export function readReadingQuery(search,collections=[]) {
 const params=new URLSearchParams(search);
 return readingSelection({q:params.get('q'),collection:params.get('collection')},collections);
}
export function matchesReading(entry,{q='',collection=''}={}) {
 return (!collection||entry.group===collection)&&matchesWords(entry.search,q);
}

export function bindReadingRoom(doc=document,win=window) {
 const form=doc.querySelector('#reading-search'),input=doc.querySelector('#reading-query'),group=doc.querySelector('#reading-group');
 const count=doc.querySelector('#reading-count'),empty=doc.querySelector('#reading-empty');
 const cards=[...doc.querySelectorAll('[data-reading-entry]')],collections=[...group.options].map(o=>o.value);
 let typing=false,composing=false;
 const state=()=>readingSelection({q:input.value,collection:group.value},collections);
 function restore(){const s=readReadingQuery(win.location.search,collections);input.value=s.q;group.value=s.collection;}
 function render(){const s=state();let n=0;for(const card of cards){card.hidden=!matchesReading(card.dataset,s);if(!card.hidden)n++;}count.textContent=`${n} research ${n===1?'note':'notes'}${s.q?' · “'+s.q+'”':''}${s.collection?' · '+s.collection:''}`;empty.hidden=n!==0;}
 function update(mode='choice') {
  const query=readingQuery(state(),collections),url=win.location.pathname+(query?'?'+query:'')+win.location.hash;
  if(url!==win.location.pathname+win.location.search+win.location.hash){win.history[mode==='typing'&&typing?'replaceState':'pushState'](win.history.state,'',url);if(mode==='typing')typing=true;}
  if(mode!=='typing')typing=false;
  render();
 }
 restore();render();
 input.addEventListener('compositionstart',()=>{composing=true;});
 input.addEventListener('compositionend',()=>{composing=false;update('typing');});
 input.addEventListener('input',event=>{if(!composing&&!event.isComposing)update('typing');});
 input.addEventListener('blur',()=>{typing=false;});
 group.addEventListener('change',()=>update());
 form.addEventListener('submit',event=>{event.preventDefault();if(composing)return;update();count.focus();});
 form.addEventListener('reset',event=>{event.preventDefault();input.value='';group.value='';composing=false;update();input.focus();});
 win.addEventListener('popstate',()=>{typing=false;composing=false;restore();render();});
}
