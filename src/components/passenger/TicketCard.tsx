import { ticket } from "@/lib/journey-data";
import { QrCode, ShieldCheck } from "lucide-react";

export function TicketCard({ checkedIn }: { checkedIn: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-rail text-rail-foreground shadow-lift">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-brass" />
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-stretch">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-rail-foreground/60">
            <span>{ticket.train}</span>
            <span className="h-1 w-1 rounded-full bg-brass" />
            <span>{ticket.klass}</span>
            <span className="h-1 w-1 rounded-full bg-brass" />
            <span>{ticket.quota}</span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold">{ticket.trainName}</h2>

          <div className="mt-6 flex items-end gap-4">
            <div>
              <p className="font-mono text-3xl leading-none">{ticket.from.time}</p>
              <p className="mt-1 text-sm font-semibold">{ticket.from.code}</p>
              <p className="text-xs text-rail-foreground/60">{ticket.from.city}</p>
            </div>
            <div className="mb-6 flex-1">
              <div className="track-line h-[3px] w-full opacity-70" />
            </div>
            <div className="text-right">
              <p className="font-mono text-3xl leading-none">{ticket.to.time}</p>
              <p className="mt-1 text-sm font-semibold">{ticket.to.code}</p>
              <p className="text-xs text-rail-foreground/60">{ticket.to.city}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-rail-foreground/15 pt-4 sm:grid-cols-4">
            {[
              ["Passenger", `${ticket.passenger}, ${ticket.age}`],
              ["Coach", ticket.coach],
              ["Seat / Berth", `${ticket.seat} · ${ticket.berth}`],
              ["Date", ticket.date],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-rail-foreground/55">
                  {k}
                </dt>
                <dd className="mt-1 text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hidden w-px bg-[repeating-linear-gradient(180deg,var(--color-rail-foreground)_0_6px,transparent_6px_14px)] opacity-30 sm:block" />

        <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-44">
          <div className="grid h-28 w-28 place-items-center rounded-xl bg-rail-foreground/95 text-rail">
            <QrCode className="h-20 w-20" strokeWidth={1.2} />
          </div>
          <p className="font-mono text-xs tracking-[0.2em] text-rail-foreground/70">
            PNR {ticket.pnr}
          </p>
          {checkedIn ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brass px-3 py-1 text-[11px] font-semibold text-brass-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Checked in
            </span>
          ) : (
            <span className="rounded-full border border-rail-foreground/25 px-3 py-1 text-[11px] font-medium text-rail-foreground/70">
              Awaiting check-in
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
