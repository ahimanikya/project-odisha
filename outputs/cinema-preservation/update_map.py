import json,datetime,hashlib
from pathlib import Path
R=Path(__file__).resolve().parents[2]
p=R/'kb/research/references/data/research-map.json';d=json.loads(p.read_text());ids={x['id']for x in d['records']}
new=[
 ('culture/cinema-series/who-keeps-a-film-alive','Who Keeps a Film Alive?','kb/research/culture/cinema-series/who-keeps-a-film-alive.md','Cinema History'),
 ('sources/cinema-preservation-evidence-2026-10-30','Cinema preservation and access evidence','kb/research/sources/cinema-preservation-evidence-2026-10-30.json','Evidence'),
 ('records/cinema-preservation-2026-10-30','Cinema preservation, reading paths and book review','kb/records/cinema-preservation-2026-10-30.json','Review')]
for rid,title,src,kind in new:
 if rid in ids:continue
 d['records'].append(dict(id=rid,title=title,kind=kind,source_path=src.removeprefix('kb/research/') if src.startswith('kb/research/') else None,project_path=src,project_counterpart_present=True,scope='Preservation and access article, thematic paths, current-source book edition; local review, no publication.'))
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
d['current_counts']['records_mapped']=len(d['records']);d['current_counts']['updated_at']=now
if not any(x.get('run_id')=='2026-10-30-cinema-preservation' for x in d['extension_history']):
 d['extension_history'].append(dict(run_id='2026-10-30-cinema-preservation',recorded_at=now,scope='Preservation and access chapter;41readings/7parts; newdatedbookreview.',record_ids=[x[0]for x in new]))
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(len(d['records']),'records')

