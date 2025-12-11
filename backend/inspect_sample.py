import json
from collections import Counter

# Load file with UTF-8/UTF-16 auto detect
raw = open("sample.json", "rb").read()
if raw[:2] in (b"\xff\xfe", b"\xfe\xff"):   # UTF-16 BOM
    text = raw.decode("utf-16")
else:
    text = raw.decode("utf-8")
j = json.loads(text)

def show_dict_keys(d, prefix="root"):
    if isinstance(d, dict):
        print(f"{prefix} : dict keys = {list(d.keys())[:40]}")
    elif isinstance(d, list):
        print(f"{prefix} : list len = {len(d)}")
    else:
        print(f"{prefix} type = {type(d)}")

print("ROOT TYPE:", type(j))
show_dict_keys(j, "root")

candidates = ("result","items","rows","data")
for c in candidates:
    if isinstance(j, dict) and c in j:
        print(f"Found candidate '{c}', type = {type(j[c])}, len (if list) = {len(j[c]) if isinstance(j[c],list) else 'N/A'}")
        if isinstance(j[c], list) and len(j[c])>0:
            print("First element keys:", list(j[c][0].keys())[:60])
        break

if isinstance(j, list):
    if len(j)>0:
        print("Root is list. First element keys:", list(j[0].keys())[:80])
    else:
        print("Root is empty list")

if isinstance(j, dict):
    for k,v in j.items():
        if isinstance(v, list):
            print(f"Top-level list found at key '{k}', length = {len(v)}")
            if len(v)>0 and isinstance(v[0], dict):
                print("First element keys at", k, ":", list(v[0].keys())[:80])
            break
