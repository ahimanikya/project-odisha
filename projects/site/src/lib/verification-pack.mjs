export function renderVerificationPack(pack){
 const lines=[pack.title,`Version ${pack.version} · prepared ${pack.prepared_on}`,`Status: ${pack.status}`,pack.purpose,'','HOW TO USE',...pack.instructions.map((s,i)=>`${i+1}. ${s}`),''];
 for(const guide of pack.guides){lines.push(guide.place.toUpperCase(),...guide.routes.map(route=>'https://projectodisha.org'+route),'','Questions:',...guide.questions.map(q=>'[ ] '+q),'','Repeat this record for each claim:',...pack.record_fields.flatMap(field=>[field,'','']), 'Context starting point: '+guide.source_pointer,'');}
 lines.push(pack.source_note,'','Submit only public material: https://projectodisha.org/contribute/','No submission, contact, appointment or publication is made by downloading this pack.','');
 return lines.join('\n');
}
