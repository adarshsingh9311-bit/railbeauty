import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/lib/app-store";
import { ShieldCheck, TrainFront, Lock, ChevronLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/tt/")({
  head: () => ({
    meta: [
      { title: "TT Staff Sign-in — SeatSetu Dashboard" },
      {
        name: "description",
        content:
          "Restricted railway staff access. Sign in with your staff account to open the coach-wise seat occupancy and exception dashboard.",
      },
      { property: "og:title", content: "TT Staff Sign-in — SeatSetu" },
      {
        property: "og:description",
        content: "Staff account access to the railway seat occupancy dashboard.",
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
  const { user, role, authReady, employeeId } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authReady && user && role === "tt") navigate({ to: "/tt/dashboard", replace: true });
  }, [authReady, user, role, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
  };

  const wrongRole = authReady && user && role !== "tt";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-rail text-rail-foreground">
      <Toaster position="top-center" />
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
          Restricted area. Role-based access with audit logging — every verification and seat
          release is recorded against your employee ID.
        </p>

        {wrongRole ? (
          <div className="mt-7 space-y-3 rounded-2xl bg-card p-5 text-card-foreground shadow-lift">
            <p className="text-sm font-semibold">This account is not a staff account</p>
            <p className="text-xs text-muted-foreground">
              You're signed in as a passenger{employeeId ? "" : ""}. Staff accounts are created
              with an employee ID.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate({ to: "/passenger" })}>Go to passenger app</Button>
              <Button variant="outline" onClick={() => void supabase.auth.signOut()}>
                Sign out
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="mt-7 space-y-4 rounded-2xl bg-card p-5 text-card-foreground shadow-lift"
            onSubmit={submit}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Staff email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tt@railways.gov.in"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Sign in to dashboard
            </Button>
            <Link
              to="/auth"
              search={{ role: "tt", redirect: "/tt/dashboard" }}
              className="block text-center text-xs font-medium text-primary underline"
            >
              Create a staff account with your employee ID
            </Link>
            <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Passengers cannot open this
              dashboard — TT actions are the only way a seat is released.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
