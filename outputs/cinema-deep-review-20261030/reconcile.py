from pathlib import Path
import json,re,hashlib
R=Path(__file__).resolve().parents[2]
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
mp=R/'kb/research/culture/cinema-series/manifest.json';m=json.loads(mp.read_text())
np=R/'kb/research/culture/cinema-series/book-narrative-2026-10-27.json';n=json.loads(np.read_text())
s=(R/'kb/research/culture/odia-cinema.md').read_text();body=re.sub(r'^---\n.*?\n---\n','',s,count=1,flags=re.S)
sections={c.splitlines()[0]:c.strip() for c in re.split(r'(?=^##? )',body,flags=re.M) if c.startswith('#')}
old={s['heading']:s for s in n['overview']['section_map']};newheadings=set(sections)-set(old);assert newheadings=={'## Reported film counts: a dated reference'},newheadings
opened=[];companion=[];mapping=[]
for heading,chunk in sections.items():
 destination=old.get(heading,{'destination':'companion'})['destination'];(opened if destination=='opening' else companion).append(chunk)
 mapping.append(dict(heading=heading,destination=destination,source_sha256=hashlib.sha256(chunk.encode()).hexdigest(),source_characters=len(chunk),preservation='verbatim'))
opened.append(n['overview']['opening_bridge_editorial_addition']['text'])
n['overview'].update(opening_markdown='\n\n'.join(opened),companion_markdown='\n\n'.join(companion),section_map=mapping)
n['preservation']['overview_source_sha256']=sha(R/'kb/research/culture/odia-cinema.md');n['preservation']['refreshed']='2026-10-30'
n['bridges']['literature-and-screen']='Follow one of those journeys more closely: a novel by Basanta Kumari Patnaik, and the life from which she wrote.'
n['bridges']['nandita-das']='A film also grows through what people learn from one another. We turn towards the classrooms, crews and shared screenings behind that work.'
n['callouts']=[c for c in n['callouts'] if c['id'] not in ['livelihood-thread','waiting-thread','loan-fact']]
for p in n['people_guide']:
 if p['label']=='Basanta Kumari Patnaik and Gopal Chhotray':p['text']='Amada Bata connects Patnaik’s novel with Chhotray’s screenplay.'
# Extend the guide to overlooked actors through a documented film, rather than speculative totals.
if not any(p['label']=='Bijay Mohanty and Parbati Ghose' for p in n['people_guide']):n['people_guide'].insert(5,dict(label='Bijay Mohanty and Parbati Ghose',relationship='Literary characters on screen',text='They play Bhagia and Saria in Chha Mana Atha Guntha.',slug='parbati-ghose',source_note_id='adaptation'))
save(np,n)
for f in ['kb/research/culture/cinema-series/manifest.json','projects/site/src/data/cinema.json']:
 p=R/f;x=json.loads(p.read_text())
 for a in x['articles']:a['source_sha256']=sha(R/a['source'])
 save(p,x)
# Record new sources privately as well as the reader’s numbered notes.
p=R/'kb/records/cinema-deep-review-2026-10-30.json';x=json.loads(p.read_text());x['integration_changes']=['Overview bookcompanion regenerated from canonical revised source','Two stale chapter bridges corrected','Three repetitive callouts removed; three genuine callbacks retained','Amada Bata peopleguide credit narrowed to screenplay','Bijay Mohanty/Parbati Ghose added to peopleguide through documentedroles','Both manifests sourcehashes reconciled'];save(p,x)
