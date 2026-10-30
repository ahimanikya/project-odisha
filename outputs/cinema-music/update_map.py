import json,datetime
from pathlib import Path
root=Path(__file__).resolve().parents[2]
path=root/'kb/research/references/data/research-map.json';d=json.loads(path.read_text());site=json.loads((root/'projects/site/src/data/cinema.json').read_text());mapped={x['id']:x for x in d['records']};record_ids=[]
for slug in ['cinema-music','prafulla-kar','pranab-patnaik','tapu-mishra']:
 x=next(a for a in site['articles'] if a['slug']==slug);src=x['source'];assert(root/src).is_file();rid=src.removeprefix('kb/research/').removesuffix('.md');record_ids.append(rid)
 record=mapped.get(rid,{})
 record.update(id=rid,title=x['title'],kind='Person' if x['route'].startswith('/people/') else 'Cinema History',layer='research_concept',source_path=src.removeprefix('kb/research/'),project_path=src,project_counterpart_present=True,copy_state='local_editorial_article',scope='Connected cinema-music story with recording-specific roles and original licensed photographs; local review only.')
 if rid not in mapped:d['records'].append(record)
for rid,src,title in [('sources/cinema-music-evidence-2026-10-30','kb/research/sources/cinema-music-evidence-2026-10-30.json','Cinema music contributor evidence'),('records/cinema-music-2026-10-30','kb/records/cinema-music-2026-10-30.json','Cinema music local review and integration')]:
 record_ids.append(rid)
 if rid not in mapped:d['records'].append(dict(id=rid,title=title,source_path=src.removeprefix('kb/research/') if src.startswith('kb/research/') else None,project_path=src,scope='Evidence, source limitations, sequential article reviews and actual local checks.'))
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
d['current_counts']['records_mapped']=len(d['records']);d['current_counts']['updated_at']=now
if not any(x.get('run_id')=='2026-10-30-cinema-music' for x in d['extension_history']):d['extension_history'].append(dict(run_id='2026-10-30-cinema-music',recorded_at=now,scope='Four local music readings; existing Prafulla nucleus enhanced. No publication or dated PDF revision.',record_ids=record_ids))
path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print('Mapped',len(d['records']),'records; added/updated',len(record_ids),'music records')
