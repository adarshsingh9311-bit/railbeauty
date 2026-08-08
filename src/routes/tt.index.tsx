import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { store } from "@/lib/app-store";
import { ShieldCheck, TrainFront, Lock, ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/tt/")({
  head: () => ({
    meta: [
      { title: "TT Staff Sign-in — SeatSetu Dashboard" },
      {
        name: "description",
        content:
          "Restricted railway staff access. Sign in with your employee ID and OTP to open the coach-wise seat occupancy and exception dashboard.",
      },
      { property: "og:title", content: "TT Staff Sign-in — SeatSetu" },
      {
        property: "og:description",
        content: "Employee ID + OTP access to the railway seat occupancy dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TTSignIn,
});

function TTSignIn() {
  const navigate = useNavigate();
  const [emp, setEmp] = useState("44821");
  const [otp, setOtp] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-rail text-rail-foreground">
      <header className="mx-auto flex w-full max-w-md items-center gap-3 px-5 py-4">
        <Link to="/" aria-label="Back" className="grid h-8 w-8 place-items-center rounded-lg bg-rail-foreground/10">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brass text-brass-foreground">
          <TrainFront className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold">SeatSetu · Staff</p>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-12">
        <h1 className="text-2xl font-semibold">Travelling Ticket Examiner access</h1>
        <p className="mt-2 text-sm text-rail-foreground/70">
          Restricted area. Role-based access with audit logging — every verification and
          seat release is recorded against your employee ID.
        </p>

        <form
          className="mt-7 space-y-4 rounded-2xl bg-card p-5 text-card-foreground shadow-lift"
          onSubmit={(e) => {
            e.preventDefault();
            store.ttSignIn();
            navigate({ to: "/tt/dashboard" });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="emp">Employee ID</Label>
            <Input id="emp" value={emp} onChange={(e) => setEmp(e.target.value)} inputMode="numeric" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="otp">OTP sent to registered mobile</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP (demo: any value)"
              inputMode="numeric"
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            <Lock className="h-4 w-4" /> Sign in to dashboard
          </Button>
          <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Passengers cannot open this
            dashboard — TT actions are the only way a seat is released.
          </p>
        </form>
      </main>
    </div>
  );
}
