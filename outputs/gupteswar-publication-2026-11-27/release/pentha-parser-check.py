"""Offline diagnosis only; recheck retained Pentha response without new HTTP requests.

Preserves the original failure. HTML text nodes concatenate across inline tags;
only actual text whitespace is collapsed. No punctuation/typography replacements.
"""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import hashlib,json,re,difflib,subprocess
ROOT=Path('/Users/ahimanikya/.codex/worktrees/odisha-hill-destinations/publication-checkout')
CAP=ROOT/'outputs/gupteswar-publication-2026-11-27/pentha-live-20261127T023228Z'
SOURCE='kb/research/stories/independent-features/nature/pentha.md'
H=lambda b:hashlib.sha256(b).hexdigest()
class NoteText(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.text=[]
 def handle_data(self,data):self.text.append(data)
 def handle_starttag(self,tag,attrs):
  if tag in ['p','div','li','br']:self.text.append('\n')
 def handle_endtag(self,tag):
  if tag in ['p','div','li']:self.text.append('\n')
def text_nodes(html):
 p=NoteText();p.feed(html);p.close();return ' '.join(''.join(p.text).split())
raw=(CAP/'page.html').read_bytes();old_bytes=(CAP/'report.json').read_bytes();old=json.loads(old_bytes)
assert H(raw)==old['sha256']=='c6ddd31b4ec965d54d222fdb4cb8e2980e8408da87ee9cbc9528b319e04a2035'
assert old['result']=='FAIL' and old['checks']['exact_corrected_note_prose'] is False
assert all(value for key,value in old['checks'].items() if key!='exact_corrected_note_prose')
source=(ROOT/SOURCE).read_bytes();assert H(source)==old['source_sha256']=='4928ed9e61f9e9497c3b06798f333c193b99cf4ca414db480a408da51dcc142e'
deployed_source=subprocess.check_output(['git','show',old['release_commit']+':'+SOURCE],cwd=ROOT)
assert deployed_source==source
md=source.decode();html=raw.decode();note=re.findall(r'<li\b[^>]*id="user-content-fn-2"[^>]*>(.*?)</li>',html,re.S);assert len(note)==1
clean=re.sub(r'<a\b[^>]*data-footnote-backref[^>]*>.*?</a>','',note[0],flags=re.S)
source_note=re.search(r'^\[\^2\]: (.+)$',md,re.M)[1]
expected=' '.join(re.sub(r'\[([^]]+)\]\([^)]+\)',r'\1',source_note).replace('*','').split())
buggy=' '.join(unescape(re.sub('<[^>]+>',' ',clean)).split());corrected=text_nodes(clean)
assert corrected==expected
ops=[{'operation':tag,'expected_span':[i,j],'buggy_span':[k,l],'expected_text':expected[i:j],'buggy_text':buggy[k:l]} for tag,i,j,k,l in difflib.SequenceMatcher(a=expected,b=buggy,autojunk=False).get_opcodes() if tag!='equal']
assert len(ops)==4 and all(x['operation']=='insert' and x['buggy_text']==' ' for x in ops)
result={'result':'PARSER_BUG_CONFIRMED_FROM_RETAINED_RESPONSE','observed_deployment':old['deployment'],'observed_release_commit':old['release_commit'],'original_report':str(CAP/'report.json'),'original_report_sha256':H(old_bytes),'original_result_preserved':'FAIL','retained_page':str(CAP/'page.html'),'retained_page_sha256':H(raw),'source':SOURCE,'source_sha256':H(source),'deployed_git_source_exact':True,'raw_note_html':note[0],'expected_source_text':expected,'original_checker_text':buggy,'corrected_text_node_result':corrected,'exact_corrected_text_matches_reviewed_source':True,'spurious_insertions':ops,'cause':'Original checker replaces every HTML tag with a space. Closing inline emphasis/link tags immediately before commas therefore introduce four spaces absent from both source and HTML text nodes.','correction':'Use HTMLParser text-node concatenation across inline tags; collapse only real text whitespace. The dedicated note wrapper may supply block boundaries. Do not globally remove spaces before punctuation or normalize quotation/dash characters.','scope':'Offline examination of the original HTTP200 response already captured by root; no fresh HTTP verification or full-page delivery acceptance. Existing3notes/returns/source-link checks were true and remain preserved.','changed_files':['/private/tmp/gupteswar-pentha-parser-check.py','/private/tmp/gupteswar-pentha-diagnosis.json'],'limits':['Root established successful deployment externally; this diagnosis checks retained evidence and deployed source bytes, not a freshGitHub/API request.','No tracked source/helper/report modified.','This is a targeted checker diagnosis, not a foreign article factual re-review.']}
assert H((CAP/'page.html').read_bytes())==H(raw) and H((CAP/'report.json').read_bytes())==H(old_bytes)
Path('/private/tmp/gupteswar-pentha-diagnosis.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':result['result'],'spurious_space_insertions':len(ops),'exact_source_text_match':corrected==expected,'diagnosis':'/private/tmp/gupteswar-pentha-diagnosis.json'}))
