import json,hashlib,re,shutil
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
slug='who-keeps-a-film-alive'
src='kb/research/culture/cinema-series/'+slug+'.md'
art='kb/research/media/cinema-series/preserving-a-collection-20261030.png'
dst=R/art
if not dst.exists():shutil.copyfile('/Users/ahimanikya/.codex/generated_images/01a166e7-8279-7d61-8fb5-7c9a20fef128/exec-57a65480-a6bb-4c43-b093-44cf85be7d28.png',dst)
im=Image.open(dst).convert('RGB'); derivatives=[]
for w in [320,640,960,1200]:
 h=round(im.height*w/im.width);f='/assets/cinema/preservation-'+str(w)+'.jpg';p=R/'projects/site/public'/f.lstrip('/')
 im.resize((w,h),Image.Resampling.LANCZOS).save(p,quality=90,optimize=True)
 derivatives.append(dict(file=f,width=w,height=h,format='jpeg',bytes=p.stat().st_size,sha256=sha(p)))
provenance=dict(date='2026-10-30',kind='generated-conceptual-illustration',tool='built-in image_gen',skill='human-natural-image',mode='Editorial Natural',source=art,sha256=sha(dst),depiction='Invented cataloguing scene; no identified person, institution or historical artifact.',prompt_file='outputs/cinema-preservation/image-prompt.txt',modifications='Display resizing only; original retained.')
save(R/'kb/research/media/cinema-series/preservation-provenance-20261030.json',provenance)
save(R/'projects/site/public/assets/cinema/preservation-provenance.json',provenance)
ims=dict(role='title',source=art,original_sha256=sha(dst),file=derivatives[-1]['file'],width=1200,height=derivatives[-1]['height'],derivatives=derivatives,provenance=['/assets/cinema/preservation-provenance.json'])
raw=(R/src).read_text()
def field(n):return json.loads(re.search(r'^'+n+r': (".*")$',raw,re.M)[1])
entry=dict(slug=slug,title=field('title'),source=src,route='/cinema/'+slug+'/',status='draft',documentary_required=False,series_intro=field('series_intro'),hero=dict(kind='illustration',path=art,alt='Hands recording details of paper booklets and a videotape in a notebook',caption='Illustration: giving a collection a catalogue.'),card_image_position='50% 50%',source_sha256=sha(R/src))
for f in ['kb/research/culture/cinema-series/manifest.json','projects/site/src/data/cinema.json']:
 p=R/f;m=json.loads(p.read_text());entries={a['slug']:a for a in m['articles']}
 entries[slug]=entry if f.startswith('kb/') else dict(entry,images=[ims])
 part=next(x for x in m['parts'] if x['title']=='Memory and Discovery')
 if slug not in part['chapters']:part['chapters'].insert(part['chapters'].index('searching-for-sita-bibaha')+1,slug)
 order=[s for part in m['parts'] for s in part['chapters']]
 assert len(order)==len(set(order))==len(entries)==41
 m['articles']=[entries[s] for s in order];save(p,m)
np=R/'kb/research/culture/cinema-series/book-narrative-2026-10-27.json';n=json.loads(np.read_text())
# Preserve the previous edition's narrative snapshot before updating the active plan.
snapshot=R/'outputs/cinema-preservation/narrative-before-20261030.json'
if not snapshot.exists():save(snapshot,n)
canonical=R/'kb/research/culture/odia-cinema.md';text=canonical.read_text()
body=re.sub(r'^---\n.*?\n---\n','',text,count=1,flags=re.S)
chunks=re.split(r'(?=^##? )',body,flags=re.M)
sections={c.splitlines()[0]:c.strip() for c in chunks if c.startswith('#')}
old={s['heading']:s for s in n['overview']['section_map']}
assert set(sections)==set(old),(set(sections)-set(old),set(old)-set(sections))
opened=[];companion=[];mapping=[]
for heading,chunk in sections.items():
 destination=old[heading]['destination'];(opened if destination=='opening' else companion).append(chunk)
 mapping.append(dict(heading=heading,destination=destination,source_sha256=hashlib.sha256(chunk.encode()).hexdigest(),source_characters=len(chunk),preservation='verbatim'))
opened.append(n['overview']['opening_bridge_editorial_addition']['text'])
n['overview']['opening_markdown']='\n\n'.join(opened)
n['overview']['companion_markdown']='\n\n'.join(companion)
n['overview']['section_map']=mapping
n['preservation']['overview_source_sha256']=sha(canonical)
n['preservation']['refreshed']='2026-10-30'
n['author_introduction']['placement']='First reading before the overview; personal essay retained verbatim. Forty-one readings follow in seven parts.'
n['part_intros']['Songs and Voices']='A song can leave the theatre with its listener. These readings follow the voices, words and compositions that keep films close to everyday life. Listen for the partnerships inside a familiar recording, and for the different choices musicians make across generations.'
n['part_intros']['Memory and Discovery']='A film may survive as a print, a recording, a book or a remembered credit. This part follows the people who look for those traces and the work that helps others encounter them. Discovery opens the question of continuing care; reading can give the next search its direction.'
n['bridges']['air-cuttack']='A voice travels from the radio into daily life. In the next part, songs carry their own stories beyond the screen.'
n['bridges']['tapu-mishra']='Behind a remembered voice is a shared production. The next part follows the lives and films shaped by such collaborations.'
n['bridges']['learning-cinema-together']='Learning leaves traces too. We turn now to the people who gather the records through which another generation can learn.'
n['bridges']['reading-odia-cinema']='The books leave us with further questions. The next stories bring us among people trying to make a film of their own.'
n['reading_paths']=[
 dict(title='From a written page to a listening audience',text='Follow language through adaptation, broadcasting and song.',chapters=['literature-and-screen','gopal-chhotray','air-cuttack','cinema-music']),
 dict(title='A film’s second life',text='Follow a restored film into the work of discovery, care and access.',chapters=['maya-miriga','surya-deo','searching-for-sita-bibaha','who-keeps-a-film-alive']),
 dict(title='The work of finding a story',text='Move between a writer, two films and the people who learn together.',chapters=['gourahari-das','pratikshya','daman','learning-cinema-together']),
 dict(title='Keeping creative work possible',text='Connect audiences and income with practical choices for the next production.',chapters=['commercial-successes','cinema-economics','cinema-futures'])
]
newpeople=[
 dict(label='Basanta Kumari Patnaik and Gopal Chhotray',relationship='A novel and its screen adaptation',text='Amada Bata connects Patnaik’s novel with Chhotray’s screenplay and dialogue.',slug='basanta-kumari-patnaik',source_note_id='film'),
 dict(label='Kalindi Charan Panigrahi and Mrinal Sen',relationship='Literature and direction',text='Matira Manisha brought Panigrahi’s novel into Sen’s Odia-language film.',slug='kalindi-charan-panigrahi',source_note_id='film'),
 dict(label='Tapu Mishra and Humane Sagar',relationship='Playback voices',text='Their voices share the title song of Ishq Tu Hi Tu.',slug='cinema-music',source_note_id='ishq'),
 dict(label='Biren Das and JD Centre of Art',relationship='A television collection’s continuing life',text='Das donated Ajira Orissa tapes; JDCA reports selected digitisation with NCAA at IGNCA.',slug=slug,source_note_id='jdca')]
labels={x['label'] for x in n['people_guide']}
n['people_guide']=[x for x in newpeople if x['label'] not in labels]+n['people_guide']
save(np,n)
print('Integrated',slug,'41 readings, 7 parts; overview reconciled; 4 reading paths')

