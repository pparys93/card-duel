// #region [DYNAMIC CARD RENDERING] ------------------>
const cardHand = document.querySelector(".card-hand");

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

  return article;
}

function drawHand(cards, count = 5) {
  return [...cards]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

function renderHand(cards) {
  cardHand.innerHTML = "";
  drawHand(cards).forEach(card => {
    cardHand.appendChild(renderCard(card));
  });
}

renderHand(cards);
// #endregion