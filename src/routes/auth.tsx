import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAppState } from "@/lib/app-store";
import { TrainFront, ChevronLeft, ShieldCheck, Loader2 } from "lucide-react";

type Search = { redirect: string | undefined; role: "passenger" | "tt" | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect:
      typeof search["redirect"] === "string" && (search["redirect"] as string).startsWith("/")
        ? (search["redirect"] as string)
        : undefined,
    role: search["role"] === "tt" ? "tt" : search["role"] === "passenger" ? "passenger" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — SeatSetu Railway Seat App" },
      {
        name: "description",
        content:
          "Sign in or create your SeatSetu account to check in to your berth, book tickets, order food and raise complaints. Railway staff sign in for the TT dashboard.",
      },
      { property: "og:title", content: "Sign in — SeatSetu" },
      {
        property: "og:description",
        content: "Passenger and TT staff accounts for SeatSetu smart seat management.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user, role: sessionRole, authReady } = useAppState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [role, setRole] = useState<"passenger" | "tt">(search.role ?? "passenger");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [busy, setBusy] = useState(false);

  const dest = search.redirect ?? (sessionRole === "tt" ? "/tt/dashboard" : "/passenger");

  useEffect(() => {
    if (authReady && user) navigate({ to: dest, replace: true });
  }, [authReady, user, dest, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${search.redirect ?? "/passenger"}`,
            data: {
              full_name: name || email.split("@")[0],
              role,
              employee_id: role === "tt" ? employeeId : null,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created", { description: "You're signed in." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign you in");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    setBusy(false);
  };

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
        <p className="text-sm font-semibold">SeatSetu</p>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-10">
        <h1 className="text-2xl font-semibold">
          {mode === "in" ? "Sign in to your journey" : "Create your SeatSetu account"}
        </h1>
        <p className="mt-2 text-sm text-rail-foreground/70">
          Your check-ins, tickets, seat requests, food orders and complaints are saved to your
          account and synced across devices.
        </p>

        <form
          onSubmit={submit}
          className="mt-6 space-y-4 rounded-2xl bg-card p-5 text-card-foreground shadow-lift"
        >
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            {(["in", "up"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-lg py-2 text-xs font-semibold ${
                  mode === m ? "bg-card shadow-card" : "text-muted-foreground"
                }`}
              >
                {m === "in" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          {mode === "up" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="As on your ID" />
              </div>
              <div className="space-y-1.5">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "passenger", label: "Passenger" },
                      { id: "tt", label: "TT / Staff" },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                        role === r.id ? "border-primary bg-secondary" : "bg-background"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              {role === "tt" && (
                <div className="space-y-1.5">
                  <Label htmlFor="emp">Employee ID</Label>
                  <Input
                    id="emp"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. 44821"
                    inputMode="numeric"
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "in" ? "Sign in" : "Create account"}
          </Button>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" size="lg" className="w-full" onClick={google} disabled={busy}>
            Continue with Google
          </Button>

          <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Staff dashboards stay restricted —
            TT actions are logged against the employee ID on the account.
          </p>
        </form>
      </main>
    </div>
  );
}
