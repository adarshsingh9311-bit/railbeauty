import { createFileRoute } from "@tanstack/react-router";
import { TicketCard } from "@/components/passenger/TicketCard";
import { CheckInPanel } from "@/components/passenger/CheckInPanel";
import { JourneyProgress } from "@/components/passenger/JourneyProgress";
import { store, useAppState } from "@/lib/app-store";
import { Link } from "@tanstack/react-router";
import { ArmchairIcon, MessageSquareWarning, IndianRupee, ArrowRight, UtensilsCrossed, TicketIcon } from "lucide-react";

export const Route = createFileRoute("/passenger/")({
  head: () => ({
    meta: [
      { title: "My Trip — SeatSetu Passenger Check-in" },
      {
        name: "description",
        content:
          "Your ticket, boarding check-in and live journey progress in one place. Check in with a ticket-linked QR or ask the TT for help.",
      },
      { property: "og:title", content: "My Trip — SeatSetu Passenger" },
      {
        property: "og:description",
        content: "Ticket-linked QR check-in and live journey progress for your reserved seat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyTrip,
});

const shortcuts = [
  { to: "/passenger/book", label: "Book a new ticket", icon: TicketIcon },
  { to: "/passenger/seats", label: "Request a free seat", icon: ArmchairIcon },
  { to: "/passenger/food", label: "Order food to your seat", icon: UtensilsCrossed },
  { to: "/passenger/seats", label: "Pay for an upgrade", icon: IndianRupee },
  { to: "/passenger/help", label: "Raise a complaint", icon: MessageSquareWarning },
];


function MyTrip() {
  const { checkedIn } = useAppState();

  return (
    <div className="space-y-5">
      <h1 className="sr-only">My trip</h1>
      <TicketCard checkedIn={checkedIn} />
      <CheckInPanel checkedIn={checkedIn} onCheckIn={store.checkIn} />

      <section className="rounded-2xl border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold">Quick actions</h2>
        <ul className="mt-3 space-y-2">
          {shortcuts.map((s) => (
            <li key={s.label}>
              <Link
                to={s.to}
                className="flex items-center gap-3 rounded-xl border bg-background/60 px-3 py-3 text-sm font-medium active:scale-[0.99]"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent-foreground">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="flex-1">{s.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <JourneyProgress />
    </div>
  );
}
