export const collectionURL='https://www.youtube.com/watch?v=LgqHdOa_U1g';
export const collectionEmbedURL='https://www.youtube-nocookie.com/embed/LgqHdOa_U1g?autoplay=0&controls=1&playsinline=1';

// Only this article imports the module. The canonical link remains the print/no-JS fallback.
export function enhanceKhokaListening(document){
 if(document.getElementById('khoka-collection-player'))return null;
 const heading=[...document.querySelectorAll('h2')].find(h=>h.textContent.trim()==='Essential Khoka Bhai listening');
 if(!heading)return null;
 let paragraph=heading.nextElementSibling;
 while(paragraph&&paragraph.tagName!=='H2'){
  const link=[...paragraph.querySelectorAll('a')].find(a=>a.href===collectionURL);
  if(link){
   const container=document.createElement('div');container.id='khoka-collection-player';container.className='khoka-collection-player';
   const frame=document.createElement('iframe');
   frame.src=collectionEmbedURL;frame.title='Khoka Bhai songs — official Saregama collection';
   frame.width='640';frame.height='360';frame.loading='lazy';
   frame.referrerPolicy='strict-origin-when-cross-origin';
   frame.allow='encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;
   container.append(frame);paragraph.before(container);return frame;
  }
  paragraph=paragraph.nextElementSibling;
 }
 return null;
}
