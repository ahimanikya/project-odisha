function invalid(field,message){const error=new Error(message);error.field=field;throw error;}
function contributionEntry(value,entries){
 if(value.page==='__new__'){const title=String(value.subject||'').trim();if(title.length<2||title.length>160)invalid('subject','Name the new subject in 2–160 characters.');return {title,href:'New subject — no existing page'};}
 return entries.find(p=>p.href===value.page);
}
export function correctionDraft(value,entries){
 const page=contributionEntry(value,entries);
 if(!page)invalid('page','Choose the entry you want to improve.');
 const text=String(value.correction||'').trim(),evidence=String(value.evidence||'').trim(),credit=String(value.credit||'').trim();
 if(text.length<10||text.length>10000)invalid('text','Describe the correction in 10–10,000 characters.');
 if(evidence.length<5||evidence.length>3000)invalid('evidence','Add a supporting source or explain your firsthand knowledge (5–3,000 characters).');
 if(credit.length>120)invalid('credit','Keep the requested public credit within 120 characters.');
 if(!['Correction','Additional knowledge','Personal recollection'].includes(value.kind))invalid('kind','Choose a contribution type.');
 return `PROJECT ODISHA · EDITORIAL DRAFT\nNot submitted — prepared by the reader for later editorial review.\n\nEntry: ${page.title}\nPage: ${page.href}\nType: ${value.kind}\n\nSuggested change\n${text}\n\nEvidence or firsthand context\n${evidence}\n\nRequested public credit: ${credit||'Not supplied'}\n\nThis draft grants no publication permission for attached or referenced third-party material. Editors must verify claims, credit and reuse rights before publication.\n`;
}

export const PUBLIC_ISSUE_URL='https://github.com/ahimanikya/utkal-project/issues/new';
export function publicIssueLink(value,entries){
 const draft=correctionDraft(value,entries),page=contributionEntry(value,entries);
 const body=draft.replace('Not submitted — prepared by the reader for later editorial review.','Reader-prepared contribution. Posting this issue does not imply editorial acceptance or publication.');
 const params=new URLSearchParams({title:`[Knowledge] ${page.title}`,body});
 const url=PUBLIC_ISSUE_URL+'?'+params;
 // Preserve long or multibyte drafts in the preview instead of truncating their content.
 return url.length<=6500?{url,prefilled:true}:{url:PUBLIC_ISSUE_URL,prefilled:false};
}
