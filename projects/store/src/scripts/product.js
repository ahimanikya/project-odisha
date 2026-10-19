import products from '../data/products.json';
import {loadCart,saveCart,addItem} from '../lib/cart.mjs';
import {api,priceLabel,supplyLabel} from '../lib/store-api.mjs';
const form=document.querySelector('#selection-form'),select=form.elements.variant,button=form.querySelector('button'),status=document.querySelector('#save-status'),availability=document.querySelector('#option-availability');
let liveProduct=null;
function update(){const option=liveProduct?.variant_options.find(v=>v.label===select.value);button.disabled=!!option&&!option.preorders_open;availability.textContent=option?priceLabel(option.unit_price_paise)+' · '+supplyLabel(option)+(option.preorders_open?'':' · Interest paused')+(option.fulfillment_note?' · '+option.fulfillment_note:''):'Current price and supply unavailable. You can still save this design.';}
select.addEventListener('change',update);
form.addEventListener('submit',event=>{event.preventDefault();try{const cart=addItem(loadCart(localStorage,products),{id:form.dataset.product,variant:select.value,quantity:Number(form.elements.quantity.value)},products);saveCart(localStorage,cart);status.textContent='Added to your selection. Open your selection to register interest.';}catch(error){status.textContent=error.message;}});
try{const data=await api('/api/catalog');liveProduct=data.products.find(p=>p.id===form.dataset.product);update();}catch{update();}
