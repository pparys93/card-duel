# Changelog

Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Minor releases (`v0.1.0`, `v0.2.0`, ...) correspond to the project's milestones, as outlined in the [README](./README.md). Fixes made within a given milestone are collapsed underneath it as patches rather than listed as separate top-level entries, keeping the project's main timeline readable.

---

## [v0.4.0] - Rules Overlay | 2026-08-08

### Added
- Rules overlay shown on page load (including after "Play Again"), introducing new players to the core mechanics before their first move
- Numbered rules list, with `HP` and `Mana` highlighted in the same colours used throughout the interface
- Link to the full ruleset on GitHub

### Fixed
- Hover sound effects not playing before the first user interaction (a limitation present since audio feedback was introduced in v0.3.0) - resolved as a side effect of the overlay's required first interaction, which unlocks audio for the rest of the session

<details>
<summary><strong>Patches on top of v0.4.0</strong> - v0.4.1, v0.4.2</summary>

**[v0.4.2] | 2026-08-10**
- Fixed: hover preview sound (`cardPreview`) no longer replays when hovering a card that's already selected

**[v0.4.1] | 2026-08-09**
- Fixed: rules overlay now shown only once per browser session (`sessionStorage`), instead of reappearing on every "Play Again" reload

</details>

---

## [v0.3.0] - UI Improvements | 2026-08-06

### Added
- Distinct victory/defeat icons on the game-over overlay
- Card entrance animation and spell-cast icon glow effect
- Floating damage/heal popups over player stat panels, summing damage when the enemy plays multiple cards in one turn
- Pointer-based drag-and-drop card placement, alongside existing click-to-place
- Audio feedback for card interactions, turn actions, and match outcomes

### Changed
- Overlay text and icons now scale fluidly across the full screen size range, not just large screens
- Player panel stat labels visually differentiated from their values through colour contrast

### Fixed
- Layout no longer shifts when the hand is emptied of cards (regression from the hand system introduced in v0.2.0)

<details>
<summary><strong>Patches on top of v0.3.0</strong> - v0.3.1, v0.3.2, v0.3.3</summary>

**[v0.3.3] | 2026-08-08**
- Changed: simplified the game-over victory icon to a cleaner crossed-swords design

**[v0.3.2] | 2026-08-08**
- Fixed: scheduled turn handoff (`endEnemyTurn`) could resume game state after the match had already ended, even though the game-over overlay was already shown

**[v0.3.1] | 2026-08-08**
- Fixed: card placement cleanup (hand state, selection) was skipped when the placed card was the finishing blow of the match

</details>

---

## [v0.2.0] - JavaScript Core | 2026-07-19

### Added
- Dynamic card rendering from a data array (`cards.js` / `icons.js`), replacing static HTML
- Dynamic fan-layout scaling based on hand size
- Card placement system (guarded against overwriting an occupied slot), mana system, turn management
- Draw card mechanic with mana cost and once-per-turn limit
- Health system and win/lose conditions, with a game-over overlay
- Enemy turn logic (randomised attack card AI)
- Focus trap on the game-over overlay (accessibility)

---

## [v0.1.0] - HTML/CSS Foundation | 2026-06-07

### Added
- Initial responsive game layout (CSS Grid battlefield, board slots, player hand)
- Fan-style card hand layout, mana cost badges
- Screen-guard overlay for short viewports / unsupported orientation
- Semantic HTML structure and initial accessibility landmarks
- Initial CSS design token system

<details>
<summary><strong>Patches on top of v0.1.0</strong> - v0.1.1, v0.1.2, v0.1.3</summary>

**[v0.1.3] | 2026-06-29**
- Fixed: card title/description font now scales via `cqi` instead of `vw`

**[v0.1.2] | 2026-06-21**
- Fixed: card overlap margin synced with card width to prevent scaling desync between the two

**[v0.1.1] | 2026-06-21**
- Fixed: font-weight values corrected to match the loaded Google Fonts variants

</details>

---

[v0.4.0]: https://github.com/pparys93/card-duel/releases/tag/v0.4.0
[v0.4.1]: https://github.com/pparys93/card-duel/releases/tag/v0.4.1
[v0.4.2]: https://github.com/pparys93/card-duel/releases/tag/v0.4.2
[v0.3.0]: https://github.com/pparys93/card-duel/releases/tag/v0.3.0
[v0.3.1]: https://github.com/pparys93/card-duel/releases/tag/v0.3.1
[v0.3.2]: https://github.com/pparys93/card-duel/releases/tag/v0.3.2
[v0.3.3]: https://github.com/pparys93/card-duel/releases/tag/v0.3.3
[v0.2.0]: https://github.com/pparys93/card-duel/releases/tag/v0.2.0
[v0.1.0]: https://github.com/pparys93/card-duel/releases/tag/v0.1.0
[v0.1.1]: https://github.com/pparys93/card-duel/releases/tag/v0.1.1
[v0.1.2]: https://github.com/pparys93/card-duel/releases/tag/v0.1.2
[v0.1.3]: https://github.com/pparys93/card-duel/releases/tag/v0.1.3
