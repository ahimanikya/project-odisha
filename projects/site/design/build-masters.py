from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'design/wordmark-outlines.json').read_text())
brand=root/'public/assets/brand-v3';brand.mkdir(parents=True,exist_ok=True)
art=root.parent/'store/public/artwork/sea-and-stone-v1';art.mkdir(parents=True,exist_ok=True)
SEA='#1D4658';EARTH='#91462F';PAPER='#F2E6D0';STRAW='#C1A263'
def symbol(sail=EARTH,hull=SEA):
 return f'<g fill="{sail}"><path d="M76 86C55 65 35 59 18 65C35 42 39 25 40 8C61 17 75 40 76 62Z"/><path d="M84 86C105 65 125 59 142 65C125 42 121 25 120 8C99 17 85 40 84 62Z"/><path d="M20 73C38 65 59 73 75 91C55 81 37 78 20 80Z"/><path d="M140 73C122 65 101 73 85 91C105 81 123 78 140 80Z"/></g><path fill="{hull}" d="M8 90Q80 110 152 90Q128 128 80 128Q32 128 8 90Z"/>'
def letters(key,x,y,width,fill):
 d=data[key]; bx,by,w,h=d['bounds'];scale=width/w
 paths=''.join('<path d="'+p+'"/>' for p in d['paths'])
 return f'<g fill="{fill}" transform="translate({x} {y}) scale({scale}) translate({-bx} {-by})">{paths}</g>'
def svg(body,w,h,title,mm=None):
 size=f'width="{mm[0]}mm" height="{mm[1]}mm"' if mm else f'width="{w}" height="{h}"'
 return f'<svg xmlns="http://www.w3.org/2000/svg" {size} viewBox="0 0 {w} {h}" role="img"><title>{title}</title><desc>Utkal Sea and Stone design candidate v1. Creative direction Ahimanikya Satapathy; AI-assisted vector drawing. Lettering outlined from Noto Serif Oriya Bold under SIL OFL. Not approved for manufacture.</desc>{body}</svg>'
for name,s,h in [('colour',EARTH,SEA),('sea',SEA,SEA),('earth',EARTH,EARTH),('reverse',PAPER,PAPER)]:
 (brand/f'symbol-{name}.svg').write_text(svg(symbol(s,h),160,140,'Utkal book and boat'))
 for lang,key,width in [('en','en',600),('or','odia',280)]:
  textheight=data[key]['bounds'][3]*width/data[key]['bounds'][2]
  body=symbol(s,h)+letters(key,185,(140-textheight)/2,width,h)
  (brand/f'utkal-project-{lang}-{name}.svg').write_text(svg(body,205+width,140,'Project Odisha' if lang=='en' else 'ଉତ୍କଳ'))
# Single-ink small symbol: omit the two secondary page lines at tiny sizes.
small='<path fill="'+SEA+'" d="M74 88C54 63 35 59 18 67C34 43 39 23 40 8C62 20 74 42 74 65ZM86 88C106 63 125 59 142 67C126 43 121 23 120 8C98 20 86 42 86 65ZM8 96Q80 114 152 96Q128 132 80 132Q32 132 8 96Z"/>'
(brand/'symbol-small.svg').write_text(svg(small,160,140,'Utkal small book and boat'))
def waves(y,colour=SEA):
 return ''.join(f'<path d="M15 {y+i*14} Q40 {y-8+i*14} 65 {y+i*14} T115 {y+i*14} T165 {y+i*14} T215 {y+i*14} T265 {y+i*14}" stroke="{colour}" stroke-width="3" fill="none"/>' for i in range(3))
# Artwork canvases are proposed print dimensions; no blank product or sample approval implied.
designs={
 'tshirt-odia':(240,260,'<g transform="translate(40 12)">'+symbol(PAPER,EARTH)+'</g>'+letters('odia',36,158,168,PAPER)+'<path d="M80 242Q100 234 120 242T160 242" stroke="'+STRAW+'" stroke-width="3" fill="none"/>'),
 'jhula-english':(280,300,'<path d="M15 12H265M15 288H265" stroke="'+EARTH+'" stroke-width="4"/>'+ '<circle cx="228" cy="62" r="19" fill="'+EARTH+'"/><g transform="translate(60 24)">'+symbol(SEA,SEA)+'</g>'+letters('store',28,180,224,SEA)+waves(246)),
 'cup-english':(200,85,'<g transform="translate(13 6) scale(.43)">'+symbol()+'</g>'+letters('store',91,29,96,SEA)+'<g transform="translate(0 71) scale(.71 .22)">'+waves(0)+'</g><path d="M10 82H190" stroke="'+STRAW+'" stroke-width="1"/>'),
 'bottle-odia':(70,150,'<g transform="translate(10 10) scale(.3125)">'+symbol(PAPER,PAPER)+'</g>'+letters('odia',10,64,50,PAPER)+'<g transform="translate(0 122) scale(.25 .3)">'+waves(0,STRAW)+'</g><path d="M6 143H64" stroke="'+EARTH+'" stroke-width="1"/>')}
for name,(w,h,body) in designs.items():
 (art/(name+'.svg')).write_text(svg(body,w,h,name+' artwork study',(w,h)))
print('Generated 13 vector brand files and 4 outlined merchandise artwork candidates.')
