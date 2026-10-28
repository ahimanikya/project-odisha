import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,relative,join} from 'node:path';
import {pathToFileURL} from 'node:url';
// Match production labels, not factual discussion of AI or provenance intake questions.
const labels=/\bwithout\s+AI\s+modification\b|\bAI\s+(?:assistants?|researchers?)\b|\bAI[\s\u2010-\u2015-]+(?:generated|created|assisted|assistance|adaptation)\b|\b(?:prepared|drafted|written|created|generated|produced|developed|researched|designed|translated)\s+(?:with|by|using)\s+(?:an?\s+)?(?:AI|artificial intelligence)\b/gi;
export function productionLabels(html){
 const publicMarkup=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
 const normalized=publicMarkup.replace(/&(?:nbsp|#160|#xA0);/gi,' ').replace(/&#(?:45|8208|8209);/g,'-');
 // Scan attributes (alt, title, aria-label, meta content) and text across inline markup.
 return [...new Set([...(normalized.match(labels)||[]),...(normalized.replace(/<[^>]*>/g,' ').match(labels)||[])])];
}
export function audit(root){
 const exceptions=JSON.parse(readFileSync(new URL("./public-disclosure-exceptions.json",import.meta.url),"utf8"));
 for(const item of exceptions)if(!item.route||!item.excerpt||!item.reason||item.excerpt.length>500)throw Error("Exceptions require an exact route, short excerpt and review reason");
 let pages=0;const violations=[];const walk=dir=>{for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(html|txt|md)$/i.test(e.name)){const route=relative(root,p).replaceAll('\\','/');pages++;if(route==='about/editorial-process/index.html')continue;let content=readFileSync(p,'utf8');for(const item of exceptions.filter(e=>e.route===route)){if(!content.includes(item.excerpt))throw Error('Stale disclosure exception: '+route);content=content.replaceAll(item.excerpt,'');}const matches=productionLabels(content);if(matches.length)violations.push({route,matches});}}};walk(root);const disclosure=join(root,'about/editorial-process/index.html');if(!existsSync(disclosure)||!readFileSync(disclosure,'utf8').includes('AI assistants'))violations.push({route:'about/editorial-process/index.html',matches:['Central process explanation is missing']});return {pages,violations};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const root=resolve(process.argv[2]||'dist');const result=audit(root);console.log(JSON.stringify({root,...result},null,2));if(result.violations.length)process.exitCode=1;
}
