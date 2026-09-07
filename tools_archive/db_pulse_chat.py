#!/usr/bin/env python3
from pathlib import Path

p = Path("src/DigitalBoostOperator.tsx")
t = p.read_text(encoding="utf-8")
if "msgs" in t:
    print("ya era chat")
else:
    t = t.replace(
        "const [out, setOut] = useState<PulseDecision | null>(null);",
        "const [out, setOut] = useState<PulseDecision | null>(null);\n  const [msgs, setMsgs] = useState<{ role: string; text: string }[]>([]);",
        1,
    )
    t = t.replace(
        "setOut(smart.decision);",
        "setOut(smart.decision);\n      setMsgs(function (m) { return m.concat([{ role: \"user\", text: word || \"hola\" }, { role: \"pulse\", text: smart.decision.title + \" — \" + smart.decision.body }]); });",
        1,
    )
    t = t.replace(
        "{out && (",
        """{msgs.length > 0 && (
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {msgs.map(function (m, i) {
                return (
                  <div key={i} className={m.role === "user" ? "rounded-lg bg-white/5 px-3 py-2 text-xs" : "rounded-lg border border-cyan-400/25 bg-cyan-400/5 px-3 py-2 text-xs text-[#AFC0D5]"}>
                    <span className="font-semibold text-cyan-300">{m.role === "user" ? "Vos" : "PULSE"} · </span>{m.text}
                  </div>
                );
              })}
            </div>
          )}
          {out && (""",
        1,
    )
    p.write_text(t, encoding="utf-8")
    print("ok chat")
print("LISTO CHAT")
