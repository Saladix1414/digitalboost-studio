import { Boxes, Crosshair, Heart, MapPin, Maximize, Minimize, Pause, Play, Radio, Settings, User, Users, Volume2, VolumeX, X } from 'lucide-react';
import { getContainmentStatus, subscribeContainmentStatus } from './ContainmentScore';
import type { ArenaDiagnostics } from './RenderMetrics';
import { useEffect, useRef, useState } from 'react';
import { NeonArenaEngine } from './NeonArenaEngine';
import type { AimMode } from './AimAssist';
import { GameSimulation } from './GameSimulation';
import { DEFAULT_ARENA } from './ArenaDefinition';
import { COLONY_SECTORS } from './ColonySectors';
import { BOSSES, WEAPONS, WEAPON_IDS, nextBossEncounter, readProgress, saveProgress, type WeaponId } from './SurvivalRules';
import { getBrainBoostMusicVolume, setBrainBoostMusicVolume, resetNeonSurvivalScore, releaseNeonSurvivalScore, isBrainBoostAudioEnabled, playBrainBoostSfx, playNeonSurvivalSfx, playNeonCreatureSfx, setBrainBoostAudioEnabled, subscribeBrainBoostAudioEnabled, startBrainBoostMusic, stopBrainBoostMusic, setNeonSurvivalMood } from '../brainBoostAudio';
import { useImmersiveArena } from './useImmersiveArena';
import './NeonArenaGame.css';
const initial = new GameSimulation(undefined, null, undefined, 1, DEFAULT_ARENA).snapshot();
type Snapshot = typeof initial;
const BEST_KEY = 'digitalboost:brain-boost:neon-arena:best:v1';
const COOP_BEST_KEY = 'digitalboost:brain-boost:neon-arena:best:coop:v1';
const bestKey = (count: number) => count === 2 ? COOP_BEST_KEY : BEST_KEY;
function storage() { try { return window.localStorage; } catch { return undefined; } }
function readBest(count = 1) { try { const n = Number(storage()?.getItem(bestKey(count))); return Number.isSafeInteger(n) && n >= 0 ? n : 0; } catch { return 0; } }
const unlockDescriptions: Record<WeaponId, string> = { machinegun: 'Disponible', shotgun: 'Eliminá 30 criaturas en una partida', flame: 'Derrotá a Brood Mother · oleada 5', cascade: 'Derrotá a Iron Maw · oleada 12', rail: 'Derrotá a Hive Sovereign · oleada 20' };
let encounter = nextBossEncounter(1, false, DEFAULT_ARENA);
const campaign = COLONY_SECTORS.map((sector, index) => {
  if (index > 0) encounter = nextBossEncounter(encounter.wave, true, DEFAULT_ARENA);
  return { ...sector, encounter };
});
const weaponMarks: Record<WeaponId, string> = {
  machinegun: 'M1 7h5V5h11v2h6v2h-8l-2 4h-3l1-4H7l-3 2H1Z',
  shotgun: 'M1 8h5l3-2h14v3H12l-2 2H6l-4 2H1Z',
  flame: 'M12 1c2 5 7 6 7 11a7 7 0 0 1-14 0c0-3 2-5 4-7 0 3 1 4 2 4 1-2 2-5 1-8Zm1 9c-1 3-4 4-4 6a3 3 0 0 0 6 0c0-2-1-3-2-6Z',
  cascade: 'M8 4h8v3l3 3v5l-3 3H8l-3-3v-5l3-3Zm2-3h7v2h-7Z',
  rail: 'M1 8h4V5h13l2 2h3v3h-9l-2 3H9l1-3H5l-4 2Zm9-2v2h6V6Z',
};
const menuViews = { mission: 'Misión', arsenal: 'Arsenal', settings: 'Ajustes' } as const;
type MenuView = keyof typeof menuViews;
const menuIcons = { mission: Crosshair, arsenal: Boxes, settings: Settings };
const sectorArt = [
  'M0 66h22V47h24V35h12v31h16V23h20V8h11v38h8V20h9v42h18v28H0z M7 78h61 M28 58h10 M77 37h13 M77 46h13 M100 69h32',
  'M5 88c5-18 16-19 26-20 0-30 33-39 43-5 5-12 10-20 24-17 9 2 12 9 16 16 12-11 24-4 27 9v19z M80 0l8 25 23 8 13 16 M105 0l7 12 20 9 M32 62l8-6 M45 73l7-6 M86 65l6-6 M106 73l4-5',
  'M36 0v15l18 13v10 M123 0v15l-18 13v10 M27 0v20l17 14 M130 0v20l-16 14 M27 89h105l-12-13H39z M54 72c-12-15 9-43 23-43 14 0 35 28 23 43-10 10-36 10-46 0z M73 51l5 6 M87 60l5 5',
  'M8 90l23-24h20l7-15h13V0h10v51h13V0h10v51h13l7 15h10l6 24z M17 84h108 M46 75h66 M64 61h44 M84 67V41 M94 69V32',
] as const;
function MarineControls({ marine, active, onShock, coop }: { marine: Snapshot['marines'][number]; active: boolean; onShock: () => void; coop: boolean }) {
  return <div className="na-combat-controls" hidden={!active || !marine.alive}>
    <div className="na-joystick" data-na-stick="" data-na-player={marine.id} aria-label={`Joystick de movimiento P${marine.id + 1}`}><span /><small>MOVER {coop ? `P${marine.id + 1}` : ''}</small></div>
    <div className="na-right-controls">
      <button type="button" className="na-shock-button" aria-label={`Shockwave P${marine.id + 1}`} onPointerDown={e => e.preventDefault()} disabled={marine.cooldown > 0} onClick={onShock}>
        <Radio size={18} aria-hidden="true" /><span>{marine.cooldown > 0 ? `${Math.ceil(marine.cooldown)}s` : 'SHOCK'}</span>
      </button>
      <button type="button" data-na-fire="" data-na-player={marine.id} className="na-fire-button" aria-label={coop ? `Mantener para disparar P${marine.id + 1}` : 'Mantener para disparar'}>
        <Crosshair className="na-aim-knob" size={21} aria-hidden="true" />FUEGO {coop ? `P${marine.id + 1}` : ''}
      </button>
    </div>
  </div>;
}
export default function NeonArenaGame({ onExit }: { onExit: () => void }) {
  const root = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null), engine = useRef<NeonArenaEngine | null>(null), startButton = useRef<HTMLButtonElement>(null);
  const [snapshot, setSnapshot] = useState(initial), [error, setError] = useState(''), [session, setSession] = useState(0);
  const [playerCount, setPlayerCount] = useState<1 | 2>(1), [best, setBest] = useState(() => readBest(1)), [audio, setAudio] = useState(isBrainBoostAudioEnabled);
  const [progress, setProgress] = useState(() => readProgress(storage())), [modes, setModes] = useState<AimMode[]>(['assisted', 'assisted']);
  const [musicStatus, setMusicStatus] = useState(getContainmentStatus), [musicVolume, setMusicVolume] = useState(getBrainBoostMusicVolume);
  const [quality, setQuality] = useState<'auto' | 'low' | 'high' | 'horde'>('auto'), [diagnostics, setDiagnostics] = useState(false), [metrics, setMetrics] = useState<ArenaDiagnostics | null>(null);
  const [menuView, setMenuView] = useState<MenuView>('mission');
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
    if (['READY', 'PAUSED', 'GAME_OVER'].includes(snapshot.phase)) {
      setMenuView('mission');
      startButton.current?.focus({ preventScroll: true });
    }
  }, [snapshot.phase]);
  useEffect(() => {
    if (snapshot.phase !== 'GAME_OVER' || resultSaved.current) return;
    resultSaved.current = true; const next = Math.max(readBest(playerCount), snapshot.score); setBest(next);
    try { storage()?.setItem(bestKey(playerCount), String(next)); } catch { /* Storage is optional. */ }
    stopBrainBoostMusic('neon-arena'); playBrainBoostSfx('neon-arena', 'game-over');
  }, [snapshot.phase, snapshot.score, playerCount]);
  const changeCount = (count: 1 | 2) => { if (engine.current?.setPlayerCount(count)) { setPlayerCount(count); setBest(readBest(count)); } };
  const start = () => { resetNeonSurvivalScore(); view.arm(); setNeonSurvivalMood('start'); if (audio) startBrainBoostMusic('neon-arena'); engine.current?.start(); playBrainBoostSfx('neon-arena', 'start'); };
  const restart = () => { setMenuView('mission'); setSession(n => n + 1); };
  const choose = (id: WeaponId, playerId = 0) => { if (engine.current?.simulation.equip(id, playerId)) { setSnapshot(engine.current.simulation.snapshot()); if (snapshot.phase === 'PLAYING') host.current?.querySelector('canvas')?.focus({ preventScroll: true }); } };
  const active = snapshot.phase === 'PLAYING' && !error;
  useEffect(() => {
    if (snapshot.mapPhase > 0) {
      const next = COLONY_SECTORS[snapshot.mapPhase % COLONY_SECTORS.length];
      setNotice(current => current.startsWith('ARMA DESBLOQUEADA') ? `${next.name} · ${current}` : `${next.name} · ${next.condition}`);
    }
  }, [snapshot.mapPhase]);
  const lobby = !error && snapshot.phase === 'READY';
  const paused = !error && snapshot.phase === 'PAUSED';
  const menuOpen = !!error || ['LOADING', 'READY', 'PAUSED', 'GAME_OVER'].includes(snapshot.phase);
  const sector = COLONY_SECTORS[snapshot.mapPhase % COLONY_SECTORS.length];
  const visibleViews: MenuView[] = lobby ? ['mission', 'arsenal', 'settings'] : ['mission', 'settings'];
  const hud = <div className="na-hud" aria-label="Estado de partida">
    <span className="na-hud-stat"><small>{coop ? 'EQUIPO' : 'PUNTOS'}</small><b>{String(snapshot.score).padStart(5, '0')}</b></span>
    <span className="na-hud-stat"><small>OLEADA</small><b>{String(snapshot.wave).padStart(2, '0')}</b></span>
    <span className="na-hud-sector"><MapPin size={14} aria-hidden="true" /><b>{sector.name}</b></span>
    {coop ? <span className="na-team-badge">COOP LOCAL · 2P</span> : <span className={`na-health${danger ? ' na-critical' : ''}`}>
      <span className="na-health-number"><Heart size={14} aria-hidden="true" /><b>{snapshot.health}%</b></span>
      <span role="progressbar" aria-label="Salud del marine" aria-valuenow={snapshot.health} aria-valuemin={0} aria-valuemax={100} className="na-meter"><i style={{ width: `${snapshot.health}%` }} /></span>
    </span>}
    <button type="button" className="na-pause-button" aria-label={paused ? 'Reanudar' : 'Pausa'} title={paused ? 'Reanudar' : 'Pausa'} disabled={!['PLAYING', 'WAVE_TRANSITION', 'PAUSED'].includes(snapshot.phase) || !!error} onClick={() => engine.current?.togglePause()}>
      {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
    </button>
  </div>;
  const encounter = <>
    {active && !snapshot.boss && <div className="na-director" data-na-director=""><span>EN CAMPO <b>{snapshot.activeEnemies}</b> · LLEGANDO <b>{snapshot.pendingEnemies}</b></span><span>JEFE · OLA {snapshot.nextEncounter.wave}</span></div>}
    {snapshot.boss && <div className="na-boss" role="status"><b>{BOSSES[snapshot.boss.name].name} · FASE {snapshot.boss.phase}</b><span className="na-meter" role="progressbar" aria-label="Salud del jefe" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.ceil(snapshot.boss.hp / snapshot.boss.maxHp * 100)}><i style={{ width: `${snapshot.boss.hp / snapshot.boss.maxHp * 100}%` }} /></span><small>{snapshot.boss.warning ? '¡ATAQUE INMINENTE! MOVETE FUERA DE LA SEÑAL' : 'Buscá una ventana para atacar'}</small></div>}
  </>;
  return <div ref={root} className={`na-game${view.immersive ? ' na-game--immersive' : ''}${coop ? ' na-game--coop' : ''}`} data-neon-fullscreen={view.native ? 'native' : view.immersive ? 'viewport' : 'off'} data-neon-phase={error ? 'ERROR' : snapshot.phase} data-neon-players={playerCount} data-menu-open={menuOpen}>
    <div className="na-toolbar"><span><b>NEON ARENA</b><small>{coop ? 'COOPERATIVO LOCAL / PANTALLA DIVIDIDA' : 'NIGHTMARE PROTOCOLO / ALIEN HORDE SURVIVAL'}</small></span><div>
      <button type="button" aria-label="Sonido" aria-pressed={audio} onClick={() => setBrainBoostAudioEnabled(!audio)}>{audio ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}<span>{audio ? 'Sonido ON' : 'Sonido OFF'}</span></button>
      <button type="button" aria-label={view.immersive ? 'Reducir' : 'Expandir'} aria-pressed={view.immersive} onClick={() => view.immersive ? view.leave() : view.enter()}>{view.immersive ? <Minimize size={17} aria-hidden="true" /> : <Maximize size={17} aria-hidden="true" />}<span>{view.immersive ? 'Reducir' : 'Expandir'}</span></button>
      {view.immersive && !view.native && <button type="button" aria-label="Pantalla completa" onClick={view.enter}><Maximize size={17} aria-hidden="true" /><span>Pantalla completa</span></button>}
      <button type="button" aria-label="Salir" onClick={exit}><X size={17} aria-hidden="true" /><span>Salir</span></button>
    </div></div>
    {coop && !menuOpen && <div className="na-team-header">{hud}{encounter}</div>}
    <div className="na-stage" data-playing={active}>
      <div className="na-canvas" ref={host} />
      {!coop && !menuOpen && <div className="na-combat-status">{hud}{encounter}</div>}
      <div className="na-player-panels">{snapshot.marines.map(marine => <div className="na-player-pane" key={marine.id} data-player-id={marine.id}>
        {coop && !menuOpen && <div className="na-player-stats"><b>P{marine.id + 1} · {marine.alive ? `${marine.health}%` : 'CAÍDO'}</b><span>{WEAPONS[marine.weapon].name} · {marine.weapon === 'machinegun' ? '∞' : marine.ammo}</span><span className="na-meter" role="progressbar" aria-label={`Salud P${marine.id + 1}`} aria-valuenow={marine.health} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${marine.health}%` }} /></span></div>}
        {coop && !marine.alive && active && <div className="na-fallen" role="status">P{marine.id + 1} CAÍDO<small>Tu compañero puede recuperarte al completar la oleada.</small></div>}
        <MarineControls marine={marine} active={active} coop={coop} onShock={() => engine.current?.simulation.shock(marine.id)} />
      </div>)}</div>
      {metrics && diagnostics && <output className="na-diagnostics">{Math.round(metrics.fps)} FPS · p95 {metrics.frameP95.toFixed(1)}ms · CPU update {metrics.updateMs.toFixed(1)}ms / render {metrics.renderMs.toFixed(1)}ms<br />{metrics.calls} draws · {metrics.triangles} tris · G {metrics.geometries} / T {metrics.textures} · {metrics.enemies} enemigos</output>}
      {danger && active && <div className="na-warning" role="status">SALUD CRÍTICA · BUSCÁ UN BOTIQUÍN</div>}
      {notice && <div className="na-notice" role="status">{notice}</div>}
      {snapshot.phase === 'WAVE_TRANSITION' && !error && <div className="na-wave" role="status"><b>OLEADA {snapshot.wave} SUPERADA</b><small>{coop ? 'Los marines caídos regresan con 35 de salud.' : 'Respirá. La siguiente horda se acerca.'}</small><em>REARME DISPONIBLE · REVISÁ TU ARSENAL ABAJO</em></div>}
      {menuOpen && <div className="na-overlay"><section className="na-menu" data-cabinet={lobby} aria-label="Menú de Neon Arena">
        <header className="na-menu-header">
          <p className="na-eyebrow">{error ? 'Sistema gráfico' : 'OriginX Foundation · Nightmare Protocolo · Virus Survivor'}</p>
          {lobby && <span className="na-cabinet-title">Neon Arena</span>}
          <h4>{error ? 'Escena no disponible' : paused ? 'En pausa' : snapshot.phase === 'GAME_OVER' ? 'La horda ganó' : 'Sobreviví al nido'}</h4>
        </header>
        {(lobby || paused) && <nav className="na-menu-nav" aria-label="Vistas del menú">
          {visibleViews.map(view => {
            const Icon = menuIcons[view];
            return <button key={view} type="button" aria-pressed={menuView === view} onClick={() => setMenuView(view)}>
              <Icon size={16} aria-hidden="true" />{menuViews[view]}
            </button>;
          })}
        </nav>}
        <div className="na-menu-body" key={menuView}>
          {(menuView === 'mission' || (!lobby && !paused)) && <>
            {lobby ? <>
              <ol className="na-campaign" aria-label="Ruta de la colonia">{campaign.map(({ name, condition, encounter }, index) => <li key={name} data-sector={index} title={condition}>
                <svg className="na-sector-art" viewBox="0 0 140 90" aria-hidden="true">
                  <path d={sectorArt[index]} fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <b>{name}</b>
                <small>Ola {encounter.wave} · {encounter.name}</small>
              </li>)}</ol>
              <p className="na-menu-record">Récord {coop ? 'cooperativo' : 'individual'} <b>{best}</b> · {progress.unlocked.length}/5 armas</p>
            </> : <>
              <p>{error || (snapshot.phase === 'GAME_OVER' ? `${snapshot.score} puntos · ${snapshot.kills} criaturas · oleada ${snapshot.wave} · ${Math.floor(snapshot.elapsed)}s · ${snapshot.bossesKilled} jefes derrotados` : paused ? `${sector.name} · oleada ${snapshot.wave}` : 'Preparando la colonia…')}</p>
              {!error && snapshot.phase === 'GAME_OVER' && <p className="na-run-unlocks">{snapshot.unlockedThisRun.length ? `ARMAS OBTENIDAS · ${snapshot.unlockedThisRun.map(id => WEAPONS[id].name).join(' · ')}` : 'Tu arsenal sigue disponible para la próxima partida.'}</p>}
              {paused && <p className="na-menu-next">Próximo jefe · {snapshot.nextEncounter.name} · ola {snapshot.nextEncounter.wave}</p>}
            </>}
          </>}
          {(lobby || paused) && menuView === 'settings' && <>
            <p className="na-controls">{coop ? <>P1: WASD · F dispara · Espacio Shockwave · Q cambia arma<br />P2: flechas · J / Ctrl derecho dispara · K / Shift derecho Shockwave · L / Enter cambia arma<br />También dos gamepads o los controles táctiles de cada vista. En móvil conviene girar la pantalla.</> : <>WASD / flechas o joystick: moverse · F / ratón / FUEGO: disparar · Espacio: Shockwave · P: pausa</>}<br />Asistido: mantené FUEGO para seguir objetivos automáticamente en 360°, incluso al mover el dedo o el ratón. El aro marca el objetivo. Para apuntar manualmente con ratón, arrastrando FUEGO o con stick derecho, elegí Moderno.</p>
            {snapshot.marines.map(marine => <label key={marine.id} className="na-mode">Apuntado {coop ? `P${marine.id + 1}` : ''}<select aria-label={coop ? `Modo de apuntado P${marine.id + 1}` : 'Modo de apuntado'} value={modes[marine.id]} onChange={e => { const next = e.target.value as AimMode; setModes(old => old.map((mode, i) => i === marine.id ? next : mode)); engine.current?.setMode(next, marine.id); }}><option value="assisted">Asistido · seguimiento 360°</option><option value="classic">Clásico · diagonal 45°</option><option value="modern">Moderno · ratón / stick derecho / FUEGO</option></select></label>)}
            <label className="na-mode">Música <input aria-label="Volumen de música" type="range" min={0} max={1} step={.05} value={musicVolume} onChange={e => { const volume = Number(e.target.value); setMusicVolume(volume); setBrainBoostMusicVolume(volume); }} /></label>
            <p className="na-music-status" data-score-status={musicStatus}>{musicStatus === 'fallback' ? 'Música: síntesis de respaldo · recursos no disponibles' : musicStatus === 'loading' ? 'Cargando banda sonora…' : 'Containment Breach · banda sonora original'}</p>
            <label className="na-mode">Gráficos <select aria-label="Calidad gráfica" value={quality} onChange={e => { const q = e.target.value as typeof quality; setQuality(q); engine.current?.setQuality(q); }}><option value="auto">Automático</option><option value="low">Bajo · sin bloom</option><option value="horde">Horda masiva · estable</option><option value="high">Alto</option></select></label>
            <label className="na-mode"><input type="checkbox" checked={diagnostics} onChange={e => { setDiagnostics(e.target.checked); engine.current?.setDiagnostics(e.target.checked); }} /> Diagnóstico de rendimiento</label>
            <label className="na-mode"><input type="checkbox" checked={remains} onChange={e => { setRemains(e.target.checked); engine.current?.setRemains(e.target.checked); }} /> Restos de combate en el suelo</label>
          </>}
          {lobby && menuView === 'arsenal' && (coop ? <div className="na-coop-loadout">{snapshot.marines.map(marine => <label className="na-mode" key={marine.id}>Arma P{marine.id + 1}<select aria-label={`Arma inicial P${marine.id + 1}`} value={marine.weapon} onChange={e => choose(e.target.value as WeaponId, marine.id)}>{WEAPON_IDS.map(id => <option key={id} value={id} disabled={!progress.unlocked.includes(id)}>{WEAPONS[id].name}{!progress.unlocked.includes(id) ? ' · bloqueada' : ''}</option>)}</select></label>)}</div> : <div className="na-loadout" aria-label="Arsenal inicial">{WEAPON_IDS.map(id => <button type="button" key={id} disabled={!progress.unlocked.includes(id)} aria-pressed={snapshot.weapon === id} title={unlockDescriptions[id]} onClick={() => choose(id)}>{WEAPONS[id].name}{!progress.unlocked.includes(id) && <small>{unlockDescriptions[id]}</small>}</button>)}</div>)}
        </div>
        {lobby && <div className="na-cabinet-mode" role="group" aria-label="Cantidad de jugadores">
          <button type="button" aria-pressed={!coop} onClick={() => changeCount(1)}><User size={16} aria-hidden="true" />Individual</button>
          <button type="button" aria-pressed={coop} onClick={() => changeCount(2)}><Users size={16} aria-hidden="true" />Cooperativo</button>
        </div>}
        <div className="na-menu-actions"><button ref={startButton} type="button" className="na-primary" disabled={!error && snapshot.phase === 'LOADING'} onClick={error || snapshot.phase === 'GAME_OVER' ? restart : snapshot.phase === 'PAUSED' ? () => engine.current?.togglePause() : start}>{error ? 'Reintentar escena' : snapshot.phase === 'GAME_OVER' ? 'Nueva partida' : snapshot.phase === 'PAUSED' ? 'Reanudar partida' : snapshot.phase === 'LOADING' ? 'Cargando escena…' : 'Iniciar supervivencia →'}</button><button type="button" onClick={exit}>Volver a Nightmare Protocolo</button></div>
      </section></div>}
    </div>
    <div className="na-arsenal-rows" hidden={menuOpen}>
      {snapshot.marines.map(marine => <div className="na-weapon-bar" key={marine.id} data-arsenal-player={marine.id}>
        <span className="na-active-weapon">
          <b>{coop ? `P${marine.id + 1} · ` : ''}{WEAPONS[marine.weapon].name}</b> · {marine.weapon === 'machinegun' ? '∞' : marine.ammo}
          {marine.shield > 0 ? ' · ESCUDO' : ''}{marine.haste > 0 ? ' · CADENCIA +' : ''}{!marine.alive ? ' · CAÍDO' : ''}
        </span>
        <div className="na-weapon-slots" aria-label={`Cambio rápido de armas${coop ? ` P${marine.id + 1}` : ''}`}>
          {snapshot.unlocked.map(id => <button
            type="button" key={id}
            className={marine.weapon === id ? 'na-weapon-slot is-active' : 'na-weapon-slot'}
            onPointerDown={e => e.preventDefault()}
            aria-label={`Equipar ${WEAPONS[id].name}${coop ? ` P${marine.id + 1}` : ''}`}
            title={WEAPONS[id].name}
            aria-pressed={marine.weapon === id}
            disabled={!marine.alive || !['READY', 'PLAYING', 'WAVE_TRANSITION'].includes(snapshot.phase)}
            onClick={() => choose(id, marine.id)}
          >
            <kbd>{WEAPON_IDS.indexOf(id) + 1}</kbd>
            <svg className="na-weapon-mark" viewBox="0 0 24 20" aria-hidden="true"><path d={weaponMarks[id]} /></svg>
            <small>{id === 'machinegun' ? '∞' : marine.ammoByWeapon[id]}</small>
          </button>)}
        </div>
      </div>)}
    </div>
    <p className="na-footer" hidden={menuOpen}>{coop ? 'Cooperativo local · récord de equipo' : 'Marine · hordas · suministros · Récord'} {best}<span>{Math.floor(snapshot.elapsed / 60)}:{String(Math.floor(snapshot.elapsed % 60)).padStart(2, '0')}</span></p>
  </div>;
}
