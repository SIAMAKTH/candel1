export type Member = {
  id: string;
  name: string;
  phone: string;
  shares: number;
  // Fixed lottery numbers, one per share.
  numbers: number[];
};

export type Entry = {
  number: number;
  member: Member;
};

export type Round = {
  id: string;
  number: number;
  date: string;
  winnerId: string;
  winnerName: string;
  winnerNumber: number;
  amount: number;
  paidIds: string[];
};

export type Settings = {
  fundName: string;
  contribution: number;
};

export type FundState = {
  settings: Settings;
  members: Member[];
  rounds: Round[];
  paidIds: string[];
};

export const emptyState: FundState = {
  settings: { fundName: "صندوق وام خانگی", contribution: 1_000_000 },
  members: [],
  rounds: [],
  paidIds: [],
};

export function totalShares(members: Member[]): number {
  return members.reduce((sum, m) => sum + m.shares, 0);
}

export function loanAmount(state: FundState): number {
  return state.settings.contribution * totalShares(state.members);
}

export function winsOf(memberId: string, rounds: Round[]): number {
  return rounds.filter((r) => r.winnerId === memberId).length;
}

export function nextNumbers(members: Member[], count: number): number[] {
  const max = members.reduce((m, x) => Math.max(m, ...x.numbers), 0);
  return Array.from({ length: count }, (_, i) => max + i + 1);
}

// One entry per number that has not won yet, in number order.
export function eligibleEntries(members: Member[], rounds: Round[]): Entry[] {
  const won = new Set(rounds.map((r) => r.winnerNumber));
  const entries: Entry[] = [];
  for (const member of members) {
    for (const number of member.numbers) {
      if (!won.has(number)) entries.push({ number, member });
    }
  }
  return entries.sort((a, b) => a.number - b.number);
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

export function draw(
  state: FundState,
  pick: (length: number) => number = randomIndex,
): Round {
  const entries = eligibleEntries(state.members, state.rounds);
  if (entries.length === 0) throw new Error("همه اعضا وام گرفته‌اند");
  const { number, member } = entries[pick(entries.length)];
  return {
    id: newId(),
    number: state.rounds.length + 1,
    date: new Date().toISOString(),
    winnerId: member.id,
    winnerName: member.name,
    winnerNumber: number,
    amount: loanAmount(state),
    paidIds: [...state.paidIds],
  };
}

export function newId(): string {
  return crypto.randomUUID();
}

const numberFmt = new Intl.NumberFormat("fa-IR");
const dateFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function toman(n: number): string {
  return `${numberFmt.format(n)} تومان`;
}

export function faNum(n: number): string {
  return numberFmt.format(n);
}

export function faDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

// Accepts Persian/Arabic digits and thousands separators.
export function parseNumber(input: string): number {
  const latin = input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[^\d]/g, "");
  return latin ? Number(latin) : 0;
}

export function isFundState(value: unknown): value is FundState {
  const v = value as FundState;
  return (
    !!v &&
    typeof v.settings?.fundName === "string" &&
    typeof v.settings?.contribution === "number" &&
    Array.isArray(v.members) &&
    Array.isArray(v.rounds) &&
    Array.isArray(v.paidIds)
  );
}

// Upgrades data saved before lottery numbers existed.
export function normalizeState(state: FundState): FundState {
  const members: Member[] = [];
  for (const m of state.members) {
    members.push(
      Array.isArray(m.numbers) && m.numbers.length === m.shares
        ? m
        : { ...m, numbers: nextNumbers(members, m.shares) },
    );
  }
  const used = new Set<number>();
  const rounds = state.rounds.map((r) => {
    if (typeof r.winnerNumber === "number") {
      used.add(r.winnerNumber);
      return r;
    }
    const member = members.find((m) => m.id === r.winnerId);
    const number = member?.numbers.find((n) => !used.has(n)) ?? 0;
    used.add(number);
    return { ...r, winnerNumber: number };
  });
  return { ...state, members, rounds };
}
