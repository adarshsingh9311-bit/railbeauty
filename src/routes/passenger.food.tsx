import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { foodStops, ticket } from "@/lib/journey-data";
import { OrderTracker } from "@/components/passenger/OrderTracker";

import { store, useAppState } from "@/lib/app-store";
import {
  UtensilsCrossed,
  Clock,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  X,
  Smartphone,
  CreditCard,
  Landmark,
  ExternalLink,
  Truck,
  Leaf,
  Drumstick,
} from "lucide-react";

export const Route = createFileRoute("/passenger/food")({
  head: () => ({
    meta: [
      { title: "Order Food to Your Seat — SeatSetu E-Catering" },
      {
        name: "description",
        content:
          "Order meals from station vendors ahead of Vadodara and Surat, pay by UPI or card, and get delivery to coach B4 seat 32. IRCTC e-catering link included.",
      },
      { property: "og:title", content: "Order Food to Your Seat — SeatSetu" },
      {
        property: "og:description",
        content:
          "Station-wise menus, order cut-off timings and seat-linked meal delivery on your train journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FoodPage,
});

const methods = [
  { id: "upi", label: "UPI (GPay, PhonePe, Paytm)", icon: Smartphone },
  { id: "card", label: "Debit / Credit card", icon: CreditCard },
  { id: "cod", label: "Pay on delivery", icon: Landmark },
];

const irctcUrl = `https://www.ecatering.irctc.co.in/?pnr=${ticket.pnr}`;

function FoodPage() {
  const { cart, cartVendor, orders } = useAppState();
  const [stopCode, setStopCode] = useState(foodStops[0]!.code);
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState("upi");

  const stop = foodStops.find((s) => s.code === stopCode)!;
  const itemsTotal = cart.reduce((n, l) => n + l.price * l.qty, 0);
  const delivery = itemsTotal > 0 ? 25 : 0;
  const total = itemsTotal + delivery;
  const qtyOf = (id: string) => cart.find((l) => l.id === id)?.qty ?? 0;

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <UtensilsCrossed className="h-5 w-5 text-accent" /> Food on this train
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Delivered to <span className="font-medium text-foreground">Coach {ticket.coach} · Seat {ticket.seat}</span>{" "}
          at the station you pick. Order before the cut-off time.
        </p>
      </div>

      {orders.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Truck className="h-4 w-4 text-accent" /> Live order tracking
          </h2>
          <OrderTracker orders={orders} />
        </section>
      )}


      <div className="flex gap-2 overflow-x-auto pb-1">
        {foodStops.map((s) => {
          const active = s.code === stopCode;
          return (
            <button
              key={s.code}
              onClick={() => setStopCode(s.code)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left text-xs ${
                active ? "border-primary bg-secondary" : "bg-card"
              }`}
            >
              <span className="block text-sm font-semibold">{s.station}</span>
              <span className="text-muted-foreground">Arrives {s.eta}</span>
            </button>
          );
        })}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" /> Order for {stop.station} before{" "}
        <span className="font-medium text-foreground">{stop.cutoff}</span>
      </p>

      <div className="space-y-4">
        {stop.vendors.map((v) => (
          <section key={v.id} className="rounded-2xl border bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{v.name}</h2>
                <p className="text-xs text-muted-foreground">{v.kind}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-medium">
                <Star className="h-3 w-3 text-brass" /> {v.rating}
              </span>
            </div>

            <ul className="mt-3 divide-y">
              {v.menu.map((m) => {
                const qty = qtyOf(m.id);
                return (
                  <li key={m.id} className="flex items-start gap-3 py-3">
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md ${
                        m.veg ? "bg-vacant/15 text-vacant" : "bg-disputed/15 text-disputed"
                      }`}
                    >
                      {m.veg ? <Leaf className="h-3.5 w-3.5" /> : <Drumstick className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {m.name}
                        {m.tag && (
                          <span className="ml-2 rounded-full bg-brass/20 px-2 py-0.5 text-[10px] font-semibold text-brass-foreground">
                            {m.tag}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
                      <p className="mt-1 font-mono text-sm font-semibold">₹{m.price}</p>
                    </div>
                    {qty === 0 ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          store.addToCart(
                            { id: v.id, name: v.name, station: stop.station, eta: stop.eta },
                            m,
                          )
                        }
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border px-1.5 py-1">
                        <button aria-label="Remove one" onClick={() => store.decFromCart(m.id)}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                        <button
                          aria-label="Add one"
                          onClick={() =>
                            store.addToCart(
                              { id: v.id, name: v.name, station: stop.station, eta: stop.eta },
                              m,
                            )
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <a
        href={irctcUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm shadow-card active:scale-[0.99]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary">
          <ExternalLink className="h-4 w-4" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Order on IRCTC e-catering</span>
          <span className="text-xs text-muted-foreground">
            Opens the official partner site with your PNR {ticket.pnr}
          </span>
        </span>
      </a>

      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-2xl px-4">
          <button
            onClick={() => setPayOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lift"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="flex-1 text-left text-sm font-semibold">
              {cart.reduce((n, l) => n + l.qty, 0)} item(s) · {cartVendor?.station}
            </span>
            <span className="font-mono text-sm font-semibold">₹{total}</span>
          </button>
        </div>
      )}

      {payOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-foreground/40 sm:items-center sm:justify-center sm:p-4">
          <div className="w-full rounded-t-2xl bg-card p-5 shadow-lift sm:max-w-md sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Confirm food order</h2>
              <button onClick={() => setPayOpen(false)} aria-label="Close">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {cartVendor?.name} · delivered at {cartVendor?.station} ({cartVendor?.eta}) to Coach{" "}
              {ticket.coach} Seat {ticket.seat}
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              {cart.map((l) => (
                <li key={l.id} className="flex justify-between">
                  <span>
                    {l.name} ×{l.qty}
                  </span>
                  <span className="font-mono">₹{l.price * l.qty}</span>
                </li>
              ))}
              <li className="flex justify-between text-xs text-muted-foreground">
                <span>Delivery & handling</span>
                <span className="font-mono">₹{delivery}</span>
              </li>
              <li className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span className="font-mono">₹{total}</span>
              </li>
            </ul>

            <ul className="mt-4 space-y-2">
              {methods.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => setMethod(m.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm ${
                      method === m.id ? "border-primary bg-secondary" : "bg-background"
                    }`}
                  >
                    <m.icon className="h-4 w-4 text-accent" />
                    <span className="flex-1">{m.label}</span>
                    <span
                      className={`h-4 w-4 rounded-full border-2 ${
                        method === m.id ? "border-primary bg-primary" : "border-border"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>

            <Button
              className="mt-4 w-full"
              size="lg"
              onClick={() => {
                store.placeOrder(total);
                setPayOpen(false);
                toast.success("Food order placed", {
                  description: `Delivery at ${stop.station} to ${ticket.coach}/${ticket.seat}.`,
                });
              }}
            >
              {method === "cod" ? `Place order · ₹${total} on delivery` : `Pay ₹${total} & order`}
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Late or missing delivery? Raise a Food &amp; catering complaint from Help.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
