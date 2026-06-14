<div align="center">

# ✦ Card ⚔️ Duel ✦

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)
![Status](https://img.shields.io/badge/Status-In%20Progress-yellow)

</div>

A browser-based fantasy card game built as a frontend portfolio project. The first milestone (`HTML/CSS Foundation`) is complete: the game arena is fully structured, styled, and accessible. Next up: bringing it to life with JavaScript.

---

## 📖 About The Project

Card Duel is a turn-based fantasy card game built in the browser. The player faces an AI opponent across a battlefield, placing cards, managing mana, and fighting to reduce the opponent's HP to zero.
The project aims to deliver a fully playable game experience - from a polished UI to complete game logic entirely in the browser.

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
- fan-style hand layout by default, classic overlap on touch devices.
- enemy and player status panels with HP and mana indicators plus card counter for enemy

### 🎨 UI & Visual Design
- fantasy-inspired visual style,
- dark gradient background,
- smooth transitions and hover effects,
- custom typography using Google Fonts,
- minimalist spell icons on cards crafted from vector shape paths,
- glassmorphism-inspired UI containers,
- subtle depth effects using shadows and backdrop blur.

### ♿ Accessibility & UX
- semantic HTML structure,
- keyboard-accessible interactive elements,
- `focus-visible` states,
- ARIA markup for screen reader support,
- touch-friendly controls,
- visually hidden headings for screen readers using the `visually-hidden` class,
- screen-guard overlay when the browser window is too short or the device is in a non-optimal orientation.

### 🧱 CSS Architecture
- BEM naming convention,
- CSS custom properties (`:root` variables),
- modular section-based stylesheet organization,
- scalable component structure,
- reusable utility-like design tokens.

### ⚙️ JavaScript Features
- dynamic card rendering.

---

## 🗺️ Roadmap

| Version | Milestone | Status |
|---|---|---|
| `v0.1.0` | HTML/CSS Foundation | ✅ Done |
| `v0.2.0` | JavaScript Core | ⏳ In Progress |
| `v0.3.0` | UI Improvements | 🔄 Planned |
| `v1.0.0` | React Migration | 🔄 Planned |

---

## ✍🏻 Planned Features

### 🔄 JavaScript Features
- full turn-based game logic,
- card placement system,
- mana system,
- health system,
- turn management,
- win/lose conditions.

### 🔄 UI Improvements
- card animations,
- drag & drop mechanics,
- visual spell/effect animations,
- sound effects.

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
│   ├── favicons/
│   └── images/
│
├── scripts/
│
└── README.md
```

---

## 🌱 Game Arena Layout Structure

```
ENEMY REGION
├── .player-panel .player-panel--enemy
│    ├─ .player-panel__name
│    └─ .player-panel__stats
│        ├─ .player-panel__stat--cards-counter
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
│    └─ .card * N
│        ├─ .card__mana
│        ├─ .card__art
│        ├─ .card__content
│        │    ├─ .card__title
│        │    └─ .card__description
│        └─ .card__stat (--attack or --health)
│
└── .player-panel .player-panel--player
     ├─ .player-panel__name
     └─ .player-panel__stats
         ├─ .player-panel__stat--hp
         └─ .player-panel__stat--mana
```

---

## 🚧 Project Status

Current version: `v0.1.1`

> 🚀 **[Live Demo](https://pparys93.github.io/card-duel)**

---

## 📸 Preview

### 🖼️ Layout

| Desktop | Mobile |
|---|---|
| <img src="assets/images/desktop-ui.png" width="400" alt="Desktop UI"> | <img src="assets/images/mobile-ui.png" width="200" alt="Mobile UI"> |


### 🔒 Screen Guard Overlay

<img src="assets/images/screen-guard.gif" width="400" alt="Screen guard overlay appearing automatically on narrow or portrait-oriented viewport">

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
