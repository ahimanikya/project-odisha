import json, hashlib
from pathlib import Path
from datetime import datetime, timezone, timedelta
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).parent
DELIVERY_DATE=datetime.now(timezone(timedelta(hours=5,minutes=30))).date().isoformat()
rel="records/cinema-bapa-publication-2026-11-07.json"
def read(p): return json.loads((ROOT/p).read_text())
def write(p,d): (ROOT/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n")
live=read("outputs/cinema-bapa-publication-20261107/live-verification.json")
run=read("outputs/cinema-bapa-publication-20261107/deployment.json")
pr=read("outputs/cinema-bapa-publication-20261107/merged-pr.json")
ci=read("outputs/cinema-bapa-publication-20261107/hosted-result.json")
assert live["status"]=="PASS" and run["conclusion"]=="success" and pr["state"]=="MERGED" and ci["conclusion"]=="success"
assert run["headSha"]==pr["mergeCommit"]["oid"] and ci["headSha"]==pr["headRefOid"]
assets=read("outputs/cinema-bapa-publication-20261107/remote-assets.json")
manifest=read("outputs/cinema-bapa-publication-20261107/book-release-manifest.json")
assert assets["status"]=="PASS" and len(assets["assets"])==len(manifest["assets"])
verified={a["filename"]:a for a in assets["assets"]}
for expected in manifest["assets"]:
 actual=verified[expected["filename"]]
 assert actual["verified"] and actual["status"]==200
 assert actual["sha256"]==expected["sha256"] and actual["bytes"]==expected["bytes"] and actual["url"]==expected["planned_release_url"]
d=read("kb/"+rel)
d.update(status="published_verified", publication_performed=True, scope_released=True, quality_review="outputs/cinema-bapa-publication-20261107/review.json")
d["counts"]={"online_readings":52,"book_readings":49,"digital_pages":271,"print_pages":276,"source_notes":538}
d["asset_release"].update(status="published_anonymous_hash_verified",verification="outputs/cinema-bapa-publication-20261107/remote-assets.json")
d["publication"].update(status="published_verified",required_check_result="success",merge=pr["mergeCommit"]["oid"],deployment_run=run["databaseId"],deployment_result=run["conclusion"],live_routes_verified=len(live["routes"]),live_receipt="outputs/cinema-bapa-publication-20261107/live-verification.json",limits="Targeted new-claim review and live release verification; no whole-book new fact-check or mobile manual re-audit.")
d["pull_request"]=pr["url"]
d["deployment"]={"conclusion":run["conclusion"],"run_id":run["databaseId"],"head_sha":run["headSha"],"url":run["url"]}
d["verified_routes"]=[x["route"] for x in live["routes"]]
d["completed_at"]=live["verified_at"]
write("kb/"+rel,d)
p="kb/records/article-editorial-rollout.json";r=read(p)
for x in r["items"]:
 if x["id"] not in ("POD-EDIT-804","POD-EDIT-810"):continue
 old=x.get("publication_receipt")
 if old and old!=rel and old not in x.setdefault("prior_publication_receipts",[]):x["prior_publication_receipts"].append(old)
 x["publication_receipt"]=rel
 x["latest_verified_publication"]={"receipt":rel,"date":DELIVERY_DATE,"source_sha256":x["local_revision_followup"]["source_sha256"]}
 x["local_revision_followup"].update(status="published_verified",published=True,publication_receipt=rel)
 x["publication_authorization"]="Founder explicitly requested publication of these updates and book downloads on 7 November 2026."
write(p,r)
p="kb/team/operations.json";o=read(p)
for v in o["parallel_programmes"]:
 if v.get("name")=="Cinema research and story expansion":
  v.update(handoff=rel,status="published_verified",note="Two reviewed Bapa additions and 271/276-page book downloads published and live verified; payment remains unresolved. Scope released; other ownership preserved.",active_article=None,scope_released=True)
write(p,o)
p=ROOT/"kb/index.md";s=p.read_text();old=next(x for x in s.splitlines() if x.startswith("Current cinema publication:"));new="Current cinema publication: [Bapa article and book release]("+rel+"). Published and live verified: Gourahari Das, Pratikshya, and 271/276-page book downloads. Focused fact-check passed; television and recognition remain attributed accounts, payment unverified. Scope released."
p.write_text(s.replace(old,new))
e={"id":"POD-HIS-CINEMA-BAPA-DELIVERY-20261107","recorded_on":DELIVERY_DATE,"status":"published_verified","title":"Bapa television history and book editions published","summary":"PR 702 passed hosted validation and deployed. Gourahari Das and Pratikshya retain attributed author accounts; no payment conclusion. New digital 271 / print 276-page downloads verified anonymously against reviewed bytes; 52 online readings, 49 book chapters and 538 notes. Earlier editions preserved. No programme credit or human specialist approval claimed.","record":rel}
p=ROOT/"kb/history/ledger.jsonl"
if e["id"] not in p.read_text():
 with p.open("a") as f:f.write(json.dumps(e,ensure_ascii=False)+"\n")
p=ROOT/"kb/history/LEDGER.md"
if "Bapa television history and book editions published" not in p.read_text():
 with p.open("a") as f:f.write("\n\n### "+DELIVERY_DATE+" · Bapa television history and book editions published\n\nTwo attributed additions and both current books published; live text, links and downloaded bytes verified. Payment remains unresolved. [Receipt](../"+rel+").\n")
print("Recorded actual verified publication; no additional programme credit.")
