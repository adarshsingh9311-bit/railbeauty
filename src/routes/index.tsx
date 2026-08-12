import { createFileRoute, Link } from "@tanstack/react-router";
import { TrainFront, QrCode, ClipboardCheck, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SeatSetu — Smart Railway Seat Occupancy & Seat Management" },
      {
        name: "description",
        content:
          "Pick your role: passengers check in with a ticket-linked QR, request verified vacant seats, pay upgrades and raise complaints. TTs get a live exception dashboard.",
      },
      { property: "og:title", content: "SeatSetu — Smart Railway Seat Management" },
      {
        property: "og:description",
        content:
          "Ticket-linked QR check-in, live coach occupancy, TT-verified seat reassignment, payments and complaints for Indian Railways.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RolePicker,
});

const roles = [
  {
    to: "/passenger",
    title: "I'm a Passenger",
    desc: "Check in to your seat, see live coach occupancy, request a verified vacant seat, pay upgrades and raise complaints.",
    points: ["QR / TT-assisted check-in", "Seat requests & payments", "Complaints & SOS"],
    icon: QrCode,
    accent: true,
  },
  {
    to: "/tt",
    title: "I'm a TT / Railway Staff",
    desc: "Sign in with your employee ID to open the coach-wise exception dashboard, verify vacancies and approve reassignments.",
    points: ["Exception-first dashboard", "Verify vacant & resolve disputes", "Approve reassignments"],
    icon: ClipboardCheck,
    accent: false,
  },
];

function RolePicker() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-rail text-rail-foreground">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-5 py-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brass text-brass-foreground">
            <TrainFront className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">SeatSetu</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-rail-foreground/55">
              Smart seat occupancy
            </p>
          </div>
        </div>
        <div className="track-line h-[3px] w-full opacity-60" />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">Who's using the app?</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Choose your role to continue. Seat release always stays under TT verification —
          the app only collects check-in signals.
        </p>

        <div className="mt-6 space-y-4">
          {roles.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className={`block rounded-2xl border p-5 shadow-card transition-transform active:scale-[0.99] ${
                r.accent ? "bg-gradient-rail text-rail-foreground" : "bg-card"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                    r.accent
                      ? "bg-gradient-brass text-brass-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <r.icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    {r.title}
                    <ArrowRight className="h-4 w-4 opacity-60" />
                  </h2>
                  <p
                    className={`mt-1 text-sm ${
                      r.accent ? "text-rail-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {r.desc}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {r.points.map((p) => (
                      <li
                        key={p}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          r.accent
                            ? "bg-rail-foreground/12 text-rail-foreground/85"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Staff area is protected by employee ID + OTP.
        </p>
      </main>
    </div>
  );
}
