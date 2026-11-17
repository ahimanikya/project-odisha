(function(root){
'use strict';
const types=['full-film','trailer','song-clip','short-film','animation-episode'];
const providerHosts=['www.zee5.com','www.primevideo.com','www.airtelxstream.in'];
function httpsURL(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')?u.href:null;}catch{return null;}}
function providerURL(value){const safe=httpsURL(value);return safe&&providerHosts.includes(new URL(safe).hostname)?safe:null;}
function validEntry(e){if(!e||!(/^[a-z0-9-]+$/.test(e.id))||!(/^[a-z0-9-]+$/.test(e.filmID))||typeof e.titleEnglish!=='string'||e.language!=='Odia'||!types.includes(e.type)||!['original','dubbed','unknown'].includes(e.languageType)||!Array.isArray(e.genres)||!Array.isArray(e.evidenceURLs)||!e.evidenceURLs.length||!e.evidenceURLs.every(httpsURL))return false;
return e.access==='provider-listing'?Boolean(!e.videoID&&providerURL(e.watchURL)):e.access==='official-upload'&&/^[A-Za-z0-9_-]{11}$/.test(e.videoID)&&httpsURL(e.watchURL)===`https://www.youtube.com/watch?v=${e.videoID}`;}
function decade(e){return Number.isInteger(e.year)?`${Math.floor(e.year/10)*10}s`:'unknown';}
function filter(entries,query,type,rights,extra={}){const q=query.trim().toLocaleLowerCase();return entries.filter(e=>(type==='all'||e.type===type)&&(rights!=='public-domain'||e.publicDomainVerified===true)&&(!extra.access||extra.access==='all'||e.access===extra.access)&&(!extra.source||extra.source==='all'||e.sourceChannel===extra.source)&&(!extra.decade||extra.decade==='all'||decade(e)===extra.decade)&&(!extra.genre||extra.genre==='all'||(extra.genre==='unknown'?e.genres.length===0:e.genres.includes(extra.genre)))&&(!extra.languageType||extra.languageType==='all'||e.languageType===extra.languageType)&&[e.titleEnglish,e.titleOdia,e.sourceChannel,e.year,...e.genres].join(' ').toLocaleLowerCase().includes(q));}
function counts(entries){return {entries:entries.length,films:new Set(entries.map(e=>e.filmID)).size};}
function hashID(hash){try{return decodeURIComponent(hash.replace(/^#/,''));}catch{return '';}}
function embedURL(e,protocol){return validEntry(e)&&e.access==='official-upload'&&['https:','http:'].includes(protocol)?`https://www.youtube-nocookie.com/embed/${e.videoID}?playsinline=1&rel=0`:null;}
const api={validEntry,filter,hashID,embedURL,httpsURL,providerURL,providerHosts,decade,counts};root.MovieCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
