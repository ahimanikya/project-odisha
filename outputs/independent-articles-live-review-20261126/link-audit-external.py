#!/usr/bin/env python3
"""Read-only bounded external-link audit; one GET per distinct normalized URL.
Commons runs sequentially, five seconds apart; other targets use four workers.
No retry, authentication, third-party content reuse, or site mutation.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urlsplit, urldefrag, urlunsplit, parse_qsl, urlencode
from pathlib import Path
import json, re, time

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
OUT=HERE/'link-audit-external.json'

def public_url(url):
    """Retain destination evidence without session/challenge/tracking values."""
    parts=urlsplit(url)
    query=[(key,value) for key,value in parse_qsl(parts.query,keep_blank_values=True)
           if not re.search(r'cf_chl|__cf|token|client[_-]?id|session|gclid|fbclid|^utm_',key,re.I)]
    return urlunsplit((parts.scheme,parts.netloc,parts.path,urlencode(query),parts.fragment))

def main():
    if OUT.exists(): raise SystemExit('Refusing to overwrite existing audit')
    images=json.loads((ROOT/'kb/research/stories/independent-features/images.json').read_text())
    collection=json.loads((ROOT/'kb/research/stories/independent-features/collection.json').read_text())
    urls={}
    def add(url,context):
        if url.startswith('/') or url.startswith('https://github.com/'):
            return # Already covered in link-audit-site.json.
        key=urldefrag(url)[0]
        urls.setdefault(key,[]).append({'original_url':url,'context':context})
    for slug,image in images.items():
        for key in ('source','license_url'):
            if image.get(key): add(image[key],slug+':image-'+key)
    for a in collection['articles']:
        source=(ROOT/a['source_path']).read_text()
        for line in re.findall(r'^\[\^[^\]]+\]: (.*)$',source,re.M):
            for match in re.finditer(r'\]\((https?://)',line):
                start=match.start()+2; end=start; depth=1
                while end<len(line):
                    if line[end]=='(': depth+=1
                    if line[end]==')': depth-=1
                    if depth==0: break
                    end+=1
                add(line[start:end],a['slug']+':article-footnote')
    report={'started_at':datetime.now(timezone.utc).isoformat(),'mode':'public GET, bounded 65536-byte body, 20s timeout, no retries','target_count':len(urls),'results':[]}
    def save(): OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    def check(url):
        record={'url':url,'references':urls[url],'checked_at':datetime.now(timezone.utc).isoformat()}
        started=time.monotonic()
        try:
            request=Request(url,headers={'User-Agent':'ProjectOdisha-LinkReview/1.0 (editorial source-link availability check)','Accept-Encoding':'identity'})
            try:
                response=urlopen(request,timeout=20)
            except HTTPError as error:
                response=error
            with response:
                content=response.read(65536); record.update(http_status=response.status,final_url=public_url(response.url),content_type=response.headers.get('Content-Type',''),sample_bytes=len(content),retry_after=response.headers.get('Retry-After'))
                snippet=content.decode('utf-8',errors='replace')
                title=re.search(r'<title[^>]*>(.*?)</title>',snippet,re.I|re.S)
                if title: record['title']=re.sub(r'\s+',' ',title[1]).strip()[:500]
                code=response.status
                record['classification']=('reachable' if 200<=code<300 else 'confirmed_http_404' if code==404 else 'gone_http_410' if code==410 else 'rate_limited' if code==429 else 'access_restricted' if code in (401,403) else 'server_error' if code>=500 else 'other_http_status')
                if record['classification']=='reachable' and re.search(r'just a moment|access denied|attention required.*cloudflare|verify you are human',record.get('title',''),re.I):
                    record['classification']='challenge_page_200'
                # Never retain response bodies, challenge markup, or session values.
        except Exception as error:
            record.update(classification='transport_error',error=str(error))
        record['elapsed_seconds']=round(time.monotonic()-started,2)
        return record
    regular=[u for u in urls if urlsplit(u).hostname!='commons.wikimedia.org']
    commons=[u for u in urls if urlsplit(u).hostname=='commons.wikimedia.org']
    with ThreadPoolExecutor(max_workers=4) as pool:
        jobs={pool.submit(check,u):u for u in regular}
        for future in as_completed(jobs):
            result=future.result(); report['results'].append(result); save()
            if result['classification'] not in ('reachable',): print(result['classification'],result['url'],flush=True)
    for index,url in enumerate(commons):
        if index: time.sleep(5)
        result=check(url); report['results'].append(result); save()
        if result['classification']=='rate_limited':
            for deferred in commons[index+1:]:
                report['results'].append({'url':deferred,'references':urls[deferred],'classification':'not_requested_after_commons_rate_limit'})
            break
    report['finished_at']=datetime.now(timezone.utc).isoformat()
    report['status_counts']={status:sum(x['classification']==status for x in report['results']) for status in sorted({x['classification'] for x in report['results']})}
    save(); print(json.dumps(report['status_counts']),flush=True)

if __name__=='__main__': main()
