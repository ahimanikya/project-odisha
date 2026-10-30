from pathlib import Path
import json
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
from pypdf import PdfReader
R=Path(__file__).resolve().parents[2];out=R/'tmp/pdfs/2026-10-30-deep-review'
for edition in ['digital','print']:
 folder=out/edition;rec=json.loads((folder/'book-build-2026-10-30-deep-review.json').read_text());p=R/rec['pdf'];doc=pdfium.PdfDocument(p);pdf=PdfReader(p);render=folder/'review-pages';render.mkdir(exist_ok=True);sheetdir=folder/'contact';sheetdir.mkdir(exist_ok=True);sparse=[]
 for start in range(0,len(doc),24):
  sheet=Image.new('RGB',(1600,6*430),'#d8d8d8');draw=ImageDraw.Draw(sheet)
  for idx in range(start,min(start+24,len(doc))):
   im=doc[idx].render(scale=1).to_pil().convert('RGB');im.save(render/f'p{idx+1:03}.png');im.thumbnail((270,405));x=((idx-start)%4)*400+65;y=((idx-start)//4)*430+22;sheet.paste(im,(x,y));draw.text((x,y-16),f'{edition} {idx+1}',fill='#111111')
   text=pdf.pages[idx].extract_text() or ''
   if len(text.split())<65:sparse.append({'page':idx+1,'words':len(text.split()),'text':text[:700]})
  sheet.save(sheetdir/f'{start+1:03}-{min(start+24,len(doc)):03}.jpg',quality=88)
 (folder/'render-receipt.json').write_text(json.dumps({'pdf_sha256':rec['pdf_sha256'],'pages':len(doc),'pdf':rec['pdf']},indent=2)+'\n');(folder/'sparse-review.json').write_text(json.dumps(sparse,ensure_ascii=False,indent=2)+'\n');print(edition,len(doc),'rendered',len(sparse),'sparsecandidates')
