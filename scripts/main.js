// #region [DOM REFERENCES] -------------------------->
const game = document.querySelector(".game");
const cardHand = document.querySelector(".card-hand");
const endTurnButton = document.querySelector(".button--end-turn");
const playerNameEl = document.querySelector(".player-panel--player .player-panel__name");
const enemyNameEl = document.querySelector(".player-panel--enemy .player-panel__name");
const drawCardButton = document.querySelector(".button--draw-card");
const drawCardManaBadge = drawCardButton.querySelector(".button__mana");

let currentTurn = "player"; // "player" | "enemy"

if (!game) {
  throw new Error("main.js: .game element not found in DOM");
}

if (!cardHand) {
  throw new Error("main.js: .card-hand element not found in DOM");
}

if (!endTurnButton || !playerNameEl || !enemyNameEl || !drawCardButton || !drawCardManaBadge) {
  throw new Error("main.js: turn UI elements not found in DOM");
}
// #endregion

// #region [MANA SYSTEM] ----------------------------->
const MAX_MANA = 10;
const MANA_INCREMENT = 2;
const playerManaDisplay = document.querySelector(".player-panel--player .player-panel__stat--mana .player-panel__value");
const enemyManaDisplay = document.querySelector(".player-panel--enemy .player-panel__stat--mana .player-panel__value");
let playerMana = 1;
let enemyMana = 1;

function updateManaDisplay() {
  playerManaDisplay.textContent = playerMana;
  enemyManaDisplay.textContent = enemyMana;
}

function incrementPlayerMana() {
  playerMana = Math.min(playerMana + MANA_INCREMENT, MAX_MANA);
  updateManaDisplay();
}

function incrementEnemyMana() {
  enemyMana = Math.min(enemyMana + MANA_INCREMENT, MAX_MANA);
  updateManaDisplay();
}

function hasEnoughMana(card) {
  return card.mana <= playerMana;
}

function spendMana(amount) {
  playerMana -= amount;
  updateManaDisplay();
}

function setCardAffordability(cardEl, card) {
  const affordable = hasEnoughMana(card);
 
  cardEl.classList.toggle("card--unaffordable", !affordable);
  cardEl.setAttribute("aria-disabled", String(!affordable));
 
  if (!affordable) {
    cardEl.setAttribute("aria-label", `${card.name}, not enough mana to play`);
  } else {
    cardEl.removeAttribute("aria-label");
  }
}

function refreshHandAffordability() {
  const cardElements = cardHand.querySelectorAll(".card");
  cardElements.forEach(cardEl => {
    const card = currentHand.find(c => c.id === cardEl.dataset.cardId);
    if (card) setCardAffordability(cardEl, card);
  });
}
// #endregion

// #region [HAND LAYOUT] ----------------------------->
const MAX_CARD_ROTATION_DEG = 10; // rotation applied to the outermost cards
const MAX_CARD_LIFT_PX = 16; // vertical lift applied to the outermost cards

function getCardTransform(index, count) {
  const mid = (count - 1) / 2;
  const offset = index - mid; // negative = left of center, positive = right
  const maxOffset = mid || 1; // avoid divide-by-zero when count is 1
  const ratio = offset / maxOffset; // normalized from -1 to 1
  const rotation = `${(ratio * MAX_CARD_ROTATION_DEG).toFixed(2)}deg`;
  // lift uses squared ratio (not linear) so cards near the center stay low and flat
  // while lift accelerates toward the edges - mimics a natural fan curve
  const lift = `${Math.pow(Math.abs(ratio), 2) * MAX_CARD_LIFT_PX}px`;

  return { rotation, lift };
}

function updateHandLayout() {
  const renderedCards = cardHand.querySelectorAll(".card");
  const count = renderedCards.length;
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  renderedCards.forEach((card, i) => {
    // skip the fan effect on touch devices
    // pointers don't benefit from the extra rotation/lift, so cards stay flat
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
      aria-label="${card.type === "attack" ? "Attack" : "Heal"} ${card.stat}">
      ${card.stat}
    </div>
  `;
  return wrapper;
}

function allSlotsFull() {
  const slots = document.querySelectorAll(".board--player .board__slot");
  return [...slots].every(slot => slot.classList.contains("board__slot--occupied"));
}

function deselectCard() {
  if (!selectedCard) return;
  selectedCard.element.classList.remove("card--selected");
  selectedCard = null;
  game.classList.remove("game--card-selected");
}

function selectCard(cardElement, card) {
  if (currentTurn !== "player") return;
  // clicking the already-selected card again acts as a toggle: deselect it
  if (selectedCard && selectedCard.element === cardElement) {
    deselectCard();
    return;
  }
  // can't select a card with nowhere to place it, or one the player can't afford
  if (allSlotsFull() || !hasEnoughMana(card)) return;

  if (selectedCard) {
    selectedCard.element.classList.remove("card--selected"); // switching selection to a different card
  }
  selectedCard = { element: cardElement, data: card };
  cardElement.classList.add("card--selected");
  game.classList.add("game--card-selected"); // toggles .game--card-selected, which CSS uses to highlight valid empty slots
}

function placeCard(slotElement) {
  if (!selectedCard || currentTurn !== "player") return;

  const card = selectedCard.data;

  slotElement.innerHTML = "";
  slotElement.appendChild(renderSlotCard(card));
  slotElement.classList.add("board__slot--occupied");
  slotElement.disabled = true;
  slotElement.setAttribute("aria-label", `${slotElement.dataset.baseLabel}, occupied by ${card.name}`);
  spendMana(card.mana);

  currentHand = currentHand.filter(c => c !== card);

  selectedCard.element.remove();
  selectedCard = null;
  game.classList.remove("game--card-selected");
  updateHandLayout();
  refreshHandAffordability();
  updateDrawButtonState();
}

function clearPlayerBoard() {
  const slots = document.querySelectorAll(".board--player .board__slot");

  slots.forEach(slot => {
    slot.innerHTML = "";
    slot.classList.remove("board__slot--occupied");
    slot.disabled = false;
    slot.setAttribute("aria-label", slot.dataset.baseLabel);
  });
}

function initPlacement() {
  document.querySelectorAll(".board--player .board__slot").forEach(slot => {
    slot.dataset.baseLabel = slot.getAttribute("aria-label"); // stored so clearPlayerBoard can restore it
    slot.addEventListener("click", () => placeCard(slot));
  });
}

initPlacement();
// #endregion

// #region [TURN MANAGEMENT] ------------------------->
let enemyHasHadFirstTurn = false;

function updateTurnUI() {
  playerNameEl.classList.toggle("player-panel__name--inactive", currentTurn !== "player");
  enemyNameEl.classList.toggle("player-panel__name--inactive", currentTurn !== "enemy");
  endTurnButton.disabled = currentTurn !== "player";
}

function startPlayerTurn() {
  currentTurn = "player";
  hasDrawnThisTurn = false;
  incrementPlayerMana();
  refreshHandAffordability();
  updateDrawButtonState();
  updateTurnUI();
}

function startEnemyTurn() {
  currentTurn = "enemy";
  deselectCard(); // player may have selected a card without playing it before End Turn

  // player skips mana growth on turn 1 (playerMana starts at 1 in the MANA SYSTEM region above
  // incrementPlayerMana() is never called for that first turn)
  // enemy mirrors that here so both sides reach the same mana on their own turn N
  if (enemyHasHadFirstTurn) {
    incrementEnemyMana();
  }
  enemyHasHadFirstTurn = true;
  updateDrawButtonState();
  updateTurnUI();

  setTimeout(() => {
    endEnemyTurn();
  }, 1000); // simulates enemy thinking; replace with real AI logic here
}

function endEnemyTurn() {
  clearPlayerBoard(); // clears after enemy's turn, before player's turn starts
  startPlayerTurn(); // no AI yet - immediately hands control back to player
}

function endTurn() {
  if (currentTurn !== "player") return;
  startEnemyTurn();
}

endTurnButton.addEventListener("click", endTurn);
// #endregion

// #region [DYNAMIC CARD RENDERING] ------------------>
const MAX_HAND_SIZE = 5;
let currentHand = [];

function renderCard(card) {
  const article = document.createElement("article");
  article.className = "card";
  article.tabIndex = 0;
  article.dataset.cardId = card.id; // enables lookup by identity instead of DOM position

  article.innerHTML = `
    <div class="card__mana" aria-label="Mana cost ${card.mana}">${card.mana}</div>

    <div class="card__art">
      ${icons[card.id]}
    </div>

    <div class="card__content">
      <h3 class="card__title">${card.name}</h3>
      <p class="card__description">${card.description}</p>
    </div>

    <div class="card__stat card__stat--${card.type}" aria-label="${card.type === "attack" ? "Attack" : "Heal"} ${card.stat}">
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

  setCardAffordability(article, card);

  return article;
}

function drawHand(cards, count = MAX_HAND_SIZE) {
  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const hand = shuffled.slice(0, count);
  const hasPlayableCard = hand.some(card => hasEnoughMana(card)); // guarantee at least one playable card in the opening hand

  if (!hasPlayableCard) {
    const affordableLeftover = shuffled.slice(count).filter(card => hasEnoughMana(card));
    if (affordableLeftover.length > 0) {
      let mostExpensiveIndex = 0;
      // find the priciest card in hand to swap out
      hand.forEach((card, i) => {
        if (card.mana > hand[mostExpensiveIndex].mana) mostExpensiveIndex = i;
      });
      hand[mostExpensiveIndex] = affordableLeftover[0];
    }
  }

  return hand;
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
updateTurnUI(); // sync turn indicator UI with default currentTurn = "player" on page load
// #endregion

// #region [DRAW CARD MECHANIC] ---------------------->
const DRAW_COST = 1;
let hasDrawnThisTurn = false;

function canDrawCard() {
  return currentTurn === "player"
    && !hasDrawnThisTurn
    && currentHand.length < MAX_HAND_SIZE
    && playerMana >= DRAW_COST;
}

function updateDrawButtonState() {
  drawCardButton.disabled = !canDrawCard();
}

function drawCard() {
  if (!canDrawCard()) return;

  const randomIndex = Math.floor(Math.random() * cards.length);
  // guards against a duplicate draw: if the same card is already in hand, playing either
  // copy would otherwise delete both from currentHand, since placeCard removes by reference
  const newCard = { ...cards[randomIndex] };
  currentHand.push(newCard);
  cardHand.appendChild(renderCard(newCard));

  spendMana(DRAW_COST);
  hasDrawnThisTurn = true;

  updateHandLayout();
  refreshHandAffordability();
  updateDrawButtonState();
}

drawCardManaBadge.textContent = DRAW_COST;
drawCardButton.setAttribute("aria-label", `Draw Card, costs ${DRAW_COST} mana`);
drawCardButton.addEventListener("click", drawCard);
// sync initial disabled state - hand starts full, so this should start disabled
updateDrawButtonState();
// #endregion
