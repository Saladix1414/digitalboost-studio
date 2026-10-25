import { useEffect, useRef, useState } from 'react';
import { NeonArenaEngine } from './NeonArenaEngine';
import { GameSimulation } from './GameSimulation';
import { BOSSES, WEAPONS, WEAPON_IDS, readProgress, saveProgress, type WeaponId } from './SurvivalRules';
import { isBrainBoostAudioEnabled, playBrainBoostSfx, playNeonSurvivalSfx, setBrainBoostAudioEnabled, subscribeBrainBoostAudioEnabled, startBrainBoostMusic, stopBrainBoostMusic, setNeonSurvivalMood } from '../brainBoostAudio';
import './NeonArenaGame.css';
const initial = new GameSimulation().snapshot();
type Snapshot = typeof initial;
const BEST_KEY = 'digitalboost:brain-boost:neon-arena:best:v1';
const COOP_BEST_KEY = 'digitalboost:brain-boost:neon-arena:best:coop:v1';
const bestKey = (count: number) => count === 2 ? COOP_BEST_KEY : BEST_KEY;
function storage() { try { return window.localStorage; } catch { return undefined; } }
function readBest(count = 1) { try { const n = Number(storage()?.getItem(bestKey(count))); return Number.isSafeInteger(n) && n >= 0 ? n : 0; } catch { return 0; } }
const unlockDescriptions: Record<WeaponId, string> = { machinegun: 'Disponible', shotgun: 'Eliminá 30 criaturas en una partida', flame: 'Derrotá a Brood Mother · oleada 5', cascade: 'Derrotá a Iron Maw · oleada 10', rail: 'Derrotá a Hive Sovereign · oleada 15' };
function MarineControls({ marine, active, onShock, coop }: { marine: Snapshot['marines'][number]; active: boolean; onShock: () => void; coop: boolean }) {
  return <div className="na-combat-controls" hidden={!active || !marine.alive}>
    <div className="na-joystick" data-na-stick="" data-na-player={marine.id} aria-label={`Joystick de movimiento P${marine.id + 1}`}><span /><small>MOVER {coop ? `P${marine.id + 1}` : ''}</small></div>
    <div className="na-right-controls"><button type="button" className="na-shock-button" aria-label={`SHOCKWAVE P${marine.id + 1}`} onPointerDown={e => e.preventDefault()} disabled={marine.cooldown > 0} onClick={onShock}>◉ {coop ? '' : 'SHOCKWAVE '}{marine.cooldown > 0 ? `${Math.ceil(marine.cooldown)}s` : 'LISTA'}</button><button type="button" data-na-fire="" data-na-player={marine.id} className="na-fire-button" aria-label={coop ? `Mantener para disparar P${marine.id + 1}` : 'Mantener para disparar'}>FUEGO {coop ? `P${marine.id + 1}` : ''}</button></div>
  </div>;
}
export default function NeonArenaGame({ onExit }: { onExit: () => void }) {
  const host = useRef<HTMLDivElement>(null), engine = useRef<NeonArenaEngine | null>(null), startButton = useRef<HTMLButtonElement>(null);
  const [snapshot, setSnapshot] = useState(initial), [error, setError] = useState(''), [session, setSession] = useState(0);
  const [playerCount, setPlayerCount] = useState<1 | 2>(1), [best, setBest] = useState(() => readBest(1)), [audio, setAudio] = useState(isBrainBoostAudioEnabled), [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(() => readProgress(storage())), [modes, setModes] = useState<('classic' | 'modern')[]>(['classic', 'classic']);
  const [remains, setRemains] = useState(true), [notice, setNotice] = useState('');
  const progressRef = useRef(progress), resultSaved = useRef(false);
  const coop = playerCount === 2, musicActive = snapshot.phase === 'PLAYING' || snapshot.phase === 'WAVE_TRANSITION';
  const danger = snapshot.marines.some(p => p.alive && p.health <= 30);
  useEffect(() => subscribeBrainBoostAudioEnabled(setAudio), []);
  useEffect(() => {
    let current: NeonArenaEngine | null = null; resultSaved.current = false; setError(''); setSnapshot(initial); setNotice('');
    try {
      current = new NeonArenaEngine(host.current!, setSnapshot, message => { stopBrainBoostMusic('neon-arena'); setError(message); }, {
        progress: progressRef.current, playerCount,
        onProgress: p => { const merged = saveProgress(p, storage()); progressRef.current = merged; setProgress(merged); },
        onCue: e => {
          if (e.kind === 'shot' || e.kind === 'flame') playNeonSurvivalSfx(e.weapon || 'machinegun');
          if (e.kind === 'pickup') playNeonSurvivalSfx('pickup'); if (e.kind === 'impact') playNeonSurvivalSfx('impact');
          if (e.kind === 'shock') playBrainBoostSfx('neon-arena', 'advance');
          if (e.kind === 'revive') { setNotice(`P${(e.playerId ?? 0) + 1} RECUPERADO · 35 DE SALUD`); playBrainBoostSfx('neon-arena', 'complete'); }
          if (e.kind === 'unlock' && e.weapon) { setNotice(`ARMA DESBLOQUEADA · ${WEAPONS[e.weapon].name}`); playBrainBoostSfx('neon-arena', 'complete'); }
        },
      });
      modes.forEach((mode, i) => current!.setMode(mode, i)); current.setRemains(remains); engine.current = current;
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo iniciar la escena.'); }
    return () => { stopBrainBoostMusic('neon-arena'); engine.current = null; current?.dispose(); };
  }, [session]);
  useEffect(() => {
    if (!audio || !musicActive || error) { stopBrainBoostMusic('neon-arena'); return; }
    startBrainBoostMusic('neon-arena'); return () => stopBrainBoostMusic('neon-arena');
  }, [audio, musicActive, error]);
  useEffect(() => { setNeonSurvivalMood(snapshot.boss ? 'boss' : danger ? 'danger' : snapshot.phase === 'WAVE_TRANSITION' ? 'victory' : snapshot.wave >= 2 ? 'horde' : 'start'); }, [snapshot.boss?.name, danger, snapshot.phase, snapshot.wave]);
  const warning = snapshot.boss?.warning;
  useEffect(() => { if (warning && musicActive) playNeonSurvivalSfx('warning'); }, [warning, musicActive]);
  useEffect(() => { if (!notice) return; const id = window.setTimeout(() => setNotice(''), 4500); return () => clearTimeout(id); }, [notice]);
  useEffect(() => {
    if (['READY', 'PAUSED', 'GAME_OVER'].includes(snapshot.phase)) startButton.current?.focus({ preventScroll: true });
    if (snapshot.phase !== 'GAME_OVER' || resultSaved.current) return;
    resultSaved.current = true; const next = Math.max(readBest(playerCount), snapshot.score); setBest(next);
    try { storage()?.setItem(bestKey(playerCount), String(next)); } catch { /* Storage is optional. */ }
    stopBrainBoostMusic('neon-arena'); playBrainBoostSfx('neon-arena', 'game-over');
  }, [snapshot.phase, snapshot.score, playerCount]);
  const changeCount = (count: 1 | 2) => { if (engine.current?.setPlayerCount(count)) { setPlayerCount(count); setBest(readBest(count)); } };
  const start = () => { setNeonSurvivalMood('start'); if (audio) startBrainBoostMusic('neon-arena'); engine.current?.start(); playBrainBoostSfx('neon-arena', 'start'); };
  const restart = () => setSession(n => n + 1);
  const choose = (id: WeaponId, playerId = 0) => { if (engine.current?.simulation.equip(id, playerId)) { setSnapshot(engine.current.simulation.snapshot()); if (snapshot.phase === 'PLAYING') host.current?.querySelector('canvas')?.focus({ preventScroll: true }); } };
  const active = snapshot.phase === 'PLAYING' && !error;
  const hud = <div className="na-hud" aria-label="Estado de partida">
    <span><small>{coop ? 'TEAM SCORE' : 'SCORE'}</small><b>{String(snapshot.score).padStart(5, '0')}</b></span><span><small>WAVE</small><b>{String(snapshot.wave).padStart(2, '0')}</b></span>
    {coop ? <span className="na-team-badge">COOP LOCAL · 2P</span> : <span className={`na-health${danger ? ' na-critical' : ''}`}><small>MARINE · {snapshot.health}%</small><span role="progressbar" aria-label="Salud del marine" aria-valuenow={snapshot.health} aria-valuemin={0} aria-valuemax={100} className="na-meter"><i style={{ width: `${snapshot.health}%` }} /></span></span>}
    <button type="button" disabled={!['PLAYING', 'WAVE_TRANSITION', 'PAUSED'].includes(snapshot.phase) || !!error} onClick={() => engine.current?.togglePause()}>{snapshot.phase === 'PAUSED' ? 'Reanudar' : 'Pausa'}</button>
  </div>;
  const encounter = <>
    {active && !snapshot.boss && <div className="na-director" data-na-director=""><span>EN CAMPO <b>{snapshot.activeEnemies}</b> · LLEGANDO <b>{snapshot.pendingEnemies}</b></span><span>JEFE · OLA {snapshot.nextEncounter.wave}</span></div>}
    {snapshot.boss && <div className="na-boss" role="status"><b>{BOSSES[snapshot.boss.name].name} · FASE {snapshot.boss.phase}</b><span className="na-meter" role="progressbar" aria-label="Salud del jefe" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.ceil(snapshot.boss.hp / snapshot.boss.maxHp * 100)}><i style={{ width: `${snapshot.boss.hp / snapshot.boss.maxHp * 100}%` }} /></span><small>{snapshot.boss.warning ? '¡ATAQUE INMINENTE! MOVETE FUERA DE LA SEÑAL' : 'Buscá una ventana para atacar'}</small></div>}
  </>;
  return <div className={`na-game${expanded ? ' na-game--expanded' : ''}${coop ? ' na-game--coop' : ''}`} data-neon-phase={error ? 'ERROR' : snapshot.phase} data-neon-players={playerCount}>
    <div className="na-toolbar"><span><b>NEON ARENA</b><small>{coop ? 'COOPERATIVO LOCAL / PANTALLA DIVIDIDA' : 'ALIEN HORDE SURVIVAL / FOCUS LAB'}</small></span><div>
      <button type="button" aria-pressed={audio} onClick={() => setBrainBoostAudioEnabled(!audio)}>{audio ? 'Sonido ON' : 'Sonido OFF'}</button><button type="button" aria-pressed={expanded} onClick={() => setExpanded(v => !v)}>{expanded ? 'Reducir' : 'Expandir'}</button><button type="button" onClick={onExit}>Salir</button>
    </div></div>
    {coop && <div className="na-team-header">{hud}{encounter}</div>}
    <div className="na-stage" data-playing={active}>
      <div className="na-canvas" ref={host} />
      {!coop && <>{hud}{encounter}</>}
      <div className="na-player-panels">{snapshot.marines.map(marine => <div className="na-player-pane" key={marine.id} data-player-id={marine.id}>
        {coop && <div className="na-player-stats"><b>P{marine.id + 1} · {marine.alive ? `${marine.health}%` : 'CAÍDO'}</b><span>{WEAPONS[marine.weapon].name} · {marine.weapon === 'machinegun' ? '∞' : marine.ammo}</span><span className="na-meter" role="progressbar" aria-label={`Salud P${marine.id + 1}`} aria-valuenow={marine.health} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${marine.health}%` }} /></span></div>}
        {coop && !marine.alive && active && <div className="na-fallen" role="status">P{marine.id + 1} CAÍDO<small>Tu compañero puede recuperarte al completar la oleada.</small></div>}
        <MarineControls marine={marine} active={active} coop={coop} onShock={() => engine.current?.simulation.shock(marine.id)} />
      </div>)}</div>
      {danger && active && <div className="na-warning" role="status">SALUD CRÍTICA · BUSCÁ UN BOTIQUÍN</div>}
      {notice && <div className="na-notice" role="status">{notice}</div>}
      {snapshot.phase === 'WAVE_TRANSITION' && !error && <div className="na-wave" role="status">OLEADA {snapshot.wave} SUPERADA<small>{coop ? 'Los marines caídos regresan con 35 de salud.' : 'Respirá. La siguiente horda se acerca.'}</small></div>}
      {(error || ['LOADING', 'READY', 'PAUSED', 'GAME_OVER'].includes(snapshot.phase)) && <div className="na-overlay"><div className="na-menu">
        <p className="na-eyebrow">{error ? 'SISTEMA GRÁFICO' : snapshot.phase === 'GAME_OVER' ? coop ? 'ESCUADRÓN PERDIDO' : 'SEÑAL DEL MARINE PERDIDA' : 'DIGITALBOOST / ALIEN HORDE SURVIVAL'}</p>
        <h4>{error ? 'Escena no disponible' : snapshot.phase === 'PAUSED' ? 'En pausa' : snapshot.phase === 'GAME_OVER' ? 'La horda ganó' : coop ? 'SOBREVIVAN JUNTOS' : 'SOBREVIVÍ AL NIDO'}</h4>
        <p>{error || (snapshot.phase === 'GAME_OVER' ? `${snapshot.score} puntos · ${snapshot.kills} criaturas · oleada ${snapshot.wave} · ${Math.floor(snapshot.elapsed)}s · ${snapshot.bossesKilled} jefes derrotados` : snapshot.phase === 'PAUSED' ? 'Combate y música detenidos. Reanudá cuando estés listo.' : coop ? 'Dos marines en el mismo dispositivo. Salud y munición individuales, progreso compartido. Sin fuego amigo. Si caen ambos, termina la partida.' : 'Sos el último marine. Rodeá las hordas, recogé suministros y derrotá a los jefes para ampliar tu arsenal.')}</p>
        {!error && <>
          <label className="na-mode">Jugadores <select aria-label="Cantidad de jugadores" value={playerCount} disabled={snapshot.phase !== 'READY'} onChange={e => changeCount(Number(e.target.value) as 1 | 2)}><option value={1}>Individual</option><option value={2}>Cooperativo local · 2 jugadores</option></select></label>
          <p className="na-controls">{coop ? <>P1: WASD · F dispara · Espacio Shockwave · Q cambia arma<br />P2: flechas · J / Ctrl derecho dispara · K / Shift derecho Shockwave · L / Enter cambia arma<br />También dos gamepads o los controles táctiles de cada vista. En móvil conviene girar la pantalla.</> : <>WASD / flechas o joystick: moverse · F / ratón / FUEGO: disparar · Espacio: Shockwave · P: pausa</>}<br />Clásico: el arma dispara 45° a la derecha de tu orientación. La línea del suelo indica la dirección.</p>
          {snapshot.marines.map(marine => <label key={marine.id} className="na-mode">Apuntado {coop ? `P${marine.id + 1}` : ''}<select aria-label={coop ? `Modo de apuntado P${marine.id + 1}` : 'Modo de apuntado'} value={modes[marine.id]} onChange={e => { const next = e.target.value as 'classic' | 'modern'; setModes(old => old.map((mode, i) => i === marine.id ? next : mode)); engine.current?.setMode(next, marine.id); }}><option value="classic">Clásico · diagonal 45°</option><option value="modern">Moderno · ratón / stick derecho / FUEGO</option></select></label>)}
          <label className="na-mode"><input type="checkbox" checked={remains} onChange={e => { setRemains(e.target.checked); engine.current?.setRemains(e.target.checked); }} /> Restos de combate en el suelo</label>
          {snapshot.phase === 'READY' && (coop ? <div className="na-coop-loadout">{snapshot.marines.map(marine => <label className="na-mode" key={marine.id}>Arma P{marine.id + 1}<select aria-label={`Arma inicial P${marine.id + 1}`} value={marine.weapon} onChange={e => choose(e.target.value as WeaponId, marine.id)}>{WEAPON_IDS.map(id => <option key={id} value={id} disabled={!progress.unlocked.includes(id)}>{WEAPONS[id].name}{!progress.unlocked.includes(id) ? ' · bloqueada' : ''}</option>)}</select></label>)}</div> : <div className="na-loadout" aria-label="Arsenal inicial">{WEAPON_IDS.map(id => <button type="button" key={id} disabled={!progress.unlocked.includes(id)} aria-pressed={snapshot.weapon === id} title={unlockDescriptions[id]} onClick={() => choose(id)}>{WEAPONS[id].name}{!progress.unlocked.includes(id) && <small>{unlockDescriptions[id]}</small>}</button>)}</div>)}
          <p className="na-controls">Récord {coop ? 'cooperativo' : 'individual'} {best} · {progress.unlocked.length}/5 armas · Progreso local recreativo{coop && <><br />Gamepad: A / RT dispara · B Shockwave · LB cambia arma · Start pausa. Los caídos regresan en la siguiente oleada.</>}</p>
        </>}
        {!error && <p className="na-objective">PRÓXIMO JEFE · {snapshot.nextEncounter.name} · OLA {snapshot.nextEncounter.wave}<small>{progress.unlocked.includes(snapshot.nextEncounter.reward) ? 'Arma obtenida · superá tu marca de supervivencia' : `Desbloquea ${WEAPONS[snapshot.nextEncounter.reward].name}`}</small></p>}
        <div className="na-menu-actions"><button ref={startButton} type="button" className="na-primary" disabled={!error && snapshot.phase === 'LOADING'} onClick={error || snapshot.phase === 'GAME_OVER' ? restart : snapshot.phase === 'PAUSED' ? () => engine.current?.togglePause() : start}>{error ? 'Reintentar escena' : snapshot.phase === 'GAME_OVER' ? 'Nueva partida' : snapshot.phase === 'PAUSED' ? 'Reanudar partida' : snapshot.phase === 'LOADING' ? 'Cargando escena…' : 'Iniciar supervivencia →'}</button><button type="button" onClick={onExit}>Volver a Focus Lab</button></div>
      </div></div>}
    </div>
    <div className="na-arsenal-rows">{snapshot.marines.map(marine => <div className="na-weapon-bar" key={marine.id} data-arsenal-player={marine.id}><span><b>{coop ? `P${marine.id + 1} · ` : ''}{WEAPONS[marine.weapon].name}</b> · {marine.weapon === 'machinegun' ? '∞' : marine.ammo}{marine.shield > 0 ? ' · ESCUDO' : ''}{marine.haste > 0 ? ' · CADENCIA +' : ''}{!marine.alive ? ' · CAÍDO' : ''}</span><div>{snapshot.unlocked.map(id => <button type="button" key={id} onPointerDown={e => e.preventDefault()} aria-label={`Equipar ${WEAPONS[id].name}${coop ? ` P${marine.id + 1}` : ''}`} aria-pressed={marine.weapon === id} disabled={!marine.alive || !['READY', 'PLAYING', 'WAVE_TRANSITION'].includes(snapshot.phase)} onClick={() => choose(id, marine.id)}>{WEAPON_IDS.indexOf(id) + 1}</button>)}</div></div>)}</div>
    <p className="na-footer">{coop ? 'Cooperativo local · récord de equipo' : 'Marine · hordas · suministros · Récord'} {best}<span>{Math.floor(snapshot.elapsed / 60)}:{String(Math.floor(snapshot.elapsed % 60)).padStart(2, '0')}</span></p>
  </div>;
}
