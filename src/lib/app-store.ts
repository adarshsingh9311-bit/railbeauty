import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Complaint = {
  id: string;
  category: string;
  detail: string;
  status: "Submitted" | "With TT" | "Resolved";
  at: string;
};

export type RequestState = {
  id: string;
  seat: number;
  coach: string;
  fare: number;
  status: "Awaiting TT" | "Payment pending" | "Confirmed" | "Declined";
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
  id: string;
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

export type SessionUser = { id: string; email: string; name: string };

type State = {
  authReady: boolean;
  user: SessionUser | null;
  role: "passenger" | "tt" | null;
  employeeId: string | null;
  loading: boolean;
  checkedIn: boolean;
  checkedInAt: string | null;
  request: RequestState | null;
  complaints: Complaint[];
  cart: CartLine[];
  cartVendor: { id: string; name: string; station: string; eta: string } | null;
  orders: FoodOrder[];
  bookings: Booking[];
};

const empty = {
  checkedIn: false,
  checkedInAt: null,
  request: null,
  complaints: [],
  cart: [],
  cartVendor: null,
  orders: [],
  bookings: [],
} satisfies Partial<State>;

let state: State = {
  authReady: false,
  user: null,
  role: null,
  employeeId: null,
  loading: false,
  ...empty,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapComplaint = (r: any): Complaint => ({
  id: r.id,
  category: r.category,
  detail: r.detail,
  status: r.status,
  at: `${fmtTime(r.created_at)}${r.station ? ` · ${r.station}` : ""}`,
});

const mapRequest = (r: any): RequestState => ({
  id: r.id,
  seat: r.seat,
  coach: r.coach,
  fare: Number(r.fare),
  status: r.status,
});

const mapOrder = (r: any): FoodOrder => ({
  id: r.id,
  station: r.station,
  vendor: r.vendor,
  eta: r.eta ?? "",
  lines: (r.lines ?? []) as CartLine[],
  total: Number(r.total),
  placedAt: new Date(r.placed_at).getTime(),
  etaAt: new Date(r.eta_at).getTime(),
  stage: r.stage,
  stageAt: (r.stage_at ?? []) as (number | null)[],
});

const mapBooking = (r: any): Booking => ({
  id: r.id,
  pnr: r.pnr,
  trainNo: r.train_no,
  trainName: r.train_name,
  from: r.from_station,
  to: r.to_station,
  date: r.travel_date,
  klass: r.klass,
  quota: r.quota,
  coach: r.coach,
  passengers: (r.passengers ?? []) as Booking["passengers"],
  total: Number(r.total),
  status: r.status,
  bookedAt: new Date(r.created_at).getTime(),
});
/* eslint-enable @typescript-eslint/no-explicit-any */

async function loadAll(userId: string) {
  set({ loading: true });
  const [roles, checkins, requests, complaints, orders, bookings] = await Promise.all([
    supabase.from("user_roles").select("role, employee_id").eq("user_id", userId),
    supabase.from("checkins").select("*").order("created_at", { ascending: false }).limit(1),
    supabase
      .from("seat_requests")
      .select("*")
      .neq("status", "Declined")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("complaints").select("*").order("created_at", { ascending: false }),
    supabase.from("food_orders").select("*").order("placed_at", { ascending: false }),
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
  ]);

  const roleRow = roles.data?.[0];
  const lastCheckin = checkins.data?.[0];

  set({
    loading: false,
    role: (roleRow?.role as State["role"]) ?? "passenger",
    employeeId: roleRow?.employee_id ?? null,
    checkedIn: Boolean(lastCheckin),
    checkedInAt: lastCheckin
      ? `${fmtTime(lastCheckin.created_at)} · ${lastCheckin.station ?? "on board"}`
      : null,
    request: requests.data?.[0] ? mapRequest(requests.data[0]) : null,
    complaints: (complaints.data ?? []).map(mapComplaint),
    orders: (orders.data ?? []).map(mapOrder),
    bookings: (bookings.data ?? []).map(mapBooking),
  });
}

let initialised = false;

/** Wires the auth session into the store. Safe to call more than once. */
export function initAppStore() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;

  const apply = (session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null) => {
    if (!session?.user) {
      set({ authReady: true, user: null, role: null, employeeId: null, ...empty });
      return;
    }
    const u = session.user;
    set({
      authReady: true,
      user: {
        id: u.id,
        email: u.email ?? "",
        name: (u.user_metadata?.["full_name"] as string) ?? u.email?.split("@")[0] ?? "Passenger",
      },
    });
    void loadAll(u.id);
  };

  void supabase.auth.getSession().then(({ data }) => apply(data.session));
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "TOKEN_REFRESHED") return;
    apply(session);
  });
}

const uid = () => state.user?.id ?? null;

export const store = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => state,

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: null, employeeId: null, ...empty });
  },

  checkIn: async (station = "Ratlam Jn", coach = "B4", seat = 32, pnr?: string) => {
    const user_id = uid();
    if (!user_id) return;
    const { data } = await supabase
      .from("checkins")
      .insert({ user_id, station, coach, seat, pnr: pnr ?? null })
      .select()
      .single();
    set({
      checkedIn: true,
      checkedInAt: data ? `${fmtTime(data.created_at)} · ${station}` : `Now · ${station}`,
    });
  },

  requestSeat: async (seat: number, coach: string, fare: number) => {
    const user_id = uid();
    if (!user_id) return;
    const { data } = await supabase
      .from("seat_requests")
      .insert({
        user_id,
        seat,
        coach,
        current_seat: "B4/32",
        reason: "Requested a TT-verified vacant berth",
        fare,
        status: fare > 0 ? "Payment pending" : "Awaiting TT",
      })
      .select()
      .single();
    if (data) set({ request: mapRequest(data) });
  },

  paySeat: async () => {
    const r = state.request;
    if (!r) return;
    const { data } = await supabase
      .from("seat_requests")
      .update({ status: "Awaiting TT" })
      .eq("id", r.id)
      .select()
      .single();
    if (data) set({ request: mapRequest(data) });
  },

  cancelRequest: async () => {
    const r = state.request;
    if (!r) return;
    await supabase.from("seat_requests").delete().eq("id", r.id);
    set({ request: null });
  },

  refreshRequest: async () => {
    if (!uid()) return;
    const { data } = await supabase
      .from("seat_requests")
      .select("*")
      .neq("status", "Declined")
      .order("created_at", { ascending: false })
      .limit(1);
    set({ request: data?.[0] ? mapRequest(data[0]) : null });
  },

  addComplaint: async (category: string, detail: string) => {
    const user_id = uid();
    if (!user_id) return;
    const { data } = await supabase
      .from("complaints")
      .insert({ user_id, category, detail, coach: "B4", seat: 32, station: "Ratlam Jn" })
      .select()
      .single();
    if (data) set({ complaints: [mapComplaint(data), ...state.complaints] });
  },

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

  placeOrder: async (total: number) => {
    const user_id = uid();
    if (!user_id || !state.cartVendor || state.cart.length === 0) return;
    const v = state.cartVendor;
    const now = Date.now();
    const { data } = await supabase
      .from("food_orders")
      .insert({
        user_id,
        station: v.station,
        vendor: v.name,
        eta: v.eta,
        lines: state.cart,
        total,
        stage: 0,
        stage_at: [now, null, null, null],
        placed_at: new Date(now).toISOString(),
        eta_at: new Date(now + DELIVERY_MS).toISOString(),
      })
      .select()
      .single();
    set({
      orders: data ? [mapOrder(data), ...state.orders] : state.orders,
      cart: [],
      cartVendor: null,
    });
  },

  /** Advances any live order to the stage its elapsed time has reached. */
  tickOrders: () => {
    const now = Date.now();
    const changed: FoodOrder[] = [];
    const orders = state.orders.map((o) => {
      if (o.stage >= orderStages.length - 1) return o;
      const elapsed = (now - o.placedAt) / (o.etaAt - o.placedAt);
      let stage = o.stage;
      for (let i = o.stage + 1; i < stageFractions.length; i++) {
        if (elapsed >= stageFractions[i]!) stage = i;
      }
      if (stage === o.stage) return o;
      const stageAt = [...o.stageAt];
      for (let i = o.stage + 1; i <= stage; i++) stageAt[i] = now;
      const next = { ...o, stage, stageAt };
      changed.push(next);
      return next;
    });
    if (!changed.length) return;
    set({ orders });
    for (const o of changed) {
      void supabase
        .from("food_orders")
        .update({ stage: o.stage, stage_at: o.stageAt })
        .eq("id", o.id);
    }
  },

  bookTicket: async (b: Omit<Booking, "id" | "pnr" | "bookedAt" | "coach">) => {
    const user_id = uid();
    if (!user_id) return null;
    const coach = b.klass === "SL" ? "S5" : b.klass === "2A" ? "A1" : "B4";
    const pnr = `${Math.floor(4 + Math.random() * 5)}${Math.floor(100000000 + Math.random() * 899999999)}`;
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id,
        pnr,
        train_no: b.trainNo,
        train_name: b.trainName,
        from_station: b.from,
        to_station: b.to,
        travel_date: b.date,
        klass: b.klass,
        quota: b.quota,
        coach,
        passengers: b.passengers,
        total: b.total,
        status: b.status,
      })
      .select()
      .single();
    if (error || !data) return null;
    const booking = mapBooking(data);
    set({ bookings: [booking, ...state.bookings] });
    return booking;
  },
};

export function useAppState(): State {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
