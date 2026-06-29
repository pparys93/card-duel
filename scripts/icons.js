const icons = {
  // #region [TYPE: ATTACK] ---------------------------->
  ensnare: `<svg class="card__art-icon card__art-icon--ensnare" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.0 12.4 L12.2 12.28 L12.46 12.22 L12.75 12.26 L13.05 12.41 L13.31 12.67 L13.51 13.03 L13.59 13.46 L13.54 13.94 L13.35 14.42 L13.0 14.86 L12.51 15.2 L11.91 15.41 L11.24 15.45 L10.54 15.29 L9.88 14.93 L9.32 14.38 L8.9 13.66 L8.69 12.82 L8.71 11.91 L8.98 11.0 L9.51 10.17 L10.27 9.48 L11.23 9.0 L12.31 8.79 L13.45 8.87 L14.57 9.27 L15.57 9.98 L16.37 10.96 L16.9 12.15 L17.11 13.47 L16.95 14.85 L16.41 16.17 L15.53 17.33 L14.33 18.24 L12.9 18.81 L11.33 19.0 L9.73 18.75 L8.21 18.08 L6.9 17.01 L5.89 15.59 L5.27 13.92 L5.12 12.1 L5.45 10.28 L6.27 8.56 L7.54 7.1 L9.19 6.0 L11.1 5.36 L13.16 5.24 L15.21 5.67 L17.11 6.65 L18.71 8.12 L22.1 11.23"/>
    <path d="M21.49 11.89L22.71 10.57"/>
    <path d="M9.88 14.93L8.9 15.93"/>
    <path d="M13.45 8.87L13.92 7.55"/>
    <path d="M15.53 17.33L16.38 18.45"/>
    <path d="M5.89 15.59L4.58 16.08"/>
    <path d="M9.19 6L8.75 4.67"/>
  </svg>`,
  fireball: `<svg class="card__art-icon card__art-icon--fireball" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2C12 2 6 8 6 13a6 6 0 0012 0c0-2-1-4-2-5.5C15.5 9 16 10.5 16 12a4 4 0 01-8 0c0-2.5 2-5 4-6z"/>
    <path d="M12 14c0 1.1-.9 2-2 2s-2-.9-2-2 2-4 2-4 2 2.9 2 4z"/>
  </svg>`,
  frostbite: `<svg class="card__art-icon card__art-icon--frostbite" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2v20"/>
    <path d="M3.7 7l16.6 10"/>
    <path d="M20.3 7L3.7 17"/>
    <path d="M12 4.5l-1.8 1.8M12 4.5l1.8 1.8"/>
    <path d="M12 19.5l-1.8-1.8M12 19.5l1.8-1.8"/>
    <path d="M5.4 8.2l1.9 1.1M5.4 8.2l-1.1 1.9"/>
    <path d="M18.6 15.8l-1.9-1.1M18.6 15.8l1.1-1.9"/>
    <path d="M18.6 8.2l-1.9 1.1M18.6 8.2l1.1 1.9"/>
    <path d="M5.4 15.8l1.9-1.1M5.4 15.8l-1.1-1.9"/>
  </svg>`,
  lightning: `<svg class="card__art-icon card__art-icon--lightning" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M13 2L5 14h5l-1 8 8-12h-5l1-8z"/>
  </svg>`,
  precision: `<svg class="card__art-icon card__art-icon--precision" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 3c8 4 8 14 0 18"/>
    <path d="M5 12h14"/>
    <path d="M15 9l4 3-4 3"/>
  </svg>`,
  sunfire: `<svg class="card__art-icon card__art-icon--sunfire" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="7"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
    <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>
  </svg>`,
  // #endregion

  // #region [TYPE: HEALTH] ---------------------------->
  absorb: `<svg class="card__art-icon card__art-icon--absorb" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12,8 A4,4 0 1,1 12,16"/>
    <path d="M12,16 A4,4 0 1,1 12,8"/>
    <path d="M8,6.5 A7,7 0 0,0 8,17.5"/>
    <path d="M6,4.5 A10,10 0 0,0 6,19.5"/>
    <path d="M16,6.5 A7,7 0 0,1 16,17.5"/>
    <path d="M18,4.5 A10,10 0 0,1 18,19.5"/>
  </svg>`,
  healing: `<svg class="card__art-icon card__art-icon--healing" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/>
  </svg>`,
  potion: `<svg class="card__art-icon card__art-icon--potion" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9.5 2h5"/>
    <path d="M10.5 2.5v5.5l-4.8 6.8a4.3 4.3 0 003.5 6.7h5.6a4.3 4.3 0 003.5-6.7l-4.8-6.8V2.5"/>
    <path d="M8.5 16.5h7"/>
  </svg>`,
  shield: `<svg class="card__art-icon card__art-icon--shield" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>`
// #endregion
};
