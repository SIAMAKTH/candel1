import { test } from "node:test";
import assert from "node:assert/strict";
import {
  draw,
  eligibleEntries,
  emptyState,
  loanAmount,
  nextNumbers,
  normalizeState,
  parseNumber,
  randomIndex,
  type FundState,
} from "./lottery.ts";

const state: FundState = {
  ...emptyState,
  settings: { fundName: "test", contribution: 500, nextDrawAt: "" },
  members: [
    { id: "a", name: "علی", phone: "", shares: 2, numbers: [1, 3] },
    { id: "b", name: "سارا", phone: "", shares: 1, numbers: [2] },
  ],
};

test("loan amount is contribution times total shares", () => {
  assert.equal(loanAmount(state), 1500);
});

test("each unwon number is one entry, sorted by number", () => {
  assert.deepEqual(
    eligibleEntries(state.members, state.rounds).map((e) => [e.number, e.member.id]),
    [[1, "a"], [2, "b"], [3, "a"]],
  );
});

test("new numbers continue after the highest existing one", () => {
  assert.deepEqual(nextNumbers(state.members, 2), [4, 5]);
  assert.deepEqual(nextNumbers([], 1), [1]);
});

test("normalizeState assigns numbers to legacy data", () => {
  const legacy = {
    ...state,
    members: state.members.map(({ numbers: _, ...m }) => m),
    rounds: [{ id: "r", number: 1, date: "", winnerId: "b", winnerName: "سارا", amount: 0, paidIds: [] }],
  } as unknown as FundState;
  const s = normalizeState(legacy);
  assert.deepEqual(s.members.map((m) => m.numbers), [[1, 2], [3]]);
  assert.equal(s.rounds[0].winnerNumber, 3);
});

test("winners lose one entry per win until all shares are drawn", () => {
  let s = state;
  const winners: string[] = [];
  for (let i = 0; i < 3; i++) {
    const round = draw(s, () => 0);
    winners.push(`${round.winnerNumber}${round.winnerId}`);
    assert.equal(round.number, i + 1);
    s = { ...s, rounds: [...s.rounds, round] };
  }
  assert.deepEqual(winners, ["1a", "2b", "3a"]);
  assert.throws(() => draw(s));
});

test("randomIndex stays in range", () => {
  for (let i = 0; i < 1000; i++) {
    const n = randomIndex(7);
    assert.ok(n >= 0 && n < 7);
  }
});

test("parseNumber handles Persian digits and separators", () => {
  assert.equal(parseNumber("۱٬۲۰۰٬۰۰۰"), 1200000);
  assert.equal(parseNumber("2,500"), 2500);
  assert.equal(parseNumber(""), 0);
});
