# Neon Arena V4 — Alien Horde Survival

## Master specification

The user's accepted V4.0 prompt and Phobia II screenshot supersede the old reactor-defense rules. This is a migration of the existing Brain Boost experience, not a second game or standalone application.

Preserved: Focus Lab entry, modal navigation, lazy loading, error boundary, Three.js 0.186.1, shared audio graph, score key, StrictMode lifecycle, fixed timestep, WebGL recovery and portable TypeScript 5.9.3.

Changed: a marine survives pursuing creatures in an organic environment. Player health replaces core health. Directional projectiles replace automatic targeting. Orthographic top-down composition replaces the elevated reactor composition. The old reactor/city geometry and drone authority were removed from the active implementation.

Implementation branch: `feat/alien-horde-survival`, based on the user's published `b66fc68`. No remote writes, push, deployment, external assets, extra runtime dependency or new backend.

## Responsibilities

| Module | Responsibility |
| --- | --- |
| `GameSimulation.ts` | Sole gameplay authority; seeded movement/combat/director, spatial grid, contact protection, projectiles, bosses, rewards, pickups, weapon cooldowns |
| `SurvivalRules.ts` | Weapon definitions, shared obstacle circles, validated/merged versioned local progression, geometry math |
| `SurvivalWorld.ts` | Read-only 3D representation, shared meshes, instanced bodies/legs/plates/boss organs, procedural ground, marine, impacts, bounded remains, camera |
| `NeonArenaEngine.ts` | Input adapters, two-pointer capture, fixed-step loop, render/composer fallback, immediate reward callback, GPU lifecycle |
| `NeonArenaGame.tsx` | Menus, HUD, arsenal, controls, results, existing score persistence, reward storage, audio lifecycle |
| `brainBoostAudio.ts` | Original survival composition and effects through the existing graph and scheduler |

## Playable rules

- Move with WASD/arrows or the left joystick. Diagonal movement has normalized speed.
- Hold F, the left mouse button or FUEGO to shoot. Classic aim defaults to heading +45° clockwise on the ground plane and keeps its last orientation when stationary.
- Modern aim is optional: independent mouse raycast, or drag the FUEGO control to select a direction. No automatic target acquisition.
- Space or SHOCKWAVE triggers a single-hit expanding wave with a 12-second cooldown.
- Keys 1–5 or unlocked weapon buttons change the equipped weapon without resetting per-weapon cooldowns.
- Debris circles match visible collision geometry. Creatures use local separation and tangent obstacle steering. Ranged attacks have direction markers; charges/invocations have warning rings and wind-up.
- Contact has 0.65 seconds of player protection instead of damage every frame. No enemy is removed merely for reaching the player.
- Pickups require proximity. Medkits cap health at 100, shield/cadence buffs cap their durations at 12 seconds and ammo reserves cap at twice the initial allocation.
- Wave transitions give a brief respite, with no invisible healing. Health recovery comes from pickups.
- Hidden tabs/window blur pause. Music and inputs stop; resume is explicit. Reduced motion removes shake and leg/orbit motion; coarse input/reduced motion skips bloom. Slow frames lower resolution and remove composer.

### Arsenal and permanent progression

| Weapon | Unlock | Combat |
| --- | --- | --- |
| Ametralladora | Initially available | Infinite reserve, fast finite-lifetime swept bullets |
| Escopeta | 30 kills in one run | Seven short-range pellets, finite ammunition |
| Lanzallamas | Brood Mother, wave 5 | Directional cone, fuel and bounded periodic burn |
| Granada de cascada | Iron Maw, wave 10 | One grenade, then five scheduled area blasts; queue and per-step budgets |
| Rail Lance | Hive Sovereign, wave 15 | Slow cadence; up to four unique penetrations |

Bosses repeat during continued survival. Brood Mother summons capped skitters and increases pressure below half health. Iron Maw has armor with exposed charge-warning windows. Hive Sovereign fires announced fans with more projectiles below half health. Each has distinguishing appendages, a health/phase HUD and a terminal kill path shared with valid combat.

Rewards are emitted once per boss death and saved during the engine step that grants them. They survive leaving before game over. Storage is local recreational progress, not trusted server authority. Existing score storage remains intact. Unknown IDs and malformed records fall back safely; merges preserve known unlocks; storage failure does not break the running session.

### Rendering and sound

The world uses actual 3D geometry: armored marine/helmet/weapon/boots, segmented creatures with six articulated legs, carapaces, brood sacs, Maw jaws and Sovereign orbital organs. No reference image is used as the rendered scene. Ground texture is generated locally at initialization. Collision debris, organic growth and boundary machinery share materials/geometries. Remains expire after 18 seconds, cap at 80, and can be disabled in the menu.

Original 116 BPM score: bass, industrial percussion, harmonic pads and a recurring sequenced motif. Start/horde/danger/boss/victory moods change musical layers on bar boundaries. Weapon, pickup and warning effects use the existing shared graph, finite source lifetimes, disconnection handlers and per-kind rate limits. No new AudioContext or separate music scheduler was introduced.

## Verification

- `npm run test:brain-boost`: 53/53 PASS (35 pre-existing unrelated tests plus 18 survival tests).
- `npm run typecheck:neon-arena`: PASS, strict checking using TypeScript 5.9.3.
- `npm run build`: PASS; deferred game chunk retained; existing large-chunk warning remains.
- `npm run test:pulse`: 1023/1023 PASS.
- `git diff --check`: PASS.
- Browser desktop 1280×1000 and touch 390×844/reduced motion: select/play, one canvas and RAF under StrictMode, keyboard, two simultaneous touch pointers, pause/time freeze, Shockwave, stage bounds, exit/frame cancellation/GPU context release, context-loss retry and sibling game selection.
- Browser encounter fixtures: all three bosses rendered in the real game UI; actual Shockwave damage triggers immediate persisted weapon rewards; exit/re-entry retains unlocks; a subsequent session equips the flamethrower and consumes real fuel. Fixtures are injected by the test only; production has no debug/cheat entry point. These are controlled encounter tests, not evidence of naturally completing 15 waves.
- Browser audio: analyser measured nonzero output (sample RMS 0.01123), one shared music scheduler, silence after pause, resumed output, mute and no music interval after exit. This verifies signal/lifecycle, not subjective music quality on the user's speakers.
- Pure simulation tests: deterministic 30/60/120 FPS outcomes, normalized input, 45° aim/rest orientation, contact protection, pause/terminal immutability, one-hit Shockwave, boss rewards, cooldown/ammo, swept/penetrating projectiles, flame/burn, five-blast cascade, pickups, obstacle consistency, wave progression, malformed persistence and entity caps.

### CPU stress evidence

`node --experimental-strip-types tests/brain-boost/neonArena.stress.mjs` executed 3,600 updates per profile. The harness explicitly keeps the player invulnerable so it can measure sustained density; this is not a production feature.

| Initial enemies | Mean simulation step | p95 step | Final enemies |
| --- | --- | --- | --- |
| 120 | 0.449 ms | 0.646 ms | 120 |
| 240 | 1.193 ms | 1.603 ms | 240 |

These are host CPU measurements with no renderer. Browser QA used Chromium 153 and software WebGL/SwiftShader. Neither establishes 60/120 FPS, thermal stability or memory behavior on a physical Android device.

Optional browser checks use Playwright supplied by the test environment. Run from the repository root; `NEON_PLAYWRIGHT_MODULE` and `NEON_BROWSER_EXECUTABLE` select environment-installed tools. `neonArena.browser.mjs` starts Vite on 5179; `neonArena.progression.browser.mjs` uses 5181. Both stop their browser/server in finally blocks and keep QA captures temporary under `/tmp`.

## Remaining acceptance work

- Physical Android/Termux gameplay and audio review, sustained GPU/frame-time/memory/thermal measurements.
- Natural full-run balance testing of the 5/10/15-wave bosses, ammo economy and classic diagonal aiming.
- User visual acceptance against the supplied screenshot; this is an original realtime-3D interpretation, not a pixel-identical recreation.
- Local split-screen cooperation is explicitly deferred by the master prompt until solo play is validated. No networking or empty multiplayer abstractions were added.

Historical backups were preserved. New pre-migration copies live under `.phase-backups/neon-v4`; unrelated pre-existing untracked files remain excluded from commits.
