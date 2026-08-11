<div align="center">

# ✦ Card ⚔️ Duel ✦

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)
![Status](https://img.shields.io/badge/Status-In%20Progress-yellow)

</div>

A browser-based fantasy card game built as a frontend portfolio project. The third milestone (`UI Improvements`) is complete. The game now offers a more polished and immersive experience, enhancing the feel of every match. Next up: migrating the architecture to React.

---

## ℹ️ About The Project

Card Duel is a turn-based fantasy card game built in the browser. The player faces an AI opponent across a battlefield, placing cards, managing mana, and fighting to reduce the opponent's HP to zero.
The project aims to deliver a fully playable game experience - from a polished UI to complete game logic entirely in the browser.

### 📜 Game Rules

1. Reduce your opponent's HP to 0 to win.
2. Attack cards deal damage to the enemy; heal cards restore your own HP.
3. Your hand can hold up to 5 cards.
4. Both sides start with 1 Mana and gain +2 Mana at the start of each subsequent turn, up to a maximum of 10.
5. Drawing a card is optional, costs 1 Mana, and can only be done once per turn.
6. Playing a card costs its Mana value. Board slots limit you to 4 cards per turn.
7. Cards placed on the board cannot be moved or returned to your hand.
8. Card effects resolve immediately when played.
9. HP starts at 20 and cannot exceed this cap.

---

## 🎯 Development Goals

This project is also used to practice a professional frontend workflow:
- version control with Git,
- regular commits,
- responsive UI architecture,
- writing maintainable code,
- accessibility-first thinking,
- scalable frontend structure,
- preparing production-like project organization.

---

## 🛠️ Current Tech Stack
- HTML5
- CSS3
- JavaScript (ES6+)
- Git & GitHub
- Visual Studio Code

---

## ✨ Current Features

### 📐 Responsive Game Layout
- CSS Grid-based battlefield structure,
- separate enemy and player sections,
- center action area for game controls,
- responsive spacing using `clamp()`,
- horizontal scrolling for the hand on touch devices.

### 🃏 Game Board
- interactive board slots,
- hover animations,
- keyboard focus support,
- player hand interface,
- fan-style hand layout by default, classic overlap on touch devices,
- enemy and player status panels with HP and mana indicators plus a static card counter for enemy,
- drag-and-drop card placement alongside click-to-place.

### 🎨 UI & Visual Design
- fantasy-inspired visual style,
- dark gradient background,
- smooth transitions and hover effects,
- custom typography using Google Fonts,
- minimalist stroke-based icon system, spanning card spell and overlay screens,
- glassmorphism-inspired UI containers,
- subtle depth effects using shadows and backdrop blur,
- animated card entrances and spell-cast glow effects,
- floating damage/heal indicators over stat panels.

### 🔊 Sound Design
- audio feedback for core card interactions, including drawing, previewing, selecting, and playing cards,
- distinct sound cues for interface actions, spell effects, and match outcomes.

### ♿ Accessibility & UX
- semantic HTML structure,
- keyboard-accessible interactive elements,
- `focus-visible` states,
- ARIA markup for screen reader support,
- touch-friendly controls,
- `prefers-reduced-motion` support,
- visually hidden headings for screen readers using the `visually-hidden` class,
- screen-guard overlay when the browser window is too short or the device is in a non-optimal orientation,
- game rules overlay shown on load, introducing new players to the mechanics before their first move.

### 🧱 CSS Architecture
- BEM naming convention,
- CSS custom properties (`:root` variables),
- modular section-based stylesheet organization,
- scalable component structure,
- reusable utility-like design tokens.

### ⚙️ JavaScript Features
- dynamic card rendering,
- dynamic fan-layout scaling based on hand size,
- card placement system,
- mana system,
- turn management,
- draw card mechanic,
- health system,
- enemy turn logic,
- win/lose conditions,
- pointer-based drag and drop,
- audio feedback system.

---

## 🗺️ Roadmap

| Version | Milestone | Status |
|---|---|---|
| [`v0.1.0`](https://github.com/pparys93/card-duel/releases/tag/v0.1.0) | HTML/CSS Foundation | ✅ Done |
| [`v0.2.0`](https://github.com/pparys93/card-duel/releases/tag/v0.2.0) | JavaScript Core | ✅ Done |
| [`v0.3.0`](https://github.com/pparys93/card-duel/releases/tag/v0.3.0) | UI Improvements | ✅ Done |
| [`v0.4.0`](https://github.com/pparys93/card-duel/releases/tag/v0.4.0) | Rules Overlay | ✅ Done |
| `v1.0.0` | React Migration | ⏳ Planned |

---

## ✍🏻 Planned Features

### 🔄 React Migration
- reusable components,
- state management,
- dynamic rendering,
- component-based architecture,
- scalable game state handling.

---

## 📁 Project Structure

```
card-duel/
│
├── index.html
├── styles.css
├── favicon.ico
│
├── assets/
│   ├── audio/
│   ├── favicons/
│   └── images/
│
├── scripts/
│   ├── icons.js
│   ├── cards.js
│   └── main.js
│
├── README.md
└── CHANGELOG.md
```

---

## 🌱 Game Arena Layout Structure

```
ENEMY REGION
├── .player-panel .player-panel--enemy
│    ├─ .player-panel__name
│    └─ .player-panel__stats
│        ├─ .player-panel__stat (Cards)
│        ├─ .player-panel__stat--hp
│        └─ .player-panel__stat--mana
│
├── .board .board--enemy
│    └─ .board__slot * 4
│
MUTUAL REGION
├── .turn-controls
│    ├─ .button .button--draw-card
│    └─ .button .button--end-turn
│
PLAYER REGION
├── .board .board--player
│    └─ .board__slot * 4
│
├── .card-hand
│    └─ .card * N (max 5)
│        ├─ .card__mana
│        ├─ .card__art
│        ├─ .card__content
│        │    ├─ .card__title
│        │    └─ .card__description
│        └─ .card__stat (--attack or --heal)
│
└── .player-panel .player-panel--player
     ├─ .player-panel__name
     └─ .player-panel__stats
         ├─ .player-panel__stat--hp
         └─ .player-panel__stat--mana
```

---

## 🚧 Project Status

Current version: [`v0.4.2`](./CHANGELOG.md)

> 🚀 **[Live Demo](https://pparys93.github.io/card-duel)**

---

## 📸 Preview

### 🖼️ Layout

| Desktop | Mobile |
|---|---|
| <img src="assets/images/desktop-ui.png" width="400" alt="Desktop UI"> | <img src="assets/images/mobile-ui.png" width="200" alt="Mobile UI"> |

### 🎭 Overlays

| Game Rules | Game Over |
|---|---|
| <img src="assets/images/game-rules.png" width="200" alt="Rules overlay shown on page load, listing core game rules with a link to the full ruleset"> | <img src="assets/images/game-over.gif" width="200" alt="Game over screen showing outcome based on match result"> |

| Screen Guard |
|---|
| <img src="assets/images/screen-guard.gif" width="400" alt="Screen guard overlay prompting to rotate device or resize window"> |

### 🃏 Card Placement Mechanics

| Drag & Drop | Tap to Place |
|---|---|
| <img src="assets/images/drag-drop.gif" width="200" alt="Dragging a card from the hand to a board slot"> | <img src="assets/images/tap-place.gif" width="200" alt="Tap to select and place a card on the board"> |


### ✨ Card Animations & Spell Effects

| Card Entrance | Stats Update |
|---|---|
| <img src="assets/images/card-entrance.gif" width="300" alt="Dragging a card from the hand to a board slot"> | <img src="assets/images/popup.gif" width="220" alt="Tap to select and place a card on the board"> |

---

## 🎓 What I'm Learning Through This Project

This isn't just a game. It's a structured self-education path through the joy of coding 😄

| ✅ Completed | 🔄 In Progress |
|---|---|
| Semantic HTML | JavaScript: DOM manipulation, game logic, events |
| Modern CSS architecture | React: components, state, dynamic rendering |
| Responsive layouts | |
| CSS Grid & Flexbox | |
| Accessibility fundamentals | |
| UI/UX principles | |
| Git & GitHub workflow | |
| Scalable frontend structure | |
| Component thinking | |

---

## 👤 Author

[![GitHub](https://img.shields.io/badge/GitHub-pparys93-181717?style=flat&logo=github)](https://github.com/pparys93)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Przemysław%20Parys-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/przemys%C5%82aw-parys-85a47621a)
