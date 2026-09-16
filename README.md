<div align="center">

# ✦ Card ⚔️ Duel ✦

![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)

</div>

A browser-based fantasy card game built as a frontend portfolio project. With `v1.0.0`, the project is complete: every milestone on the original roadmap has been delivered, culminating in a full migration of the architecture from vanilla JavaScript to React with TypeScript. Reaching this point marks the completion of the project's original goals, but not necessarily its end. The nature of a card game leaves plenty of room for new mechanics, features, and directions, so the project may continue to evolve beyond the original roadmap as new possibilities emerge.

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
- production-like project organization,
- migrating a working application to a modern framework without regressions.

---

## 🛠️ Current Tech Stack
- React
- TypeScript
- Vite
- CSS Modules
- CSS3
- HTML5
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
- CSS Modules for component-scoped styling, colocated with each component,
- shared design tokens (`tokens.css`) and global reset/base styles (`global.css`),
- style composition (`composes`) for cross-component base styles (overlays, buttons) without duplication,
- CSS custom properties for the design token system,
- container queries (`cqi`) for card sizing proportionate to its container, not the viewport.

### ⚙️ Application Architecture
- component-based UI (React + TypeScript), organized by responsibility (`components/`, `game/`, `hooks/`, `data/`, `utils/`),
- centralized game state via a single reducer (`useReducer`), with every game rule expressed as a pure state transition,
- strict typing throughout - card data, icon data, and game state all fully typed, catching data-shape mistakes at compile time,
- side effects (timers, sound, DOM focus) kept out of the reducer and handled in dedicated hooks and effects,
- dynamic card rendering, fan-layout scaling, card placement, mana system, turn management, draw mechanic, health system, enemy turn AI, win/lose conditions, pointer-based drag and drop, and an audio feedback system - all ported from the original vanilla JS implementation.

---

## 🗺️ Roadmap

| Version | Milestone | Status |
|---|---|---|
| [`v0.1.0`](https://github.com/pparys93/card-duel/releases/tag/v0.1.0) | HTML/CSS Foundation | ✅ Done |
| [`v0.2.0`](https://github.com/pparys93/card-duel/releases/tag/v0.2.0) | JavaScript Core | ✅ Done |
| [`v0.3.0`](https://github.com/pparys93/card-duel/releases/tag/v0.3.0) | UI Improvements | ✅ Done |
| [`v0.4.0`](https://github.com/pparys93/card-duel/releases/tag/v0.4.0) | Rules Overlay | ✅ Done |
| [`v1.0.0`](https://github.com/pparys93/card-duel/releases/tag/v1.0.0) | React Migration | ✅ Done |

---

## 📁 Project Structure

```
card-duel/
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── .gitignore
├── package.json
│
├── public/
│   ├── favicon.ico
│   └── assets/
│       ├── audio/
│       └── favicons/
│
├── assets/
│   └── images/
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── components/
│   │   ├── Board/
│   │   ├── BoardCard/
│   │   ├── BoardSlot/
│   │   ├── Card/
│   │   ├── CardArt/
│   │   ├── CardContent/
│   │   ├── CardManaBadge/
│   │   ├── CardStat/
│   │   ├── GameOverOverlay/
│   │   ├── Hand/
│   │   ├── Icon/
│   │   ├── PlayerPanel/
│   │   ├── RulesOverlay/
│   │   ├── ScreenGuard/
│   │   └── TurnControls/
│   │   (each with a colocated .tsx + .module.css)
│   │
│   ├── game/
│   │   ├── constants.ts
│   │   ├── initialState.ts
│   │   ├── reducer.ts
│   │   └── types.ts
│   │
│   ├── hooks/
│   │   └── useSoundEffects.ts
│   │
│   ├── data/
│   │   ├── cards.ts
│   │   └── icons.ts
│   │
│   ├── types/
│   │   └── card.ts
│   │
│   ├── utils/
│   │   ├── deepFreeze.ts
│   │   ├── drawHand.ts
│   │   ├── getCardFanTransform.ts
│   │   ├── pickRandom.ts
│   │   └── sounds.ts
│   │
│   └── styles/
│       ├── tokens.css
│       ├── global.css
│       ├── overlay.module.css
│       └── button.module.css
│
├── README.md
├── CHANGELOG.md
└── LICENSE
```
---

## 🌱 Component Tree

```
App
├── ScreenGuard
├── GameOverOverlay
├── RulesOverlay
│
└── <main> (CSS Grid battlefield)
    │
    ├── PlayerPanel (enemy)
    ├── Board (enemy)
    │   └── BoardSlot × 4 → BoardCard
    │
    ├── TurnControls
    │
    ├── Board (player)
    │   └── BoardSlot × 4 → BoardCard
    ├── Hand
    │   └── Card × N (max 5)
    │       ├── CardManaBadge
    │       ├── CardArt → Icon
    │       ├── CardContent
    │       └── CardStat
    └── PlayerPanel (player)
```

---

## 🚧 Project Status

Current version: [`v1.0.0`](./CHANGELOG.md) - complete

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

This isn't just a game. It's a structured self-education path through the joy of coding.😄
- Semantic HTML,
- Modern CSS architecture, including CSS Modules and container queries,
- Responsive layouts, CSS Grid & Flexbox,
- Accessibility fundamentals (ARIA, focus management, `prefers-reduced-motion`),
- UI/UX principles,
- Git & GitHub workflow,
- Scalable frontend structure and component thinking,
- JavaScript: DOM manipulation, event handling, closures, game logic,
- React: components, state, hooks (`useState`, `useReducer`, `useEffect`, `useRef`), dynamic rendering,
- TypeScript: static typing, discriminated unions, generics,
- State management with reducers (`useReducer`), keeping side effects out of pure state transitions,
- Working with AI as a development assistant: defining the architecture and rules myself, critically evaluating its suggestions, independently debugging and validating the resulting code, and rejecting or revising solutions that don't hold up under testing.

This project taught me a lot about modern frontend development, but just as importantly, it showed me how much further there still is to go. That's exactly why I keep learning, experimenting, making mistakes, figuring out why things break, and improving the way I approach coding.

---

## 👤 Author

[![GitHub](https://img.shields.io/badge/GitHub-pparys93-181717?style=flat&logo=github)](https://github.com/pparys93)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Przemysław%20Parys-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/przemys%C5%82aw-parys-85a47621a)
