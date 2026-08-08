import { createFileRoute } from "@tanstack/react-router";
import { CoachMap } from "@/components/passenger/CoachMap";

export const Route = createFileRoute("/passenger/coach")({
  head: () => ({
    meta: [
      { title: "Live Coach Occupancy — SeatSetu" },
      {
        name: "description",
        content:
          "See every berth in your coach with its verification status: occupied, awaiting check-in, potentially vacant, TT-verified vacant, reassigned or disputed.",
      },
      { property: "og:title", content: "Live Coach Occupancy — SeatSetu" },
      {
        property: "og:description",
        content: "Berth-by-berth verification status for your railway coach, updated live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Coach occupancy</h1>
      <CoachMap />
    </div>
  ),
});
