import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScanLine, Loader2, CheckCircle2, WifiOff, Languages, UserCheck } from "lucide-react";
import { ticket } from "@/lib/journey-data";

export function CheckInPanel({
  checkedIn,
  onCheckIn,
}: {
  checkedIn: boolean;
  onCheckIn: () => void;
}) {
  const [scanning, setScanning] = useState(false);

  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onCheckIn();
      toast.success("Check-in recorded", {
        description: `Coach ${ticket.coach} · Seat ${ticket.seat} · 01:26 at Ratlam Jn`,
      });
    }, 1400);
  };

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Boarding check-in</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Scan the ticket-linked dynamic QR at the coach entrance. This is a check-in
            signal — your TT stays in charge of final verification.
          </p>
        </div>
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
            checkedIn ? "bg-occupied/15 text-occupied" : "bg-accent/20 text-accent-foreground animate-pulse-ring"
          }`}
        >
          {checkedIn ? <CheckCircle2 className="h-6 w-6" /> : <ScanLine className="h-6 w-6" />}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button size="lg" onClick={scan} disabled={scanning || checkedIn}>
          {scanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying token…
            </>
          ) : checkedIn ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Checked in at 01:26
            </>
          ) : (
            <>
              <ScanLine className="h-4 w-4" /> Scan coach QR
            </>
          )}
        </Button>
        <Button variant="outline" size="lg" onClick={() => toast("TT-assisted check-in requested")}>
          <UserCheck className="h-4 w-4" /> Ask TT to check me in
        </Button>
      </div>

      <ul className="mt-5 grid gap-2 border-t pt-4 text-xs text-muted-foreground sm:grid-cols-3">
        <li className="flex items-center gap-2">
          <WifiOff className="h-3.5 w-3.5 text-accent" /> Works offline, syncs later
        </li>
        <li className="flex items-center gap-2">
          <Languages className="h-3.5 w-3.5 text-accent" /> हिन्दी · English · 8 more
        </li>
        <li className="flex items-center gap-2">
          <UserCheck className="h-3.5 w-3.5 text-accent" /> No smartphone? TT can help
        </li>
      </ul>
    </section>
  );
}
