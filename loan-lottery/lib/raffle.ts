export type PrizeIcon = "fridge" | "washer" | "tv" | "stove" | "vacuum" | "aircon";

export type Campaign = {
  id: string;
  title: string;
  prize: string;
  ticketPrice: number;
  // 0 means unlimited.
  maxTickets: number;
  // Local date-time ("2026-11-05T20:00").
  drawAt: string;
  icon: PrizeIcon;
  createdAt: string;
  winnerNumber: number | null;
  drawnAt: string | null;
};

export type Ticket = {
  id: string;
  campaignId: string;
  number: number;
  buyerName: string;
  phone: string;
  purchasedAt: string;
};

export type Store = {
  siteName: string;
  campaigns: Campaign[];
  tickets: Ticket[];
};

export const emptyStore: Store = {
  siteName: "خانه شانس",
  campaigns: [],
  tickets: [],
};

export const FIRST_TICKET = 1001;
export const MAX_PER_PURCHASE = 20;

export const prizeIcons: { value: PrizeIcon; label: string }[] = [
  { value: "fridge", label: "یخچال" },
  { value: "washer", label: "ماشین لباسشویی" },
  { value: "tv", label: "تلویزیون" },
  { value: "stove", label: "اجاق گاز" },
  { value: "vacuum", label: "جاروبرقی" },
  { value: "aircon", label: "کولر گازی" },
];

export function prizeLabel(icon: PrizeIcon): string {
  return prizeIcons.find((p) => p.value === icon)?.label ?? "لوازم خانگی";
}

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

export function ticketsOf(store: Store, campaignId: string): Ticket[] {
  return store.tickets
    .filter((t) => t.campaignId === campaignId)
    .sort((a, b) => a.number - b.number);
}

export function remaining(store: Store, campaign: Campaign): number {
  if (campaign.maxTickets === 0) return Infinity;
  return Math.max(0, campaign.maxTickets - ticketsOf(store, campaign.id).length);
}

export function isOpen(campaign: Campaign): boolean {
  return campaign.winnerNumber === null;
}

export function winnerTicket(store: Store, campaign: Campaign): Ticket | undefined {
  if (campaign.winnerNumber === null) return undefined;
  return store.tickets.find(
    (t) => t.campaignId === campaign.id && t.number === campaign.winnerNumber,
  );
}

// Converts Persian/Arabic digits to Latin and strips everything else.
export function latinDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[^\d]/g, "");
}

export function parseNumber(input: string): number {
  const digits = latinDigits(input);
  return digits ? Number(digits) : 0;
}

export function normalizePhone(input: string): string | null {
  let digits = latinDigits(input);
  if (digits.startsWith("98") && digits.length === 12) digits = "0" + digits.slice(2);
  if (digits.length === 10 && digits.startsWith("9")) digits = "0" + digits;
  return /^09\d{9}$/.test(digits) ? digits : null;
}

export type Purchase = { buyerName: string; phone: string; quantity: number };

export function buyTickets(
  store: Store,
  campaignId: string,
  purchase: Purchase,
): { store: Store; tickets: Ticket[] } {
  const campaign = store.campaigns.find((c) => c.id === campaignId);
  if (!campaign) throw new Error("این قرعه‌کشی پیدا نشد.");
  if (!isOpen(campaign)) throw new Error("قرعه‌کشی انجام شده و فروش بلیط بسته است.");
  const buyerName = purchase.buyerName.trim();
  if (!buyerName) throw new Error("نام خریدار را وارد کنید.");
  const phone = normalizePhone(purchase.phone);
  if (!phone) throw new Error("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.");
  const { quantity } = purchase;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_PER_PURCHASE) {
    throw new Error(`تعداد بلیط باید بین ۱ تا ${faNum(MAX_PER_PURCHASE)} باشد.`);
  }
  const left = remaining(store, campaign);
  if (quantity > left) {
    throw new Error(
      left === 0 ? "بلیط‌های این قرعه‌کشی تمام شده است." : `فقط ${faNum(left)} بلیط باقی مانده است.`,
    );
  }

  const existing = ticketsOf(store, campaignId);
  const start = existing.length ? existing[existing.length - 1].number + 1 : FIRST_TICKET;
  const purchasedAt = new Date().toISOString();
  const tickets = Array.from({ length: quantity }, (_, i) => ({
    id: newId(),
    campaignId,
    number: start + i,
    buyerName,
    phone,
    purchasedAt,
  }));
  return { store: { ...store, tickets: [...store.tickets, ...tickets] }, tickets };
}

export function randomIndex(length: number): number {
  if (length <= 0) throw new Error("no entries");
  // Rejection sampling avoids modulo bias.
  const max = Math.floor(0x1_0000_0000 / length) * length;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= max);
  return buf[0] % length;
}

export function drawWinner(
  store: Store,
  campaignId: string,
  pick: (length: number) => number = randomIndex,
): { store: Store; ticket: Ticket } {
  const campaign = store.campaigns.find((c) => c.id === campaignId);
  if (!campaign) throw new Error("این قرعه‌کشی پیدا نشد.");
  if (!isOpen(campaign)) throw new Error("این قرعه‌کشی قبلاً انجام شده است.");
  const tickets = ticketsOf(store, campaignId);
  if (tickets.length === 0) throw new Error("هنوز بلیطی فروخته نشده است.");
  const ticket = tickets[pick(tickets.length)];
  const drawn: Campaign = {
    ...campaign,
    winnerNumber: ticket.number,
    drawnAt: new Date().toISOString(),
  };
  return {
    store: { ...store, campaigns: store.campaigns.map((c) => (c.id === campaignId ? drawn : c)) },
    ticket,
  };
}

// At most `max` numbers for the wheel, evenly spread, always including `must`.
export function wheelSample(numbers: number[], max: number, must?: number): number[] {
  if (numbers.length <= max) return numbers;
  const others = numbers.filter((n) => n !== must);
  const slots = must === undefined ? max : max - 1;
  const step = others.length / slots;
  const picked = Array.from({ length: slots }, (_, i) => others[Math.floor(i * step)]);
  if (must !== undefined) picked.push(must);
  return picked.sort((a, b) => a - b);
}

const numberFmt = new Intl.NumberFormat("fa-IR");
const dateFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function faDigits(s: string): string {
  return s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function faNum(n: number): string {
  return numberFmt.format(n);
}

export function ticketNo(n: number): string {
  return faDigits(`#${n}`);
}

export function toman(n: number): string {
  return `${numberFmt.format(n)} تومان`;
}

export function faDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function faDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

// "09121234567" -> "۰۹۱۲***۴۵۶۷"; render inside dir="ltr".
export function maskPhone(phone: string): string {
  return faDigits(`${phone.slice(0, 4)}***${phone.slice(-4)}`);
}

export function isStore(value: unknown): value is Store {
  const v = value as Store;
  return (
    !!v && typeof v.siteName === "string" && Array.isArray(v.campaigns) && Array.isArray(v.tickets)
  );
}
