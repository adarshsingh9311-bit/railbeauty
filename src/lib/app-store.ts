import { useSyncExternalStore } from "react";

export type Complaint = {
  id: string;
  category: string;
  detail: string;
  status: "Submitted" | "With TT" | "Resolved";
  at: string;
};

export type RequestState = {
  seat: number;
  coach: string;
  fare: number;
  status: "Awaiting TT" | "Payment pending" | "Confirmed";
};

type State = {
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedOut: boolean;
  checkedOutAt: string | null;
  loyaltyPoints: number;
  request: RequestState | null;
  complaints: Complaint[];
  ttSignedIn: boolean;
};

let state: State = {
  checkedIn: false,
  checkedInAt: null,
  checkedOut: false,
  checkedOutAt: null,
  loyaltyPoints: 240,
  request: null,
  complaints: [
    {
      id: "CMP-2291",
      category: "Cleanliness",
      detail: "Washroom near B4 needs cleaning.",
      status: "Resolved",
      at: "22:40, Kota Jn",
    },
  ],
  ttSignedIn: false,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

export const store = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => state,
  checkIn: () => set({ checkedIn: true, checkedInAt: "01:26 · Ratlam Jn" }),
  checkOut: (reward: number) =>
    set({
      checkedOut: true,
      checkedOutAt: "01:40 · Ratlam Jn",
      loyaltyPoints: state.loyaltyPoints + reward,
    }),
  spendPoints: (n: number) =>
    set({ loyaltyPoints: Math.max(0, state.loyaltyPoints - n) }),
  requestSeat: (seat: number, coach: string, fare: number) =>
    set({
      request: { seat, coach, fare, status: fare > 0 ? "Payment pending" : "Awaiting TT" },
    }),
  paySeat: () =>
    set({ request: state.request ? { ...state.request, status: "Awaiting TT" } : null }),
  cancelRequest: () => set({ request: null }),
  addComplaint: (category: string, detail: string) =>
    set({
      complaints: [
        {
          id: `CMP-${Math.floor(2300 + Math.random() * 90)}`,
          category,
          detail,
          status: "Submitted",
          at: "Now · Ratlam Jn",
        },
        ...state.complaints,
      ],
    }),
  ttSignIn: () => {
    if (typeof window !== "undefined") sessionStorage.setItem("tt-session", "1");
    set({ ttSignedIn: true });
  },
  ttSignOut: () => {
    if (typeof window !== "undefined") sessionStorage.removeItem("tt-session");
    set({ ttSignedIn: false });
  },
  hasTTSession: () =>
    state.ttSignedIn ||
    (typeof window !== "undefined" && sessionStorage.getItem("tt-session") === "1"),
};

export function useAppState(): State {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
