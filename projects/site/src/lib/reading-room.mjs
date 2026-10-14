import {readFileSync} from 'node:fs';
import {posix,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createSatteriMarkdownProcessor} from '@astrojs/markdown-satteri';
import manifest from '../../../../kb/records/pending-reading-room.json' with {type:'json'};
export const entries=manifest.entries;
const paths=new Map(entries.map(e=>[e.path,e.route]));
const root=pathToFileURL(resolve('../../kb/research')+'/');
const repository='https://github.com/ahimanikya/project-odisha/blob/main/kb/research/';
export function researchLink(url,path){
 if(/^(https?:|mailto:|#|\/)/.test(url))return url;
 const [pathname,hash]=url.split('#');
 const resolved=posix.normalize(posix.join(posix.dirname(path),decodeURI(pathname)));
 if(resolved.startsWith('../'))return 'https://github.com/ahimanikya/project-odisha/blob/main/kb/'+resolved.slice(3)+(hash?'#'+hash:'');
 const route=paths.get(resolved)||manifest.native_routes[resolved];
 return route||repository+resolved.split('/').map(encodeURIComponent).join('/')+(hash?'#'+hash:'');
}
let renderer;
export async function renderResearch(entry){
 const raw=readFileSync(new URL(entry.path,root),'utf8');
 const end=raw.indexOf('\n---\n',4);if(!raw.startsWith('---\n')||end<0)throw Error('Missing frontmatter: '+entry.path);
 let body=raw.slice(end+5).replace(/^\s*# [^\n]+\n/,'');
 if(/<script\b|\bon\w+=|<iframe\b/i.test(body))throw Error('Unexpected active content: '+entry.path);
 // The reading release includes prose. Refer to original graphics without republishing media rights.
 body=body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'[View figure: $1]($2)');
 body=body.replace(/\]\(([^)]+)\)/g,(_,url)=>']('+researchLink(url,entry.path)+')');
 renderer??=createSatteriMarkdownProcessor({syntaxHighlight:false});
 const result=await (await renderer).render(body);
 return result.code.replace(/<table>/g,'<table tabindex="0" aria-label="Scrollable research table">').replace(/(href|src)="([^"#][^"]*)"/g,(_,attr,url)=>`${attr}="${researchLink(url,entry.path)}"`);
}
