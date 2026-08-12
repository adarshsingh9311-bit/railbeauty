import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ticket } from "@/lib/journey-data";
import { useAppState } from "@/lib/app-store";
import {
  TrainFront,
  Home,
  LayoutGrid,
  ArmchairIcon,
  LifeBuoy,
  ChevronLeft,
  WifiOff,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/passenger")({
  component: PassengerLayout,
});

const tabs = [
  { to: "/passenger", label: "My trip", icon: Home, exact: true },
  { to: "/passenger/coach", label: "Coach", icon: LayoutGrid },
  { to: "/passenger/seats", label: "Seats", icon: ArmchairIcon },
  { to: "/passenger/help", label: "Help", icon: LifeBuoy },
];

function PassengerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { checkedIn } = useAppState();

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <Toaster position="top-center" />
      <header className="sticky top-0 z-20 bg-rail text-rail-foreground">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            aria-label="Change role"
            className="grid h-8 w-8 place-items-center rounded-lg bg-rail-foreground/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brass text-brass-foreground">
            <TrainFront className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">
              {ticket.train} · {ticket.coach}/{ticket.seat}
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-rail-foreground/55">
              {ticket.passenger}
            </p>
          </div>
          {checkedIn ? (
            <span className="flex items-center gap-1 rounded-full bg-brass px-2 py-1 text-[10px] font-semibold text-brass-foreground">
              <CheckCircle2 className="h-3 w-3" /> Checked in
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full border border-rail-foreground/25 px-2 py-1 text-[10px] font-medium text-rail-foreground/75">
              <WifiOff className="h-3 w-3" /> Not checked in
            </span>
          )}
        </div>
        <div className="track-line h-[3px] w-full opacity-60" />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur">
        <ul className="mx-auto flex max-w-2xl">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <li key={t.to} className="flex-1">
                <Link
                  to={t.to}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`grid h-8 w-14 place-items-center rounded-full ${
                      active ? "bg-accent/20 text-accent-foreground" : ""
                    }`}
                  >
                    <t.icon className="h-[18px] w-[18px]" />
                  </span>
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
