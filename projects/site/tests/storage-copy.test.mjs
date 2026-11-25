import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,stat,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {copyPublicationTree,copyPublicationFile} from '../tools/storage-copy.mjs';

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


test('publication file copies preserve bytes independently and reject existing destinations and links',async()=>{
 const root=await mkdtemp(join(tmpdir(),'pod-file-copy-test-'));
 try{
  const source=join(root,'source.bin'),destination=join(root,'delivery.bin');
  const bytes=Buffer.from([0,255,12,34,56,78]);await writeFile(source,bytes);
  if(process.platform!=='darwin')await assert.rejects(copyPublicationFile(source,destination),/explicit non-macOS/);
  await copyPublicationFile(source,destination,{allowNonMacFullCopy:true});
  assert.deepEqual(await readFile(destination),bytes);
  assert.notEqual((await stat(source)).ino,(await stat(destination)).ino);
  await writeFile(destination,'independent delivery edit');
  assert.deepEqual(await readFile(source),bytes);
  await assert.rejects(copyPublicationFile(source,destination,{allowNonMacFullCopy:true}),/already exists/);
  assert.equal(await readFile(destination,'utf8'),'independent delivery edit');
  const broken=join(root,'broken-link');await symlink(join(root,'missing'),broken);
  await assert.rejects(copyPublicationFile(source,broken,{allowNonMacFullCopy:true}),/already exists/);
  const linkedSource=join(root,'source-link');await symlink(source,linkedSource);
  await assert.rejects(copyPublicationFile(linkedSource,join(root,'other'),{allowNonMacFullCopy:true}),/regular file/);
 }finally{await rm(root,{recursive:true,force:true});}
});
