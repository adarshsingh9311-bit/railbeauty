import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  ttCoaches,
  ttExceptions,
  ttSeatRequests,
  ttSummary,
  coachSeats,
  statusMeta,
} from "@/lib/journey-data";
import { store, useAppState } from "@/lib/app-store";
import {
  TrainFront,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  BadgeCheck,
  IndianRupee,
  ScanLine,
} from "lucide-react";

export const Route = createFileRoute("/tt/dashboard")({
  head: () => ({
    meta: [
      { title: "TT Dashboard — Coach Occupancy & Exceptions | SeatSetu" },
      {
        name: "description",
        content:
          "Exception-first dashboard for Travelling Ticket Examiners: coach seat maps, unverified berths, disputes, verified vacancies and reassignment approvals.",
      },
      { property: "og:title", content: "TT Dashboard — SeatSetu" },
      {
        property: "og:description",
        content: "Coach-wise occupancy, exception alerts and TT-controlled seat reassignment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TTDashboard,
});

const kindMeta: Record<string, { label: string; token: string }> = {
  "not-verified": { label: "Not verified", token: "var(--unverified)" },
  "potentially-vacant": { label: "Potentially vacant", token: "var(--vacant)" },
  disputed: { label: "Disputed", token: "var(--disputed)" },
  "duplicate-checkin": { label: "Duplicate check-in", token: "var(--disputed)" },
};

function TTDashboard() {
  const navigate = useNavigate();
  const { ttSignedIn } = useAppState();
  const [coach, setCoach] = useState("B4");
  const [done, setDone] = useState<Record<string, string>>({});

  useEffect(() => {
    const ok = ttSignedIn || sessionStorage.getItem("tt-session") === "1";
    if (!ok) navigate({ to: "/tt" });
  }, [ttSignedIn, navigate]);

  const stats = [
    { label: "Verified", value: ttSummary.verified, token: "var(--occupied)" },
    { label: "Awaiting", value: ttSummary.awaiting, token: "var(--unverified)" },
    { label: "Maybe vacant", value: ttSummary.potentiallyVacant, token: "var(--vacant)" },
    { label: "Disputed", value: ttSummary.disputed, token: "var(--disputed)" },
  ];

  const exceptions = ttExceptions.filter((e) => e.coach === coach);
  const requests = ttSeatRequests.filter((r) => r.coach === coach);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <header className="sticky top-0 z-20 bg-rail text-rail-foreground">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brass text-brass-foreground">
            <TrainFront className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">TT Dashboard</p>
            <p className="truncate text-[10px] uppercase tracking-[0.14em] text-rail-foreground/55">
              {ttSummary.onDuty}
            </p>
          </div>
          <Link
            to="/"
            onClick={store.ttSignOut}
            className="flex items-center gap-1.5 rounded-lg bg-rail-foreground/10 px-2.5 py-1.5 text-[11px] font-medium"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Link>
        </div>
        <div className="track-line h-[3px] w-full opacity-60" />
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5">
        <h1 className="text-lg font-semibold">{ttSummary.train}</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {ttSummary.seats} reserved berths · exception-first view, so you only inspect what
          needs you.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-3 shadow-card">
              <span className="h-1.5 w-8 rounded-full" style={{ backgroundColor: s.token, display: "block" }} />
              <p className="mt-2 font-mono text-2xl font-semibold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 -mx-4 overflow-x-auto px-4">
          <div className="flex gap-2">
            {ttCoaches.map((c) => (
              <button
                key={c}
                onClick={() => setCoach(c)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold ${
                  coach === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground"
                }`}
              >
                Coach {c}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-5 rounded-2xl border bg-card p-4 shadow-card">
          <h2 className="text-sm font-semibold">Needs your attention · Coach {coach}</h2>
          {exceptions.length === 0 ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-occupied" /> No open exceptions in this
              coach.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {exceptions.map((e) => {
                const meta = kindMeta[e.kind]!;
                const action = done[e.id];
                return (
                  <li key={e.id} className="rounded-xl border bg-background/60 p-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold"
                        style={{
                          backgroundColor: `color-mix(in oklab, ${meta.token} 16%, transparent)`,
                          color: `color-mix(in oklab, ${meta.token} 80%, var(--foreground))`,
                        }}
                      >
                        {e.seat}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">
                            Seat {e.seat} · {e.passenger}
                          </p>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: `color-mix(in oklab, ${meta.token} 16%, transparent)`,
                              color: `color-mix(in oklab, ${meta.token} 80%, var(--foreground))`,
                            }}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{e.detail}</p>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                          PNR {e.pnr} · open {e.since}
                        </p>
                      </div>
                    </div>

                    {action ? (
                      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-occupied">
                        <BadgeCheck className="h-3.5 w-3.5" /> {action} — logged against your
                        ID
                      </p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setDone({ ...done, [e.id]: "Marked verified vacant" });
                            toast.success(`Seat ${e.seat} marked verified vacant`, {
                              description: "Now offered to eligible passengers.",
                            });
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verify vacant
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDone({ ...done, [e.id]: "Occupancy confirmed" });
                            toast.success(`Seat ${e.seat} confirmed occupied`);
                          }}
                        >
                          <UserCheck className="h-3.5 w-3.5" /> Confirm occupied
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDone({ ...done, [e.id]: "TT-assisted check-in done" });
                            toast.success(`Checked in seat ${e.seat} on passenger's behalf`);
                          }}
                        >
                          <ScanLine className="h-3.5 w-3.5" /> Assisted check-in
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDone({ ...done, [e.id]: "Flagged for ID verification" });
                            toast("ID verification requested");
                          }}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" /> Ask for ID
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-5 rounded-2xl border bg-card p-4 shadow-card">
          <h2 className="text-sm font-semibold">Reassignment requests · Coach {coach}</h2>
          {requests.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            <ul className="mt-3 divide-y">
              {requests.map((r) => {
                const action = done[r.id];
                return (
                  <li key={r.id} className="py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {r.requester} → Seat {r.seat}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          From {r.currentSeat} · {r.reason}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                          {r.id} · PNR {r.pnr}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-medium">
                        <IndianRupee className="h-3 w-3" />
                        {r.fare === 0 ? "No fare" : `${r.fare} paid`}
                      </span>
                    </div>
                    {action ? (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-occupied">
                        <BadgeCheck className="h-3.5 w-3.5" /> {action}
                      </p>
                    ) : (
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setDone({ ...done, [r.id]: "Reassignment confirmed" });
                            toast.success(`Seat ${r.seat} allocated to ${r.requester}`);
                          }}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDone({ ...done, [r.id]: "Request declined" });
                            toast("Request declined — passenger notified");
                          }}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-5 rounded-2xl border bg-card p-4 shadow-card">
          <h2 className="text-sm font-semibold">Seat map · Coach {coach}</h2>
          <div className="mt-3 -mx-1 overflow-x-auto px-1">
            <div className="grid min-w-[520px] grid-cols-16 gap-1.5">
              {coachSeats.map((s) => {
                const meta = statusMeta[s.status];
                return (
                  <span
                    key={s.no}
                    title={`Seat ${s.no} · ${meta.label}`}
                    className="grid h-8 place-items-center rounded text-[10px] font-semibold"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${meta.token} 16%, transparent)`,
                      color: `color-mix(in oklab, ${meta.token} 80%, var(--foreground))`,
                    }}
                  >
                    {s.no}
                  </span>
                );
              })}
            </div>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3 text-[11px] sm:grid-cols-3">
            {Object.entries(statusMeta).map(([k, m]) => (
              <li key={k} className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: m.token }} />
                {m.label}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-6 pb-4 text-center text-[11px] text-muted-foreground">
          A seat is never released automatically — every status change here is signed with
          your employee ID.
        </p>
      </main>
    </div>
  );
}
