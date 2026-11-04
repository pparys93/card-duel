import { beforeEach, describe, expect, it, vi } from "vitest";
import { cards } from "../data/cards";
import {
  BOARD_SIZE,
  DRAW_COST,
  ENEMY_MAX_CARDS_PER_TURN,
  ENEMY_SKIP_CHANCE,
  MANA_INCREMENT,
  MAX_HAND_SIZE,
  MAX_HP,
  MAX_MANA,
  STARTING_MANA,
} from "./constants";
import { allPlayerSlotsFull, canDrawCard, gameReducer, type GameAction } from "./reducer";
import type { CardData } from "../types/card";
import type { GameState } from "./types";
import {
  emptyBoard,
  makeHandCard,
  makeState,
  mockRandom,
  mockUuids,
  mulberry32,
} from "../test/helpers";

// hand fixtures: independent of the real card data, so rebalancing cards.ts never breaks these tests
const cheapAttack = makeHandCard("cheap-attack", { id: "ensnare", mana: 1, stat: 3, type: "attack" });
const costlyAttack = makeHandCard("costly-attack", { id: "fireball", mana: 4, stat: 5, type: "attack" });
const healCard = makeHandCard("heal", { id: "healing", mana: 2, stat: 4, type: "heal" });

// enemy AI draws from the real attack cards, so its tests derive expectations from that data
// (the picked card's own mana/stat) instead of hardcoding numbers
const attackCards = cards.filter((card) => card.type === "attack");
const cheapestAttack = attackCards.reduce((best, card) => (card.mana < best.mana ? card : best));
const priciestAttack = attackCards.reduce((best, card) => (card.mana > best.mana ? card : best));
const cardPick = (card: (typeof attackCards)[number]) =>
  (attackCards.indexOf(card) + 0.5) / attackCards.length; // value that makes pickRandom() choose `card`
const slotPick = (position: number, emptySlots: number) => (position + 0.5) / emptySlots;
const NO_SKIP = 0.99; // anything >= ENEMY_SKIP_CHANCE

// randomness is forbidden unless a test opts in (mockRandom / a seeded mock): an unplanned
// Math.random() call then fails the test deterministically instead of passing or failing by chance
beforeEach(() => {
  vi.spyOn(Math, "random").mockImplementation(() => {
    throw new Error("Unplanned Math.random() call - mock it explicitly in this test");
  });
});

const fullBoard = (): (CardData | undefined)[] => Array.from({ length: BOARD_SIZE }, () => cheapestAttack);

describe("test fixtures", () => {
  it("makeState returns a deeply frozen state, so reducer mutations would throw", () => {
    const state = makeState({ hand: [cheapAttack] });
    expect(() => {
      (state.player as { hp: number }).hp = 1;
    }).toThrow(TypeError);
    expect(() => {
      state.hand.push(healCard);
    }).toThrow(TypeError);
  });
});

describe("canDrawCard / allPlayerSlotsFull", () => {
  it("allows drawing on the player's turn with free hand space, an unused draw and enough mana", () => {
    expect(canDrawCard(makeState({ player: { hp: MAX_HP, mana: DRAW_COST } }))).toBe(true);
  });

  it.each<[string, Partial<GameState>]>([
    ["it is the enemy's turn", { turn: "enemy" }],
    ["a card was already drawn this turn", { hasDrawnThisTurn: true }],
    [
      "the hand is full",
      { hand: Array.from({ length: MAX_HAND_SIZE }, (_, i) => makeHandCard(`h${i}`)) },
    ],
    ["mana is below the draw cost", { player: { hp: MAX_HP, mana: DRAW_COST - 1 } }],
  ])("refuses to draw when %s", (_label, overrides) => {
    expect(canDrawCard(makeState(overrides))).toBe(false);
  });

  it("reports full player slots only when every slot is occupied", () => {
    expect(allPlayerSlotsFull(makeState())).toBe(false);
    const almostFull = fullBoard();
    almostFull[BOARD_SIZE - 1] = undefined;
    expect(allPlayerSlotsFull(makeState({ playerBoard: almostFull }))).toBe(false);
    expect(allPlayerSlotsFull(makeState({ playerBoard: fullBoard() }))).toBe(true);
  });
});

describe("SELECT_CARD", () => {
  const select = (state: GameState, instanceId: string) =>
    gameReducer(state, { type: "SELECT_CARD", instanceId });

  it("selects an affordable card", () => {
    const state = makeState({ hand: [cheapAttack, healCard] });
    expect(select(state, "heal").selectedInstanceId).toBe("heal");
  });

  it("allows a card that costs exactly the player's mana", () => {
    const state = makeState({ hand: [healCard], player: { hp: MAX_HP, mana: healCard.mana } });
    expect(select(state, "heal").selectedInstanceId).toBe("heal");
  });

  it("deselects the card when it is selected again (toggle)", () => {
    const state = makeState({ hand: [cheapAttack], selectedInstanceId: "cheap-attack" });
    expect(select(state, "cheap-attack").selectedInstanceId).toBeNull();
  });

  it("moves the selection when another card is chosen", () => {
    const state = makeState({ hand: [cheapAttack, healCard], selectedInstanceId: "cheap-attack" });
    expect(select(state, "heal").selectedInstanceId).toBe("heal");
  });

  it("ignores a card the player cannot afford", () => {
    const state = makeState({ hand: [costlyAttack], player: { hp: MAX_HP, mana: costlyAttack.mana - 1 } });
    expect(select(state, "costly-attack")).toBe(state);
  });

  it("ignores selection when every player slot is taken", () => {
    const state = makeState({ hand: [cheapAttack], playerBoard: fullBoard() });
    expect(select(state, "cheap-attack")).toBe(state);
  });

  it("ignores selection on the enemy's turn", () => {
    const state = makeState({ hand: [cheapAttack], turn: "enemy" });
    expect(select(state, "cheap-attack")).toBe(state);
  });

  it("ignores an instanceId that is not in the hand", () => {
    const state = makeState({ hand: [cheapAttack] });
    expect(select(state, "ghost")).toBe(state);
  });

  // known gap, documented in the checklist (Lista B): the guard is planned together with
  // the first feature that dispatches from outside the inert tree (keyboard shortcuts)
  it.todo("ignores selection after the game has ended");
});

describe("DESELECT_CARD", () => {
  it("clears the selection", () => {
    const state = makeState({ hand: [cheapAttack], selectedInstanceId: "cheap-attack" });
    expect(gameReducer(state, { type: "DESELECT_CARD" }).selectedInstanceId).toBeNull();
  });

  it("returns the same state when nothing is selected", () => {
    const state = makeState({ hand: [cheapAttack] });
    expect(gameReducer(state, { type: "DESELECT_CARD" })).toBe(state);
  });
});

describe("DRAW_CARD", () => {
  const draw = (state: GameState) => gameReducer(state, { type: "DRAW_CARD" });

  it("adds the picked card with a fresh instanceId, spends mana and marks the draw as used", () => {
    mockRandom(0); // pickRandom -> first card in the deck
    mockUuids("drawn");
    const state = makeState({ hand: [cheapAttack], player: { hp: MAX_HP, mana: 3 } });

    const next = draw(state);

    expect(next.hand).toHaveLength(2);
    expect(next.hand[1]).toEqual({ ...cards[0], instanceId: "drawn-1" });
    expect(next.player.mana).toBe(3 - DRAW_COST);
    expect(next.hasDrawnThisTurn).toBe(true);
    expect(next.hand[0]).toBe(cheapAttack); // existing cards untouched
  });

  it("draws from the whole pool: a roll just below 1 picks the last card", () => {
    mockRandom(0.999999);
    mockUuids("drawn");
    const next = draw(makeState({ player: { hp: MAX_HP, mana: 3 } }));
    expect(next.hand[0]).toEqual({ ...cards[cards.length - 1], instanceId: "drawn-1" });
  });

  it("gives two copies of the same card distinct instanceIds", () => {
    mockRandom(0, 0);
    mockUuids("copy");
    const first = draw(makeState({ player: { hp: MAX_HP, mana: 5 } }));
    const second = draw({ ...first, hasDrawnThisTurn: false });
    expect(second.hand[0].id).toBe(second.hand[1].id);
    expect(second.hand[0].instanceId).not.toBe(second.hand[1].instanceId);
  });

  it("allows a draw that leaves exactly zero mana", () => {
    mockRandom(0);
    const next = draw(makeState({ player: { hp: MAX_HP, mana: DRAW_COST } }));
    expect(next.player.mana).toBe(0);
  });

  it.each<[string, Partial<GameState>]>([
    ["a card was already drawn this turn", { hasDrawnThisTurn: true }],
    ["the hand is full", { hand: Array.from({ length: MAX_HAND_SIZE }, (_, i) => makeHandCard(`h${i}`)) }],
    ["mana is below the draw cost", { player: { hp: MAX_HP, mana: DRAW_COST - 1 } }],
    ["it is the enemy's turn", { turn: "enemy" }],
  ])("is rejected when %s", (_label, overrides) => {
    const state = makeState(overrides);
    expect(draw(state)).toBe(state); // rejected before any randomness is consumed
  });

  // regression, v1.0.9: SELECT_CARD only lets the player select affordable cards, so a draw
  // that makes the selected card unaffordable has to clear the selection
  describe("selection after the draw (regression v1.0.9)", () => {
    const stateWithSelection = (mana: number) =>
      makeState({
        hand: [costlyAttack], // costs 4
        selectedInstanceId: "costly-attack",
        player: { hp: MAX_HP, mana },
      });

    it("keeps the selection while the card is still affordable after paying for the draw", () => {
      mockRandom(0);
      const next = draw(stateWithSelection(costlyAttack.mana + DRAW_COST));
      expect(next.selectedInstanceId).toBe("costly-attack");
    });

    it("clears the selection when the draw makes the card unaffordable", () => {
      mockRandom(0);
      const next = draw(stateWithSelection(costlyAttack.mana + DRAW_COST - 1));
      expect(next.selectedInstanceId).toBeNull();
    });
  });

  // known gap, documented in the checklist (Lista B) - see SELECT_CARD
  it.todo("is rejected after the game has ended");
});

describe("PLACE_CARD", () => {
  const place = (state: GameState, slotIndex: number) =>
    gameReducer(state, { type: "PLACE_CARD", slotIndex });
  const withSelected = (card: ReturnType<typeof makeHandCard>, overrides: Partial<GameState> = {}) =>
    makeState({ hand: [card, healCard], selectedInstanceId: card.instanceId, ...overrides });

  describe("attack card", () => {
    it("damages the enemy, spends mana, fills the slot, removes the card from hand and clears the selection", () => {
      const state = withSelected(cheapAttack, { player: { hp: 12, mana: 5 } });

      const next = place(state, 2);

      expect(next.enemy.hp).toBe(MAX_HP - cheapAttack.stat);
      expect(next.player).toEqual({ hp: 12, mana: 5 - cheapAttack.mana }); // own HP untouched
      expect(next.playerBoard[2]?.id).toBe(cheapAttack.id);
      expect(next.playerBoard.filter(Boolean)).toHaveLength(1);
      expect(next.hand.map((c) => c.instanceId)).toEqual(["heal"]);
      expect(next.selectedInstanceId).toBeNull();
      expect(next.gameEnded).toBe(false);
      expect(next.winner).toBeNull();
    });

    it("clamps enemy HP at 0 instead of going negative", () => {
      const state = withSelected(costlyAttack, { enemy: { hp: 2, mana: 5 } });
      expect(place(state, 0).enemy.hp).toBe(0);
    });

    // regression, v0.3.1: cleanup (hand, selection) must also happen on the finishing blow
    it("ends the game with a player win on a finishing blow and still cleans up hand and selection", () => {
      const state = withSelected(cheapAttack, { enemy: { hp: cheapAttack.stat, mana: 5 } });

      const next = place(state, 1);

      expect(next.enemy.hp).toBe(0);
      expect(next.gameEnded).toBe(true);
      expect(next.winner).toBe("player");
      expect(next.hand.map((c) => c.instanceId)).toEqual(["heal"]);
      expect(next.selectedInstanceId).toBeNull();
      expect(next.player.mana).toBe(5 - cheapAttack.mana);
    });
  });

  describe("heal card", () => {
    it("restores the player's HP and leaves the enemy untouched", () => {
      const state = withSelected(healCard, { player: { hp: 10, mana: 5 } });
      const next = place(state, 0);
      expect(next.player.hp).toBe(10 + healCard.stat);
      expect(next.player.mana).toBe(5 - healCard.mana);
      expect(next.enemy).toBe(state.enemy);
    });

    it("caps HP at MAX_HP", () => {
      const state = withSelected(healCard, { player: { hp: MAX_HP - 1, mana: 5 } });
      expect(place(state, 0).player.hp).toBe(MAX_HP);
    });

    it("does not end the game", () => {
      const next = place(withSelected(healCard), 0);
      expect(next.gameEnded).toBe(false);
      expect(next.winner).toBeNull();
    });
  });

  it("allows a card that costs exactly the player's remaining mana", () => {
    const state = withSelected(costlyAttack, { player: { hp: MAX_HP, mana: costlyAttack.mana } });
    expect(place(state, 0).player.mana).toBe(0);
  });

  describe("rejections", () => {
    const occupiedBoard = emptyBoard();
    occupiedBoard[1] = cheapestAttack;

    it.each<[string, () => GameState, number]>([
      ["no card is selected", () => makeState({ hand: [cheapAttack] }), 0],
      ["the slot index is negative", () => withSelected(cheapAttack), -1],
      ["the slot index is past the last slot", () => withSelected(cheapAttack), BOARD_SIZE],
      ["the slot is occupied", () => withSelected(cheapAttack, { playerBoard: occupiedBoard }), 1],
      ["it is the enemy's turn", () => withSelected(cheapAttack, { turn: "enemy" }), 0],
      ["the game has ended", () => withSelected(cheapAttack, { gameEnded: true, winner: "enemy" }), 0],
      [
        "the selected card is no longer affordable (inconsistent state)",
        () => withSelected(costlyAttack, { player: { hp: MAX_HP, mana: costlyAttack.mana - 1 } }),
        0,
      ],
      [
        "the selected id is not in the hand (inconsistent state)",
        () => makeState({ hand: [healCard], selectedInstanceId: "ghost" }),
        0,
      ],
    ])("is rejected when %s", (_label, build, slotIndex) => {
      const state = build();
      expect(place(state, slotIndex)).toBe(state);
    });

    it("leaves the board untouched on rejection", () => {
      const state = withSelected(cheapAttack, { playerBoard: occupiedBoard });
      expect(place(state, 1).playerBoard).toBe(state.playerBoard);
    });
  });
});

describe("END_PLAYER_TURN", () => {
  const endTurn = (state: GameState) => gameReducer(state, { type: "END_PLAYER_TURN" });

  it("hands the turn to the enemy and clears the selection", () => {
    const state = makeState({ hand: [cheapAttack], selectedInstanceId: "cheap-attack" });
    const next = endTurn(state);
    expect(next.turn).toBe("enemy");
    expect(next.selectedInstanceId).toBeNull();
  });

  it("does not grow the enemy's mana on the first hand-over, only marks the first turn as taken", () => {
    const next = endTurn(makeState({ enemy: { hp: MAX_HP, mana: STARTING_MANA } }));
    expect(next.enemy.mana).toBe(STARTING_MANA);
    expect(next.enemyHasHadFirstTurn).toBe(true);
  });

  it("grows the enemy's mana by MANA_INCREMENT on later hand-overs", () => {
    const state = makeState({ enemyHasHadFirstTurn: true, enemy: { hp: MAX_HP, mana: 3 } });
    expect(endTurn(state).enemy.mana).toBe(3 + MANA_INCREMENT);
  });

  it("caps the enemy's mana at MAX_MANA", () => {
    const state = makeState({ enemyHasHadFirstTurn: true, enemy: { hp: MAX_HP, mana: MAX_MANA - 1 } });
    expect(endTurn(state).enemy.mana).toBe(MAX_MANA);
  });

  it("is ignored on the enemy's turn", () => {
    const state = makeState({ turn: "enemy" });
    expect(endTurn(state)).toBe(state);
  });

  // known gap, documented in the checklist (Lista B) - see SELECT_CARD
  it.todo("is ignored after the game has ended");
});

describe("PLAY_ENEMY_TURN", () => {
  const playEnemyTurn = (state: GameState) => gameReducer(state, { type: "PLAY_ENEMY_TURN" });
  const enemyTurn = (overrides: Partial<GameState> = {}) =>
    makeState({ turn: "enemy", enemy: { hp: MAX_HP, mana: MAX_MANA }, ...overrides });

  it("skips the whole turn when the roll is below ENEMY_SKIP_CHANCE", () => {
    mockRandom(ENEMY_SKIP_CHANCE - 0.01);
    const state = enemyTurn();
    expect(playEnemyTurn(state)).toBe(state);
  });

  it("does not skip when the roll equals ENEMY_SKIP_CHANCE exactly", () => {
    mockRandom(ENEMY_SKIP_CHANCE, cardPick(cheapestAttack), slotPick(0, BOARD_SIZE), cardPick(cheapestAttack));
    const next = playEnemyTurn(enemyTurn({ enemy: { hp: MAX_HP, mana: cheapestAttack.mana } }));
    expect(next.enemyBoard.filter(Boolean)).toHaveLength(1);
  });

  it("plays a card: damages the player, spends the enemy's mana and fills a slot", () => {
    mockRandom(NO_SKIP, cardPick(cheapestAttack), slotPick(2, BOARD_SIZE), cardPick(cheapestAttack));
    // mana for exactly one card, so the second pick is unaffordable and ends the turn
    const state = enemyTurn({ enemy: { hp: MAX_HP, mana: cheapestAttack.mana } });

    const next = playEnemyTurn(state);

    expect(next.player.hp).toBe(MAX_HP - cheapestAttack.stat);
    expect(next.enemy.mana).toBe(0);
    expect(next.enemyBoard[2]?.id).toBe(cheapestAttack.id);
    expect(next.enemyBoard.filter(Boolean)).toHaveLength(1);
    expect(next.gameEnded).toBe(false);
  });

  it("plays at most ENEMY_MAX_CARDS_PER_TURN cards and sums their damage", () => {
    mockRandom(
      NO_SKIP,
      cardPick(cheapestAttack), slotPick(0, 4), // first card -> slot 0
      cardPick(cheapestAttack), slotPick(2, 3), // second card -> third of the remaining empty slots (3)
    );
    const state = enemyTurn({ enemy: { hp: MAX_HP, mana: MAX_MANA } });

    const next = playEnemyTurn(state);

    const played = next.enemyBoard.filter(Boolean);
    expect(played).toHaveLength(ENEMY_MAX_CARDS_PER_TURN);
    expect(next.enemyBoard[0]).toBeDefined();
    expect(next.enemyBoard[3]).toBeDefined();
    expect(next.enemyBoard[1]).toBeUndefined();
    expect(next.enemyBoard[2]).toBeUndefined();
    expect(next.player.hp).toBe(MAX_HP - ENEMY_MAX_CARDS_PER_TURN * cheapestAttack.stat);
    expect(next.enemy.mana).toBe(MAX_MANA - ENEMY_MAX_CARDS_PER_TURN * cheapestAttack.mana);
  });

  it("only ever uses empty slots", () => {
    const occupied = emptyBoard();
    occupied[0] = cheapestAttack;
    occupied[2] = cheapestAttack;
    // empty slots are [1, 3]; position 1 -> slot 3
    mockRandom(NO_SKIP, cardPick(cheapestAttack), slotPick(1, 2), cardPick(cheapestAttack), slotPick(0, 1));
    const next = playEnemyTurn(enemyTurn({ enemyBoard: occupied }));
    expect(next.enemyBoard.every((slot) => slot !== undefined)).toBe(true);
    expect(next.enemyBoard[0]).toBe(cheapestAttack); // pre-existing cards not overwritten
    expect(next.enemyBoard[2]).toBe(cheapestAttack);
  });

  it("ends the turn early when the picked card is unaffordable", () => {
    mockRandom(NO_SKIP, cardPick(cheapestAttack));
    const state = enemyTurn({ enemy: { hp: MAX_HP, mana: cheapestAttack.mana - 1 } });
    const next = playEnemyTurn(state);
    expect(next.enemyBoard.filter(Boolean)).toHaveLength(0);
    expect(next.enemy.mana).toBe(cheapestAttack.mana - 1);
    expect(next.player.hp).toBe(MAX_HP);
  });

  // documented limitation: the AI checks only the single card it picked, not cheaper alternatives
  it("does not fall back to a cheaper card when the picked one is unaffordable (documented limitation)", () => {
    expect(priciestAttack.mana).toBeGreaterThan(cheapestAttack.mana); // precondition for this scenario
    mockRandom(NO_SKIP, cardPick(priciestAttack));
    const state = enemyTurn({ enemy: { hp: MAX_HP, mana: cheapestAttack.mana } });
    expect(playEnemyTurn(state).enemyBoard.filter(Boolean)).toHaveLength(0);
  });

  it("does nothing when the enemy board is full", () => {
    mockRandom(NO_SKIP); // no further randomness: the loop stops before picking a card
    const next = playEnemyTurn(enemyTurn({ enemyBoard: fullBoard() }));
    expect(next.player.hp).toBe(MAX_HP);
    expect(next.enemy.mana).toBe(MAX_MANA);
  });

  it("stops after a lethal card, declares the enemy the winner and does not play the second card", () => {
    mockRandom(NO_SKIP, cardPick(cheapestAttack), slotPick(0, BOARD_SIZE)); // a second pick would throw
    const state = enemyTurn({ player: { hp: 1, mana: 5 } });

    const next = playEnemyTurn(state);

    expect(next.player.hp).toBe(0);
    expect(next.gameEnded).toBe(true);
    expect(next.winner).toBe("enemy");
    expect(next.enemyBoard.filter(Boolean)).toHaveLength(1);
    expect(next.enemy.mana).toBe(MAX_MANA - cheapestAttack.mana);
  });

  it("never plays heal cards (200 seeded turns)", () => {
    let cardsPlayed = 0;
    for (let seed = 0; seed < 200; seed++) {
      vi.spyOn(Math, "random").mockImplementation(mulberry32(seed));
      const next = playEnemyTurn(enemyTurn());
      for (const card of next.enemyBoard) {
        if (card) {
          cardsPlayed++;
          expect(card.type).toBe("attack");
        }
      }
    }
    // without this the test would pass vacuously whenever the enemy never plays a card
    expect(cardsPlayed).toBeGreaterThan(0);
  });

  it.each<[string, Partial<GameState>]>([
    ["it is the player's turn", { turn: "player" }],
    ["the game has ended", { gameEnded: true, winner: "player" }],
  ])("is ignored when %s", (_label, overrides) => {
    const state = enemyTurn(overrides);
    expect(playEnemyTurn(state)).toBe(state); // rejected before any randomness is used (see beforeEach)
  });

  // known gap, documented in the checklist (Lista B): ENEMY_MAX_CARDS_PER_TURN holds only because
  // App dispatches this action once per enemy turn; the reducer itself would accept a second call
  it.todo("ignores a second PLAY_ENEMY_TURN within the same enemy turn");
});

describe("END_ENEMY_TURN", () => {
  const endEnemyTurn = (state: GameState) => gameReducer(state, { type: "END_ENEMY_TURN" });
  const midEnemyTurn = (overrides: Partial<GameState> = {}) =>
    makeState({
      turn: "enemy",
      hasDrawnThisTurn: true,
      playerBoard: fullBoard(),
      enemyBoard: fullBoard(),
      hand: [cheapAttack],
      player: { hp: 15, mana: 3 },
      enemy: { hp: 9, mana: 4 },
      ...overrides,
    });

  it("returns the turn to the player, clears both boards, re-enables drawing and grows the player's mana", () => {
    const next = endEnemyTurn(midEnemyTurn());
    expect(next.turn).toBe("player");
    expect(next.playerBoard).toHaveLength(BOARD_SIZE);
    expect(next.playerBoard.every((slot) => slot === undefined)).toBe(true);
    expect(next.enemyBoard).toHaveLength(BOARD_SIZE);
    expect(next.enemyBoard.every((slot) => slot === undefined)).toBe(true);
    expect(next.hasDrawnThisTurn).toBe(false);
    expect(next.player.mana).toBe(3 + MANA_INCREMENT);
  });

  it("leaves HP, the enemy's mana and the hand untouched", () => {
    const state = midEnemyTurn();
    const next = endEnemyTurn(state);
    expect(next.player.hp).toBe(15);
    expect(next.enemy).toBe(state.enemy);
    expect(next.hand).toBe(state.hand);
  });

  it("caps the player's mana at MAX_MANA", () => {
    const next = endEnemyTurn(midEnemyTurn({ player: { hp: 15, mana: MAX_MANA - 1 } }));
    expect(next.player.mana).toBe(MAX_MANA);
  });

  it("is ignored on the player's turn", () => {
    const state = midEnemyTurn({ turn: "player" });
    expect(endEnemyTurn(state)).toBe(state);
  });

  // regression, v0.3.2: a scheduled hand-over must not resume play after the match ended
  it("is ignored after the game has ended (regression v0.3.2)", () => {
    const state = midEnemyTurn({ gameEnded: true, winner: "enemy" });
    expect(endEnemyTurn(state)).toBe(state);
  });
});

describe("RESTART_GAME", () => {
  const restart = (state: GameState) => gameReducer(state, { type: "RESTART_GAME" });
  const finishedGame = () =>
    makeState({
      gameId: 3,
      turn: "enemy",
      player: { hp: 0, mana: 7 },
      enemy: { hp: 11, mana: 9 },
      playerBoard: fullBoard(),
      enemyBoard: fullBoard(),
      hand: [cheapAttack, healCard],
      selectedInstanceId: "heal",
      hasDrawnThisTurn: true,
      enemyHasHadFirstTurn: true,
      gameEnded: true,
      winner: "enemy",
    });

  it("is ignored while the game is still running", () => {
    const state = makeState();
    expect(restart(state)).toBe(state);
  });

  it("starts a fresh game with the next gameId", () => {
    vi.spyOn(Math, "random").mockImplementation(mulberry32(1)); // the new hand is dealt randomly
    const next = restart(finishedGame());
    expect(next).toMatchObject({
      gameId: 4,
      turn: "player",
      player: { hp: MAX_HP, mana: STARTING_MANA },
      enemy: { hp: MAX_HP, mana: STARTING_MANA },
      selectedInstanceId: null,
      hasDrawnThisTurn: false,
      enemyHasHadFirstTurn: false,
      gameEnded: false,
      winner: null,
    });
    expect(next.playerBoard).toHaveLength(BOARD_SIZE);
    expect(next.playerBoard.every((slot) => slot === undefined)).toBe(true);
    expect(next.enemyBoard).toHaveLength(BOARD_SIZE);
    expect(next.enemyBoard.every((slot) => slot === undefined)).toBe(true);
  });

  it("deals a full hand of distinct cards that includes at least one the player can afford (300 seeded restarts)", () => {
    for (let seed = 0; seed < 300; seed++) {
      vi.spyOn(Math, "random").mockImplementation(mulberry32(seed));
      const { hand } = restart(finishedGame());
      expect(hand).toHaveLength(MAX_HAND_SIZE);
      expect(new Set(hand.map((card) => card.id)).size).toBe(MAX_HAND_SIZE); // distinct cards...
      expect(new Set(hand.map((card) => card.instanceId)).size).toBe(MAX_HAND_SIZE); // ...and distinct instances
      expect(hand.some((card) => card.mana <= STARTING_MANA)).toBe(true);
    }
  });
});

describe("mana symmetry across turns", () => {
  it("gives the player and the enemy the same mana on their own turn N, capped at MAX_MANA", () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // 0 < ENEMY_SKIP_CHANCE -> the enemy skips every turn

    let state = makeState({
      player: { hp: MAX_HP, mana: STARTING_MANA },
      enemy: { hp: MAX_HP, mana: STARTING_MANA },
    });

    for (let turn = 1; turn <= 8; turn++) {
      const expected = Math.min(STARTING_MANA + MANA_INCREMENT * (turn - 1), MAX_MANA);
      expect(state.player.mana).toBe(expected);

      state = gameReducer(state, { type: "END_PLAYER_TURN" });
      expect(state.enemy.mana).toBe(expected);

      state = gameReducer(state, { type: "PLAY_ENEMY_TURN" });
      state = gameReducer(state, { type: "END_ENEMY_TURN" });
    }
  });
});

describe("unknown actions", () => {
  it("return the state unchanged", () => {
    const state = makeState();
    expect(gameReducer(state, { type: "NOPE" } as unknown as GameAction)).toBe(state);
  });
});
