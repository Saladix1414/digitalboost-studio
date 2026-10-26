# V5 — Campaign pilot portability correction

The reported Android ARM64 failure was wave 10 instead of 16. On this x64 host,
V5 passed, but multiplying Math.hypot results by 1 + Number.EPSILON reproduced a
wave-10 defeat with the original pilot. This demonstrates numerical sensitivity;
it does not establish the exact Android runtime calculation responsible.

Only test code changes. No production simulation, difficulty, health, damage,
spawns, aiming, assets or music changes. Assisted pilot evasion begins at six
world units, with a fixed portfolio of forces 1, 1.4 and 3. Each attempt starts
seed 42819 from scratch and uses normal inputs, equipment and Shockwave.
Legacy/manual pilot settings remain unchanged.

The campaign still requires wave 16, three bosses, positive health, all weapons,
under 600 seconds, identical local replay and identical outcome with cap 240.
It accepts the first successful prescribed policy instead of assuming a single
floating-point-sensitive trajectory must win on every CPU. Failure diagnostics
include every attempted trace. A separate test perturbs distance rounding and
restores Math.hypot in finally; production never patches Math.

Validation on this host: typecheck PASS; 93/93 Brain Boost tests PASS; Vite build
PASS (existing large-chunk warning). Additional scratch experiments completed
24/24 portfolios with +/-1,2,4 epsilon perturbations independently applied to
hypot, sin, cos and atan2. These experiments are not Android hardware evidence.
The original Android run remains the required next verification.
