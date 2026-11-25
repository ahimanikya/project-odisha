import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,stat,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {copyPublicationTree} from '../tools/storage-copy.mjs';

test('publication staging preserves bytes and source independence, and refuses overwrite',async()=>{
 const root=await mkdtemp(join(tmpdir(),'pod-copy-test-'));
 try{
  const source=join(root,'source'),destination=join(root,'destination');await mkdir(source);
  await writeFile(join(source,'asset'),'preserved original');
  if(process.platform!=='darwin')await assert.rejects(copyPublicationTree(source,destination),/explicit non-macOS/);
  await copyPublicationTree(source,destination,{allowNonMacFullCopy:true});
  assert.equal(await readFile(join(destination,'asset'),'utf8'),'preserved original');
  assert.notEqual((await stat(join(source,'asset'))).ino,(await stat(join(destination,'asset'))).ino);
  await writeFile(join(destination,'asset'),'delivery edit');
  assert.equal(await readFile(join(source,'asset'),'utf8'),'preserved original');
  await assert.rejects(copyPublicationTree(source,destination,{allowNonMacFullCopy:true}),/already exists/);
 }finally{await rm(root,{recursive:true,force:true});}
});
