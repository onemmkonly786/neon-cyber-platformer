NEON CYBER: UPRISING — MERGED CONTROLS UPDATE

This package keeps the full upgraded game and restores the working Pulse and Shield controls.

PRESERVED UPGRADED FEATURES
- 10 sectors with increasing difficulty and a 5-hit CORE boss
- Credits and collectible coins
- Upgrade Lab: double jump, phase dash, pulse radius, shield duration, Plasma Blaster, suit colors
- Energy meter and dash/pulse/shield energy costs
- Checkpoints, turrets, enemy projectiles, drones, hazards
- Saved upgrades and best score in local browser storage
- Mobile touch controls and desktop keyboard controls

CONTROLS
- Move: A/D or Left/Right arrows
- Jump: W, Up arrow, or Space
- Dash: Shift
- Nova Pulse: E (X also works) — permanently destroys nearby drones and turrets for the current sector.
Plasma Blaster: F (J also works) — unlock and upgrade it in the Upgrade Lab.
- Shield: Q (C also works)
- Pause: P or Escape
- Mobile: use the on-screen buttons, including FIRE (requires the Blaster upgrade)

PULSE stuns nearby drones, clears nearby projectiles, and damages the CORE boss when close enough.
SHIELD temporarily protects the player and consumes energy.

INSTALL ON GITHUB PAGES
1. Extract this ZIP.
2. Open your GitHub repository and upload/replace all five files together:
   index.html, style.css, game.js, audio.js, particles.js
3. Commit the changes to the main branch.
4. Wait for GitHub Pages to deploy, then hard-refresh the game (Ctrl+Shift+R).

Your saved upgrades remain in the same browser if the localStorage key is unchanged. This package keeps the existing key.

WEAPON UPDATE
- Nova Pulse (E) now removes nearby normal enemies (drones and turrets) permanently for the rest of that sector. Enemies destroyed this way do not return until you restart the sector.
- Plasma Blaster can be purchased in the Upgrade Lab. Press F to fire forward; upgraded levels improve projectile speed and firing rate. It can damage the CORE only while the boss is exposed.
