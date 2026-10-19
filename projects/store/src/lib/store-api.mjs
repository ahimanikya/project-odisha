export async function api(path, {method='GET',body,csrf,signal}={}) {
 const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',signal,headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 let data;try{data=await response.json();}catch{throw new Error('The store service is unavailable. Please try again later.');}
 if(!response.ok){const error=new Error(data.error?.message||'The request could not be completed.');error.status=response.status;throw error;}return data;
}
export function priceLabel(paise){return paise===null||paise===undefined?'Price to be confirmed':new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(paise/100)+' per unit (indicative)';}
export function supplyLabel(option){return `Available: ${option.available_units===null?'to be confirmed':option.available_units} · Planned: ${option.planned_units===null?'to be confirmed':option.planned_units}`;}
export function rupeesToPaise(value){const s=value.trim();if(!s)return null;if(!/^\d{1,7}(\.\d{1,2})?$/.test(s))throw new Error('Use a non-negative price with up to two decimal places.');const [whole,fraction='']=s.split('.');const result=Number(whole)*100+Number(fraction.padEnd(2,'0'));if(result>100000000)throw new Error('Price exceeds the supported limit.');return result;}
export function displayLabel(label){return label==='Standard'?'Ivory & blue':label;}
