// Printed stories need their evidence even when the reader has kept it folded.
// Restore the reader's original state after printing or cancelling the dialog.
export function bindStoryPrint(doc,win){
 const notes=doc.getElementById('story-sources');
 if(!notes||notes.tagName!=='DETAILS')return;
 let originalOpen;
 win.addEventListener('beforeprint',()=>{
  if(originalOpen!==undefined)return;
  originalOpen=notes.open;
  notes.open=true;
 });
 win.addEventListener('afterprint',()=>{
  if(originalOpen===undefined)return;
  notes.open=originalOpen;
  originalOpen=undefined;
 });
}
