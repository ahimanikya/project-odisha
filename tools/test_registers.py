#!/usr/bin/env python3
"""Meaningful negative checks for the adopted Utkal register model; no source mutation."""
import copy,json
from pathlib import Path
import registers
root=Path(__file__).resolve().parents[1]/'kb'
home=json.loads((root.parent/'utkal.config.json').read_text())['record_directory']
base=json.loads((root/home/'records.json').read_text())
events=[json.loads(x) for x in (root/home/'activity.jsonl').read_text().splitlines() if x.strip()]
checks=[]
def reject(name,mutate):
 d=copy.deepcopy(base);es=copy.deepcopy(events);mutate(d,es)
 try:registers.validate(root,d,es)
 except ValueError:checks.append(name);return
 raise AssertionError('Invalid record accepted: '+name)
registers.validate(root,base,events);checks.append('valid records')
reject('duplicate ID',lambda d,e:d['work'].append(copy.deepcopy(d['work'][0])))
reject('dangling reference',lambda d,e:d['work'][0]['refs'].append(d['project']+'-WORK-999999'))
reject('AI approval',lambda d,e:d['decisions'][0]['actor'].update(kind='persona'))
reject('work used as approval',lambda d,e:d['work'][0].update(authorization=d['work'][0]['id']))
reject('external non-decision used as approval',lambda d,e:d['external_refs']['ODB-DEC-005'].update(kind='source'))
reject('published without release evidence',lambda d,e:d['work'][0].update(readiness='published'))
reject('release without destination',lambda d,e:d['releases'][0].update(destination=''))
reject('missing evidence',lambda d,e:d['work'][0]['evidence'].append('missing.md'))
reject('repository path traversal',lambda d,e:d['work'][0]['evidence'].append('../outside.md'))
assert registers.cell(False)=='False';checks.append('self-review false remains visible')
assert registers.render(base,events,'a')==registers.render(base,events,'a');checks.append('deterministic rendering')
assert registers.render(base,events,'a')!=registers.render(base,events,'b');checks.append('changed source fingerprint changes view')
registers.run(root,True);checks.append('dashboard current')
print(json.dumps({'result':'pass','checks':checks,'independent':False},indent=2))
