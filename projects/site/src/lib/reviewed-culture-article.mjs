import {markdownToHtml} from 'satteri';
import path from 'node:path';
const repository='https://github.com/ahimanikya/project-odisha/blob/main/';
const escapeAttribute=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;');
/** Render only an explicitly selected, reviewed canonical article. No route discovery. */
export function renderReviewedCultureArticle(source,{sourcePath,route,links={},images={},imageDimensions={}}){
 const title=source.match(/^# (.+)$/m)?.[1];
 const author=source.match(/^By (.+)$/m)?.[1];
 if(!title||!author)throw Error(`Missing article title/byline: ${sourcePath}`);
 let markdown=source.replace(/^---\n[\s\S]*?\n---\n/,'').replace(/^# .+\n/m,'').replace(/^By .+\n/m,'');
 markdown=markdown.replace(/^## Footnotes & Sources\s*$/m,'<div data-source-position></div>\n\n');
 markdown=markdown.replace(/<details>\s*<summary>Further reading<\/summary>/,'## Further reading').replace(/<\/details>/g,'');
 markdown=markdown.replace(/(!?\[[^\]]*\])\(([^)]+)\)/g,(whole,label,url)=>{
  if(url.startsWith('https://projectodisha.org/contribute/'))return `${label}(/contribute/?page=${encodeURIComponent(route)})`;
  if(/^(?:[a-z]+:|#|\/)/i.test(url))return whole;
  const destination=images[url]||links[url];
  if(destination)return `${label}(${destination})`;
  const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath),url));
  if(!resolved.startsWith('kb/'))throw Error(`Unmapped local article link ${url}`);
  return `${label}(${repository}${resolved})`;
 });
 let {html}=markdownToHtml(markdown,{features:{gfm:{footnotes:{label:'Footnotes & Sources'}}}});
 const notes=html.match(/<section data-footnotes[\s\S]*?<\/section>/)?.[0];
 if(!notes)throw Error(`Reviewed article lacks source notes: ${sourcePath}`);
 html=html.replace(notes,'').replace('<div data-source-position></div>',notes.replace('class="footnotes"','class="article-footnotes"').replace('class="sr-only" ',''));
 html=html.replace(/<p>(<img\b[^>]*>)<\/p>\s*<p><em>([\s\S]*?)<\/em>((?:<sup[\s\S]*?<\/sup>)*)<\/p>/g,'<figure>$1<figcaption>$2$3</figcaption></figure>');
 html=html.replace(/<table>/g,'<div class="article-table" role="region" aria-label="Scrollable data table" tabindex="0"><table>').replace(/<\/table>/g,'</table></div>');
 html=html.replace(/<img\b([^>]*?)src="([^"]+)"([^>]*)>/g,(whole,before,src,after)=>{const size=imageDimensions[src];return size?`<img${before}src="${src}"${after} width="${size.width}" height="${size.height}" loading="lazy" decoding="async">`:whole;});
 const headings=[];const used=new Set(['footnote-label']);
 html=html.replace(/<h2>(.*?)<\/h2>/g,(_,text)=>{let base=text.replace(/<[^>]+>/g,'').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-'),id=base,n=2;while(used.has(id))id=base+'-'+n++;used.add(id);headings.push({title:text,href:'#'+id});return `<h2 id="${escapeAttribute(id)}">${text}</h2>`;});
 return {title,author,html,headings};
}
