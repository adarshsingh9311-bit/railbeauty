export type SeatStatus =
  | "verified-occupied"
  | "not-verified"
  | "potentially-vacant"
  | "tt-verified-vacant"
  | "reassigned"
  | "disputed";

export type Berth = "LB" | "MB" | "UB" | "SL" | "SU";

export type Seat = {
  no: number;
  berth: Berth;
  status: SeatStatus;
  passenger?: string;
};

export const statusMeta: Record<
  SeatStatus,
  { label: string; short: string; token: string }
> = {
  "verified-occupied": {
    label: "Verified occupied",
    short: "Occupied",
    token: "var(--occupied)",
  },
  "not-verified": {
    label: "Not yet verified",
    short: "Awaiting",
    token: "var(--unverified)",
  },
  "potentially-vacant": {
    label: "Potentially vacant",
    short: "Maybe free",
    token: "var(--vacant)",
  },
  "tt-verified-vacant": {
    label: "TT verified vacant",
    short: "Free",
    token: "var(--vacant)",
  },
  reassigned: { label: "Reassigned", short: "Reassigned", token: "var(--reassigned)" },
  disputed: { label: "Disputed", short: "Disputed", token: "var(--disputed)" },
};

export const ticket = {
  pnr: "8624417930",
  train: "12951",
  trainName: "Mumbai Rajdhani Express",
  coach: "B4",
  seat: 32,
  berth: "LB" as Berth,
  passenger: "Aarav Mehta",
  age: 27,
  quota: "GN",
  klass: "3A",
  from: { code: "NDLS", city: "New Delhi", time: "16:55" },
  to: { code: "MMCT", city: "Mumbai Central", time: "08:35" },
  date: "09 Aug 2026",
};

export const stations = [
  { code: "NDLS", name: "New Delhi", time: "16:55", done: true },
  { code: "MTJ", name: "Mathura Jn", time: "18:47", done: true },
  { code: "KOTA", name: "Kota Jn", time: "22:25", done: true },
  { code: "RTM", name: "Ratlam Jn", time: "01:45", current: true },
  { code: "BRC", name: "Vadodara Jn", time: "05:05" },
  { code: "ST", name: "Surat", time: "06:23" },
  { code: "MMCT", name: "Mumbai Central", time: "08:35" },
];

const berthOf = (n: number): Berth => {
  const m = n % 8;
  if (m === 1 || m === 4) return "LB";
  if (m === 2 || m === 5) return "MB";
  if (m === 3 || m === 6) return "UB";
  return m === 7 ? "SL" : "SU";
};

const names = [
  "R. Iyer",
  "S. Kaur",
  "M. Das",
  "P. Nair",
  "A. Khan",
  "V. Rao",
  "N. Joshi",
  "T. Bose",
  "K. Patel",
  "D. Reddy",
];

const overrides: Record<number, SeatStatus> = {
  7: "not-verified",
  11: "potentially-vacant",
  18: "disputed",
  23: "tt-verified-vacant",
  29: "not-verified",
  36: "tt-verified-vacant",
  41: "reassigned",
  47: "potentially-vacant",
  52: "tt-verified-vacant",
  58: "not-verified",
};

export const coachSeats: Seat[] = Array.from({ length: 64 }, (_, i) => {
  const no = i + 1;
  const status = overrides[no] ?? "verified-occupied";
  return {
    no,
    berth: berthOf(no),
    status,
    passenger:
      status === "tt-verified-vacant" || status === "potentially-vacant"
        ? undefined
        : names[i % names.length],
  };
});

export const availableSeats = coachSeats.filter((s) => s.status === "tt-verified-vacant");
