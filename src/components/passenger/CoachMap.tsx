import { coachSeats, statusMeta, ticket, type Seat } from "@/lib/journey-data";
import { useState } from "react";
import { Armchair, Info } from "lucide-react";

function SeatCell({
  seat,
  mine,
  selected,
  onSelect,
}: {
  seat: Seat;
  mine: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = statusMeta[seat.status];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Seat ${seat.no} ${seat.berth}, ${meta.label}`}
      className={`relative flex h-11 flex-col items-center justify-center rounded-md border text-[11px] font-semibold transition-transform active:scale-95 ${
        mine ? "ring-2 ring-accent ring-offset-1 ring-offset-card" : ""
      } ${selected ? "outline-2 outline-offset-1 outline-primary" : ""}`}
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
  const [sel, setSel] = useState<Seat | null>(null);
  const bays = Array.from({ length: 8 }, (_, b) => coachSeats.slice(b * 8, b * 8 + 8));

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Coach {ticket.coach} · live</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Updated 2 min ago · 54 verified · 3 awaiting · 3 verified vacant
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
          <Armchair className="h-3.5 w-3.5" /> Your seat {ticket.seat}
        </span>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Info className="h-3.5 w-3.5" /> Tap any berth to see its status
      </p>

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
    </section>
  );
}
