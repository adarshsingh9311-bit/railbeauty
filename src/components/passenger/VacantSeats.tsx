import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { availableSeats, ticket } from "@/lib/journey-data";
import { ArrowUpRight, Clock, IndianRupee } from "lucide-react";

export function VacantSeats() {
  const [requested, setRequested] = useState<number | null>(null);

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-card">
      <h3 className="text-lg font-semibold">Seats you can request</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Only TT-verified vacant seats appear here. Your request is confirmed by the TT
        before the seat becomes yours.
      </p>

      <ul className="mt-5 divide-y">
        {availableSeats.map((s) => {
          const isMine = requested === s.no;
          return (
            <li key={s.no} className="flex flex-wrap items-center gap-4 py-4">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-vacant/15 font-mono text-sm font-semibold text-vacant">
                {s.no}
              </div>
              <div className="min-w-40 flex-1">
                <p className="text-sm font-semibold">
                  Coach {ticket.coach} · Seat {s.no} · {s.berth}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Free from Ratlam Jn
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" /> No extra fare
                  </span>
                </p>
              </div>
              <Button
                variant={isMine ? "secondary" : "default"}
                disabled={isMine}
                onClick={() => {
                  setRequested(s.no);
                  toast.success(`Request sent for seat ${s.no}`, {
                    description: "Waiting for TT confirmation — you'll get a notification.",
                  });
                }}
              >
                {isMine ? "Awaiting TT" : "Request seat"}
                {!isMine && <ArrowUpRight className="h-4 w-4" />}
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
