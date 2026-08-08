import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TicketCard } from "@/components/passenger/TicketCard";
import { CheckInPanel } from "@/components/passenger/CheckInPanel";
import { CoachMap } from "@/components/passenger/CoachMap";
import { VacantSeats } from "@/components/passenger/VacantSeats";
import { JourneyProgress } from "@/components/passenger/JourneyProgress";
import { TrainFront, Bell, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SeatSetu — Smart Railway Seat Check-in for Passengers" },
      {
        name: "description",
        content:
          "Check in to your reserved seat with a ticket-linked QR, see live coach occupancy, and request TT-verified vacant seats mid-journey.",
      },
      { property: "og:title", content: "SeatSetu — Smart Railway Seat Check-in" },
      {
        property: "og:description",
        content:
          "Ticket-linked QR check-in, live coach seat map, and TT-verified seat reassignment for Indian Railways passengers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PassengerHome,
});

function PassengerHome() {
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="sticky top-0 z-20 border-b border-rail-foreground/10 bg-rail text-rail-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brass text-brass-foreground">
              <TrainFront className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">SeatSetu</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-rail-foreground/55">
                Passenger
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-rail-foreground/70">
            <span className="hidden items-center gap-1.5 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-brass" /> Secure token active
            </span>
            <Bell className="h-4 w-4" />
          </div>
        </div>
        <div className="track-line h-[3px] w-full opacity-60" />
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="sr-only">Passenger seat check-in and occupancy</h1>
        <div className="space-y-6">
          <TicketCard checkedIn={checkedIn} />
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <CheckInPanel checkedIn={checkedIn} onCheckIn={() => setCheckedIn(true)} />
              <CoachMap />
              <VacantSeats />
            </div>
            <JourneyProgress />
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        QR check-in is a signal, not identity proof — final seat release stays with your TT.
      </footer>
    </div>
  );
}
