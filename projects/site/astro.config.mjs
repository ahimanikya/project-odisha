import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import nimuhiFootnoteHeading from './tools/nimuhi-footnote-heading.mjs';
const edition=process.env.PUBLIC_UTKAL_EDITION||'full';
if(!['full','coast'].includes(edition))throw Error('Unknown Utkal edition: '+edition);
export default defineConfig({ site:'https://projectodisha.org', output:'static',outDir:edition==='coast'?'./.coast-staging':'./dist',devToolbar:{enabled:false}, markdown:{processor:satteri({hastPlugins:[nimuhiFootnoteHeading]})}, server:{host:'127.0.0.1',port:4322} });
