"""Check this OKF bundle's structure, references and saved growth arithmetic.

This is a scoped validator for this bundle, not an OKF certification authority
or a source-authentication service. It does not make network requests.
"""
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote,urlsplit
import json,math,re,sys
from kb_io import ROOT,concepts,read_concept,collection_paths

errors=[]; checked_links=0
def check(condition,message):
    if not condition: errors.append(message)

def timestamp(value,label):
    try:
        parsed=datetime.fromisoformat(value.replace('Z','+00:00'))
        check(parsed.utcoffset() is not None,label+' lacks offset')
    except Exception: errors.append(label+' is not an ISO datetime')

def link_target(path,link):
    global checked_links
    link=link.strip('<>')
    if urlsplit(link).scheme or link.startswith('#'): return
    clean=unquote(link.split('#')[0])
    target=ROOT/clean.lstrip('/') if clean.startswith('/') else path.parent/clean
    if not target.exists() and re.fullmatch(r'/people/[^/]+/', clean):
        person_source = ROOT / (clean.strip('/') + '.md')
        if person_source.is_file():
            target = person_source
    check(target.exists(),str(path.relative_to(ROOT))+': broken link '+link)
    checked_links+=1

all_concepts=list(concepts())
for path in collection_paths():
    raw=path.read_text(encoding='utf-8')
    if path.name=='index.md':
        if path==ROOT/'index.md':
            check(not raw.startswith('---\n'),'Research is a group index inside the project bundle; no root frontmatter')
        else: check(not raw.startswith('---\n'),str(path)+': subindex has frontmatter')
    elif path.name=='log.md':
        check(not raw.startswith('---\n'),str(path)+': log has frontmatter')
        check(bool(re.search(r'^## \d{4}-\d{2}-\d{2}$',raw,re.M)),'Log lacks date header')
    else:
        meta,body=read_concept(path)
        check(isinstance(meta.get('type'),str) and bool(meta['type'].strip()),str(path)+': missing type')
        check(meta.get('status') in {'draft','stable','deprecated'},str(path)+': invalid status')
        if meta.get('generated'):
            check(bool(meta['generated'].get('by')),str(path)+': missing generated actor')
            timestamp(meta['generated'].get('at',''),str(path)+' generated.at')
        if meta.get('stale_after'): timestamp(meta['stale_after'],str(path)+' stale_after')
        verified=meta.get('verified',[])
        if isinstance(verified,dict):verified=[verified]
        for event in verified:
            timestamp(event['at'],str(path)+' verified.at')
            check(not event['by'].startswith('human:'),str(path)+': unexpected human verification')
        refs=meta.get('sources',[]); ids=[s.get('id') for s in refs]
        check(len(ids)==len(set(ids)),str(path)+': duplicate source ids')
        for s in refs:
            check(bool(s.get('resource')),str(path)+': source resource missing')
        notes=set(re.findall(r'\[\^([^\]]+)\]',body))
        defs=set(re.findall(r'^\[\^([^\]]+)\]:',body,re.M))
        check(notes<=set(ids),str(path)+': footnote missing matching source id')
        check(notes<=defs,str(path)+': footnote definition missing')
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',raw): link_target(path,target)

g=json.loads((ROOT/'references/data/industry-growth-data.json').read_text())
calculations=0
for s in g['real_sector_series']:
    first,last,years=s['values'][0],s['values'][-1],len(s['periods'])-1
    change=(last/first-1)*100;cagr=((last/first)**(1/years)-1)*100
    check(math.isclose(change,s['total_change_pct'],abs_tol=1e-8),s['sector']+' change mismatch')
    check(math.isclose(cagr,s['cagr_pct'],abs_tol=1e-8),s['sector']+' CAGR mismatch');calculations+=2
for s in g['supporting_comparisons']:
    first,last,years=s['start_value'],s['end_value'],s['elapsed_years']
    check(math.isclose((last/first-1)*100,s['total_change_pct'],abs_tol=1e-8),s['metric']+' change mismatch')
    check(math.isclose(((last/first)**(1/years)-1)*100,s['cagr_pct'],abs_tol=1e-8),s['metric']+' CAGR mismatch');calculations+=2
old=json.loads((ROOT/'references/data/evidence-ledger.json').read_text())
evidence=[c for c in all_concepts if c['id'].startswith('evidence/')]
check(len(evidence)==len(old['entries'])==71,'Evidence migration count mismatch')
for e in old['entries']:
    matches=[c for c in evidence if c.get('legacy_id')==e['id']]
    check(len(matches)==1,'Evidence id missing/duplicated: '+e['id'])
    if matches:
        for field in ['value','units','period','geography']:
            check(matches[0][field]==e[field],e['id']+' altered '+field)
indexed=json.loads((ROOT/'search-index.json').read_text())
check({c['id'] for c in indexed}=={c['id'] for c in all_concepts},'Search export contains missing/extra IDs')
report={'checked_at':datetime.now().astimezone().isoformat(timespec='seconds'),'result':'PASS' if not errors else 'FAIL','concepts':len(all_concepts),'local_link_checks':checked_links,'growth_arithmetic_checks':calculations,'preserved_evidence_records':len(evidence),'errors':errors,'scope':'Structure, internal links, source-footnote matching, migration values and arithmetic; not independent factual or legal certification.'}
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(bool(errors))
