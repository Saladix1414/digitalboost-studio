export type PulseDraft = { kind: string; title: string; body: string; cta: string };
function pageName() { try { return localStorage.getItem('db-store-page-v1') || 'Inicio'; } catch { return 'Inicio'; } }
function readBlocks() {
  const page = pageName();
  const keys = ['db-store-canvas-v1:' + page, 'db-store-canvas-v1'];
  for (let i = 0; i < keys.length; i++) {
    try { const parsed = JSON.parse(localStorage.getItem(keys[i]) || 'null'); if (Array.isArray(parsed) && parsed.length) return { key: keys[i], blocks: parsed }; } catch {}
  }
  return { key: 'db-store-canvas-v1:' + page, blocks: [] as any[] };
}
function live(next: any[]) { try { const w = window as any; if (typeof w.__dbSetBlocks === 'function') w.__dbSetBlocks(next); } catch {} }
function snapHistory() {
  try {
    const page = pageName();
    const raw = localStorage.getItem('db-store-canvas-v1:' + page) || localStorage.getItem('db-store-canvas-v1') || '[]';
    const hist = JSON.parse(localStorage.getItem('db-store-history-v1') || '[]');
    hist.push({ t: Date.now(), page: page, raw: raw });
    localStorage.setItem('db-store-history-v1', JSON.stringify(hist.slice(-12)));
  } catch {}
}
export function applyPulseDraft(draft: PulseDraft) {
  snapHistory();
  if (draft.kind === 'theme') {
    const theme = /noir/i.test(draft.title + ' ' + draft.body) ? 'noir' : 'nimbus';
    try { localStorage.setItem('db-os-theme-v1', theme); } catch {}
    window.dispatchEvent(new Event('db-theme-reload'));
    return true;
  }
  const bag = readBlocks();
  let blocks = bag.blocks.slice();
  if (!blocks.length) blocks = [{ id: 'hero', type: 'hero', title: draft.title, body: draft.body, cta: draft.cta }];
  let hit = false;
  const next = blocks.map(function (b: any) {
    const isHero = b && (b.type === 'hero' || b.kind === 'hero');
    if (draft.kind === 'hero' && isHero) { hit = true; return Object.assign({}, b, { title: draft.title, body: draft.body, cta: draft.cta || b.cta }); }
    if (draft.kind === 'cta' && b && (isHero || b.cta)) { hit = true; return Object.assign({}, b, { cta: draft.cta || 'Comprar ahora' }); }
    return b;
  });
  if (draft.kind === 'hero' && !hit && next[0]) next[0] = Object.assign({}, next[0], { title: draft.title, body: draft.body, cta: draft.cta || next[0].cta });
  try { localStorage.setItem(bag.key, JSON.stringify(next)); localStorage.setItem('db-store-canvas-v1', JSON.stringify(next)); } catch {}
  live(next);
  window.dispatchEvent(new CustomEvent('db-canvas-reload', { detail: next }));
  return true;
}
export function appendPulseBlock(block: { type: string; title: string; body: string; cta: string }) {
  snapHistory();
  const bag = readBlocks();
  const next = bag.blocks.concat([Object.assign({ id: 'db-' + Date.now() }, block)]);
  try { localStorage.setItem(bag.key, JSON.stringify(next)); localStorage.setItem('db-store-canvas-v1', JSON.stringify(next)); } catch {}
  live(next);
  window.dispatchEvent(new CustomEvent('db-canvas-reload', { detail: next }));
  return true;
}
export function undoPulseApply() {
  try {
    const hist = JSON.parse(localStorage.getItem('db-store-history-v1') || '[]');
    const last = hist.pop();
    if (!last) return false;
    localStorage.setItem('db-store-history-v1', JSON.stringify(hist));
    if (last.page) localStorage.setItem('db-store-page-v1', last.page);
    localStorage.setItem('db-store-canvas-v1:' + (last.page || 'Inicio'), last.raw);
    localStorage.setItem('db-store-canvas-v1', last.raw);
    live(JSON.parse(last.raw));
    window.dispatchEvent(new Event('db-canvas-reload'));
    return true;
  } catch { return false; }
}

export function applyBlockAt(index: number, patch: { title?: string; body?: string; cta?: string }) {
  snapHistory();
  const bag = readBlocks();
  const next = bag.blocks.map(function (b: any, i: number) {
    if (i !== index) return b;
    return Object.assign({}, b, patch);
  });
  try { localStorage.setItem(bag.key, JSON.stringify(next)); localStorage.setItem('db-store-canvas-v1', JSON.stringify(next)); } catch {}
  live(next);
  window.dispatchEvent(new CustomEvent('db-canvas-reload', { detail: next }));
  return true;
}

function commit(next: any[]) {
  const bag = readBlocks();
  try { localStorage.setItem(bag.key, JSON.stringify(next)); localStorage.setItem('db-store-canvas-v1', JSON.stringify(next)); } catch {}
  live(next);
  window.dispatchEvent(new CustomEvent('db-canvas-reload', { detail: next }));
}
export function moveBlock(index: number, dir: number) {
  snapHistory();
  const blocks = readBlocks().blocks.slice();
  const j = index + dir;
  if (j < 0 || j >= blocks.length) return index;
  const t = blocks[index]; blocks[index] = blocks[j]; blocks[j] = t;
  commit(blocks);
  return j;
}
export function duplicateBlock(index: number) {
  snapHistory();
  const blocks = readBlocks().blocks.slice();
  const copy = Object.assign({}, blocks[index], { id: 'db-' + Date.now() });
  blocks.splice(index + 1, 0, copy);
  commit(blocks);
  return index + 1;
}
export function removeBlock(index: number) {
  snapHistory();
  const blocks = readBlocks().blocks.slice();
  if (blocks.length < 2) return index;
  blocks.splice(index, 1);
  commit(blocks);
  return Math.max(0, index - 1);
}

export function toggleHidden(index: number) {
  snapHistory();
  const blocks = readBlocks().blocks.slice();
  const cur = blocks[index] || {};
  blocks[index] = Object.assign({}, cur, { hidden: !cur.hidden });
  commit(blocks);
  return index;
}
