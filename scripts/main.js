// #region [DOM REFERENCES] -------------------------->
const game = document.querySelector(".game");
const cardHand = document.querySelector(".card-hand");
const endTurnButton = document.querySelector(".button--end-turn");
const playerNameEl = document.querySelector(".player-panel--player .player-panel__name");
const enemyNameEl = document.querySelector(".player-panel--enemy .player-panel__name");
const drawCardButton = document.querySelector(".button--draw-card");
const drawCardManaBadge = drawCardButton?.querySelector(".button__mana-badge");

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

// #region [DATA VALIDATION] ------------------------->
function validateCardData() {
  cards.forEach(card => {
    if (!icons[card.id]) {
      console.warn(`Card "${card.id}" has no matching icon`);
    }
    if (card.mana < 0 || card.mana > MAX_MANA) {
      console.warn(`Card "${card.id}" has suspicious mana value: ${card.mana}`);
    }
    if (card.stat <= 0) {
      console.warn(`Card "${card.id}" has a non-positive stat value: ${card.stat}`);
    }
  });
}

validateCardData();
// #endregion

// #region [HEALTH SYSTEM] --------------------------->
const MAX_HP = 20;

const playerHPDisplay = document.querySelector(".player-panel--player .player-panel__stat--hp .player-panel__value");
const enemyHPDisplay = document.querySelector(".player-panel--enemy .player-panel__stat--hp .player-panel__value");

let playerHP = MAX_HP;
let enemyHP = MAX_HP;

function updateHPDisplay() {
  playerHPDisplay.textContent = playerHP;
  enemyHPDisplay.textContent = enemyHP;
}

function showStatPopup(statEl, amount) {
  const popup = document.createElement("span");
  popup.className = `stat-popup ${amount < 0 ? "stat-popup--negative" : "stat-popup--positive"}`;
  popup.textContent = amount > 0 ? `+${amount}` : `${amount}`;
  popup.setAttribute("aria-hidden", "true");
  statEl.appendChild(popup);
  popup.addEventListener("animationend", () => popup.remove());
}

function damageEnemy(amount) {
  enemyHP = Math.max(enemyHP - amount, 0);
  updateHPDisplay();
  showStatPopup(enemyHPDisplay, -amount);
  playSound("spellEffect");
}

function healPlayer(amount) {
  playerHP = Math.min(playerHP + amount, MAX_HP);
  updateHPDisplay();
  showStatPopup(playerHPDisplay, amount);
  playSound("spellEffect");
}

function damagePlayer(amount, { showPopup = true } = {}) {
  playerHP = Math.max(playerHP - amount, 0);
  updateHPDisplay();
  if (showPopup) showStatPopup(playerHPDisplay, -amount);
  playSound("spellEffect");
}

// not called yet - enemy AI currently plays attack cards only
function healEnemy(amount) {
  enemyHP = Math.min(enemyHP + amount, MAX_HP);
  updateHPDisplay();
  showStatPopup(enemyHPDisplay, amount);
  playSound("spellEffect");
}
// #endregion

// #region [SOUND SYSTEM] ---------------------------->
const sounds = {
  buttonClick: new Audio("assets/audio/button-click.mp3"),
  cardDraw: new Audio("assets/audio/card-draw.mp3"),
  cardPlace: new Audio("assets/audio/card-place.mp3"),
  cardPreview: new Audio("assets/audio/card-preview.mp3"),
  cardSelect: new Audio("assets/audio/card-select.mp3"),
  spellEffect: new Audio("assets/audio/spell-effect.mp3"),
  gameOver: new Audio("assets/audio/game-over.mp3"),
};

function playSound(name) {
  const sound = sounds[name];
  sound.currentTime = 0; // restart if the same sound is still playing (e.g. rapid actions)
  sound.play().catch(() => {}); // ignore playback errors (e.g. autoplay restrictions)
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

// also used by renderCard in [DYNAMIC CARD RENDERING]
function getStatLabel(card) {
  return `${card.type === "attack" ? "Attack" : "Heal"} ${card.stat}`;
}

function renderSlotCard(card) {
  const wrapper = document.createElement("div");
  wrapper.className = "board__card";
  wrapper.innerHTML = `
    <div class="card__art">
      ${icons[card.id]}
    </div>
    <div class="card__stat card__stat--${card.type}" 
      aria-label="${getStatLabel(card)}">
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
    // switching selection to a different card
    selectedCard.element.classList.remove("card--selected");
  }
  selectedCard = { element: cardElement, data: card };
  cardElement.classList.add("card--selected");
  // toggles .game--card-selected, which CSS uses to highlight valid empty slots
  game.classList.add("game--card-selected");
  playSound("cardSelect");
}

function placeCard(slotElement) {
  if (!selectedCard || currentTurn !== "player") return;

  const card = selectedCard.data;

  slotElement.innerHTML = "";
  slotElement.appendChild(renderSlotCard(card));
  playSound("cardPlace");
  slotElement.classList.add("board__slot--occupied");
  slotElement.disabled = true;
  slotElement.setAttribute("aria-label", `${slotElement.dataset.baseLabel}, occupied by ${card.name}`);
  spendMana(card.mana);

  if (card.type === "attack") {
    damageEnemy(card.stat);
  } else {
    healPlayer(card.stat);
  }

  currentHand = currentHand.filter(c => c !== card);

  selectedCard.element.remove();
  selectedCard = null;
  game.classList.remove("game--card-selected");
  updateHandLayout();
  refreshHandAffordability();
  updateDrawButtonState();
  // checked last so cleanup above always runs, even on the finishing blow
  checkWinCondition();
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

function clearEnemyBoard() {
  const slots = document.querySelectorAll(".board--enemy .board__slot");
  slots.forEach(slot => {
    slot.innerHTML = "";
    slot.classList.remove("board__slot--occupied");
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

// #region [DRAG & DROP] ----------------------------->
const DRAG_THRESHOLD_PX = 8;
const supportsDrag = window.matchMedia("(pointer: fine)").matches;
// touch devices use tap-to-select/tap-to-place instead;
// dragging would conflict with horizontal hand scrolling.

function enableCardDrag(cardEl, card) {
  if (!supportsDrag) return;

  let startX, startY, dragging = false;
  let currentDropTarget = null; // slot currently under the pointer

  function endDrag() {
    cardEl.style.removeProperty("transform");
    cardEl.classList.remove("card--dragging");
    currentDropTarget?.classList.remove("board__slot--drop-target");
    currentDropTarget = null;
    dragging = false;
    startX = undefined;
  }

  cardEl.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    // keeps pointermove/pointerup targeting this card even if the cursor
    // moves over other elements (e.g. a board slot) mid-gesture
    cardEl.setPointerCapture(e.pointerId);
  });

  cardEl.addEventListener("pointermove", (e) => {
    if (startX === undefined) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      if (currentTurn !== "player" || allSlotsFull() || !hasEnoughMana(card)) return;
      dragging = true;
      cardEl.classList.add("card--dragging");

      // deselect whatever was previously selected - mirrors the same cleanup
      // selectCard() does when switching selection to a different card
      if (selectedCard && selectedCard.element !== cardEl) {
        selectedCard.element.classList.remove("card--selected");
      }

      selectedCard = { element: cardEl, data: card };
      game.classList.add("game--card-selected");
    }

    cardEl.style.transform = `translate(${dx}px, ${dy}px)`;

    // pointer capture keeps e.target on the card, so look up the element
    // under the cursor manually. Update classes only when the target changes.
    const target = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest(".board--player .board__slot:not(.board__slot--occupied)");

    if (target !== currentDropTarget) {
      currentDropTarget?.classList.remove("board__slot--drop-target");
      target?.classList.add("board__slot--drop-target");
      currentDropTarget = target;
    }
  });

  cardEl.addEventListener("pointerup", () => {
    if (!dragging) { startX = undefined; return; } // plain click - existing click handler takes over
    const dropTarget = currentDropTarget; // already known from the last pointermove
    endDrag();

    // the browser still fires a click after this gesture despite the movement -
    // suppress it so it doesn't immediately toggle the card back off via selectCard
    cardEl.dataset.suppressClick = "true";
    if (dropTarget) {
      placeCard(dropTarget);
    } else {
      cardEl.classList.add("card--selected");
    }
  });

  cardEl.addEventListener("pointercancel", endDrag);
}
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
    playEnemyTurn();

    setTimeout(() => {
      if (gameEnded) return; // player or enemy already won - skip the turn handoff
      endEnemyTurn();
    }, 1500); // keep enemy cards visible before clearing the board
  }, 0); // waits for the UI to update before placing enemy cards on the board
}

function endEnemyTurn() {
  clearPlayerBoard(); // clears after enemy's turn, before player's turn starts
  clearEnemyBoard();
  startPlayerTurn();
}

function endTurn() {
  if (currentTurn !== "player") return;
  playSound("buttonClick");
  startEnemyTurn();
}

endTurnButton.addEventListener("click", endTurn);
// #endregion

// #region [ENEMY TURN LOGIC] ------------------------>
const ENEMY_SKIP_CHANCE = 0.3; // probability enemy skips playing cards this turn
const ENEMY_MAX_CARDS_PER_TURN = 2; // max cards enemy can place per turn

function getRandomAttackCard() {
  const attackCards = cards.filter(c => c.type === "attack");
  const randomIndex = Math.floor(Math.random() * attackCards.length);
  return { ...attackCards[randomIndex] }; // copy, not reference - same reason as drawCard
}

function getAvailableEnemySlots() {
  return [...document.querySelectorAll(".board--enemy .board__slot--inactive:not(.board__slot--occupied)")];
}

function playEnemyTurn() {
  if (Math.random() < ENEMY_SKIP_CHANCE) return; // enemy skips this turn

  let cardsPlayed = 0;
  let totalDamage = 0;

  while (cardsPlayed < ENEMY_MAX_CARDS_PER_TURN) {
    const availableSlots = getAvailableEnemySlots();
    if (availableSlots.length === 0) break; // no free slots

    const card = getRandomAttackCard();
    if (enemyMana < card.mana) break; // can't afford any card - end turn early

    const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)];

    slot.innerHTML = "";
    slot.appendChild(renderSlotCard(card));
    slot.classList.add("board__slot--occupied");

    enemyMana -= card.mana;
    totalDamage += card.stat;
    damagePlayer(card.stat, { showPopup: false });

    cardsPlayed++;

    if (checkWinCondition()) break; // stop playing further cards once someone has won
  }

  if (totalDamage > 0) {
    showStatPopup(playerHPDisplay, -totalDamage);
  }
  updateManaDisplay();
}
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

    <div class="card__stat card__stat--${card.type}" aria-label="${getStatLabel(card)}">
      ${card.stat}
    </div>
  `;

  article.addEventListener("click", () => {
    if (article.dataset.suppressClick) {
      delete article.dataset.suppressClick;
      return;
    }
    selectCard(article, card);
  });

  article.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectCard(article, card);
    }
  });

  article.addEventListener("pointerenter", () => playSound("cardPreview"));
  enableCardDrag(article, card);
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
  // guarantee at least one playable card in the opening hand
  const hasPlayableCard = hand.some(card => hasEnoughMana(card));

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
updateHPDisplay(); // sync display with playerHP/enemyHP on page load
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
  playSound("cardDraw");

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

// #region [WIN/LOSE CONDITION] ---------------------->
const gameOverEl = document.querySelector(".game-over");
const gameOverTitle = document.querySelector("#game-over-title");
const gameOverMessage = document.querySelector("#game-over-message");
const playAgainButton = document.querySelector(".game-over__button");

if (!gameOverEl || !gameOverTitle || !gameOverMessage || !playAgainButton) {
  throw new Error("main.js: game over elements not found in DOM");
}

let gameEnded = false; // guards timers scheduled before the win/loss was known

function showGameOver(playerWon) {
  gameEnded = true;
  gameOverTitle.textContent = playerWon ? "Victory!" : "Defeated!";
  gameOverMessage.textContent = playerWon
    ? "Your spells proved superior. The enemy stands defeated."
    : "Your defenses crumbled. The enemy stands victorious.";
  gameOverEl.classList.add(playerWon ? "game-over--victory" : "game-over--defeat");
  gameOverEl.classList.add("game-over--visible");
  game.inert = true; // blocks focus/interaction with the board, and hides it from screen readers
  playAgainButton.focus(); // moves focus into the modal, matching aria-modal="true"
  playSound("gameOver");
}

function checkWinCondition() {
  if (enemyHP <= 0) {
    showGameOver(true);
    return true;
  }
  if (playerHP <= 0) {
    showGameOver(false);
    return true;
  }
  return false;
}

playAgainButton.addEventListener("click", () => {
  location.reload();
});
// #endregion
