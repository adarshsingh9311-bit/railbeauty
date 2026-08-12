import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  bookQuotas,
  bookStations,
  berthPrefs,
  trainOptions,
  type BookClass,
  type TrainOption,
} from "@/lib/journey-data";
import { store, useAppState, type BookingPassenger } from "@/lib/app-store";
import {
  ArrowLeftRight,
  Calendar,
  Search,
  Train,
  Clock,
  Users,
  Plus,
  Trash2,
  Smartphone,
  CreditCard,
  Landmark,
  ShieldCheck,
  Ticket,
  X,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/passenger/book")({
  head: () => ({
    meta: [
      { title: "Book Train Tickets — SeatSetu Reservations" },
      {
        name: "description",
        content:
          "Search trains between stations, compare class-wise fares and availability, add passengers with berth preferences and pay by UPI or card to get an instant PNR.",
      },
      { property: "og:title", content: "Book Train Tickets — SeatSetu" },
      {
        property: "og:description",
        content:
          "IRCTC-style train search, live class availability, passenger details and instant PNR confirmation inside SeatSetu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

const methods = [
  { id: "upi", label: "UPI (GPay, PhonePe, Paytm)", icon: Smartphone },
  { id: "card", label: "Debit / Credit card", icon: CreditCard },
  { id: "wallet", label: "IRCTC eWallet", icon: Landmark },
];

const stateStyles: Record<BookClass["state"], string> = {
  available: "text-[--vacant]",
  raclist: "text-[--unverified]",
  waitlist: "text-[--disputed]",
};

const todayPlus = (d: number) => {
  const t = new Date();
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
};

const emptyPax = (): BookingPassenger => ({ name: "", age: 30, gender: "M", berth: berthPrefs[0]! });

function BookPage() {
  const { bookings } = useAppState();
  const [from, setFrom] = useState("NDLS");
  const [to, setTo] = useState("MMCT");
  const [date, setDate] = useState(todayPlus(2));
  const [quota, setQuota] = useState("GN");
  const [searched, setSearched] = useState(false);

  const [picked, setPicked] = useState<{ train: TrainOption; cls: BookClass } | null>(null);
  const [pax, setPax] = useState<BookingPassenger[]>([emptyPax()]);
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState("upi");

  const cityOf = (code: string) => bookStations.find((s) => s.code === code)?.city ?? code;

  const results = useMemo(
    () => (from === to ? [] : trainOptions),
    [from, to],
  );

  const fare = picked ? picked.cls.fare * pax.length : 0;
  const convenience = picked ? 25 * pax.length : 0;
  const total = fare + convenience;
  const paxValid = pax.every((p) => p.name.trim().length > 1 && p.age > 0 && p.age < 120);

  const confirm = async () => {
    if (!picked) return;
    const startSeat = 8 + Math.floor(Math.random() * 40);
    const status =
      picked.cls.state === "available" ? "Confirmed" : picked.cls.state === "raclist" ? "RAC" : "Waitlist";
    const booking = await store.bookTicket({
      trainNo: picked.train.no,
      trainName: picked.train.name,
      from,
      to,
      date,
      klass: picked.cls.code,
      quota,
      passengers: pax.map((p, i) => ({
        ...p,
        seat: startSeat + i * 3,
        berth: p.berth === berthPrefs[0] ? ["LB", "MB", "UB", "SL"][i % 4]! : p.berth,
      })),
      total,
      status,
    });
    setPayOpen(false);
    if (!booking) {
      toast.error("Booking failed — please try again.");
      return;
    }
    setPicked(null);
    setPax([emptyPax()]);
    toast.success(`Ticket ${status.toLowerCase()} · PNR ${booking.pnr}`, {
      description: `${booking.trainNo} ${booking.trainName} · ${booking.coach} · ${booking.date}`,
    });
  };


  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold tracking-tight">Book a ticket</h1>

      {/* Search */}
      <section className="rounded-2xl border bg-card p-4 shadow-card">
        <div className="flex items-end gap-2">
          <label className="flex-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            From
            <select
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setSearched(false);
              }}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm font-semibold tracking-normal text-foreground"
            >
              {bookStations.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.city} ({s.code})
                </option>
              ))}
            </select>
          </label>
          <button
            aria-label="Swap stations"
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            className="mb-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-background text-muted-foreground"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <label className="flex-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            To
            <select
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setSearched(false);
              }}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm font-semibold tracking-normal text-foreground"
            >
              {bookStations.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.city} ({s.code})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex gap-2">
          <label className="flex-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Journey date
            </span>
            <Input
              type="date"
              value={date}
              min={todayPlus(0)}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 rounded-xl text-sm font-semibold tracking-normal text-foreground"
            />
          </label>
          <label className="flex-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Quota
            <select
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border bg-background px-3 text-sm font-semibold tracking-normal text-foreground"
            >
              {bookQuotas.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Button className="mt-4 w-full" size="lg" onClick={() => setSearched(true)}>
          <Search className="mr-2 h-4 w-4" /> Search trains
        </Button>
        {from === to && (
          <p className="mt-2 text-center text-[11px] text-destructive">
            Origin and destination cannot be the same.
          </p>
        )}
      </section>

      {/* Results */}
      {searched && results.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">
            {cityOf(from)} → {cityOf(to)}{" "}
            <span className="font-normal text-muted-foreground">· {results.length} trains</span>
          </h2>
          {results.map((t) => (
            <article key={t.no} className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent-foreground">
                  <Train className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {t.no} · {t.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{t.days}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm">
                <div>
                  <p className="font-mono font-semibold">{t.dep}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{from}</p>
                </div>
                <div className="flex-1">
                  <div className="track-line h-[3px] w-full rounded-full opacity-70" />
                  <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {t.duration}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold">{t.arr}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{to}</p>
                </div>
              </div>

              <ul className="mt-3 grid grid-cols-2 gap-2">
                {t.classes.map((c) => (
                  <li key={c.code}>
                    <button
                      onClick={() => {
                        setPicked({ train: t, cls: c });
                        setPax([emptyPax()]);
                      }}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left active:scale-[0.99] ${
                        picked?.train.no === t.no && picked.cls.code === c.code
                          ? "border-primary bg-primary/5"
                          : "bg-background/60"
                      }`}
                    >
                      <p className="text-xs font-semibold">
                        {c.code} <span className="font-normal text-muted-foreground">{c.label}</span>
                      </p>
                      <p className="mt-0.5 font-mono text-sm font-semibold">₹{c.fare}</p>
                      <p className={`text-[11px] font-medium ${stateStyles[c.state]}`}>{c.avail}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <a
            href="https://www.irctc.co.in/nget/train-search"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm font-medium shadow-card"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            Continue on IRCTC instead
          </a>
        </section>
      )}

      {/* Passengers */}
      {picked && (
        <section className="rounded-2xl border bg-card p-4 shadow-card">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4" /> Passenger details
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {picked.train.no} · {picked.cls.code} · {picked.cls.avail} · ₹{picked.cls.fare} per passenger
          </p>

          <ul className="mt-3 space-y-3">
            {pax.map((p, i) => (
              <li key={i} className="rounded-xl border bg-background/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Passenger {i + 1}
                  </p>
                  {pax.length > 1 && (
                    <button
                      aria-label={`Remove passenger ${i + 1}`}
                      onClick={() => setPax(pax.filter((_, j) => j !== i))}
                      className="text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Input
                  placeholder="Full name (as on ID)"
                  value={p.name}
                  onChange={(e) =>
                    setPax(pax.map((q, j) => (j === i ? { ...q, name: e.target.value } : q)))
                  }
                  className="mt-2 rounded-xl"
                />
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Age"
                    value={p.age}
                    onChange={(e) =>
                      setPax(pax.map((q, j) => (j === i ? { ...q, age: Number(e.target.value) } : q)))
                    }
                    className="rounded-xl"
                  />
                  <select
                    value={p.gender}
                    onChange={(e) =>
                      setPax(
                        pax.map((q, j) =>
                          j === i ? { ...q, gender: e.target.value as BookingPassenger["gender"] } : q,
                        ),
                      )
                    }
                    className="h-9 rounded-xl border bg-background px-2 text-sm"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                  <select
                    value={p.berth}
                    onChange={(e) =>
                      setPax(pax.map((q, j) => (j === i ? { ...q, berth: e.target.value } : q)))
                    }
                    className="h-9 rounded-xl border bg-background px-2 text-sm"
                  >
                    {berthPrefs.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>

          {pax.length < 6 && (
            <button
              onClick={() => setPax([...pax, emptyPax()])}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-sm font-medium text-muted-foreground"
            >
              <Plus className="h-4 w-4" /> Add passenger
            </button>
          )}

          <dl className="mt-4 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Base fare × {pax.length}</dt>
              <dd className="font-mono">₹{fare}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Convenience fee</dt>
              <dd className="font-mono">₹{convenience}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total payable</dt>
              <dd className="font-mono">₹{total}</dd>
            </div>
          </dl>

          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={!paxValid}
            onClick={() => setPayOpen(true)}
          >
            {paxValid ? `Continue to payment · ₹${total}` : "Enter passenger names to continue"}
          </Button>
          <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> Carry an original photo ID during the journey.
          </p>
        </section>
      )}

      {/* My bookings */}
      <section className="rounded-2xl border bg-card p-4 shadow-card">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Ticket className="h-4 w-4" /> My bookings
        </h2>
        {bookings.length === 0 ? (
          <p className="mt-2 text-[13px] text-muted-foreground">
            No bookings from this device yet. Search a train above to reserve a berth.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {bookings.map((b) => (
              <li key={b.pnr} className="rounded-xl border bg-background/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {b.trainNo} · {b.trainName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {b.from} → {b.to} · {b.date} · {b.klass} · {b.quota}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                      b.status === "Confirmed"
                        ? "bg-brass text-brass-foreground"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs">
                  PNR {b.pnr} · Coach {b.coach}
                </p>
                <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
                  {b.passengers.map((p, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate">
                        {p.name} · {p.age}
                        {p.gender}
                      </span>
                      <span className="font-mono">
                        {b.coach}/{p.seat} {p.berth}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-xs">₹{b.total} paid</span>
                  <Link to="/passenger" className="text-xs font-semibold text-primary">
                    Check in for this trip
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Payment sheet */}
      {payOpen && picked && (
        <div className="fixed inset-0 z-40 flex items-end bg-foreground/40 backdrop-blur-sm">
          <div className="w-full rounded-t-3xl border-t bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold">Pay ₹{total}</h2>
                <p className="text-[11px] text-muted-foreground">
                  {picked.train.no} · {picked.cls.code} · {pax.length} passenger
                  {pax.length > 1 ? "s" : ""} · {date}
                </p>
              </div>
              <button aria-label="Close payment" onClick={() => setPayOpen(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {methods.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => setMethod(m.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium ${
                      method === m.id ? "border-primary bg-primary/5" : "bg-background/60"
                    }`}
                  >
                    <m.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">{m.label}</span>
                    <span
                      className={`h-4 w-4 rounded-full border-2 ${
                        method === m.id ? "border-primary bg-primary" : "border-border"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>

            <Button className="mt-4 w-full" size="lg" onClick={confirm}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Pay ₹{total} &amp; confirm berth
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Demo payment — no money is charged. PNR is generated instantly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
