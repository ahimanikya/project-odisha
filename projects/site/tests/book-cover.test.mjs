import test from 'node:test';
import assert from 'node:assert/strict';
import { createCoverState, bindBookCover } from '../src/lib/book-cover.mjs';
const pointer = (x=100,y=100,extra={}) => ({pointerId:1,pointerType:'touch',isPrimary:true,button:0,clientX:x,clientY:y,...extra});
test('buttons can select every face without affecting another book',()=>{
 const first=createCoverState(), second=createCoverState();
 for(const face of ['back','spine','front']) assert.equal(first.select(face),face);
 first.select('back'); assert.equal(second.view,'front'); assert.equal(first.select('invalid'),'back');
});
test('horizontal swipes advance and reverse; short movements leave the face unchanged',()=>{
 const state=createCoverState();
 state.begin(pointer(),300); state.move(pointer(25)); assert.equal(state.finish(pointer(25)),'spine');
 state.begin(pointer(),300); state.move(pointer(175)); assert.equal(state.finish(pointer(175)),'front');
 state.begin(pointer(),300); state.move(pointer(80)); assert.equal(state.finish(pointer(80)),'front');
});
test('vertical scroll, cancelled gestures and a second touch never turn the book',()=>{
 const state=createCoverState();
 state.begin(pointer(),300); assert.equal(state.move(pointer(105,130)),null); assert.equal(state.finish(pointer(0,140)),'front');
 state.begin(pointer(),300); state.move(pointer(0)); state.cancel(); assert.equal(state.finish(pointer(0)),'front');
 state.begin(pointer(),300); state.move(pointer(0)); assert.equal(state.begin(pointer(20,100,{pointerId:2,isPrimary:false}),300),false); assert.equal(state.finish(pointer(0)),'front');
 assert.equal(state.begin(pointer(0,0,{pointerType:'mouse'}),300),false);
});
class Element {
 constructor(dataset={}){this.dataset=dataset;this.attrs={};this.listeners={};this.hidden=true;this.clientWidth=300;this.style={setProperty:(k,v)=>this.attrs[k]=v};}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
 emit(type,event={}){for(const fn of this.listeners[type]??[])fn(event);}
 setAttribute(k,v){this.attrs[k]=v;}
 removeAttribute(k){delete this.attrs[k];if(k==='data-dragging')delete this.dataset.dragging;}
}
function fixture(reduced=false){
 const root=new Element(),host=new Element(),doc=new Element();root.ownerDocument=doc;
 const media=new Element();media.matches=reduced;host.matchMedia=()=>media;
 const names=['viewport','volume','controls','status','hint','larger'];const nodes=Object.fromEntries(names.map(n=>[n,new Element()]));
 nodes.larger.dataset={frontSrc:'/front.png',backSrc:'/back.png'};
 const buttons=['front','spine','back'].map(coverView=>new Element({coverView}));
 const faces=['front','spine','back'].map(coverFace=>new Element({coverFace}));
 root.querySelector=q=>nodes[q.match(/data-cover-(.*?)\]/)[1]];
 root.querySelectorAll=q=>q.startsWith('button')?buttons:faces;
 bindBookCover(root,host);return {root,host,doc,nodes,buttons,faces};
}
test('enhancement exposes controls, updates accessible selection and links, and cancels multitouch',()=>{
 const {root,host,doc,nodes,buttons,faces}=fixture();
 assert.equal(nodes.controls.hidden,false);assert.equal(buttons[0].attrs['aria-pressed'],'true');
 buttons[2].emit('click');assert.equal(root.dataset.view,'back');assert.equal(faces[2].attrs['aria-hidden'],'false');assert.equal(nodes.larger.attrs.href,'/back.png');
 buttons[1].emit('click');assert.equal(nodes.larger.hidden,true);
 nodes.viewport.emit('pointerdown',pointer());nodes.viewport.emit('pointermove',pointer(0));
 doc.emit('pointerdown',pointer(10,100,{pointerId:2,isPrimary:false}));host.emit('pointerup',pointer(0));assert.equal(root.dataset.view,'spine');
 nodes.viewport.emit('pointerdown',pointer());nodes.viewport.emit('pointermove',pointer(0));host.emit('pointercancel');host.emit('pointerup',pointer(0));assert.equal(root.dataset.view,'spine');
});
test('reduced motion omits drag interpolation but retains immediate selection',()=>{
 const {root,host,nodes}=fixture(true);
 nodes.viewport.emit('pointerdown',pointer());nodes.viewport.emit('pointermove',pointer(0));
 assert.equal(root.dataset.dragging,undefined);assert.equal(nodes.volume.attrs['--book-angle'],'-8deg');
 host.emit('pointerup',pointer(0));assert.equal(root.dataset.view,'spine');assert.equal(nodes.volume.attrs['--book-angle'],'90deg');
});
