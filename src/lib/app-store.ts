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

export type CartLine = { id: string; name: string; price: number; qty: number };

export const orderStages = [
  { key: "confirmed", label: "Order confirmed", note: "Vendor has accepted your order." },
  { key: "packed", label: "Packed & sealed", note: "Meal packed, hygiene-sealed with your seat tag." },
  { key: "out", label: "Out for delivery", note: "Delivery agent is heading to your coach." },
  { key: "delivered", label: "Delivered", note: "Handed over at your seat. Enjoy your meal!" },
] as const;

/** Fractions of the total ETA at which each stage begins. */
const stageFractions = [0, 0.25, 0.6, 1];

/** Demo delivery window in ms (kept short so progress is visible live). */
const DELIVERY_MS = 6 * 60 * 1000;

export type FoodOrder = {
  id: string;
  station: string;
  vendor: string;
  eta: string;
  lines: CartLine[];
  total: number;
  placedAt: number;
  etaAt: number;
  stage: number;
  stageAt: (number | null)[];
};


export type BookingPassenger = { name: string; age: number; gender: "M" | "F" | "O"; berth: string };

export type Booking = {
  pnr: string;
  trainNo: string;
  trainName: string;
  from: string;
  to: string;
  date: string;
  klass: string;
  quota: string;
  coach: string;
  passengers: (BookingPassenger & { seat: number; berth: string })[];
  total: number;
  status: "Confirmed" | "RAC" | "Waitlist";
  bookedAt: number;
};

type State = {
  checkedIn: boolean;
  checkedInAt: string | null;
  request: RequestState | null;
  complaints: Complaint[];
  ttSignedIn: boolean;
  cart: CartLine[];
  cartVendor: { id: string; name: string; station: string; eta: string } | null;
  orders: FoodOrder[];
  bookings: Booking[];
};


let state: State = {
  checkedIn: false,
  checkedInAt: null,
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
  cart: [],
  cartVendor: null,
  orders: [],
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
  addToCart: (
    vendor: { id: string; name: string; station: string; eta: string },
    item: { id: string; name: string; price: number },
  ) => {
    const sameVendor = state.cartVendor?.id === vendor.id;
    const cart = sameVendor ? state.cart : [];
    const existing = cart.find((l) => l.id === item.id);
    set({
      cartVendor: vendor,
      cart: existing
        ? cart.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l))
        : [...cart, { id: item.id, name: item.name, price: item.price, qty: 1 }],
    });
  },
  decFromCart: (id: string) => {
    const cart = state.cart
      .map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l))
      .filter((l) => l.qty > 0);
    set({ cart, cartVendor: cart.length ? state.cartVendor : null });
  },
  clearCart: () => set({ cart: [], cartVendor: null }),
  placeOrder: (total: number) => {
    if (!state.cartVendor || state.cart.length === 0) return;
    const v = state.cartVendor;
    const now = Date.now();
    set({
      orders: [
        {
          id: `FD-${Math.floor(4100 + Math.random() * 800)}`,
          station: v.station,
          vendor: v.name,
          eta: v.eta,
          lines: state.cart,
          total,
          placedAt: now,
          etaAt: now + DELIVERY_MS,
          stage: 0,
          stageAt: [now, null, null, null],
        },
        ...state.orders,
      ],
      cart: [],
      cartVendor: null,
    });
  },
  /** Advances any live order to the stage its elapsed time has reached. */
  tickOrders: () => {
    const now = Date.now();
    let changed = false;
    const orders = state.orders.map((o) => {
      if (o.stage >= orderStages.length - 1) return o;
      const elapsed = (now - o.placedAt) / (o.etaAt - o.placedAt);
      let stage = o.stage;
      for (let i = o.stage + 1; i < stageFractions.length; i++) {
        if (elapsed >= stageFractions[i]!) stage = i;
      }
      if (stage === o.stage) return o;
      changed = true;
      const stageAt = [...o.stageAt];
      for (let i = o.stage + 1; i <= stage; i++) stageAt[i] = now;
      return { ...o, stage, stageAt };
    });
    if (changed) set({ orders });
  },


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
