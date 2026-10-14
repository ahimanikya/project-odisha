import test from 'node:test';
import assert from 'node:assert/strict';
import {sharePage} from '../src/lib/page-share-action.mjs';

function ui() {
  return {url:'https://projectodisha.org/languages/atlas/?language=018000', title:'Language atlas',
    button:{disabled:false}, status:{textContent:''}, fallback:{hidden:true},
    input:{value:'old',focused:false,selected:false,focus(){this.focused=true;},select(){this.selected=true;}}};
}
function deferred() {
  let resolve, reject;
  const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
  return {promise,resolve,reject};
}

for (const kind of ['native','clipboard']) {
  test(`${kind} pending operation immediately exposes a usable current link without claiming success`,async()=>{
    const view=ui(),pending=deferred();
    const platform=kind==='native'?{share:()=>pending.promise}:{clipboard:{writeText:()=>pending.promise}};
    const action=sharePage(view,platform);
    assert.equal(view.input.value,view.url);
    assert.equal(view.fallback.hidden,false);
    assert.equal(view.button.disabled,true);
    assert.match(view.status.textContent,/Copy the link below/);
    assert.doesNotMatch(view.status.textContent,/copied|opened/i);
    pending.resolve();await action;
    assert.equal(view.button.disabled,false);
    assert.equal(view.fallback.hidden,false);
  });
}

test('native share receives the supplied title and URL with its receiver intact',async()=>{
  const view=ui();let payload;
  const platform={share(value){assert.equal(this,platform);payload=value;},clipboard:{writeText(){assert.fail('must not also copy');}}};
  await sharePage(view,platform);
  assert.deepEqual(payload,{title:view.title,url:view.url});
  assert.match(view.status.textContent,/Sharing opened/);
});

test('clipboard success uses the current URL and a later action replaces the manual link',async()=>{
  const view=ui(),copied=[];
  const clipboard={writeText(value){assert.equal(this,clipboard);copied.push(value);}};
  await sharePage(view,{clipboard});
  view.url='https://projectodisha.org/explore/?q=Chilika';
  await sharePage(view,{clipboard});
  assert.equal(copied.at(-1),view.url);
  assert.equal(view.input.value,view.url);
  assert.equal(view.status.textContent,'Page link copied.');
});

for (const kind of ['unavailable','clipboard failure','native failure']) {
  test(`${kind} focuses and selects the link for manual copying`,async()=>{
    const view=ui(),fail=()=>Promise.reject(new Error('denied'));
    const platform=kind==='unavailable'?{}:kind==='native failure'?{share:fail}:{clipboard:{writeText:fail}};
    await sharePage(view,platform);
    assert.equal(view.fallback.hidden,false);
    assert.equal(view.input.value,view.url);
    assert.equal(view.input.focused,true);
    assert.equal(view.input.selected,true);
    assert.equal(view.button.disabled,false);
    assert.equal(view.status.textContent,'Copy the link below.');
  });
}

test('cancelled native sharing retains the link without claiming success or moving focus',async()=>{
  const view=ui();
  await sharePage(view,{share:()=>Promise.reject(new DOMException('Cancelled','AbortError'))});
  assert.equal(view.fallback.hidden,false);
  assert.equal(view.input.value,view.url);
  assert.equal(view.button.disabled,false);
  assert.equal(view.input.focused,false);
  assert.match(view.status.textContent,/cancelled.*copy the link below/);
});
