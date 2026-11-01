import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buyTickets,
  drawWinner,
  emptyStore,
  maskPhone,
  normalizePhone,
  parseNumber,
  randomIndex,
  ticketsOf,
  wheelSample,
  type Campaign,
  type Store,
} from "./raffle.ts";

const campaign: Campaign = {
  id: "c1",
  title: "پژو",
  prize: "",
  ticketPrice: 50_000,
  maxTickets: 5,
  drawAt: "",
  icon: "fridge",
  createdAt: "",
  winnerNumber: null,
  drawnAt: null,
};
const base: Store = { ...emptyStore, campaigns: [campaign] };
const buyer = { buyerName: "علی", phone: "۰۹۱۲۱۲۳۴۵۶۷", quantity: 3 };

test("buying issues sequential ticket numbers", () => {
  const first = buyTickets(base, "c1", buyer);
  assert.deepEqual(first.tickets.map((t) => t.number), [1001, 1002, 1003]);
  assert.equal(first.tickets[0].phone, "09121234567");
  const second = buyTickets(first.store, "c1", { ...buyer, quantity: 2 });
  assert.deepEqual(second.tickets.map((t) => t.number), [1004, 1005]);
});

test("buying respects the ticket limit and validates input", () => {
  const { store } = buyTickets(base, "c1", buyer);
  assert.throws(() => buyTickets(store, "c1", buyer), /فقط ۲ بلیط/);
  assert.throws(() => buyTickets(base, "c1", { ...buyer, phone: "123" }), /موبایل/);
  assert.throws(() => buyTickets(base, "c1", { ...buyer, buyerName: " " }), /نام/);
  assert.throws(() => buyTickets(base, "c1", { ...buyer, quantity: 0 }), /تعداد/);
});

test("draw picks a sold ticket and closes the campaign", () => {
  const { store } = buyTickets(base, "c1", buyer);
  const drawn = drawWinner(store, "c1", () => 1);
  assert.equal(drawn.ticket.number, 1002);
  assert.equal(drawn.store.campaigns[0].winnerNumber, 1002);
  assert.throws(() => drawWinner(drawn.store, "c1"), /قبلاً/);
  assert.throws(() => buyTickets(drawn.store, "c1", buyer), /بسته/);
  assert.equal(ticketsOf(drawn.store, "c1").length, 3);
});

test("draw needs at least one ticket", () => {
  assert.throws(() => drawWinner(base, "c1"), /بلیطی/);
});

test("wheelSample caps slices and keeps the required number", () => {
  const nums = Array.from({ length: 100 }, (_, i) => 1001 + i);
  const s = wheelSample(nums, 10, 1077);
  assert.equal(s.length, 10);
  assert.ok(s.includes(1077));
  assert.deepEqual(wheelSample([1, 2, 3], 10), [1, 2, 3]);
});

test("phone helpers", () => {
  assert.equal(normalizePhone("9121234567"), "09121234567");
  assert.equal(normalizePhone("+98 912 123 4567"), "09121234567");
  assert.equal(normalizePhone("0812"), null);
  assert.equal(maskPhone("09121234567"), "۰۹۱۲***۴۵۶۷");
});

test("randomIndex stays in range and parseNumber reads Persian digits", () => {
  for (let i = 0; i < 1000; i++) {
    const n = randomIndex(7);
    assert.ok(n >= 0 && n < 7);
  }
  assert.equal(parseNumber("۱٬۲۰۰٬۰۰۰"), 1200000);
});
