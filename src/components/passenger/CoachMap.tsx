import {
  coachSeats,
  offeredSeats,
  statusMeta,
  ticket,
  type Seat,
} from "@/lib/journey-data";
import { store, useAppState } from "@/lib/app-store";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Armchair, Bell, CheckCircle2, IndianRupee, Info } from "lucide-react";

function SeatCell({
  seat,
  mine,
  selected,
  dimmed,
  onSelect,
}: {
  seat: Seat;
  mine: boolean;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
}) {
  const meta = statusMeta[seat.status];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Seat ${seat.no} ${seat.berth}, ${meta.label}`}
      className={`relative flex h-11 flex-col items-center justify-center rounded-md border text-[11px] font-semibold transition-all active:scale-95 ${
        mine ? "ring-2 ring-accent ring-offset-1 ring-offset-card" : ""
      } ${selected ? "outline-2 outline-offset-1 outline-primary" : ""} ${
        dimmed ? "opacity-25 saturate-0" : ""
      }`}
      style={{
        borderColor: `color-mix(in oklab, ${meta.token} 45%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${meta.token} 14%, transparent)`,
        color: `color-mix(in oklab, ${meta.token} 75%, var(--foreground))`,
      }}
    >
      <span>{seat.no}</span>
      <span className="text-[9px] font-medium opacity-70">{seat.berth}</span>
    </button>
  );
}

export function CoachMap() {
  const { request } = useAppState();
  const [sel, setSel] = useState<Seat | null>(null);
  const [vacantOnly, setVacantOnly] = useState(false);
  const bays = Array.from({ length: 8 }, (_, b) => coachSeats.slice(b * 8, b * 8 + 8));

  const count = (s: Seat["status"]) => coachSeats.filter((x) => x.status === s).length;
  const verifiedVacant = count("tt-verified-vacant");
  const maybeVacant = count("potentially-vacant");

  const isRequestable = (s: Seat) =>
    s.status === "tt-verified-vacant" || s.status === "potentially-vacant";

  const selOffer = sel
    ? offeredSeats.find((o) => o.coach === ticket.coach && o.no === sel.no)
    : undefined;
  const selRequested = sel != null && request?.seat === sel.no && request?.coach === ticket.coach;

  const requestSeat = (seat: Seat) => {
    const fare = selOffer?.fare ?? 0;
    store.requestSeat(seat.no, ticket.coach, fare);
    if (fare > 0) {
      toast.info(`Seat ${seat.no} reserved for you`, {
        description: `Pay ₹${fare} on the Seats tab to send it to the TT.`,
      });
    } else {
      toast.success(`Request sent for seat ${seat.no}`, {
        description: "Awaiting TT confirmation.",
      });
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Coach {ticket.coach} · live</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {count("verified-occupied")} verified · {count("not-verified")} awaiting ·{" "}
            <span className="font-semibold text-vacant">{verifiedVacant} verified vacant</span>
            {maybeVacant > 0 && <> · {maybeVacant} maybe free</>}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
          <Armchair className="h-3.5 w-3.5" /> Your seat {ticket.seat}
        </span>
      </div>

      {verifiedVacant > 0 && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-vacant/10 px-3 py-2 text-[11px] font-medium text-vacant">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {verifiedVacant} berth{verifiedVacant > 1 ? "s are" : " is"} verified vacant — tap a
          green berth to request it directly.
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="h-3.5 w-3.5" /> Tap any berth to see its status
        </p>
        <button
          type="button"
          onClick={() => setVacantOnly((v) => !v)}
          aria-pressed={vacantOnly}
          className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
            vacantOnly
              ? "border-vacant bg-vacant/15 text-vacant"
              : "bg-background text-muted-foreground"
          }`}
        >
          Vacant only
        </button>
      </div>

      <div className="mt-3 -mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-[520px] items-stretch gap-2 rounded-xl border bg-background/60 p-3">
          <div className="grid w-6 shrink-0 place-items-center rounded-md border border-dashed text-[9px] uppercase tracking-widest text-muted-foreground [writing-mode:vertical-rl]">
            Door
          </div>
          {bays.map((bay, i) => (
            <div key={i} className="flex-1 space-y-1.5">
              <p className="text-center text-[9px] uppercase tracking-widest text-muted-foreground">
                Bay {i + 1}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {bay.slice(0, 6).map((s) => (
                  <SeatCell
                    key={s.no}
                    seat={s}
                    mine={s.no === ticket.seat}
                    selected={sel?.no === s.no}
                    dimmed={vacantOnly && !isRequestable(s)}
                    onSelect={() => setSel(s)}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5 border-t pt-1.5">
                {bay.slice(6).map((s) => (
                  <SeatCell
                    key={s.no}
                    seat={s}
                    mine={s.no === ticket.seat}
                    selected={sel?.no === s.no}
                    dimmed={vacantOnly && !isRequestable(s)}
                    onSelect={() => setSel(s)}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="grid w-6 shrink-0 place-items-center rounded-md border border-dashed text-[9px] uppercase tracking-widest text-muted-foreground [writing-mode:vertical-rl]">
            Door
          </div>
        </div>
      </div>

      {sel && (
        <div className="mt-4 rounded-xl border bg-background/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">
              Seat {sel.no} · {sel.berth}
              {sel.no === ticket.seat && " (yours)"}
            </p>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: `color-mix(in oklab, ${statusMeta[sel.status].token} 16%, transparent)`,
                color: `color-mix(in oklab, ${statusMeta[sel.status].token} 78%, var(--foreground))`,
              }}
            >
              {statusMeta[sel.status].label}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{statusMeta[sel.status].hint}</p>
          {sel.passenger && (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              {sel.passenger} · PNR {sel.pnr?.slice(0, 4)}••••{sel.pnr?.slice(-2)}
            </p>
          )}

          {sel.status === "tt-verified-vacant" && sel.no !== ticket.seat && (
            <div className="mt-3 border-t pt-3">
              {selRequested ? (
                <p className="flex items-center gap-2 text-xs font-medium text-vacant">
                  <CheckCircle2 className="h-4 w-4" />
                  Requested — {request?.status}. Track it on the Seats tab.
                </p>
              ) : (
                <>
                  {selOffer && (
                    <p className="mb-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Free from {selOffer.from}</span>
                      <span className="flex items-center gap-0.5 font-medium text-foreground">
                        <IndianRupee className="h-3 w-3" />
                        {selOffer.fare === 0 ? "No extra fare" : selOffer.fare}
                      </span>
                    </p>
                  )}
                  <Button size="sm" className="w-full" onClick={() => requestSeat(sel)}>
                    Request seat {sel.no}
                  </Button>
                </>
              )}
            </div>
          )}

          {sel.status === "potentially-vacant" && (
            <div className="mt-3 border-t pt-3">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() =>
                  toast.info("We'll notify you", {
                    description: `If the TT verifies seat ${sel.no} as vacant, you'll get an alert.`,
                  })
                }
              >
                <Bell className="h-3.5 w-3.5" /> Notify me if it opens up
              </Button>
            </div>
          )}
        </div>
      )}

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-4 text-[11px] sm:grid-cols-3">
        {Object.entries(statusMeta).map(([k, m]) => (
          <li key={k} className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: m.token }} />
            {m.label}
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t pt-3 text-center text-[11px] text-muted-foreground">
        Looking for another coach or a class upgrade?{" "}
        <Link to="/passenger/seats" className="font-semibold text-primary underline-offset-2 hover:underline">
          See all requestable seats
        </Link>
      </p>
    </section>
  );
}
