import { test } from "node:test";
import assert from "node:assert/strict";
import {
  draw,
  eligibleEntries,
  emptyState,
  loanAmount,
  parseNumber,
  randomIndex,
  type FundState,
} from "./lottery.ts";

const state: FundState = {
  ...emptyState,
  settings: { fundName: "test", contribution: 500 },
  members: [
    { id: "a", name: "علی", phone: "", shares: 2 },
    { id: "b", name: "سارا", phone: "", shares: 1 },
  ],
};

test("loan amount is contribution times total shares", () => {
  assert.equal(loanAmount(state), 1500);
});

test("each unwon share is one entry", () => {
  assert.deepEqual(
    eligibleEntries(state.members, state.rounds).map((m) => m.id),
    ["a", "a", "b"],
  );
});

test("winners lose one entry per win until all shares are drawn", () => {
  let s = state;
  const winners: string[] = [];
  for (let i = 0; i < 3; i++) {
    const round = draw(s, () => 0);
    winners.push(round.winnerId);
    assert.equal(round.number, i + 1);
    s = { ...s, rounds: [...s.rounds, round] };
  }
  assert.deepEqual(winners, ["a", "a", "b"]);
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
