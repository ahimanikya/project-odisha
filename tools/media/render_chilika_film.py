#!/usr/bin/env python3
"""Render the approved free-footage Chilika review direction.
Requires ffmpeg (supply --ffmpeg) and original licensed sources in --sources.
Original editorial assembly and synthetic score for Project Odisha, with AI assistance.
"""
import argparse, array, hashlib, json, math, random, subprocess, wave
from pathlib import Path

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--ffmpeg',required=True)
parser.add_argument('--sources',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
a=parser.parse_args();a.output.mkdir(parents=True,exist_ok=True)
work=a.sources/'v2-render';work.mkdir(exist_ok=True)
serif='/System/Library/Fonts/Supplemental/Georgia.ttf'
sans='/System/Library/Fonts/Supplemental/Arial.ttf'
def run(args):
 subprocess.run([a.ffmpeg,'-hide_banner','-loglevel','error',*args],check=True)
def text_filter(text,key,y,size=36,color='0x203e43',face=sans):
 p=work/(key+'.txt');p.write_text(text)
 return f"drawtext=fontfile='{face}':textfile='{p}':fontsize={size}:fontcolor={color}:x=(w-tw)/2:y={y}"

shots=[
 {'key':'wetland','file':'mangalajodi-original.mp4','meta':'mangalajodi-original.info.json','start':2,'duration':10,'title':'Mangalajodi · Between the reeds'},
 {'key':'ferry','file':'ferry.mp4','meta':'RCnSeJtCOqw.info.json','start':8,'duration':10,'title':'Chilika · Out on the water'},
 {'key':'sunset','file':'source-sunset.mp4','meta':'source-sunset.info.json','start':4,'duration':14,'title':'Chilika · The evening return'},
]
for shot in shots:
 filters='scale=1920:1080:flags=lanczos,setsar=1,fps=30,settb=1/30,setpts=PTS-STARTPTS'
 if shot['key']=='wetland':
  filters+=",drawbox=x=550:y=48:w=820:h=205:color=0xf5eddf@0.93:t=fill:enable='between(t,0,4)'"
  filters+=','+text_filter('CHILIKA','opening',76,74,face=serif)+":enable='between(t,0,4)'"
  filters+=','+text_filter('A little closer to the water','opening-sub',168,32)+":enable='between(t,0,4)'"
  filters+=',fade=t=in:st=0:d=0.6'
 filters+=",drawbox=x=60:y=958:w=700:h=65:color=0x203e43@0.7:t=fill:enable='between(t,4,8)'"
 p=work/(shot['key']+'-label.txt');p.write_text(shot['title'])
 filters+=f",drawtext=fontfile='{sans}':textfile='{p}':fontsize=31:fontcolor=0xf5eddf:x=82:y=976:enable='between(t,4,8)'"
 run(['-ss',str(shot['start']),'-i',str(a.sources/shot['file']),'-t',str(shot['duration']),'-an','-vf',filters,'-c:v','libx264','-crf','21','-preset','fast','-pix_fmt','yuv420p','-y',str(work/(shot['key']+'.mp4'))])

# Cross-dissolves connect separate editorial scenes, not a continuous route.
run(['-i',str(work/'wetland.mp4'),'-i',str(work/'ferry.mp4'),'-i',str(work/'sunset.mp4'),'-filter_complex',
 '[0:v][1:v]xfade=transition=fade:duration=0.8:offset=9.2[v01];[v01][2:v]xfade=transition=fade:duration=0.8:offset=18.4,fade=t=out:st=31.8:d=0.6[v]',
 '-map','[v]','-an','-c:v','libx264','-crf','21','-preset','fast','-pix_fmt','yuv420p','-r','30','-y',str(work/'scenes.mp4')])

credits=[
 ('Project Odisha',112,62,'0x203e43',serif),
 ('Discover Odisha. Imagine the possibilities.',208,35,'0x9f4731',sans),
 ('REAL CHILIKA FOOTAGE',318,24,'0x203e43',sans),
 ('Pratap Padhi · Mangalajodi, Chilika Lake, Odisha (2016)',375,31,'0x203e43',sans),
 ('youtube.com/watch?v=QCIHglqlJMc',421,25,'0x203e43',sans),
 ('Ajit Satam · ferry ride @ Chilika lake (2019)',493,31,'0x203e43',sans),
 ('youtube.com/watch?v=RCnSeJtCOqw',539,25,'0x203e43',sans),
 ('Ajit Satam · sunset at chilika lake. (2019)',611,31,'0x203e43',sans),
 ('youtube.com/watch?v=EMHBwT5_8hc',657,25,'0x203e43',sans),
 ('Footage: CC BY 3.0 · creativecommons.org/licenses/by/3.0/',750,27,'0x203e43',sans),
 ('Edited excerpts, transitions and titles; original audio replaced.',800,26,'0x203e43',sans),
 ('Original synthetic ambient score · Project Odisha, with AI assistance',851,26,'0x203e43',sans),
 ('Review draft · No AI-generated scenery · Not a continuous itinerary',925,25,'0x9f4731',sans),
]
cf=','.join(text_filter(t,'credit-'+str(y),y,size,c,face) for t,y,size,c,face in credits)
run(['-f','lavfi','-i','color=c=0xf5eddf:s=1920x1080:r=30:d=10','-vf',cf,'-c:v','libx264','-crf','20','-preset','fast','-pix_fmt','yuv420p','-y',str(work/'credits.mp4')])
concat=work/'concat.txt';concat.write_text(''.join("file '"+str(work/f)+"'\n" for f in ['scenes.mp4','credits.mp4']))
run(['-f','concat','-safe','0','-i',str(concat),'-c','copy','-y',str(work/'silent.mp4')])

# A newly composed sparse pentatonic score, no samples or field-recording claim.
sr=48000;duration=42.4;n=int(sr*duration);rng=random.Random(2781)
notes=[(1.5,293.665),(5.8,440),(9.7,391.995),(14.2,329.628),(18.8,293.665),(23.1,261.626),(27.6,329.628),(31.4,293.665),(35.2,261.626)]
pcm=array.array('h');noise=0.;peak=0.;sum_sq=0.
for i in range(n):
 t=i/sr;envelope=min(1.,t/2.,max(0.,(duration-t)/4.))
 pad=0.012*(math.sin(2*math.pi*130.813*t)+0.45*math.sin(2*math.pi*195.998*t))*(0.8+0.2*math.sin(2*math.pi*0.045*t))
 tone=0.
 for onset,hz in notes:
  d=t-onset
  if 0<=d<7:
   env=(1-math.exp(-d*5))*math.exp(-d/2.1)
   tone+=0.06*env*(math.sin(2*math.pi*hz*d)+0.2*math.sin(2*math.pi*hz*2*d))
 noise=0.985*noise+0.015*rng.uniform(-1,1)
 value=envelope*(pad+tone+0.035*noise*(0.65+0.35*math.sin(2*math.pi*0.17*t)))
 left=value;right=value*0.985
 peak=max(peak,abs(left),abs(right));sum_sq+=left*left
 pcm.extend((int(max(-1,min(1,left))*32767),int(max(-1,min(1,right))*32767)))
wav=work/'original-score.wav'
with wave.open(str(wav),'wb') as w:
 w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes(pcm.tobytes())
target=a.output/'chilika-water-journey-review-v2.mp4'
run(['-i',str(work/'silent.mp4'),'-i',str(wav),'-map','0:v:0','-map','1:a:0','-c:v','copy','-af','volume=2.8','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart','-y',str(target)])
run(['-ss','3','-i',str(target),'-frames:v','1','-y',str(a.output/'poster-v2.jpg')])
run(['-i',str(target),'-vf','fps=1/4,scale=480:-1,tile=4x3','-frames:v','1','-y',str(work/'review-contact.jpg')])
run(['-i',str(target),'-f','null','-'])
sources=[]
for shot in shots:
 meta=json.loads((a.sources/shot['meta']).read_text())
 assert meta.get('license')=='Creative Commons Attribution license (reuse allowed)'
 sources.append({k:meta.get(k) for k in ['id','title','uploader','upload_date','webpage_url','license']}|{'license_url':'https://creativecommons.org/licenses/by/3.0/','source_in_seconds':shot['start'],'source_duration_used_seconds':shot['duration'],'sha256':hashlib.sha256((a.sources/shot['file']).read_bytes()).hexdigest()})
record={'status':'local_candidate_not_published','sources':sources,'output':{'file':target.name,'duration_seconds':42.4,'canvas':'1920x1080','frame_rate':30,'note':'Mangalajodi source is 720p, resized to the 1080p canvas; other sources are 1080p.','sha256':hashlib.sha256(target.read_bytes()).hexdigest()},'changes':['Excerpt selection','0.8-second cross-dissolves','Opening title, location captions and ten-second credits','Original audio omitted; newly composed synthetic ambient score added'],'audio':{'samples':'none','field_recording':False,'traditional_music_claim':False,'mix_gain':2.8,'estimated_mix_peak_dbfs':20*math.log10(peak*2.8),'pcm_peak_dbfs':20*math.log10(peak),'pcm_rms_dbfs':20*math.log10(math.sqrt(sum_sq/n))},'purchase_cost':0,'generated_scenery':False,'validation':{'decode':'passed','sampled_output_frames':'pending inspection','listening':'human review pending'},'rejected_source':{'id':'VFW9hYgsnsc','reason':'Compilation description admits third-party fair-use clips; location and underlying reuse rights not established.'}}
(a.output/'provenance-v2.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'file':str(target),'bytes':target.stat().st_size,'audio':record['audio']},indent=2))
