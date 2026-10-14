const origin='https://projectodisha.org';
export function validateSearchSelection(selection,routes){
 if(selection?.status!=='proposed_not_approved'||selection.origin!==origin||!Array.isArray(selection.pages))throw Error('Expected a proposed search review');
 const seen=new Set();
 for(const page of selection.pages){
  if(!routes.includes(page.route)||seen.has(page.route)||!['proposed','hold','exclude'].includes(page.decision)||!page.reason?.trim())throw Error('Invalid or duplicate search route');
  if(['journey','contribute','store','brand-review'].some(x=>page.route===`/${x}/`)||page.route==='/404.html')if(page.decision!=='exclude')throw Error('Utility or held route cannot be indexed');
  seen.add(page.route);
 }
 if(seen.size!==routes.length)throw Error('Every published route needs an explicit search decision');
 return selection.pages.filter(p=>p.decision==='proposed').map(p=>p.route);
}
export function candidateRobots(html,indexable){
 const tags=html.match(/<meta\b[^>]*name=["']robots["'][^>]*>/gi)||[];
 if(tags.length!==1||!tags[0].includes('noindex'))throw Error('Expected one preview robots tag');
 return html.replace(tags[0],`<meta name="robots" content="${indexable?'index, follow':'noindex, follow'}">`);
}
export function searchSitemap(routes){
 if(routes.some(r=>!/^\/(?:[a-z0-9-]+\/)*$/.test(r)))throw Error('Invalid sitemap route');
 return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+routes.map(r=>`  <url><loc>${origin}${r}</loc></url>`).join('\n')+'\n</urlset>\n';
}
export const candidateCrawlers=`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
