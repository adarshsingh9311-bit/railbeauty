import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { complaintCategories, ticket } from "@/lib/journey-data";
import { store, useAppState } from "@/lib/app-store";
import {
  Armchair,
  Sparkles,
  Fan,
  Utensils,
  ShieldAlert,
  User,
  Siren,
  Phone,
  Languages,
  Volume2,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/passenger/help")({
  head: () => ({
    meta: [
      { title: "Complaints & Help — SeatSetu Passenger Support" },
      {
        name: "description",
        content:
          "Raise a coach complaint in a few taps, track its status, call railway helplines, use SOS, or request TT-assisted check-in without a smartphone.",
      },
      { property: "og:title", content: "Complaints & Help — SeatSetu" },
      {
        property: "og:description",
        content: "Complaint tracking, railway helplines, SOS and TT-assisted support on board.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

const icons: Record<string, typeof Armchair> = {
  armchair: Armchair,
  sparkles: Sparkles,
  fan: Fan,
  utensils: Utensils,
  shield: ShieldAlert,
  user: User,
};

function HelpPage() {
  const { complaints } = useAppState();
  const [cat, setCat] = useState<string | null>(null);
  const [detail, setDetail] = useState("");

  const submit = () => {
    const label = complaintCategories.find((c) => c.id === cat)?.label ?? "General";
    store.addComplaint(label, detail || "No additional details provided.");
    setCat(null);
    setDetail("");
    toast.success("Complaint registered", {
      description: `${label} · Coach ${ticket.coach} — forwarded to the on-duty TT.`,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Complaints & help</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a category — your coach, seat and PNR are attached automatically.
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold">What's the issue?</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {complaintCategories.map((c) => {
            const Icon = icons[c.icon] ?? Armchair;
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left text-xs font-medium transition-colors ${
                  active ? "border-primary bg-secondary" : "bg-background/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-accent"}`} />
                {c.label}
              </button>
            );
          })}
        </div>

        {cat && (
          <div className="mt-4 space-y-3">
            <Textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Add details (optional). E.g. AC not cooling in bay 4 since Kota."
              rows={3}
            />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={submit}>
                Submit complaint
              </Button>
              <Button variant="outline" onClick={() => setCat(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold">Your complaints</h2>
        <ul className="mt-3 divide-y">
          {complaints.map((c) => (
            <li key={c.id} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{c.category}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.detail}</p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {c.id} · {c.at}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  c.status === "Resolved"
                    ? "bg-occupied/15 text-occupied"
                    : "bg-vacant/15 text-vacant"
                }`}
              >
                {c.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold">Support & accessibility</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button
            variant="destructive"
            className="justify-start"
            onClick={() => toast.error("SOS sent to RPF & on-duty TT", { description: "Stay where you are — help is on the way." })}
          >
            <Siren className="h-4 w-4" /> Emergency SOS
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => toast("Calling Rail Madad 139")}>
            <Phone className="h-4 w-4" /> Call Rail Madad 139
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => toast("TT-assisted check-in requested")}>
            <UserCheck className="h-4 w-4" /> Ask TT for help
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => toast("Voice guidance enabled")}>
            <Volume2 className="h-4 w-4" /> Voice guidance
          </Button>
        </div>
        <p className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Languages className="h-3.5 w-3.5 text-accent" /> Available in हिन्दी, English and 8
          regional languages. Works offline and syncs when the network returns.
        </p>
      </section>
    </div>
  );
}
