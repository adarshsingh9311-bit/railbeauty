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
  passenger?: string | undefined;
  pnr?: string | undefined;
};

export const statusMeta: Record<
  SeatStatus,
  { label: string; short: string; token: string; hint: string }
> = {
  "verified-occupied": {
    label: "Verified occupied",
    short: "Occupied",
    token: "var(--occupied)",
    hint: "Passenger checked in and verified.",
  },
  "not-verified": {
    label: "Not yet verified",
    short: "Awaiting",
    token: "var(--unverified)",
    hint: "Passenger expected, no check-in signal yet.",
  },
  "potentially-vacant": {
    label: "Potentially vacant",
    short: "Maybe free",
    token: "var(--vacant)",
    hint: "Rules suggest it may be unused. Not requestable yet.",
  },
  "tt-verified-vacant": {
    label: "TT verified vacant",
    short: "Free",
    token: "var(--vacant)",
    hint: "TT confirmed vacant — you can request this seat.",
  },
  reassigned: {
    label: "Reassigned",
    short: "Reassigned",
    token: "var(--reassigned)",
    hint: "Officially allocated to another passenger.",
  },
  disputed: {
    label: "Disputed",
    short: "Disputed",
    token: "var(--disputed)",
    hint: "Occupancy or identity unclear — TT will resolve.",
  },
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
  const free = status === "tt-verified-vacant" || status === "potentially-vacant";
  return {
    no,
    berth: berthOf(no),
    status,
    passenger: free ? undefined : names[i % names.length],
    pnr: free ? undefined : `86244${17000 + no * 7}`,
  };
});

/** Seats the passenger can request, with fare for upgrades. */
export const offeredSeats = [
  { no: 23, berth: "SL" as Berth, coach: "B4", from: "Ratlam Jn", fare: 0, note: "Same class — no extra fare" },
  { no: 36, berth: "LB" as Berth, coach: "B4", from: "Ratlam Jn", fare: 0, note: "Lower berth preference" },
  { no: 52, berth: "LB" as Berth, coach: "B4", from: "Ratlam Jn", fare: 0, note: "Lower berth preference" },
  { no: 12, berth: "LB" as Berth, coach: "A1", from: "Vadodara Jn", fare: 1240, note: "Upgrade 3A → 2A" },
];

export const complaintCategories = [
  { id: "seat", label: "Seat dispute", icon: "armchair" },
  { id: "clean", label: "Cleanliness", icon: "sparkles" },
  { id: "ac", label: "AC / Electrical", icon: "fan" },
  { id: "food", label: "Food & catering", icon: "utensils" },
  { id: "safety", label: "Safety / Security", icon: "shield" },
  { id: "staff", label: "Staff behaviour", icon: "user" },
];

/* ---------- TT dashboard mock data ---------- */

export const ttCoaches = ["B1", "B2", "B3", "B4", "B5", "A1"];

export type Exception = {
  id: string;
  coach: string;
  seat: number;
  kind: "not-verified" | "potentially-vacant" | "disputed" | "duplicate-checkin";
  passenger: string;
  pnr: string;
  detail: string;
  since: string;
};

export const ttExceptions: Exception[] = [
  {
    id: "EX-101",
    coach: "B4",
    seat: 7,
    kind: "not-verified",
    passenger: "R. Iyer",
    pnr: "8624417049",
    detail: "No check-in signal since boarding station (NDLS).",
    since: "8h 31m",
  },
  {
    id: "EX-102",
    coach: "B4",
    seat: 11,
    kind: "potentially-vacant",
    passenger: "M. Das",
    pnr: "8624417077",
    detail: "No check-in + no movement signal for 3 stops.",
    since: "3 stops",
  },
  {
    id: "EX-103",
    coach: "B4",
    seat: 18,
    kind: "disputed",
    passenger: "T. Bose",
    pnr: "8624417126",
    detail: "Two passengers claim the same berth. ID check needed.",
    since: "12m",
  },
  {
    id: "EX-104",
    coach: "B3",
    seat: 44,
    kind: "duplicate-checkin",
    passenger: "A. Khan",
    pnr: "8624417308",
    detail: "Same token used in two coaches within 4 minutes.",
    since: "26m",
  },
  {
    id: "EX-105",
    coach: "B4",
    seat: 29,
    kind: "not-verified",
    passenger: "N. Joshi",
    pnr: "8624417203",
    detail: "Passenger has no smartphone — needs TT-assisted check-in.",
    since: "1h 04m",
  },
];

export type SeatRequest = {
  id: string;
  coach: string;
  seat: number;
  requester: string;
  pnr: string;
  currentSeat: string;
  reason: string;
  fare: number;
};

export const ttSeatRequests: SeatRequest[] = [
  {
    id: "RQ-51",
    coach: "B4",
    seat: 36,
    requester: "Aarav Mehta",
    pnr: "8624417930",
    currentSeat: "B4 / 32 SU",
    reason: "Lower berth requested (medical)",
    fare: 0,
  },
  {
    id: "RQ-52",
    coach: "B4",
    seat: 23,
    requester: "S. Kaur",
    pnr: "8624417441",
    currentSeat: "B4 / 15 UB",
    reason: "Travelling with infant",
    fare: 0,
  },
  {
    id: "RQ-53",
    coach: "A1",
    seat: 12,
    requester: "V. Rao",
    pnr: "8624417612",
    currentSeat: "B4 / 44 MB",
    reason: "Paid upgrade 3A → 2A",
    fare: 1240,
  },
];

export const ttSummary = {
  train: "12951 · Mumbai Rajdhani Express",
  onDuty: "TT R. Kulkarni · Emp 44821",
  seats: 384,
  verified: 331,
  awaiting: 24,
  potentiallyVacant: 12,
  verifiedVacant: 9,
  disputed: 3,
};
