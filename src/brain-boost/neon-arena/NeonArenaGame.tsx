import { useEffect, useRef, useState } from 'react';
import { NeonArenaEngine } from './NeonArenaEngine';
import { GameSimulation } from './GameSimulation';
import { WEAPONS, WEAPON_IDS, readProgress, saveProgress, type WeaponId } from './SurvivalRules';
import { isBrainBoostAudioEnabled, playBrainBoostSfx, playNeonSurvivalSfx, setBrainBoostAudioEnabled, subscribeBrainBoostAudioEnabled, startBrainBoostMusic, stopBrainBoostMusic, setNeonSurvivalMood } from '../brainBoostAudio';
import './NeonArenaGame.css';
const initial = new GameSimulation().snapshot();
const BEST_KEY = 'digitalboost:brain-boost:neon-arena:best:v1';
function storage() { try { return window.localStorage; } catch { return undefined; } }
function readBest() { try { const n = Number(storage()?.getItem(BEST_KEY)); return Number.isSafeInteger(n) && n >= 0 ? n : 0; } catch { return 0; } }
const bossNames: Record<string, string> = { brood: 'BROOD MOTHER', maw: 'IRON MAW', sovereign: 'HIVE SOVEREIGN' };
const unlockDescriptions: Record<WeaponId, string> = { machinegun: 'Disponible', shotgun: 'Eliminá 30 criaturas en una partida', flame: 'Derrotá a Brood Mother · oleada 5', cascade: 'Derrotá a Iron Maw · oleada 10', rail: 'Derrotá a Hive Sovereign · oleada 15' };
export default function NeonArenaGame({ onExit }: { onExit: () => void }) {
  const host = useRef<HTMLDivElement>(null), engine = useRef<NeonArenaEngine | null>(null), startButton = useRef<HTMLButtonElement>(null);
  const [snapshot, setSnapshot] = useState(initial), [error, setError] = useState(''), [session, setSession] = useState(0);
  const [best, setBest] = useState(readBest), [audio, setAudio] = useState(isBrainBoostAudioEnabled), [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(() => readProgress(storage())), [mode, setMode] = useState<'classic' | 'modern'>('classic');
  const [remains, setRemains] = useState(true);
  const progressRef = useRef(progress), resultSaved = useRef(false); const [notice, setNotice] = useState('');
  const musicActive = snapshot.phase === 'PLAYING' || snapshot.phase === 'WAVE_TRANSITION';
  useEffect(() => subscribeBrainBoostAudioEnabled(setAudio), []);
  useEffect(() => {
    let current: NeonArenaEngine | null = null; resultSaved.current = false; setError(''); setSnapshot(initial); setNotice('');
    try {
      current = new NeonArenaEngine(host.current!, setSnapshot, message => { stopBrainBoostMusic('neon-arena'); setError(message); }, {
        progress: progressRef.current,
        onProgress: p => { const merged = saveProgress(p, storage()); progressRef.current = merged; setProgress(merged); },
        onCue: e => {
          if (e.kind === 'shot' || e.kind === 'flame') playNeonSurvivalSfx(e.weapon || 'machinegun');
          if (e.kind === 'pickup') playNeonSurvivalSfx('pickup');
          if (e.kind === 'impact') playNeonSurvivalSfx('impact');
          if (e.kind === 'shock') playBrainBoostSfx('neon-arena', 'advance');
          if (e.kind === 'unlock' && e.weapon) { setNotice(`ARMA DESBLOQUEADA · ${WEAPONS[e.weapon].name}`); playBrainBoostSfx('neon-arena', 'complete'); }
        },
      });
      current.setMode(mode); current.setRemains(remains); engine.current = current;
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo iniciar la escena.'); }
    return () => { stopBrainBoostMusic('neon-arena'); engine.current = null; current?.dispose(); };
  }, [session]);
  useEffect(() => {
    if (!audio || !musicActive || error) { stopBrainBoostMusic('neon-arena'); return; }
    startBrainBoostMusic('neon-arena'); return () => stopBrainBoostMusic('neon-arena');
  }, [audio, musicActive, error]);
  useEffect(() => {
    setNeonSurvivalMood(snapshot.boss ? 'boss' : snapshot.health <= 30 ? 'danger' : snapshot.phase === 'WAVE_TRANSITION' ? 'victory' : snapshot.wave >= 2 ? 'horde' : 'start');
  }, [snapshot.boss?.name, snapshot.health <= 30, snapshot.phase, snapshot.wave]);
  const warning = snapshot.boss?.warning;
  useEffect(() => { if (warning && musicActive) playNeonSurvivalSfx('warning'); }, [warning, musicActive]);
  useEffect(() => { if (!notice) return; const id = window.setTimeout(() => setNotice(''), 4500); return () => clearTimeout(id); }, [notice]);
  useEffect(() => {
    if (['READY', 'PAUSED', 'GAME_OVER'].includes(snapshot.phase)) startButton.current?.focus({ preventScroll: true });
    if (snapshot.phase !== 'GAME_OVER' || resultSaved.current) return;
    resultSaved.current = true; const next = Math.max(readBest(), snapshot.score); setBest(next);
    try { storage()?.setItem(BEST_KEY, String(next)); } catch { /* No storage requirement for gameplay. */ }
    stopBrainBoostMusic('neon-arena'); playBrainBoostSfx('neon-arena', 'game-over');
  }, [snapshot.phase, snapshot.score]);
  const start = () => { setNeonSurvivalMood('start'); if (audio) startBrainBoostMusic('neon-arena'); engine.current?.start(); playBrainBoostSfx('neon-arena', 'start'); };
  const restart = () => setSession(n => n + 1);
  const choose = (id: WeaponId) => { if (engine.current?.simulation.equip(id)) { setSnapshot(engine.current.simulation.snapshot()); if (snapshot.phase === 'PLAYING') host.current?.querySelector('canvas')?.focus({ preventScroll: true }); } };
  const active = snapshot.phase === 'PLAYING' && !error;
  return <div className={`na-game${expanded ? ' na-game--expanded' : ''}`} data-neon-phase={error ? 'ERROR' : snapshot.phase}>
    <div className="na-toolbar"><span><b>NEON ARENA</b><small>ALIEN HORDE SURVIVAL / FOCUS LAB</small></span><div>
      <button type="button" aria-pressed={audio} onClick={() => setBrainBoostAudioEnabled(!audio)}>{audio ? 'Sonido ON' : 'Sonido OFF'}</button>
      <button type="button" aria-pressed={expanded} onClick={() => setExpanded(v => !v)}>{expanded ? 'Reducir' : 'Expandir'}</button><button type="button" onClick={onExit}>Salir</button>
    </div></div>
    <div className="na-stage" data-playing={active}>
      <div className="na-canvas" ref={host} />
      <div className="na-hud" aria-label="Estado de partida">
        <span><small>SCORE</small><b>{String(snapshot.score).padStart(5, '0')}</b></span><span><small>WAVE</small><b>{String(snapshot.wave).padStart(2, '0')}</b></span>
        <span className={`na-health${snapshot.health <= 30 ? ' na-critical' : ''}`}><small>MARINE · {snapshot.health}%</small><span role="progressbar" aria-label="Salud del marine" aria-valuenow={snapshot.health} aria-valuemin={0} aria-valuemax={100} className="na-meter"><i style={{ width: `${snapshot.health}%` }} /></span></span>
        <button type="button" disabled={!['PLAYING', 'WAVE_TRANSITION', 'PAUSED'].includes(snapshot.phase) || !!error} onClick={() => engine.current?.togglePause()}>{snapshot.phase === 'PAUSED' ? 'Reanudar' : 'Pausa'}</button>
      </div>
      {snapshot.boss && <div className="na-boss" role="status"><b>{bossNames[snapshot.boss.name]} · FASE {snapshot.boss.phase}</b><span className="na-meter"><i style={{ width: `${snapshot.boss.hp / snapshot.boss.maxHp * 100}%` }} /></span><small>{snapshot.boss.warning ? '¡ATAQUE INMINENTE! MOVETE FUERA DE LA SEÑAL' : 'Buscá una ventana para atacar'}</small></div>}
      {snapshot.health <= 30 && active && <div className="na-warning" role="status">SALUD CRÍTICA · BUSCÁ UN BOTIQUÍN</div>}
      {notice && <div className="na-notice" role="status">{notice}</div>}
      <div className="na-combat-controls" hidden={!active}>
        <div className="na-joystick" data-na-stick="" aria-label="Joystick de movimiento"><span /><small>MOVER</small></div>
        <div className="na-right-controls"><button type="button" className="na-shock-button" onPointerDown={e => e.preventDefault()} disabled={snapshot.cooldown > 0} onClick={() => engine.current?.simulation.shock()}>◉ SHOCKWAVE {snapshot.cooldown > 0 ? `${Math.ceil(snapshot.cooldown)}s` : 'LISTA'}</button><button type="button" data-na-fire="" className="na-fire-button" aria-label="Mantener para disparar">FUEGO</button></div>
      </div>
      {snapshot.phase === 'WAVE_TRANSITION' && !error && <div className="na-wave" role="status">OLEADA {snapshot.wave} SUPERADA<small>Respirá. La siguiente horda se acerca.</small></div>}
      {(error || ['LOADING', 'READY', 'PAUSED', 'GAME_OVER'].includes(snapshot.phase)) && <div className="na-overlay"><div className="na-menu">
        <p className="na-eyebrow">{error ? 'SISTEMA GRÁFICO' : snapshot.phase === 'GAME_OVER' ? 'SEÑAL DEL MARINE PERDIDA' : 'DIGITALBOOST / ALIEN HORDE SURVIVAL'}</p>
        <h4>{error ? 'Escena no disponible' : snapshot.phase === 'PAUSED' ? 'En pausa' : snapshot.phase === 'GAME_OVER' ? 'La horda ganó' : 'SOBREVIVÍ AL NIDO'}</h4>
        <p>{error || (snapshot.phase === 'GAME_OVER' ? `${snapshot.score} puntos · ${snapshot.kills} criaturas · oleada ${snapshot.wave} · ${Math.floor(snapshot.elapsed)}s · ${snapshot.bossesKilled} jefes derrotados` : snapshot.phase === 'PAUSED' ? 'Combate y música detenidos. Reanudá cuando estés listo.' : 'Sos el último marine. Rodeá las hordas, recogé suministros y derrotá a los jefes para ampliar tu arsenal.')}</p>
        {!error && <><p className="na-controls">WASD / flechas o joystick: moverse · F / ratón / FUEGO: disparar · Espacio: Shockwave · P: pausa<br />Clásico: el arma dispara 45° a la derecha de tu orientación. La línea del suelo indica la dirección.</p>
          <label className="na-mode">Apuntado <select aria-label="Modo de apuntado" value={mode} onChange={e => { const next = e.target.value as 'classic' | 'modern'; setMode(next); engine.current?.setMode(next); }}><option value="classic">Clásico · diagonal 45°</option><option value="modern">Moderno · ratón / arrastrar FUEGO</option></select></label>
          <label className="na-mode"><input type="checkbox" checked={remains} onChange={e => { setRemains(e.target.checked); engine.current?.setRemains(e.target.checked); }} /> Restos de combate en el suelo</label>
          {snapshot.phase === 'READY' && <div className="na-loadout" aria-label="Arsenal inicial">{WEAPON_IDS.map(id => <button type="button" key={id} disabled={!progress.unlocked.includes(id)} aria-pressed={snapshot.weapon === id} title={unlockDescriptions[id]} onClick={() => choose(id)}>{WEAPONS[id].name}{!progress.unlocked.includes(id) && <small>{unlockDescriptions[id]}</small>}</button>)}</div>}
          <p className="na-controls">Récord {best} · {progress.unlocked.length}/5 armas · Progreso local recreativo</p></>}
        <div className="na-menu-actions"><button ref={startButton} type="button" className="na-primary" disabled={!error && snapshot.phase === 'LOADING'} onClick={error || snapshot.phase === 'GAME_OVER' ? restart : snapshot.phase === 'PAUSED' ? () => engine.current?.togglePause() : start}>{error ? 'Reintentar escena' : snapshot.phase === 'GAME_OVER' ? 'Nueva partida' : snapshot.phase === 'PAUSED' ? 'Reanudar partida' : snapshot.phase === 'LOADING' ? 'Cargando escena…' : 'Iniciar supervivencia →'}</button><button type="button" onClick={onExit}>Volver a Focus Lab</button></div>
      </div></div>}
    </div>
    <div className="na-weapon-bar"><span><b>{WEAPONS[snapshot.weapon].name}</b> · {snapshot.weapon === 'machinegun' ? '∞' : snapshot.ammo} {snapshot.shield > 0 ? ' · ESCUDO' : ''}{snapshot.haste > 0 ? ' · CADENCIA +' : ''}</span><div>{snapshot.unlocked.map(id => <button type="button" key={id} aria-label={`Equipar ${WEAPONS[id].name}`} aria-pressed={snapshot.weapon === id} disabled={!['READY', 'PLAYING', 'WAVE_TRANSITION'].includes(snapshot.phase)} onClick={() => choose(id)}>{WEAPON_IDS.indexOf(id) + 1}</button>)}</div></div>
    <p className="na-footer">Marine · hordas · suministros · Récord {best}<span>{Math.floor(snapshot.elapsed / 60)}:{String(Math.floor(snapshot.elapsed % 60)).padStart(2, '0')}</span></p>
  </div>;
}
