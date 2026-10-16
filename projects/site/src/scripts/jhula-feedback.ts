import {requestRatings} from './jhula-firebase';
const form=document.querySelector<HTMLFormElement>('#jhula-feedback');
if(form){
 const status=document.querySelector<HTMLElement>('#ratings-status')!,error=document.querySelector<HTMLElement>('#ratings-error')!,summary=document.querySelector<HTMLElement>('#rating-summary')!,commentStatus=document.querySelector<HTMLElement>('#comments-status')!;
 const retry=document.querySelector<HTMLButtonElement>('#retry-ratings')!,save=document.querySelector<HTMLButtonElement>('#save-ratings')!,withdraw=document.querySelector<HTMLElement>('#withdraw-area')!,confirmation=document.querySelector<HTMLElement>('#withdraw-confirm')!;
 const fields=[...document.querySelectorAll<HTMLFieldSetElement>('[data-feedback-fields]')];
 const ids=Array.from({length:20},(_,i)=>String(i+1).padStart(2,'0'));
 let ready=false,submitting=false,withdrawing=false,dirtyComments=false,pending=false,version=0;
 let active:Promise<void>|undefined;
 function input(name:string){return form!.elements.namedItem(name) as HTMLInputElement|HTMLTextAreaElement;}
 function radio(name:string){return document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value||'';}
 function preferences(){return {entries:ids.map(id=>({id,rating:Number(radio('rating-'+id))||null})),favourite:radio('favourite'),kit:radio('kit')};}
 function count(){const n=preferences().entries.filter(e=>e.rating).length;summary.textContent=n?`${n} of 20 designs considered.`:'';}
 function showError(message:string){error.textContent=message;error.hidden=false;}
 function clearError(){error.textContent='';error.hidden=true;}
 function lock(value:boolean){fields.forEach(f=>f.disabled=value);save.disabled=value;document.querySelectorAll<HTMLButtonElement>('#withdraw-area button,#clear-favourite').forEach(b=>b.disabled=value);}
 function badges(message:string){document.querySelectorAll<HTMLElement>('[data-save-status]').forEach(el=>{if(el.textContent)el.textContent=message;});}
 function restore(data:any){form!.reset();if(!data)return;for(const e of data.entries||[]){if(!ids.includes(e.id))continue;const rating=document.querySelector<HTMLInputElement>(`input[name="rating-${e.id}"][value="${e.rating}"]`);if(rating)rating.checked=true;input('comment-'+e.id).value=e.comment||'';}for(const name of ['name','email','phone','comment'])input(name).value=data[name]||'';for(const [name,value] of [['kit',data.kit],['favourite',data.favourite]]){const el=[...document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)].find(x=>x.value===value);if(el)el.checked=true;}}
 async function load(){ready=false;lock(true);clearError();retry.hidden=true;try{const data=await requestRatings('GET');restore(data.response);withdraw.hidden=!data.response;ready=true;count();status.textContent='';}catch{showError('We could not connect. Please try again.');retry.hidden=false;}finally{lock(!ready);}}
 // Serialize and coalesce rapid changes. A slow earlier write must never replace
 // a later choice, and inputs remain usable while preferences are saving.
 function flush(){
  if(active)return active;
  active=(async()=>{while(pending&&!withdrawing){pending=false;const snapshot=preferences(),sentVersion=version;status.textContent='Saving your choices…';retry.hidden=true;try{await requestRatings('PREFERENCES',snapshot);withdraw.hidden=false;if(sentVersion===version){status.textContent='Choices saved';badges('Saved');clearError();}}catch{pending=true;status.textContent='Choices not saved';badges('Not saved · try again below');showError('Your choices are still here. Check your connection, then try again to save them.');retry.hidden=false;break;}}})().finally(()=>{active=undefined;});
  return active;
 }
 function changed(id?:string){if(!ready||withdrawing)return;confirmation.hidden=true;version++;pending=true;count();if(id){const badge=document.querySelector<HTMLElement>(`[data-save-status="${id}"]`);if(badge)badge.textContent='Saving…';}void flush();}
 document.addEventListener('change',event=>{const target=event.target as HTMLInputElement;if(target.form!==form||!ready)return;if(target.name.startsWith('rating-')||target.name==='favourite'||target.name==='kit')changed(target.name.startsWith('rating-')?target.name.slice(7):target.name==='favourite'?target.value:undefined);});
 document.addEventListener('input',event=>{const target=event.target as HTMLInputElement;if(target.form!==form||!ready||target.type==='radio')return;dirtyComments=true;commentStatus.textContent='Your comments have not been sent yet.';input('email').setCustomValidity('');input('phone').setCustomValidity('');});
 document.querySelectorAll<HTMLButtonElement>('[data-clear-rating]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll<HTMLInputElement>(`input[name="rating-${button.dataset.clearRating}"]`).forEach(i=>i.checked=false);changed(button.dataset.clearRating);}));
 document.querySelector('#clear-favourite')!.addEventListener('click',()=>{document.querySelectorAll<HTMLInputElement>('input[name="favourite"]').forEach(i=>i.checked=false);changed();});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!ready||submitting||withdrawing)return;
  const name=input('name').value.trim(),email=input('email').value.trim(),phone=input('phone').value.trim();
  if(!name){input('name').focus();showError('Please add your name.');return;}
  if(!email&&!phone){input('email').setCustomValidity('Please add either an email address or a phone number.');input('email').reportValidity();return;}
  if(phone&&!/^[+]?([ ().-]*[0-9]){7,15}[ ().-]*$/.test(phone)){input('phone').setCustomValidity('Please enter a phone number with at least seven digits.');input('phone').reportValidity();return;}
  if(!form!.reportValidity())return;
  const payload={...preferences(),entries:ids.map(id=>({id,rating:Number(radio('rating-'+id))||null,comment:input('comment-'+id).value.trim()})),name,email,phone,comment:input('comment').value.trim()};
  submitting=true;save.disabled=true;clearError();commentStatus.textContent='Sending your comments…';const commentSignature=(data:typeof payload)=>JSON.stringify({name:data.name,email:data.email,phone:data.phone,comment:data.comment,comments:data.entries.map(e=>e.comment)});const submittedValues=commentSignature(payload);
  try{await requestRatings('POST',payload);withdraw.hidden=false;const current={...preferences(),entries:ids.map(id=>({id,rating:Number(radio('rating-'+id))||null,comment:input('comment-'+id).value.trim()})),name:input('name').value.trim(),email:input('email').value.trim(),phone:input('phone').value.trim(),comment:input('comment').value.trim()};dirtyComments=commentSignature(current)!==submittedValues;commentStatus.textContent=dirtyComments?'Comments sent. Your latest edits have not been sent yet.':'Thank you. Your words are with us.';save.textContent='Update my comments';}catch{commentStatus.textContent='Your comments have not been sent.';showError('We could not send your comments. They are still here; please try again.');}finally{submitting=false;save.disabled=false;}
 });
 retry.addEventListener('click',()=>{if(!ready)void load();else if(pending)void flush();});
 window.addEventListener('online',()=>{if(ready&&pending)void flush();});
 window.addEventListener('beforeunload',event=>{if(pending||active||submitting||dirtyComments){event.preventDefault();event.returnValue='';}});
 document.querySelector('#withdraw-ratings')!.addEventListener('click',()=>{confirmation.hidden=false;});
 document.querySelector('#cancel-withdraw')!.addEventListener('click',()=>{confirmation.hidden=true;});
 document.querySelector('#confirm-withdraw')!.addEventListener('click',async()=>{if(withdrawing||submitting)return;withdrawing=true;lock(true);clearError();try{await active;await requestRatings('DELETE');pending=false;dirtyComments=false;restore(null);count();badges('');withdraw.hidden=true;confirmation.hidden=true;commentStatus.textContent='';save.textContent='Send my comments';status.textContent='Your response has been withdrawn.';}catch{showError('Could not withdraw your response. Please try again.');}finally{withdrawing=false;lock(false);}});
 void load();
}
