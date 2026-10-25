import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/** Owns only this game's fullscreen and temporary viewport styling. Never remounts its canvas. */
export function useImmersiveArena(root: RefObject<HTMLDivElement | null>, playing: boolean, pause: () => void) {
  const [immersive, setImmersive] = useState(false), [native, setNative] = useState(false);
  const state = useRef({ alive: true, immersive: false, native: false, playing, suppressed: false, pending: false });
  const pauseRef = useRef(pause); pauseRef.current = pause; state.current.playing = playing;
  const change = useCallback((value: boolean) => { state.current.immersive = value; setImmersive(value); }, []);
  const request = useCallback(() => {
    const element = root.current, s = state.current;
    if (!element || !s.alive || s.pending || document.fullscreenElement || !element.requestFullscreen) return;
    s.pending = true;
    // Invoke in the caller's gesture/orientation event; no await before the request.
    try {
      element.requestFullscreen({ navigationUI: 'hide' }).then(() => {
        if ((!s.alive || !s.immersive || s.suppressed) && document.fullscreenElement === element) void document.exitFullscreen().catch(() => {});
      }).catch(() => { /* Immersive viewport and the explicit retry button remain available. */ }).finally(() => { s.pending = false; });
    } catch { s.pending = false; }
  }, [root]);
  const leave = useCallback((pauseGame = true) => {
    state.current.suppressed = true; change(false);
    if (document.fullscreenElement === root.current && document.exitFullscreen) void document.exitFullscreen().catch(() => {});
    if (pauseGame) pauseRef.current();
  }, [root, change]);
  const enter = useCallback(() => { state.current.suppressed = false; change(true); request(); }, [change, request]);
  const arm = useCallback(() => {
    if (matchMedia('(pointer: coarse)').matches && matchMedia('(orientation: landscape)').matches) enter();
  }, [enter]);
  useEffect(() => {
    const s = state.current; s.alive = true; const element = root.current;
    const landscape = matchMedia('(orientation: landscape)'), coarse = matchMedia('(pointer: coarse)');
    const adapt = () => {
      if (!landscape.matches) { s.suppressed = false; if (s.immersive && coarse.matches) leave(false); s.suppressed = false; return; }
      if (coarse.matches && s.playing && !s.suppressed) change(true);
    };
    const orientation = () => { adapt(); if (landscape.matches && coarse.matches && s.playing && !s.suppressed) request(); };
    const fullscreen = () => {
      const own = document.fullscreenElement === element, was = s.native; s.native = own; setNative(own);
      if (was && !own && s.alive) leave();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && s.immersive) { event.preventDefault(); event.stopImmediatePropagation(); leave(); } };
    landscape.addEventListener('change', adapt); screen.orientation?.addEventListener('change', orientation);
    document.addEventListener('fullscreenchange', fullscreen); window.addEventListener('keydown', escape, true);
    return () => {
      s.alive = false; landscape.removeEventListener('change', adapt); screen.orientation?.removeEventListener('change', orientation);
      document.removeEventListener('fullscreenchange', fullscreen); window.removeEventListener('keydown', escape, true);
      if (document.fullscreenElement === element && document.exitFullscreen) void document.exitFullscreen().catch(() => {});
    };
  }, [root, change, request, leave]);
  useEffect(() => { if (playing && !state.current.suppressed && matchMedia('(pointer: coarse)').matches && matchMedia('(orientation: landscape)').matches) change(true); }, [playing, change]);
  useEffect(() => {
    if (!immersive) return;
    const dialog = root.current?.closest<HTMLElement>('[data-brain-boost-window]'), overlay = dialog?.closest<HTMLElement>('[data-brain-boost-overlay]');
    const old = document.body.style.overflow; document.body.style.overflow = 'hidden';
    if (dialog) dialog.dataset.neonImmersive = 'true'; if (overlay) overlay.dataset.neonImmersive = 'true';
    return () => { document.body.style.overflow = old; if (dialog) delete dialog.dataset.neonImmersive; if (overlay) delete overlay.dataset.neonImmersive; };
  }, [immersive, root]);
  return { immersive, native, enter, leave, arm };
}
