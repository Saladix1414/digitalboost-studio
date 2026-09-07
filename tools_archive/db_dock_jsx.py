#!/usr/bin/env python3
from pathlib import Path

p = Path("src/DigitalBoostStudioDock.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
t = p.read_text(encoding="utf-8")
lines = t.splitlines(True)

# show around 108
print("---- around 108 ----")
for i, ln in enumerate(lines, 1):
    if 95 <= i <= 125:
        print(f"{i}:{ln.rstrip()}")

old = '{tab === "export" && ('
# wrap export branch if two buttons adjacent
if '{tab === "export" && (' in t and "<>" not in t[t.find('{tab === "export"'):t.find('{tab === "export"')+800]:
    t = t.replace(
        '{tab === "export" && (',
        '{tab === "export" && (<div className="space-y-2">',
        1,
    )
    # close that div before the matching )}
    # after first export replace, find the next )}\n that closes the tab
    i = t.find('{tab === "export" && (<div className="space-y-2">')
    rest = t[i:]
    # the original closer is `)}` after the button(s)
    closer = rest.find(")}")
    if closer != -1:
        t = t[: i + closer] + "</div>" + t[i + closer :]
        print("ok wrap export")
    else:
        print("WARN no cerre export")
else:
    # fallback: fragment around the undo button's previous sibling
    t2 = t.replace(
        '<button type="button" className="mt-2 h-11 w-full rounded-lg border border-white/10" onClick={function () {',
        '<div className="space-y-2"><button type="button" className="mt-2 h-11 w-full rounded-lg border border-white/10" onClick={function () {',
        1,
    )
    if t2 != t:
        # close after undo button's </button>
        j = t2.find("Deshacer ultimo apply</button>")
        if j != -1:
            k = t2.find("</button>", j)
            t2 = t2[: k + 9] + "</div>" + t2[k + 9 :]
            t = t2
            print("ok wrap undo")
        else:
            t = t2
            print("wrap start only")
    else:
        print("no match undo button")

p.write_text(t, encoding="utf-8")
print("LISTO JSX")
