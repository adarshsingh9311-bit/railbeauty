import { useEffect, useState } from "react";
import { orderStages, store, type FoodOrder } from "@/lib/app-store";
import { Check, Loader2, Clock, MapPin } from "lucide-react";

const timeOf = (ms: number) =>
  new Date(ms).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

/** Ticks every second so ETA countdowns and stage progress stay live. */
function useLiveClock(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      store.tickOrders();
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export function OrderTracker({ orders }: { orders: FoodOrder[] }) {
  const hasLive = orders.some((o) => o.stage < orderStages.length - 1);
  const now = useLiveClock(hasLive);

  return (
    <ul className="space-y-4">
      {orders.map((o) => {
        const done = o.stage >= orderStages.length - 1;
        const total = o.etaAt - o.placedAt;
        const pct = done ? 100 : Math.min(100, Math.max(2, ((now - o.placedAt) / total) * 100));
        const leftMs = Math.max(0, o.etaAt - now);
        const mins = Math.floor(leftMs / 60000);
        const secs = Math.floor((leftMs % 60000) / 1000);

        return (
          <li key={o.id} className="rounded-2xl border bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{o.vendor}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {o.station} · {o.id}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  done ? "bg-vacant/15 text-vacant" : "bg-accent/20 text-accent-foreground"
                }`}
              >
                {orderStages[o.stage]!.label}
              </span>
            </div>

            <div className="mt-3 rounded-xl bg-muted/60 p-3">
              <p className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  {done ? "Delivered at" : "Arriving in"}
                </span>
                <span className="font-mono text-sm font-semibold">
                  {done
                    ? timeOf(o.stageAt[orderStages.length - 1] ?? o.etaAt)
                    : `${mins}m ${String(secs).padStart(2, "0")}s`}
                </span>
              </p>
              {!done && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Expected by {timeOf(o.etaAt)} · before {o.station} ({o.eta})
                </p>
              )}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-gradient-brass transition-all duration-1000 ease-linear"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <ol className="mt-3">
              {orderStages.map((s, i) => {
                const complete = i <= o.stage;
                const current = i === o.stage && !done;
                const last = i === orderStages.length - 1;
                return (
                  <li key={s.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full border-2 ${
                          complete
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {current ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : complete ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      {!last && (
                        <span
                          className={`w-0.5 flex-1 ${i < o.stage ? "bg-accent" : "bg-border"}`}
                          style={{ minHeight: 22 }}
                        />
                      )}
                    </div>
                    <div className={`pb-3 ${last ? "pb-0" : ""}`}>
                      <p
                        className={`text-sm font-medium ${
                          complete ? "" : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                        {o.stageAt[i] && (
                          <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                            {timeOf(o.stageAt[i]!)}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{s.note}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
              {o.lines.map((l) => `${l.name} ×${l.qty}`).join(", ")} ·{" "}
              <span className="font-mono font-semibold text-foreground">₹{o.total}</span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
