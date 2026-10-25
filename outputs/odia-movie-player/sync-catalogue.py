"""Assemble the local catalogue from cleared, retained source records."""
import json, pathlib, hashlib
root=pathlib.Path(__file__).resolve().parents[2]
read=lambda p:json.loads((root/p).read_text())
cat=read('kb/records/cinema-player-catalogue-2026-10-26.json')
browser=read('kb/records/cinema-player-browser-evidence-2026-10-26.json')
clips=read('kb/records/cinema-viewing-links-contemporary-2026-10-26.json')
verified={e['videoID']:e for e in browser['entries']}
entries=[]
for item in cat['entries']:
    e=dict(item)
    if 'hold' in e['verificationStatus'] and e['videoID'] not in verified:continue
    e['checkedOn']=cat['checkedOn']
    forms={'idiot':'ଇଡିଅଟ୍','pagala-karichu-tu':'ପାଗଳ କରିଛୁ ତୁ','kandhei-akhire-luha':'କଣ୍ଢେଇ ଆଖିରେ ଲୁହ','chhati-chiridele-tu':'ଛାତି ଚିରିଦେଲେ ତୁ'}
    if e['id'] in forms:
        e['titleOdia']=forms[e['id']]
        e['displayTitleNote']='Odia display title is an editorial reading form, not a verified transcription of the film credits.'
        e['sourceTitleOdiaNote']=e['displayTitleNote']
    e['verificationSummary']='Official upload metadata checked; embedded playback is untested.'
    if e['videoID'] in verified:
        e['evidenceURLs'].append(verified[e['videoID']]['channelURL'])
        e['verificationSummary']='Source upload and channel checked in a signed-in India browser; embedded playback is untested.'
        e['duration']=verified[e['videoID']]['duration']
        e['verificationStatus']='root source-page check cleared'
        e['researchInspection']=e.pop('inspection')
        e['inspection']='Earlier research gaps superseded by root source-page title, uploader and runtime check on 26 October 2026; embedded playback remains untested.'
        e['verificationRecord']='kb/records/cinema-player-browser-evidence-2026-10-26.json'
    entries.append(e)
odia={'DAMaN':'ଦମନ','Pratikshya':'ପ୍ରତୀକ୍ଷା','Ananta':'ଅନନ୍ତା','Karma':'କର୍ମ','Bou Buttu Bhuta':'ବୋଉ ବୁଟୁ ଭୂତ'}
for e in clips['links']:
    if e['type']!='official_trailer':continue
    entries.append(dict(id=e['film'].lower().replace(' ','-')+'-trailer',titleEnglish=e['film'],titleOdia=odia[e['film']],language='Odia',year=None,type='trailer',videoID=e['url'].split('v=')[1],watchURL=e['url'],sourceChannel=e['publisher'],evidenceURLs=[e['url']],rightsStatus='Official-hosted; copyright retained; not public domain',publicDomainVerified=False,checkedOn='2026-10-26',verificationSummary='Official trailer metadata checked; playback is untested.',inspection=e['evidence']))
a=clips['additional_primary_verification']
entries.append(dict(id='stree-kali-juga',titleEnglish='Stree · Kali Juga',titleOdia='ସ୍ତ୍ରୀ',language='Odia',year=1968,type='song-clip',videoID='OlNg8Y-g3Qk',watchURL=a['clip_verified']['url'],sourceChannel='GPG Productions',evidenceURLs=[a['clip_verified']['url'],a['archive_url'],a['observed_outbound_channel']],rightsStatus='Archive-linked source; copyright retained; not public domain',publicDomainVerified=False,checkedOn='2026-10-26',verificationSummary='Song title, uploader and family-archive channel link checked; playback is untested.',description='A song clip from Stree, shared by the channel linked from the Gour–Parbati archive. This is not the full film.'))
coverage=[{'source':'Amara Muzik Odia / Sidharth TV','status':'Selected official uploads checked','note':'A bounded selection; not a complete channel catalogue.'},{'source':'Gour–Parbati archive / GPG Productions','status':'One archive-linked song clip checked','note':'Song clip, not a full film.'}]
extra_path=root/'kb/records/cinema-player-expanded-youtube-2026-10-26.json'
if extra_path.exists():
    extra=json.loads(extra_path.read_text())
    if extra.get('status') not in ('incremental-research',):
        for item in extra['entries']:
            e=dict(item)
            e.pop('evidenceCapture',None)
            reading_forms={'tate-mo-rana':'ତତେ ମୋ ରାଣ','mun-raja-tu-rani':'ମୁଁ ରାଜା ତୁ ରାଣୀ','kehi-jane-bhala-lagere':'କେହି ଜଣେ ଭଲ ଲାଗେରେ','bhala-paye-tate':'ଭଲ ପାଏ ତତେ ୧୦୦ ରୁ ୧୦୦','abhimanyu':'ଅଭିମନ୍ୟୁ','ama-bhitare':'ଆମ ଭିତରେ କିଛି ଅଛି','mu-eka-tumara':'ମୁଁ ଏକା ତୁମର','tu-mo-arambha':'ତୁ ମୋ ଆରମ୍ଭ ତୁ ମୋ ଶେଷ','super-michhua':'ସୁପର ମିଛୁଆ','raja-jhia':'ରାଜା ଝିଅ ସଙ୍ଗେ ହୋଇଗଲା ଭାବ','family-no-1':'ଫ୍ୟାମିଲି ନଂ ୧'}
            if not e.get('titleOdia') and e['id'] in reading_forms:
                e['titleOdia']=reading_forms[e['id']]
                e['displayTitleNote']='Odia display title is an editorial reading form, not a verified transcription of the film credits.'
                e['sourceTitleOdiaNote']=e['displayTitleNote']
            e.setdefault('checkedOn',extra.get('date','2026-10-26'))
            e.setdefault('verificationSummary','Primary indexed source upload and channel metadata checked; embedded playback is untested.')
            if not any(x.get('videoID')==e.get('videoID') for x in entries):entries.append(e)
        human_notes={
            'Sidharth TV':'Exact-title searches recovered primary uploader metadata for Sidharth TV. The network website lists its official channel. Alternate uploads were excluded; this is not a complete channel inventory.',
            'Amara':'New Kabula Barabula Searching Laila and Inspector Sana candidates remain held because their uploader was not confirmed. The existing DAMaN listing was not counted as a new addition.',
            'Tarang':'Love Station was a 15-minute abridgement on Tarang TV. Searches for Tu Mo Love Story, Agastya and Jaga Hatare Pagha did not establish a full upload. Other results were short clips, not full films.',
            'Saregama':'Full-film searches, including Sindura Bindu, recovered the song Na Jaa Radhika on Saregama Regional. It was excluded from the full-film count.',
            'Pen / Shemaroo':'Searches returned Hindi material and an explicitly Bengali-dubbed Something Something listing. These were excluded from the Odia collection.',
            'NFDC / Cinemas of India':'The search did not establish an exact official Odia full-film upload. This does not establish that none exists.'
        }
        for row in extra.get('coverage',[]):
            coverage.append({**row,'note':human_notes.get(row['source'],row.get('note',''))})
provider_path=root/'kb/records/cinema-player-expanded-providers-2026-10-26.json'
if provider_path.exists():
    providers=json.loads(provider_path.read_text())
    for e in providers['entries']:
        entries.append(dict(id=e['id'],filmID=e['filmId'],titleEnglish=e['titleEn'],titleOdia=e.get('titleOr'),year=e.get('year'),genres=e.get('genres',[]),language=e['language'],languageType=e.get('languageVersion','unknown'),type=e['format'],access='provider-listing',watchURL=e['sourceUrl'],sourceChannel=e['provider'],evidenceURLs=e.get('evidenceURLs',[e['sourceUrl']]),rightsStatus='Provider listing; copyright retained; no public-domain determination',publicDomainVerified=False,checkedOn=e['checkedAt'],verificationSummary=e['sourceNotes'],classificationNote=e.get('yearEvidence','Year and genre follow the provider listing; independent release-date verification is not implied.'),displayTitleNote=e.get('titleOrStatus',''),accessNote='Opens on the provider’s site. Subscription, rental, sign-in and regional conditions may apply; current playback access is not confirmed.'))
    coverage+=providers.get('coverage',[])
for e in entries:
    e.setdefault('access','official-upload')
    e.setdefault('filmID',e.get('filmId',e['id'].removesuffix('-trailer') if e['id']!='stree-kali-juga' else 'stree-1968'))
    e.setdefault('languageType',e.get('languageVersion','unknown'))
    e.setdefault('genres',[])
    e.setdefault('checkedOn','2026-10-26')
    if e.get('limits')=='Release year conflict: uploader 2004; ZEE5 catalogue 2005. Retain null.':e['limits']='Release-year sources differ: the uploader lists 2004 and ZEE5 lists 2005. The year remains unverified here.'
output={'checkedOn':'2026-10-26','entries':entries,'coverage':coverage}
(root/'outputs/odia-movie-player/catalogue.js').write_text('window.ODIA_CATALOGUE='+json.dumps(output,ensure_ascii=False,indent=2)+';\n')
(root/'outputs/odia-movie-player/catalogue.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print(f'{len(entries)} entries assembled')
