import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { offeredSeats } from "@/lib/journey-data";
import { store, useAppState } from "@/lib/app-store";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowUpRight,
  Clock,
  IndianRupee,
  CheckCircle2,
  Hourglass,
  Smartphone,
  CreditCard,
  Landmark,
  X,
} from "lucide-react";

export const Route = createFileRoute("/passenger/seats")({
  head: () => ({
    meta: [
      { title: "Request a Seat & Pay Upgrades — SeatSetu" },
      {
        name: "description",
        content:
          "Request TT-verified vacant berths mid-journey, pay class upgrades by UPI or card, and track your request until the TT confirms it.",
      },
      { property: "og:title", content: "Request a Seat & Pay Upgrades — SeatSetu" },
      {
        property: "og:description",
        content: "Verified vacant berths, transparent fares and TT-confirmed reassignment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeatsPage,
});

const methods = [
  { id: "upi", label: "UPI (GPay, PhonePe, Paytm)", icon: Smartphone },
  { id: "card", label: "Debit / Credit card", icon: CreditCard },
  { id: "irctc", label: "IRCTC wallet", icon: Landmark },
];

function SeatsPage() {
  const { request, user } = useAppState();
  const [pay, setPay] = useState<{ seat: number; coach: string; fare: number } | null>(null);
  const [method, setMethod] = useState("upi");

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("my-seat-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seat_requests", filter: `user_id=eq.${user.id}` },
        () => void store.refreshRequest(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);



  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Seats you can request</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only TT-verified vacant berths are listed. The TT confirms every reassignment
          before the seat becomes yours.
        </p>
      </div>

      {request && (
        <section className="rounded-2xl border border-accent/40 bg-accent/10 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/25 text-accent-foreground">
              {request.status === "Confirmed" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Hourglass className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {request.coach} · Seat {request.seat} — {request.status}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {request.status === "Payment pending"
                  ? `Pay ₹${request.fare} to send this request to the TT.`
                  : "You'll get a notification once the TT confirms. Keep your ticket ready."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {request.status === "Payment pending" && (
                  <Button
                    size="sm"
                    onClick={() =>
                      setPay({ seat: request.seat, coach: request.coach, fare: request.fare })
                    }
                  >
                    <IndianRupee className="h-3.5 w-3.5" /> Pay ₹{request.fare}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    store.cancelRequest();
                    toast("Request withdrawn");
                  }}
                >
                  <X className="h-3.5 w-3.5" /> Withdraw
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <ul className="space-y-3">
        {offeredSeats.map((s) => {
          const active = request?.seat === s.no;
          return (
            <li key={`${s.coach}-${s.no}`} className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-vacant/15 font-mono text-sm font-bold text-vacant">
                  {s.no}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    Coach {s.coach} · Seat {s.no} · {s.berth}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Free from {s.from}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <IndianRupee className="h-3 w-3" />
                      {s.fare === 0 ? "No extra fare" : s.fare}
                    </span>
                  </p>
                </div>
              </div>
              <Button
                className="mt-3 w-full"
                variant={active ? "secondary" : "default"}
                disabled={active}
                onClick={() => {
                  store.requestSeat(s.no, s.coach, s.fare);
                  if (s.fare > 0) {
                    setPay({ seat: s.no, coach: s.coach, fare: s.fare });
                  } else {
                    toast.success(`Request sent for seat ${s.no}`, {
                      description: "Awaiting TT confirmation.",
                    });
                  }
                }}
              >
                {active ? "Requested" : s.fare > 0 ? `Request & pay ₹${s.fare}` : "Request seat"}
                {!active && <ArrowUpRight className="h-4 w-4" />}
              </Button>
            </li>
          );
        })}
      </ul>

      {pay && (
        <div className="fixed inset-0 z-40 flex items-end bg-foreground/40 p-0 sm:items-center sm:justify-center sm:p-4">
          <div className="w-full rounded-t-2xl bg-card p-5 shadow-lift sm:max-w-md sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Pay upgrade fare</h2>
              <button onClick={() => setPay(null)} aria-label="Close">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Coach {pay.coach} · Seat {pay.seat} — refunded automatically if the TT cannot
              confirm the seat.
            </p>
            <p className="mt-4 font-mono text-3xl font-semibold">₹{pay.fare}</p>

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
                store.paySeat();
                setPay(null);
                toast.success("Payment successful", {
                  description: "Receipt saved. Request sent to the TT for confirmation.",
                });
              }}
            >
              Pay ₹{pay.fare} securely
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Every payment and seat change is digitally recorded for audit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
