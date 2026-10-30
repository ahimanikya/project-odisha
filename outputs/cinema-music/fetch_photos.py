import json, pathlib, urllib.request, urllib.parse, hashlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
DEST = ROOT / 'kb/research/media/cinema-series/music-2026-10-30'
DEST.mkdir(parents=True, exist_ok=True)
FILES = {
 'prafulla-kar': 'File:Prafulla Kar 01.jpg',
 'pranab-patnaik': 'File:Pranab Patnaik.jpg',
 'tapu-mishra': 'File:Tapu Mishra.jpg',
 'cinema-music': 'File:Odia singer Trupti Das felicitated during 2nd Odisha State Television Award 01 (cropped).JPG',
}
def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':'ProjectOdishaResearch/1.0 (editorial image research)'})
 with urllib.request.urlopen(req,timeout=45) as res:return res.read()
for slug,title in FILES.items():
 target=DEST/(slug+'.jpg')
 if target.exists():
  print(slug,'already retained',flush=True)
  continue
 query=urllib.parse.urlencode({'action':'query','format':'json','prop':'imageinfo','iiprop':'url|size|extmetadata','titles':title})
 metadata=DEST/(slug+'-commons.json')
 raw=metadata.read_bytes() if metadata.exists() else fetch('https://commons.wikimedia.org/w/api.php?'+query)
 data=json.loads(raw);info=next(iter(data['query']['pages'].values()))['imageinfo'][0]
 (DEST/(slug+'-commons.json')).write_bytes(raw)
 try:
  target.write_bytes(fetch(info['url']))
 except Exception as error:
  print(slug,type(error).__name__,str(error),flush=True)
  continue
 print(slug,info['width'],info['height'],info['extmetadata'].get('LicenseShortName'),hashlib.sha256(target.read_bytes()).hexdigest(),flush=True)
