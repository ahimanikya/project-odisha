export const ANALYTICS_CHOICE_KEY='utkal:analytics-choice:v1';
export const ANALYTICS_CHOICES=new Set(['accepted','declined']);
export function validMeasurementId(value){return typeof value==='string'&&/^G-[A-Z0-9]{6,20}$/.test(value);}
export function analyticsPage({origin,pathname,canonical,title,allowedPaths}){
 if(origin!=='https://projectodisha.org'||!allowedPaths.includes(pathname)||pathname==='/404.html')return null;
 let url;try{url=new URL(canonical);}catch{return null;}
 if(url.origin!==origin||url.pathname!==pathname||url.search||url.hash)return null;
 return {page_location:url.href,page_title:title,page_referrer:'',ignore_referrer:true};
}
// No tag request before consent. Context contains only build-time page metadata.
export function createAnalytics({id,page,gtag,loadTag,setDisabled}){
 let active=false,started=false,sent=false,loaded=false;
 return {
  accept(){
   if(!validMeasurementId(id)||!page||active)return;
   active=true;setDisabled(false);
   if(!started){
    started=true;
    gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    gtag('js',new Date());
    gtag('config',id,{...page,send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_flags:'SameSite=Lax;Secure',cookie_expires:60*60*24*30});
   }
   gtag('consent','update',{analytics_storage:'granted'});
   if(!sent){gtag('event','page_view',page);sent=true;}
   if(!loaded){loaded=true;loadTag(id);}
  },
  decline(){active=false;setDisabled(true);},
  get active(){return active;}
 };
}
