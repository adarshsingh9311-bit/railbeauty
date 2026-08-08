import { stations } from "@/lib/journey-data";
import { TrainFront } from "lucide-react";

export function JourneyProgress() {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Journey</h3>
        <span className="flex items-center gap-1.5 rounded-full bg-occupied/12 px-2.5 py-1 text-xs font-medium text-occupied">
          <TrainFront className="h-3.5 w-3.5" /> On time
        </span>
      </div>

      <ol className="mt-5 space-y-0">
        {stations.map((s, i) => (
          <li key={s.code} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 h-3 w-3 rounded-full border-2 ${
                  s.current
                    ? "border-accent bg-accent animate-pulse-ring"
                    : s.done
                      ? "border-occupied bg-occupied"
                      : "border-border bg-card"
                }`}
              />
              {i < stations.length - 1 && (
                <span
                  className={`w-0.5 flex-1 ${s.done ? "bg-occupied/40" : "bg-border"}`}
                />
              )}
            </div>
            <div className="flex flex-1 items-baseline justify-between pb-6">
              <div>
                <p
                  className={`text-sm ${s.current ? "font-semibold text-foreground" : "font-medium"}`}
                >
                  {s.name}
                </p>
                <p className="text-xs text-muted-foreground">{s.code}</p>
              </div>
              <span className="font-mono text-sm text-muted-foreground">{s.time}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
