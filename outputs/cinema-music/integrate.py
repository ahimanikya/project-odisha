import json, hashlib, re, sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
slug=sys.argv[1]
imgs=json.loads((root/'outputs/cinema-music/images.json').read_text())
meta={
 'cinema-music':('kb/research/culture/cinema-series/cinema-music.md','/cinema/cinema-music/','Trupti Das holding an award at the Odisha State Television Awards','Trupti Das at the Odisha State Television Awards, 2014.','Subhashish Panigrahi','Odia_singer_Trupti_Das_felicitated_during_2nd_Odisha_State_Television_Award_01_(cropped).JPG','50% 35%','Cropped version; resized for display.'),
 'prafulla-kar':('kb/research/people/prafulla-kar.md','/people/prafulla-kar/','Prafulla Kar standing at a microphone in Bhubaneswar','Prafulla Kar in Bhubaneswar, 2014.','Subhashish Panigrahi','Prafulla_Kar_01.jpg','50% 30%','Resized for display.'),
 'pranab-patnaik':('kb/research/people/pranab-patnaik.md','/people/pranab-patnaik/','Pranab Patnaik holding a microphone during a performance','Pranab Patnaik performing in Bhubaneswar, 2014.','Subhashish Panigrahi','Pranab_Patnaik.jpg','50% 20%','Resized for display.'),
 'tapu-mishra':('kb/research/people/tapu-mishra.md','/people/tapu-mishra/','Tapu Mishra holding a trophy at an event in Bhubaneswar','Tapu Mishra, Bhubaneswar, 2016.','Jnanaranjan Sahu','Tapu_Mishra.jpg','50% 15%','Resized for display.')}
source,route,alt,caption,creator,filename,position,notes=meta[slug]
raw=(root/source).read_text()
def field(name): return json.loads(re.search(r'^'+name+r': (".*")$',raw,re.M).group(1))
entry=dict(slug=slug,title=field('title'),source=source,route=route,status='draft',documentary_required=False,series_intro=field('series_intro'),hero=dict(kind='documentary',path=imgs[slug]['source'],alt=alt,caption=caption,credit=dict(creator=creator,source_url='https://commons.wikimedia.org/wiki/File:'+filename,license='CC BY-SA 4.0',license_url='https://creativecommons.org/licenses/by-sa/4.0/',notes=notes)),card_image_position=position,source_sha256=hashlib.sha256(raw.encode()).hexdigest())
for name in ['kb/research/culture/cinema-series/manifest.json','projects/site/src/data/cinema.json']:
 path=root/name;data=json.loads(path.read_text());entries={x['slug']:x for x in data['articles']}
 entries[slug]=entry if name.startswith('kb/') else dict(entry,images=[imgs[slug]])
 for part in data['parts']: part['chapters']=[x for x in part['chapters'] if x not in ['cinema-music','akshaya-mohanty','prafulla-kar','pranab-patnaik','tapu-mishra']]
 data['parts']=[p for p in data['parts'] if p.get('id')!='songs-and-voices']
 data['parts'].insert(1,dict(title='Songs and Voices',id='songs-and-voices',chapters=[x for x in ['cinema-music','akshaya-mohanty','prafulla-kar','pranab-patnaik','tapu-mishra'] if x in entries],intro='A melody can keep a film close long after its final scene. These readings follow singers, composers and writers across generations, from the rehearsal and recording to the songs listeners carry into their own lives.'))
 order=[s for p in data['parts'] for s in p['chapters']]
 assert len(order)==len(set(order))==len(entries),(len(order),len(entries))
 data['articles']=[entries[s] for s in order]
 path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
if route.startswith('/people/'):
 path=root/('projects/site/src/pages'+route.rstrip('/')+'.astro')
 assert not path.exists() or 'CinemaReading' in path.read_text()
 path.write_text("---\nimport CinemaReading from '../../components/CinemaReading.astro';\nimport {cinema} from '../../lib/cinema-article.mjs';\nconst entry=cinema.articles.find(article=>article.route==='"+route+"');\nif(!entry)throw new Error('Missing reviewed "+slug+" entry');\n---\n<CinemaReading entry={entry}/>\n")
 path=root/'projects/site/src/lib/page-context.mjs';s=path.read_text()
 if route not in s:s=s.replace('const cinemaPeople = new Set([',"const cinemaPeople = new Set(['"+route+"', ")
 path.write_text(s)
print(slug,entry['source_sha256'],'integrated; total',len(entries))
