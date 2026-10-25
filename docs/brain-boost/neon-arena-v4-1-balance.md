# Neon Arena V4.1 — cover, supplies and full-run verification

Continuation: [V4.2 local cooperative split-screen](neon-arena-v4-2-coop.md).

Date: 2026-10-25. Base: V4 tree at `14e8d21`. Branch: `feat/neon-arena-v4-balance`. This continues the accepted V4 master; no second game, backend, runtime dependency, rendering engine, multiplayer system or remote publication was introduced.

## Changes and evidence

### Solid cover

Three regression tests failed before the fix:

- Hostile projectiles could damage the marine even when debris intersected their path first.
- A friendly rail crossing a creature and then debris in one step skipped the valid hit in front of the debris.
- The flamethrower could apply damage/burn to a creature behind an obstacle.

Swept circle entry times now order enemy, player and obstacle contacts along the same segment. The world boundary also clips a projectile to its actual impact point. A rail can damage visible targets before cover and stops at cover; hostile shots cannot damage a player behind it; flame requires an unobstructed line to the target. Grenades detonate at the clipped point instead of the far end of a blocked step. Shockwave and grenade blast areas retain their existing radial behavior.

### Useful supplies

Drops select only usable categories for the current arsenal. A fresh marine receives medkits, shields or cadence boosts. Normal special ammunition enters the table after unlocking a corresponding weapon; grenade packs enter only after unlocking Cascade. Categories are uniformly selected from the currently available table, so this deliberately changes the previous fixed five-category distribution that could produce unusable drops.

- Medkits remain on the floor at full health.
- Ammunition remains while all relevant reserves are full.
- Grenade packs refill Cascade only; normal ammunition refills shotgun/flame/rail.
- Shield/haste pickups wait until a full six-second increment fits, instead of being consumed every frame for a tiny duration top-up.
- Existing drop caps, expiration, health cap and reserve caps remain.

No automatic healing, damage reduction, invulnerability, weakened bosses or extra ammunition was added to make a test pilot win.

### Readable objectives

A compact battle strip separates creatures currently in the arena from scheduled arrivals, and shows the next boss wave. The intro/pause/results menu identifies the upcoming boss and associated weapon; it acknowledges rewards already unlocked. Boss names/rewards/cycle are shared between simulation and UI. Boss health is an accessible progressbar.

The preview advances after defeating the current boss, including while the rest of that wave remains active. A confirmed boss death marks that encounter as appeared, keeping the preview consistent even for controlled encounter fixtures. It is derived UI data, not a second director or progress authority.

## Full-run input-only pilot

`tests/brain-boost/neonArena.playthrough.mjs` drives only `setInput`, `equip`, `shock`, lifecycle and `step`. It reads game state to choose actions; it does not set player health/position, alter enemies, skip waves or add rewards. It starts with the basic weapon and empty progress. It uses modern independent aim, pickups, obstacle avoidance and unlocked weapons.

This is an omniscient deterministic test policy, not a human playtest or a production bot/auto-play feature. Results establish reachability and integration through normal rules, not average difficulty or classic-mode mastery.

### Final sample runs

| Seed | Outcome | Simulated time | Bosses defeated | Final health |
| --- | --- | --- | --- | --- |
| 72 | Defeated in wave 10 | 248.10 s | 1 | 0 |
| 42819 (production default) | Reached wave 16 | 444.47 s | 3 | 100 |
| 913 | Reached wave 16 | 459.50 s | 3 | 95 |

The default-seed run unlocked shotgun, flamethrower, Cascade and Rail through real kill/reward rules. An automated regression repeats this complete run and compares its outcome/trace. A second campaign test verifies that an idle marine dies normally without advancing waves.

These outcomes are seed-and-policy dependent; the same policy losing on seed 72 is reported rather than hidden or compensated with cheats.

## Validation

- `npm run test:brain-boost`: 62/62 PASS, including seven new cover/supply/director tests and two full-run/idle tests.
- `npm run typecheck:neon-arena`: PASS with portable TypeScript 5.9.3.
- `npm run build`: PASS; existing large deferred chunk warning remains.
- `git diff --check`: PASS.
- Desktop and touch/reduced-motion browser checks preserve play, simultaneous touch inputs, pause, GPU release, context recovery and sibling-game navigation. New assertions check the objective strip and boss-preview advancement.
- Controlled boss fixtures still validate all three persistent weapon rewards, re-entry/equipping, fuel consumption and shared music lifecycle. Fixtures remain test-only and are distinct from the input-only full-run test.

## Limits and delivery

Physical Android performance, thermals, long GPU soak, subjective difficulty and human classic-aim balance still need device playtesting. No claim of 60/120 FPS follows from simulation tests or software WebGL. Cooperative split-screen remains the subsequent feature phase after solo acceptance.

The patch applies after the previous V4 patch. No push, merge or deployment was performed. Existing backups/untracked data are preserved and excluded; pre-change copies are under `.phase-backups/neon-v4-balance`.
