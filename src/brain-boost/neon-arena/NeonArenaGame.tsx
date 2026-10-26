import { getContainmentStatus, subscribeContainmentStatus } from './ContainmentScore';
import type { ArenaDiagnostics } from './RenderMetrics';
import { useEffect, useRef, useState } from 'react';
import { NeonArenaEngine } from './NeonArenaEngine';
import type { AimMode } from './AimAssist';
import { GameSimulation } from './GameSimulation';
import { BOSSES, WEAPONS, WEAPON_IDS, readProgress, saveProgress, type WeaponId } from './SurvivalRules';
import { getBrainBoostMusicVolume, setBrainBoostMusicVolume, resetNeonSurvivalScore, releaseNeonSurvivalScore, isBrainBoostAudioEnabled, playBrainBoostSfx, playNeonSurvivalSfx, playNeonCreatureSfx, setBrainBoostAudioEnabled, subscribeBrainBoostAudioEnabled, startBrainBoostMusic, stopBrainBoostMusic, setNeonSurvivalMood } from '../brainBoostAudio';
import { useImmersiveArena } from './useImmersiveArena';
import './NeonArenaGame.css';
const initial = new GameSimulation().snapshot();
type Snapshot = typeof initial;
const BEST_KEY = 'digitalboost:brain-boost:neon-arena:best:v1';
const COOP_BEST_KEY = 'digitalboost:brain-boost:neon-arena:best:coop:v1';
const bestKey = (count: number) => count === 2 ? COOP_BEST_KEY : BEST_KEY;
function storage() { try { return window.localStorage; } catch { return undefined; } }
function readBest(count = 1) { try { const n = Number(storage()?.getItem(bestKey(count))); return Number.isSafeInteger(n) && n >= 0 ? n : 0; } catch { return 0; } }
const unlockDescriptions: Record<WeaponId, string> = { machinegun: 'Disponible', shotgun: 'Eliminá 30 criaturas en una partida', flame: 'Derrotá a Brood Mother · oleada 5', cascade: 'Derrotá a Iron Maw · oleada 12', rail: 'Derrotá a Hive Sovereign · oleada 20' };
const mapNames = ['COLONIA INDUSTRIAL', 'NIDO CONTAMINADO', 'CÁMARA DE CRÍA', 'NÚCLEO EN PENUMBRA'];
function MarineControls({ marine, active, onShock, coop }: { marine: Snapshot['marines'][number]; active: boolean; onShock: () => void; coop: boolean }) {
  return <div className="na-combat-controls" hidden={!active || !marine.alive}>
    <div className="na-joystick" data-na-stick="" data-na-player={marine.id} aria-label={`Joystick de movimiento P${marine.id + 1}`}><span /><small>MOVER {coop ? `P${marine.id + 1}` : ''}</small></div>
    <div className="na-right-controls"><button type="button" className="na-shock-button" aria-label={`SHOCKWAVE P${marine.id + 1}`} onPointerDown={e => e.preventDefault()} disabled={marine.cooldown > 0} onClick={onShock}>◉ {coop ? '' : 'SHOCKWAVE '}{marine.cooldown > 0 ? `${Math.ceil(marine.cooldown)}s` : 'LISTA'}</button><button type="button" data-na-fire="" data-na-player={marine.id} className="na-fire-button" aria-label={coop ? `Mantener para disparar P${marine.id + 1}` : 'Mantener para disparar'}><span className="na-aim-knob" />FUEGO {coop ? `P${marine.id + 1}` : ''}</button></div>
  </div>;
}
export default function NeonArenaGame({ onExit }: { onExit: () => void }) {
  const root = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null), engine = useRef<NeonArenaEngine | null>(null), startButton = useRef<HTMLButtonElement>(null);
  const [snapshot, setSnapshot] = useState(initial), [error, setError] = useState(''), [session, setSession] = useState(0);
  const [playerCount, setPlayerCount] = useState<1 | 2>(1), [best, setBest] = useState(() => readBest(1)), [audio, setAudio] = useState(isBrainBoostAudioEnabled);
  const [progress, setProgress] = useState(() => readProgress(storage())), [modes, setModes] = useState<AimMode[]>(['assisted', 'assisted']);
  const [musicStatus, setMusicStatus] = useState(getContainmentStatus), [musicVolume, setMusicVolume] = useState(getBrainBoostMusicVolume);
  const [quality, setQuality] = useState<'auto' | 'low' | 'high'>('auto'), [diagnostics, setDiagnostics] = useState(false), [metrics, setMetrics] = useState<ArenaDiagnostics | null>(null);
  const [remains, setRemains] = useState(true), [notice, setNotice] = useState('');
  const progressRef = useRef(progress), resultSaved = useRef(false), bossPhaseRef = useRef(0);
  const coop = playerCount === 2, musicActive = snapshot.phase === 'PLAYING' || snapshot.phase === 'WAVE_TRANSITION';
  const view = useImmersiveArena(root, musicActive, () => engine.current?.pause());
  const exit = () => { view.leave(false); onExit(); };
  const danger = snapshot.marines.some(p => p.alive && p.health <= 30);
  useEffect(() => subscribeBrainBoostAudioEnabled(setAudio), []);
  useEffect(() => subscribeContainmentStatus(setMusicStatus), []);
  useEffect(() => {
    let current: NeonArenaEngine | null = null; resultSaved.current = false; setError(''); setSnapshot(initial); setNotice('');
    try {
      current = new NeonArenaEngine(host.current!, setSnapshot, message => { stopBrainBoostMusic('neon-arena'); setError(message); }, {
        progress: progressRef.current, playerCount, onDiagnostics: setMetrics,
        onProgress: p => { const merged = saveProgress(p, storage()); progressRef.current = merged; setProgress(merged); },
        onCue: e => {
          if (e.kind === 'shot' || e.kind === 'flame') playNeonSurvivalSfx(e.weapon || 'machinegun');
          if (e.creature && ['kill', 'creature', 'boss'].includes(e.kind)) playNeonCreatureSfx(e.creature, e.kind === 'kill' ? 'death' : e.kind === 'boss' ? 'boss' : 'attack');
          if (e.kind === 'boss' && e.creature && e.creature in BOSSES) setNotice(`JEFE ENTRANTE · ${BOSSES[e.creature as keyof typeof BOSSES].name}`);
          if (e.kind === 'kill' && e.creature && e.creature in BOSSES) setNotice('SECTOR ALTERADO · LA COLONIA CAMBIÓ');
          if (e.kind === 'pickup') playNeonSurvivalSfx('pickup'); if (e.kind === 'impact') playNeonSurvivalSfx('impact');
          if (e.kind === 'shock') playBrainBoostSfx('neon-arena', 'advance');
          if (e.kind === 'revive') { setNotice(`P${(e.playerId ?? 0) + 1} RECUPERADO · 35 DE SALUD`); playBrainBoostSfx('neon-arena', 'complete'); }
          if (e.kind === 'unlock' && e.weapon) { setNotice(`ARMA DESBLOQUEADA · ${WEAPONS[e.weapon].name}`); playBrainBoostSfx('neon-arena', 'complete'); }
        },
      });
      modes.forEach((mode, i) => current!.setMode(mode, i)); current.setRemains(remains); current.setQuality(quality); current.setDiagnostics(diagnostics); engine.current = current;
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo iniciar la escena.'); }
    return () => { releaseNeonSurvivalScore(); engine.current = null; current?.dispose(); };
  }, [session]);
  useEffect(() => {
    if (!audio || !musicActive || error) { stopBrainBoostMusic('neon-arena'); return; }
    startBrainBoostMusic('neon-arena'); return () => stopBrainBoostMusic('neon-arena');
  }, [audio, musicActive, error]);
  useEffect(() => { setNeonSurvivalMood(snapshot.phase === 'GAME_OVER' ? 'defeat' : snapshot.boss ? 'boss' : danger ? 'danger' : snapshot.phase === 'WAVE_TRANSITION' ? 'victory' : snapshot.wave >= 2 ? 'horde' : 'start'); }, [snapshot.boss?.name, danger, snapshot.phase, snapshot.wave]);
  const warning = snapshot.boss?.warning;
  useEffect(() => { if (warning && musicActive) playNeonSurvivalSfx('warning'); }, [warning, musicActive]);
  useEffect(() => {
    const phase = snapshot.boss?.phase ?? 0;
    if (phase === 2 && bossPhaseRef.current !== 2 && snapshot.boss && musicActive) {
      playNeonCreatureSfx(snapshot.boss.name, 'boss'); playNeonSurvivalSfx('warning');
      setNotice('FASE CRÍTICA · EL JEFE ALTERÓ SU PATRÓN');
    }
    bossPhaseRef.current = phase;
    if (!snapshot.boss) bossPhaseRef.current = 0;
  }, [snapshot.boss?.name, snapshot.boss?.phase, musicActive]);
  useEffect(() => { if (!notice) return; const id = window.setTimeout(() => setNotice(''), 4500); return () => clearTimeout(id); }, [notice]);
  useEffect(() => {
    if (['READY', 'PAUSED', 'GAME_OVER'].includes(snapshot.phase)) startButton.current?.focus({ preventScroll: true });
    if (snapshot.phase !== 'GAME_OVER' || resultSaved.current) return;
    resultSaved.current = true; const next = Math.max(readBest(playerCount), snapshot.score); setBest(next);
    try { storage()?.setItem(bestKey(playerCount), String(next)); } catch { /* Storage is optional. */ }
    stopBrainBoostMusic('neon-arena'); playBrainBoostSfx('neon-arena', 'game-over');
  }, [snapshot.phase, snapshot.score, playerCount]);
  const changeCount = (count: 1 | 2) => { if (engine.current?.setPlayerCount(count)) { setPlayerCount(count); setBest(readBest(count)); } };
  const start = () => { resetNeonSurvivalScore(); view.arm(); setNeonSurvivalMood('start'); if (audio) startBrainBoostMusic('neon-arena'); engine.current?.start(); playBrainBoostSfx('neon-arena', 'start'); };
  const restart = () => setSession(n => n + 1);
  const choose = (id: WeaponId, playerId = 0) => { if (engine.current?.simulation.equip(id, playerId)) { setSnapshot(engine.current.simulation.snapshot()); if (snapshot.phase === 'PLAYING') host.current?.querySelector('canvas')?.focus({ preventScroll: true }); } };
  const active = snapshot.phase === 'PLAYING' && !error;
  const hud = <div className="na-hud" aria-label="Estado de partida">
    <span><small>{coop ? 'TEAM SCORE' : 'SCORE'}</small><b>{String(snapshot.score).padStart(5, '0')}</b></span><span><small>WAVE</small><b>{String(snapshot.wave).padStart(2, '0')}</b></span><span><small>SECTOR</small><b>{mapNames[snapshot.mapPhase % mapNames.length]}</b></span>
    {coop ? <span className="na-team-badge">COOP LOCAL · 2P</span> : <span className={`na-health${danger ? ' na-critical' : ''}`}><small>MARINE · {snapshot.health}%</small><span role="progressbar" aria-label="Salud del marine" aria-valuenow={snapshot.health} aria-valuemin={0} aria-valuemax={100} className="na-meter"><i style={{ width: `${snapshot.health}%` }} /></span></span>}
    <button type="button" disabled={!['PLAYING', 'WAVE_TRANSITION', 'PAUSED'].includes(snapshot.phase) || !!error} onClick={() => engine.current?.togglePause()}>{snapshot.phase === 'PAUSED' ? 'Reanudar' : 'Pausa'}</button>
  </div>;
  const encounter = <>
    {active && !snapshot.boss && <div className="na-director" data-na-director=""><span>EN CAMPO <b>{snapshot.activeEnemies}</b> · LLEGANDO <b>{snapshot.pendingEnemies}</b></span><span>JEFE · OLA {snapshot.nextEncounter.wave}</span></div>}
    {snapshot.boss && <div className="na-boss" role="status"><b>{BOSSES[snapshot.boss.name].name} · FASE {snapshot.boss.phase}</b><span className="na-meter" role="progressbar" aria-label="Salud del jefe" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.ceil(snapshot.boss.hp / snapshot.boss.maxHp * 100)}><i style={{ width: `${snapshot.boss.hp / snapshot.boss.maxHp * 100}%` }} /></span><small>{snapshot.boss.warning ? '¡ATAQUE INMINENTE! MOVETE FUERA DE LA SEÑAL' : 'Buscá una ventana para atacar'}</small></div>}
  </>;
  return <div ref={root} className={`na-game${view.immersive ? ' na-game--immersive' : ''}${coop ? ' na-game--coop' : ''}`} data-neon-fullscreen={view.native ? 'native' : view.immersive ? 'viewport' : 'off'} data-neon-phase={error ? 'ERROR' : snapshot.phase} data-neon-players={playerCount}>
    <div className="na-toolbar"><span><b>NEON ARENA</b><small>{coop ? 'COOPERATIVO LOCAL / PANTALLA DIVIDIDA' : 'NIGHTMARE PROTOCOLO / ALIEN HORDE SURVIVAL'}</small></span><div>
      <button type="button" aria-pressed={audio} onClick={() => setBrainBoostAudioEnabled(!audio)}>{audio ? 'Sonido ON' : 'Sonido OFF'}</button><button type="button" aria-pressed={view.immersive} onClick={() => view.immersive ? view.leave() : view.enter()}>{view.immersive ? 'Reducir' : 'Expandir'}</button>{view.immersive && !view.native && <button type="button" onClick={view.enter}>Pantalla completa</button>}<button type="button" onClick={exit}>Salir</button>
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
      {metrics && diagnostics && <output className="na-diagnostics">{Math.round(metrics.fps)} FPS · p95 {metrics.frameP95.toFixed(1)}ms · CPU update {metrics.updateMs.toFixed(1)}ms / render {metrics.renderMs.toFixed(1)}ms<br />{metrics.calls} draws · {metrics.triangles} tris · G {metrics.geometries} / T {metrics.textures} · {metrics.enemies} enemigos</output>}
      {danger && active && <div className="na-warning" role="status">SALUD CRÍTICA · BUSCÁ UN BOTIQUÍN</div>}
      {notice && <div className="na-notice" role="status">{notice}</div>}
      {snapshot.phase === 'WAVE_TRANSITION' && !error && <div className="na-wave" role="status">OLEADA {snapshot.wave} SUPERADA<small>{coop ? 'Los marines caídos regresan con 35 de salud.' : 'Respirá. La siguiente horda se acerca.'}</small></div>}
      {(error || ['LOADING', 'READY', 'PAUSED', 'GAME_OVER'].includes(snapshot.phase)) && <div className="na-overlay"><div className="na-menu">
        <p className="na-eyebrow">{error ? 'SISTEMA GRÁFICO' : snapshot.phase === 'GAME_OVER' ? coop ? 'ESCUADRÓN PERDIDO' : 'SEÑAL DEL MARINE PERDIDA' : 'DIGITALBOOST / ALIEN HORDE SURVIVAL'}</p>
        <h4>{error ? 'Escena no disponible' : snapshot.phase === 'PAUSED' ? 'En pausa' : snapshot.phase === 'GAME_OVER' ? 'La horda ganó' : coop ? 'SOBREVIVAN JUNTOS' : 'SOBREVIVÍ AL NIDO'}</h4>
        <p>{error || (snapshot.phase === 'GAME_OVER' ? `${snapshot.score} puntos · ${snapshot.kills} criaturas · oleada ${snapshot.wave} · ${Math.floor(snapshot.elapsed)}s · ${snapshot.bossesKilled} jefes derrotados` : snapshot.phase === 'PAUSED' ? 'Combate y música detenidos. Reanudá cuando estés listo.' : coop ? 'Dos marines en el mismo dispositivo. Salud y munición individuales, progreso compartido. Sin fuego amigo. Si caen ambos, termina la partida.' : 'Sos el último marine. Rodeá las hordas, recogé suministros y derrotá a los jefes para ampliar tu arsenal.')}</p>
        {!error && snapshot.phase === 'GAME_OVER' && <p className="na-run-unlocks">{snapshot.unlockedThisRun.length ? `ARMAS OBTENIDAS · ${snapshot.unlockedThisRun.map(id => WEAPONS[id].name).join(' · ')}` : 'Sin armas nuevas en esta partida · tu arsenal sigue disponible.'}</p>}
        {!error && <>
          <label className="na-mode">Jugadores <select aria-label="Cantidad de jugadores" value={playerCount} disabled={snapshot.phase !== 'READY'} onChange={e => changeCount(Number(e.target.value) as 1 | 2)}><option value={1}>Individual</option><option value={2}>Cooperativo local · 2 jugadores</option></select></label>
          <p className="na-controls">{coop ? <>P1: WASD · F dispara · Espacio Shockwave · Q cambia arma<br />P2: flechas · J / Ctrl derecho dispara · K / Shift derecho Shockwave · L / Enter cambia arma<br />También dos gamepads o los controles táctiles de cada vista. En móvil conviene girar la pantalla.</> : <>WASD / flechas o joystick: moverse · F / ratón / FUEGO: disparar · Espacio: Shockwave · P: pausa</>}<br />Asistido: mantené FUEGO para seguir objetivos automáticamente en 360°, incluso al mover el dedo o el ratón. El aro marca el objetivo. Para apuntar manualmente con ratón, arrastrando FUEGO o con stick derecho, elegí Moderno.</p>
          {snapshot.marines.map(marine => <label key={marine.id} className="na-mode">Apuntado {coop ? `P${marine.id + 1}` : ''}<select aria-label={coop ? `Modo de apuntado P${marine.id + 1}` : 'Modo de apuntado'} value={modes[marine.id]} onChange={e => { const next = e.target.value as AimMode; setModes(old => old.map((mode, i) => i === marine.id ? next : mode)); engine.current?.setMode(next, marine.id); }}><option value="assisted">Asistido · seguimiento 360°</option><option value="classic">Clásico · diagonal 45°</option><option value="modern">Moderno · ratón / stick derecho / FUEGO</option></select></label>)}
          <label className="na-mode">Música <input aria-label="Volumen de música" type="range" min={0} max={1} step={.05} value={musicVolume} onChange={e => { const volume = Number(e.target.value); setMusicVolume(volume); setBrainBoostMusicVolume(volume); }} /></label>
          <p className="na-music-status" data-score-status={musicStatus}>{musicStatus === 'fallback' ? 'Música: síntesis de respaldo · recursos no disponibles' : musicStatus === 'loading' ? 'Cargando banda sonora…' : 'Containment Breach · banda sonora original'}</p>
          <label className="na-mode">Gráficos <select aria-label="Calidad gráfica" value={quality} onChange={e => { const q = e.target.value as typeof quality; setQuality(q); engine.current?.setQuality(q); }}><option value="auto">Automático</option><option value="low">Bajo · sin bloom</option><option value="high">Alto</option></select></label>
          <label className="na-mode"><input type="checkbox" checked={diagnostics} onChange={e => { setDiagnostics(e.target.checked); engine.current?.setDiagnostics(e.target.checked); }} /> Diagnóstico de rendimiento</label>
          <label className="na-mode"><input type="checkbox" checked={remains} onChange={e => { setRemains(e.target.checked); engine.current?.setRemains(e.target.checked); }} /> Restos de combate en el suelo</label>
          {snapshot.phase === 'READY' && (coop ? <div className="na-coop-loadout">{snapshot.marines.map(marine => <label className="na-mode" key={marine.id}>Arma P{marine.id + 1}<select aria-label={`Arma inicial P${marine.id + 1}`} value={marine.weapon} onChange={e => choose(e.target.value as WeaponId, marine.id)}>{WEAPON_IDS.map(id => <option key={id} value={id} disabled={!progress.unlocked.includes(id)}>{WEAPONS[id].name}{!progress.unlocked.includes(id) ? ' · bloqueada' : ''}</option>)}</select></label>)}</div> : <div className="na-loadout" aria-label="Arsenal inicial">{WEAPON_IDS.map(id => <button type="button" key={id} disabled={!progress.unlocked.includes(id)} aria-pressed={snapshot.weapon === id} title={unlockDescriptions[id]} onClick={() => choose(id)}>{WEAPONS[id].name}{!progress.unlocked.includes(id) && <small>{unlockDescriptions[id]}</small>}</button>)}</div>)}
          <p className="na-controls">Récord {coop ? 'cooperativo' : 'individual'} {best} · {progress.unlocked.length}/5 armas · Progreso local recreativo{coop && <><br />Gamepad: A / RT dispara · B Shockwave · LB cambia arma · Start pausa. Los caídos regresan en la siguiente oleada.</>}</p>
        </>}
        {!error && <p className="na-objective">PRÓXIMO JEFE · {snapshot.nextEncounter.name} · OLA {snapshot.nextEncounter.wave}<small>{progress.unlocked.includes(snapshot.nextEncounter.reward) ? 'Arma obtenida · superá tu marca de supervivencia' : `Desbloquea ${WEAPONS[snapshot.nextEncounter.reward].name}`}</small></p>}
        <div className="na-menu-actions"><button ref={startButton} type="button" className="na-primary" disabled={!error && snapshot.phase === 'LOADING'} onClick={error || snapshot.phase === 'GAME_OVER' ? restart : snapshot.phase === 'PAUSED' ? () => engine.current?.togglePause() : start}>{error ? 'Reintentar escena' : snapshot.phase === 'GAME_OVER' ? 'Nueva partida' : snapshot.phase === 'PAUSED' ? 'Reanudar partida' : snapshot.phase === 'LOADING' ? 'Cargando escena…' : 'Iniciar supervivencia →'}</button><button type="button" onClick={exit}>Volver a Nightmare Protocolo</button></div>
      </div></div>}
    </div>
    <div className="na-arsenal-rows">{snapshot.marines.map(marine => <div className="na-weapon-bar" key={marine.id} data-arsenal-player={marine.id}><span className="na-active-weapon"><b>{coop ? `P${marine.id + 1} · ` : ''}{WEAPONS[marine.weapon].name}</b> · {marine.weapon === 'machinegun' ? '∞' : marine.ammo}{marine.shield > 0 ? ' · ESCUDO' : ''}{marine.haste > 0 ? ' · CADENCIA +' : ''}{!marine.alive ? ' · CAÍDO' : ''}</span><div className="na-weapon-slots" aria-label={`Cambio rápido de armas${coop ? ` P${marine.id + 1}` : ''}`}>{snapshot.unlocked.map(id => <button type="button" key={id} className={marine.weapon === id ? 'na-weapon-slot is-active' : 'na-weapon-slot'} onPointerDown={e => e.preventDefault()} aria-label={`Equipar ${WEAPONS[id].name}${coop ? ` P${marine.id + 1}` : ''}`} aria-pressed={marine.weapon === id} disabled={!marine.alive || !['READY', 'PLAYING', 'WAVE_TRANSITION'].includes(snapshot.phase)} onClick={() => choose(id, marine.id)}><kbd>{WEAPON_IDS.indexOf(id) + 1}</kbd><strong>{WEAPONS[id].name.replace('Granada de ', '').replace('Ametralladora', 'AMG').replace('Lanzallamas', 'FLM')}</strong><small>{id === 'machinegun' ? '∞' : marine.ammoByWeapon[id]}</small></button>)}</div></div>)}</div>
    <p className="na-footer">{coop ? 'Cooperativo local · récord de equipo' : 'Marine · hordas · suministros · Récord'} {best}<span>{Math.floor(snapshot.elapsed / 60)}:{String(Math.floor(snapshot.elapsed % 60)).padStart(2, '0')}</span></p>
  </div>;
}
