import { coachSeats, statusMeta, ticket, type Seat } from "@/lib/journey-data";
import { Armchair } from "lucide-react";

function SeatCell({ seat, mine }: { seat: Seat; mine: boolean }) {
  const meta = statusMeta[seat.status];
  return (
    <button
      type="button"
      title={`Seat ${seat.no} · ${seat.berth} · ${meta.label}`}
      className={`group relative flex h-11 flex-col items-center justify-center rounded-md border text-[11px] font-semibold transition-transform hover:-translate-y-0.5 ${
        mine ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""
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
  const bays = Array.from({ length: 8 }, (_, b) => coachSeats.slice(b * 8, b * 8 + 8));

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Coach {ticket.coach} live occupancy</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Updated 2 min ago · 54 verified · 3 awaiting · 3 TT-verified vacant
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <Armchair className="h-3.5 w-3.5" /> Your seat {ticket.seat}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border bg-background/60 p-4">
        <div className="flex min-w-[560px] items-stretch gap-3">
          <div className="grid w-8 shrink-0 place-items-center rounded-md border border-dashed text-[10px] uppercase tracking-widest text-muted-foreground [writing-mode:vertical-rl]">
            Door
          </div>
          <div className="flex flex-1 gap-3">
            {bays.map((bay, i) => (
              <div key={i} className="flex-1 space-y-2">
                <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                  Bay {i + 1}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {bay.slice(0, 6).map((s) => (
                    <SeatCell key={s.no} seat={s} mine={s.no === ticket.seat} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5 border-t pt-2">
                  {bay.slice(6).map((s) => (
                    <SeatCell key={s.no} seat={s} mine={s.no === ticket.seat} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="grid w-8 shrink-0 place-items-center rounded-md border border-dashed text-[10px] uppercase tracking-widest text-muted-foreground [writing-mode:vertical-rl]">
            Door
          </div>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        {Object.entries(statusMeta).map(([k, m]) => (
          <li key={k} className="flex items-center gap-2 text-muted-foreground">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: m.token }}
            />
            {m.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
