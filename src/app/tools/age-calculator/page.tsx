"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";

const tool = findTool("age-calculator")!;

export default function Page() {
  const [start, setStart] = useState("2000-01-01");
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));

  const result = useMemo(() => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const early = d1 < d2 ? d1 : d2;
    const late = d1 < d2 ? d2 : d1;

    let years = late.getFullYear() - early.getFullYear();
    let months = late.getMonth() - early.getMonth();
    let days = late.getDate() - early.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(late.getFullYear(), late.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDays = Math.round((late.getTime() - early.getTime()) / 86400000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;

    return { years, months, days, totalDays, totalWeeks, totalHours };
  }, [start, end]);

  const stat = (label: string, value: string | number) => (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3">
      <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{value}</div>
      <div className="text-xs text-[var(--text-dim)] mt-0.5">{label}</div>
    </div>
  );

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Start date">
            <input type="date" className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label="End date">
            <input type="date" className={inputClass} value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>

        {result && (
          <>
            <div className="mt-6 text-center">
              <span className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {result.years}y {result.months}m {result.days}d
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {stat("Total days", result.totalDays.toLocaleString())}
              {stat("Total weeks", result.totalWeeks.toLocaleString())}
              {stat("Total hours", result.totalHours.toLocaleString())}
            </div>
          </>
        )}
      </Card>
    </ToolShell>
  );
}
