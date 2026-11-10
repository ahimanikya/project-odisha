import concurrent.futures, hashlib, json, urllib.request
from pathlib import Path
base="https://projectodisha.org"
root=Path(__file__).resolve().parents[3]
paths=["/assets/cinema/player/catalogue.js","/assets/cinema/player/app.js","/assets/cinema/player/core.js"]
def check(path):
    url=base+path+"?edition=cinema-viewing-20261110"
    with urllib.request.urlopen(url,timeout=45) as response:
        data=response.read(); status=response.status
    local=(root/"projects/site/public"/path.lstrip("/")).read_bytes()
    assert data==local, path
    return {"url":base+path,"status":status,"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest(),"matches_reviewed":True}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(check,paths))
with urllib.request.urlopen(base+"/cinema/watch/?edition=cinema-viewing-20261110",timeout=45) as response:
    html=response.read().decode()
    assert response.status==200
assert "playback conditions vary by title" in html
assert "embedded playback has not been tested" not in html
receipt={"status":"PASS","assets":results,"page":base+"/cinema/watch/","page_fallback_copy_current":True,"limits":"HTTP asset verification; browser interaction recorded separately."}
(root/"outputs/cinema-viewing-refresh-20261110/root/live-verification.json").write_text(json.dumps(receipt,indent=2)+"\n")
print(json.dumps(receipt,indent=2))
