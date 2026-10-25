# Neon Arena V4.2 — local cooperative split-screen

Date: 2026-10-25. Accepted task: continue the V4 master with local cooperation after the user's successful V4.1 validation and push.

Base: published `origin/feat/neon-arena-v4-1` at `268154d`; its tree matched the previously delivered V4.1. Working branch: `feat/neon-arena-local-coop`. No remote writes, merge, push or deployment.

## Product behavior

The existing Focus Lab entry now offers Individual or Cooperativo local before a run. Participant count is locked once play begins. Restart retains the selected count; the ready menu allows returning to solo.

- Two distinguishable marines, cyan/green P1 and amber P2.
- One shared world, wave director, enemy set, boss encounter, score and local arsenal progress.
- Independent health, invulnerability, weapon, ammunition, buffs, cooldowns and Shockwave hit sets.
- No friendly fire or blocking collisions between marines.
- Creatures select the nearest living marine. Attack wind-ups retain their announced direction. Hostile swept shots hit the first eligible living marine along their path, respecting cover.
- A pickup is awarded once to the nearest living marine able to use it; full health/ammunition does not consume it for an ineligible partner.
- A fallen marine cannot move, shoot, activate abilities or collect. Its view spectates the survivor. The session continues while at least one marine lives.
- Completing a wave returns a fallen partner at 35 health near the survivor with two seconds of re-entry protection. Both falling ends the run. This is an explicit cooperative rule; individual death remains terminal.
- Cooperative waves contain 1.4× the base count, rounded up and capped at 100; bosses have 1.5× health. Existing global enemy/projectile/effect caps remain in force, not multiplied per view.
- Weapon rewards and score are granted once even if both marines hit a boss in the same step. Unlocks are shared on this device and saved through the existing progress callback.
- Cooperative best score uses `digitalboost:brain-boost:neon-arena:best:coop:v1`. The previous individual best key remains unchanged.

## Controls

| Action | P1 keyboard | P2 keyboard | Each standard gamepad |
| --- | --- | --- | --- |
| Move | WASD; arrows still supported in solo | Arrows | Left stick |
| Shoot | F or mouse in its view | J / right Ctrl / Numpad 0; mouse in its view | A / right trigger |
| Shockwave | Space | K / right Shift | B |
| Cycle weapon | Q | L / Enter | Left bumper |
| Select weapon | 1–5 | Numpad 1–5 | Cycle |
| Shared pause | P | P | Start |
| Modern aim | Mouse or touch fire drag | Mouse in its view or touch fire drag | Right stick |

Each pane has its own joystick, held-fire button and Shockwave control. Four simultaneous pointers are independently captured/routed. Releasing one pointer addresses its owning marine. Classic 45-degree aim remains available per player; modern aim can be selected independently.

Controllers bind to stable seats by index. Losing an assigned controller pauses the shared game; a surviving controller is not compacted into its partner's seat. Unsupported/restricted gamepad APIs leave keyboard and touch available. Gamepad behavior was verified with injected standard-mapping browser devices and pure input tests, not two physical controllers.

## Architecture and rendering

`GameSimulation.players` is the authoritative marine collection. Former single-player accessors (`player`, `health`, `ammo`, etc.) reference marine one directly, preserving existing solo integrations without mirrored state. Public commands accept a player ID; invalid IDs and commands for fallen marines are rejected. A single `step` advances the shared run.

`LocalControls.ts` owns viewport partitioning, keyboard decoding and gamepad seats/edge detection. It contains no game authority.

`SurvivalWorld` still owns one scene, one ground texture, shared instanced enemy/effect geometry and two camera frames. The second marine shares geometry/materials where appropriate and has its own suit/visor identity. Both cameras follow their participant or the surviving partner.

`NeonArenaEngine` still owns one WebGLRenderer, one canvas/context and one RAF/clock. Landscape uses left/right scissor rectangles; portrait uses top/bottom rectangles, including odd-pixel dimensions without gaps. Pointer raycasting uses the corresponding viewport bounds and camera.

Co-op disables bloom/composer and caps DPR at 1.25. The same existing adaptive-resolution fallback remains. Render work is skipped for unchanged READY/PAUSED/GAME_OVER scenes while RAF still polls visible-page controls; resize/phase changes invalidate the scene. Hidden pages do not render. The second view adds render cost, not a duplicate simulation or a second full graphics context.

React owns the lobby, per-player HUD/control panes, arsenal rows, team result and existing shared audio lifecycle. Cooperative music uses one scheduler and the same shared AudioContext infrastructure, not a soundtrack per viewport.

## Validation evidence

- `npm run test:brain-boost`: 76/76 PASS: the previous 62 tests plus 14 cooperative/input tests.
- `npm run typecheck:neon-arena`: PASS, portable TypeScript 5.9.3.
- `npm run build`: PASS, existing large-chunk warning retained; no runtime dependency changes.
- `git diff --check`: PASS.
- Pure tests cover independent inputs/resources/aim/abilities; nearest living target; one fall vs team wipe; pause immutability; wave-boundary recovery; exclusive pickup recipient; first-target hostile impacts and no friendly fire; single boss reward; 30/60/120 FPS determinism; lobby count gate; spawn safety; boss scaling; keyboard separation; odd-size view partitions; gamepad dead zones, edge actions and stable seats.
- Cooperative browser checks, desktop 1280×1000: two keyboard participants consume their own ammunition; two injected gamepads move different marines; a disconnection pauses; P2 Shockwave leaves P1 cooldown untouched; one canvas/RAF/context renders two scissor views; team downfall/restart and separate records work; exit cancels RAF and removes the canvas.
- Cooperative browser checks, touch 390×844/reduced motion: four simultaneous native touch points operate both sticks and both fire buttons; portrait panes rotate to landscape panes and back; no horizontal overflow; both participants retain independent state.
- Cooperative browser audio/render checks: one music scheduler for the shared run, zero during pause, one after resume and zero after mute. WebGL draw counters settle and remain unchanged during pause, while simulation time stays frozen.
- Existing solo desktop/touch, context-loss retry, sibling navigation and GPU release checks pass after the migration. Existing controlled encounters still unlock all three boss weapons and re-enter with usable fuel. The original shared-context music signal/pause/resume/mute/exit check passes.

The optional `tests/brain-boost/neonArena.coop.browser.mjs` starts/stops its own Vite server on 5183 and uses externally supplied Playwright/Chromium. It injects observation and encounter fixtures only in the test page; production has no debug window hooks. Temporary QA captures stay under `/tmp`.

## Acceptance limits

Browser QA used Chromium 153 with SwiftShader and emulated touch/gamepads. Physical Android performance, sustained GPU/frame-time/thermal behavior, real gamepad mappings/rollover, four-finger comfort and long human cooperative balance remain to be checked on devices. These checks do not establish 60/120 FPS on hardware.

This is local split-screen on one device. No online multiplayer, networking, remote identity or extra backend was introduced. Device-local recreational unlocks are not server-trusted authority or cognitive measurements.

Historical backups/untracked data remain preserved. New pre-migration copies are under `.phase-backups/neon-coop`, excluded from implementation commits.
