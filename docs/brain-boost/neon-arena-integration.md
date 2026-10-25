# Neon Arena — integration audit and verification

Historical V3 report. Current gameplay and verification: [V4 Alien Horde Survival](neon-arena-v4-survival.md).

Date: 2026-10-25. Scope: received MASTER PROMPT V3.0, ending at section 19, “Escritorio: Arena”. The original visual reference was not attached to this session. Fidelity to that image and requirements beyond the supplied text cannot be certified.

## Repository evidence

- Repository: Saladix1414/digitalboost-studio, cloned into a previously empty workspace.
- `main` at `79ee48a` does not contain the Brain Boost module.
- Integration base: `origin/pulse/hardening-p0-1-approval-binding`, commit `47548c8`.
- Working branch: `feat/neon-arena`. No remote writes or push.
- Clean tracked working tree before implementation. This clone cannot inspect changes or backups remaining exclusively on the user's Termux installation.
- Runtime: Node v24.22.1, npm 11.9.0, Git 2.51.1; Vite 7.3.7 from the lockfile.
- Read root and `src/AGENTS.md`, relevant source files, engines, tests and project architecture instructions. No additional instructions under `src/brain-boost`.

## Actual architecture and minimal integration

| Surface | Existing behavior | Integration |
| --- | --- | --- |
| Landing | `App.tsx` mounts `DigitalBoostMainPage`, which mounts `BrainBoostLandingSection` | No changes to these application roots |
| Catalog | Local `Game`/`Category` types and `categories` in `BrainBoostLandingSection.tsx` | Add ID `neon-arena` to Focus Lab, retain five disciplines |
| Navigation | `activeCategory` and `activeGame`; modal portal; stage selected by game ID | Reuse selection, stage, Modos and close actions |
| Stage | Existing dialog bounds the active game | Lazy Three.js game, scoped responsive stage; expanded height stays inside the existing dialog |
| Visual identity | `gameArtDirections`, `GameMiniature`, existing category CSS | Cyan/red art direction and custom vector catalog miniature |
| Results | Each game owns its session/progress; no shared result adapter contract | Typed simulation snapshot drives React HUD/results; no invented global adapter |
| Cognitive panel | Landing panel currently shows “Sin datos” | Arcade score does not populate cognitive metrics |
| Persistence | Per-game localStorage keys with storage-failure handling | Terminal best score only, safe-integer validation, isolated versioned key |
| Audio | Shared `brainBoostAudio.ts`, game profiles, opt-out and one-shot cues | Add one profile and reuse enabled preference/cues; no private AudioContext/music loop |
| Graphics | Existing `BrainBoostCanvas` / `brainBoostGraphicsEngine` are 2D | Leave them intact; isolate WebGL renderer in the new game module |
| Loading | Existing games are eager imports | Only Neon Arena is lazy; local boundary isolates chunk/UI errors |
| Existing tests | Node test runner, deterministic pure TypeScript engines | Preserve existing 35 Brain Boost tests and PULSE suite |

Focus Lab is the smallest justified product surface: action, attention and threat selection fit its existing remit. This does not claim a validated cognitive assessment. Daily Run and Neural Boss remain unchanged.

## Implementation

- `GameSimulation.ts`: seeded combat, explicit state transitions, fixed-step clock, bounded entities/events, three variants, targeting, damage, terminal rules, expanding single-hit Shockwave, cooldown and wave progression. Reactor collisions damage once and remove the attacker. Between waves, health recovers by an explicit five points, capped at 100.
- `NeonArenaEngine.ts`: direct Three.js/WebGL 2, perspective camera at an approximately 51° downward angle, instanced raised platform panels, mechanical details, perimeter generators, skyline, antennas, bridges, holographic panels, multi-part reactor, orbit rings, rising energy, instanced virus bodies/spikes, drone, white/cyan beams, impact particles and controlled impact shake.
- Postprocessing uses official same-version RenderPass, UnrealBloomPass and OutputPass. Color output and tone mapping follow that pipeline. The direct renderer remains available if composer creation/rendering fails.
- Touch/coarse-pointer and reduced-motion contexts skip bloom. Pixel ratio is capped; sustained slow frames lower resolution and remove composer. These are safeguards, not a measured Android performance guarantee.
- Raycasting uses actual canvas bounds, the perspective camera and an XZ world plane. Pointer capture is scoped to active interaction. Keyboard controls are scoped to the focused canvas. Landing scroll is not disabled globally.
- React owns menus, accessibility, results, navigation and a 10 Hz HUD snapshot. Simulation is the sole combat authority. There is no React copy of enemy positions/health.
- Hidden tabs and window blur pause gameplay. Resuming requires an explicit action. Time accumulation is reset at pause/visibility boundaries.
- Dispose cancels the owned RAF, releases pointer capture, disconnects resize observation, removes listeners, disposes geometries/materials/instance buffers/composer targets, loses the exclusive WebGL context and removes the canvas. Shared one-shot audio uses the existing short cue lifecycle; no new continuous audio resources are created.
- WebGL absence/loss produces a recoverable game-level error. Returning to the catalog keeps other games usable.

## Dependencies and affected files

Runtime: exact `three@0.186.1`; `npm ls three` confirms one copy. No CDN, import map, iframe, Flask, React Three Fiber or new API.

Development: exact TypeScript and React/Three type packages in `package.json`/lockfile. `tsconfig.neon-arena.json` provides strict checking of the new module without imposing a new configuration on unrelated legacy code.

Existing source modifications: `BrainBoostLandingSection.tsx` and `brainBoostAudio.ts` only. New code stays under `src/brain-boost/neon-arena`. Additional files are targeted simulation/browser tests, scoped typecheck configuration, this report and package metadata.

Backup preserved: `src/brain-boost/BrainBoostLandingSection.tsx.bak_neon_arena_20261025`, a local untracked copy made before integration edits. PULSE tests also generated an untracked execution-claim fixture under `data/`; it is excluded from the implementation commits.

## Verification evidence

| Check | Result |
| --- | --- |
| Baseline `npm run build` | PASS; existing large-chunk warning |
| Baseline Brain Boost tests | 35/35 PASS |
| `npm run test:brain-boost` | 42/42 PASS |
| `npm run typecheck:neon-arena` | PASS, strict checking |
| `npm run test:pulse` | 1023/1023 PASS |
| `npm run build` after integration | PASS, separate deferred NeonArenaGame JS/CSS chunks |
| `git diff --check` | PASS |
| Browser desktop 1280×1000 | PASS: catalog launch, one canvas/RAF in StrictMode, play, keyboard, pause/time freeze, Shockwave cooldown, exit, GPU context release, re-entry, context loss/retry and sibling Focus Protocol selection |
| Browser touch 390×844, reduced motion | PASS: same lifecycle checks, dispatched touch drag, scoped touch action, no horizontal stage overflow |
| JavaScript page errors during browser checks | None |

Browser checks use Chromium 153 with software WebGL/SwiftShader. The optional reproducible test is `tests/brain-boost/neonArena.browser.mjs`; Playwright belongs in the test environment, not production dependencies. Run from the repository root with Playwright available. `NEON_PLAYWRIGHT_MODULE` and `NEON_BROWSER_EXECUTABLE` optionally identify environment-provided installations. The test starts/stops its own Vite server on 127.0.0.1:5179 and writes temporary QA captures under `/tmp`.

Pure simulation tests cover seeded reproducibility, caps, pause invariants, one reactor collision, terminal immutability, exactly one Shockwave hit per enemy, wave transition/recovery, equal results at 30/60/120 FPS, invalid input and bounded catch-up/disposal.

## Remaining acceptance limits

- Physical Android/Termux testing, sustained frame rate, thermal behavior, device memory pressure and long GPU soak measurements remain unverified. Software-browser runs cannot establish 60/120 FPS on mobile hardware.
- Art direction was reviewed from rendered captures against the written description. Commercial visual acceptance and fidelity to the missing original image require the user's review.
- Browser verification covers the active game and one sibling. Existing Brain Boost tests and the full PULSE suite pass; no claim is made that every legacy game was manually played.
- No remote merge, push, publication or deployment occurred. This local branch does not automatically update the user's Termux checkout.
