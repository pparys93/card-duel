// #region [DOM REFERENCES] -------------------------->
const game = document.querySelector(".game");
const cardHand = document.querySelector(".card-hand");

if (!game) {
  throw new Error("main.js: .game element not found in DOM");
}

if (!cardHand) {
  throw new Error("main.js: .card-hand element not found in DOM");
}
// #endregion

// #region [MANA SYSTEM] ----------------------------->
let playerMana = 10;
let currentHand = [];

const playerManaDisplay = document.querySelector(".player-panel--player .player-panel__stat--mana .player-panel__value");

function updateManaDisplay() {
  playerManaDisplay.textContent = playerMana;
}

function hasEnoughMana(card) {
  return card.mana <= playerMana;
}

function spendMana(amount) {
  playerMana -= amount;
  updateManaDisplay();
}

function refreshHandAffordability() {
  const cardElements = cardHand.querySelectorAll(".card");
  cardElements.forEach((cardEl, i) => {
    const card = currentHand[i];
    const affordable = hasEnoughMana(card);

    cardEl.classList.toggle("card--unaffordable", !affordable);
    cardEl.setAttribute("aria-disabled", String(!affordable));

    if (!affordable) {
      cardEl.setAttribute("aria-label", `${card.name}, not enough mana to play`);
    } else {
      cardEl.removeAttribute("aria-label");
    }
  });
}
// #endregion

// #region [HAND LAYOUT] ----------------------------->
const MAX_CARD_ROTATION_DEG = 10;  // rotation applied to the outermost cards
const MAX_CARD_LIFT_PX = 16;       // vertical lift applied to the outermost cards

function getCardTransform(index, count) {
  const mid = (count - 1) / 2;
  const offset = index - mid;       // negative = left of center, positive = right
  const maxOffset = mid || 1;       // avoid divide-by-zero when count is 1

  const ratio = offset / maxOffset; // normalized from -1 to 1

  const rotation = `${(ratio * MAX_CARD_ROTATION_DEG).toFixed(2)}deg`;

  // Lift uses ratio² (not linear) so cards near the center stay low and flat,
  // while lift accelerates toward the edges - mimics a natural fan curve.
  const lift = `${Math.pow(Math.abs(ratio), 2) * MAX_CARD_LIFT_PX}px`;

  return { rotation, lift };
}

function updateHandLayout() {
  const renderedCards = cardHand.querySelectorAll(".card");
  const count = renderedCards.length;
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  renderedCards.forEach((card, i) => {
    if (isMobile) {
      card.style.removeProperty("--card-rotation");
      card.style.removeProperty("--card-lift");
      return;
    }
    const { rotation, lift } = getCardTransform(i, count);
    card.style.setProperty("--card-rotation", rotation);
    card.style.setProperty("--card-lift", lift);
  });
}
// #endregion

// #region [CARD PLACEMENT SYSTEM] ------------------->
let selectedCard = null;

function renderSlotCard(card) {
  const wrapper = document.createElement("div");
  wrapper.className = "board__card";
  wrapper.innerHTML = `
    <div class="card__art">
      ${icons[card.id]}
    </div>
    <div class="card__stat card__stat--${card.type}" 
      aria-label="${card.type === "attack" ? "Attack" : "Health"} ${card.stat}">
      ${card.stat}
    </div>
  `;
  return wrapper;
}

function allSlotsFull() {
  const slots = document.querySelectorAll(".board--player .board__slot");
  return [...slots].every(slot => slot.classList.contains("board__slot--occupied"));
}

function selectCard(cardElement, card) {
  if (selectedCard && selectedCard.element === cardElement) {
    selectedCard.element.classList.remove("card--selected");
    selectedCard = null;
    game.classList.remove("game--card-selected");
    return;
  }

  if (allSlotsFull() || !hasEnoughMana(card)) return;

  if (selectedCard) {
    selectedCard.element.classList.remove("card--selected");
  }
  selectedCard = { element: cardElement, data: card };
  cardElement.classList.add("card--selected");
  game.classList.add("game--card-selected"); // toggles .game--card-selected, which CSS uses to highlight valid empty slots
}

function placeCard(slotElement) {
  if (!selectedCard) return;

  slotElement.innerHTML = "";
  slotElement.appendChild(renderSlotCard(selectedCard.data));
  slotElement.classList.add("board__slot--occupied");
  spendMana(selectedCard.data.mana);

  currentHand = currentHand.filter(card => card !== selectedCard.data);

  selectedCard.element.remove();
  selectedCard = null;
  game.classList.remove("game--card-selected");
  updateHandLayout();
  refreshHandAffordability();
}

function initPlacement() {
  document.querySelectorAll(".board--player .board__slot").forEach(slot => {
    slot.addEventListener("click", () => placeCard(slot));
  });
}

initPlacement();
// #endregion

// #region [DYNAMIC CARD RENDERING] ------------------>
function renderCard(card) {
  const article = document.createElement("article");
  article.className = "card";
  article.tabIndex = 0;

  article.innerHTML = `
    <div class="card__mana" aria-label="Mana cost ${card.mana}">${card.mana}</div>

    <div class="card__art">
      ${icons[card.id]}
    </div>

    <div class="card__content">
      <h3 class="card__title">${card.name}</h3>
      <p class="card__description">${card.description}</p>
    </div>

    <div class="card__stat card__stat--${card.type}" aria-label="${card.type === "attack" ? "Attack" : "Health"} ${card.stat}">
      ${card.stat}
    </div>
  `;

  article.addEventListener("click", () => selectCard(article, card));
  article.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectCard(article, card);
    }
  });

if (!hasEnoughMana(card)) {
  article.classList.add("card--unaffordable");
  article.setAttribute("aria-disabled", "true");
  article.setAttribute("aria-label", `${card.name}, not enough mana to play`);
} else {
  article.setAttribute("aria-disabled", "false");
  article.removeAttribute("aria-label");
}

  return article;
}

function drawHand(cards, count = 5) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function renderHand(cards) {
  cardHand.innerHTML = "";
  currentHand = drawHand(cards);
  currentHand.forEach(card => {
    cardHand.appendChild(renderCard(card));
  });
  updateHandLayout();
}

renderHand(cards);
updateManaDisplay(); // sync display with playerMana on page load
// #endregion
