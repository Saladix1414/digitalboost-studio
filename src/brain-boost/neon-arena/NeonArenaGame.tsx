import { useEffect, useRef, useState } from 'react';
import { NeonArenaEngine } from './NeonArenaEngine';
import { CONFIG, type GameSimulation } from './GameSimulation';
import { isBrainBoostAudioEnabled, playBrainBoostSfx, setBrainBoostAudioEnabled, subscribeBrainBoostAudioEnabled } from '../brainBoostAudio';
import './NeonArenaGame.css';

type Snapshot = ReturnType<GameSimulation['snapshot']>;
const initial: Snapshot = { phase: 'LOADING', score: 0, wave: 1, health: CONFIG.health, kills: 0, elapsed: 0, cooldown: 0 };
const BEST_KEY = 'digitalboost:brain-boost:neon-arena:best:v1';
function readBest() {
  try { const n = Number(localStorage.getItem(BEST_KEY)); return Number.isSafeInteger(n) && n >= 0 ? n : 0; } catch { return 0; }
}

export default function NeonArenaGame({ onExit }: { onExit: () => void }) {
  const host = useRef<HTMLDivElement>(null); const engine = useRef<NeonArenaEngine | null>(null);
  const [snapshot, setSnapshot] = useState(initial), [error, setError] = useState('');
  const [session, setSession] = useState(0), [best, setBest] = useState(readBest);
  const [audio, setAudio] = useState(isBrainBoostAudioEnabled), [expanded, setExpanded] = useState(false);
  const resultSaved = useRef(false); const startButton = useRef<HTMLButtonElement>(null);

  useEffect(() => subscribeBrainBoostAudioEnabled(setAudio), []);
  useEffect(() => {
    let current: NeonArenaEngine | null = null;
    resultSaved.current = false; setError(''); setSnapshot(initial);
    try {
      current = new NeonArenaEngine(host.current!, setSnapshot, message => { setError(message); });
      engine.current = current;
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo iniciar la escena 3D.'); }
    return () => { engine.current = null; current?.dispose(); };
  }, [session]);
  useEffect(() => {
    if (snapshot.phase === 'READY' || snapshot.phase === 'PAUSED' || snapshot.phase === 'GAME_OVER') startButton.current?.focus({ preventScroll: true });
    if (snapshot.phase !== 'GAME_OVER' || resultSaved.current) return;
    resultSaved.current = true;
    const next = Math.max(readBest(), snapshot.score); setBest(next);
    try { localStorage.setItem(BEST_KEY, String(next)); } catch { /* Session remains usable without storage. */ }
    playBrainBoostSfx('neon-arena', 'game-over');
  }, [snapshot.phase, snapshot.score]);

  const start = () => { engine.current?.start(); playBrainBoostSfx('neon-arena', 'start'); };
  const shock = () => { if (engine.current?.simulation.shock()) playBrainBoostSfx('neon-arena', 'advance'); };
  const restart = () => setSession(n => n + 1);
  return <div className={`na-game${expanded ? ' na-game--expanded' : ''}`} data-neon-phase={error ? 'ERROR' : snapshot.phase}>
    <div className="na-toolbar">
      <span><b>NEON ARENA</b><small>VIRUS SURVIVOR / FOCUS LAB</small></span>
      <div>
        <button type="button" aria-pressed={audio} onClick={() => setBrainBoostAudioEnabled(!audio)}>{audio ? 'Sonido ON' : 'Sonido OFF'}</button>
        <button type="button" aria-pressed={expanded} onClick={() => setExpanded(v => !v)}>{expanded ? 'Reducir' : 'Expandir'}</button>
        <button type="button" onClick={onExit}>Salir</button>
      </div>
    </div>
    <div className="na-stage" data-playing={snapshot.phase === 'PLAYING' && !error}>
      <div className="na-canvas" ref={host} />
      <div className="na-hud" aria-label="Estado de partida">
        <span><small>SCORE</small><b>{String(snapshot.score).padStart(5, '0')}</b></span>
        <span><small>WAVE</small><b>{String(snapshot.wave).padStart(2, '0')}</b></span>
        <span className={snapshot.health <= 25 ? 'na-health na-critical' : 'na-health'}>
          <small>CORE HEALTH · {snapshot.health}%</small>
          <span role="progressbar" aria-label="Integridad del reactor" aria-valuenow={snapshot.health} aria-valuemin={0} aria-valuemax={100} className="na-meter"><i style={{ width: `${snapshot.health}%` }} /></span>
        </span>
        <button type="button" disabled={!['PLAYING', 'WAVE_TRANSITION', 'PAUSED'].includes(snapshot.phase) || !!error} onClick={() => engine.current?.togglePause()}>{snapshot.phase === 'PAUSED' ? 'Reanudar' : 'Pausa'}</button>
      </div>
      {snapshot.phase === 'PLAYING' && !error && <>
        {snapshot.health <= 25 && <div className="na-warning" role="status">CORE UNDER ATTACK</div>}
        <div className="na-combat-bar"><span>Arrastrá para mover · disparo automático</span><button type="button" disabled={snapshot.cooldown > 0} onClick={shock}>◉ SHOCKWAVE {snapshot.cooldown > 0 ? `${Math.ceil(snapshot.cooldown)}s` : 'LISTA'}</button></div>
      </>}
      {snapshot.phase === 'WAVE_TRANSITION' && !error && <div className="na-wave" role="status">OLEADA {snapshot.wave} SUPERADA<small>Reparación del núcleo +5 · preparando siguiente oleada</small></div>}
      {(error || ['LOADING', 'READY', 'PAUSED', 'GAME_OVER'].includes(snapshot.phase)) && <div className="na-overlay">
        <div className="na-menu">
          <p className="na-eyebrow">{error ? 'SISTEMA GRÁFICO' : snapshot.phase === 'GAME_OVER' ? 'TRANSMISIÓN FINALIZADA' : 'DIGITALBOOST / NEURAL ARCADE'}</p>
          <h4>{error ? 'Escena no disponible' : snapshot.phase === 'PAUSED' ? 'En pausa' : snapshot.phase === 'GAME_OVER' ? 'Núcleo perdido' : 'DEFENDÉ EL NÚCLEO'}</h4>
          <p>{error || (snapshot.phase === 'GAME_OVER' ? `${snapshot.score} puntos · ${snapshot.kills} virus destruidos · oleada ${snapshot.wave} · ${Math.floor(snapshot.elapsed)}s` : snapshot.phase === 'PAUSED' ? 'La simulación está detenida. Reanudá cuando estés listo.' : 'Mové tu dron, interceptá los enjambres rojos y liberá una Shockwave cuando te rodeen.')}</p>
          {!error && <p className="na-controls">Arrastrar / WASD / flechas · Espacio: Shockwave · P: pausa<br />Récord arcade: {best} · sin equivalencia con Cognitive Score</p>}
          <div className="na-menu-actions">
            <button ref={startButton} type="button" className="na-primary" disabled={!error && snapshot.phase === 'LOADING'} onClick={error || snapshot.phase === 'GAME_OVER' ? restart : snapshot.phase === 'PAUSED' ? () => { engine.current?.togglePause(); host.current?.querySelector('canvas')?.focus(); } : start}>{error ? 'Reintentar escena' : snapshot.phase === 'GAME_OVER' ? 'Nueva partida' : snapshot.phase === 'PAUSED' ? 'Reanudar partida' : snapshot.phase === 'LOADING' ? 'Cargando escena…' : 'Iniciar defensa →'}</button>
            <button type="button" onClick={onExit}>Volver a Focus Lab</button>
          </div>
        </div>
      </div>}
    </div>
    <p className="na-footer">3D en tiempo real · Reactor + dron + enjambres · Récord {best} <span>{Math.floor(snapshot.elapsed / 60)}:{String(Math.floor(snapshot.elapsed % 60)).padStart(2, '0')}</span></p>
  </div>;
}
