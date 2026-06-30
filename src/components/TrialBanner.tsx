import Link from "next/link";

/** Tunn rad högst upp i panelen under provperioden. */
export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-sm text-center"
      style={{ background: "#13294B", color: "#fff" }}>
      <span>
        {daysLeft > 0
          ? <>Du testar Enkelfaktura gratis – <strong>{daysLeft} {daysLeft === 1 ? "dag" : "dagar"} kvar</strong> av provperioden.</>
          : <>Din provperiod går ut idag.</>}
      </span>
      <Link href="/uppgradera" className="font-semibold underline underline-offset-2" style={{ color: "#5eead4" }}>
        Uppgradera nu
      </Link>
    </div>
  );
}
