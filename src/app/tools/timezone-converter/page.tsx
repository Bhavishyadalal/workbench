"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { X } from "lucide-react";

const tool = findTool("timezone-converter")!;

const zones = [
  "UTC", "America/New_York", "America/Los_Angeles", "America/Chicago", "America/Sao_Paulo",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Asia/Kolkata", "Asia/Dubai", "Asia/Shanghai", "Asia/Tokyo", "Asia/Singapore", "Asia/Karachi",
  "Australia/Sydney", "Pacific/Auckland",
];

function nowInZone(dateStr: string, timeStr: string, sourceZone: string, targetZone: string) {
  try {
    const localDate = new Date(`${dateStr}T${timeStr}:00`);
    // Interpret localDate as if it were wall-clock time in sourceZone, convert to targetZone
    const sourceOffset = getOffsetMinutes(localDate, sourceZone);
    const utcMs = localDate.getTime() - sourceOffset * 60000;
    const utcDate = new Date(utcMs);
    return utcDate.toLocaleString("en-US", {
      timeZone: targetZone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Invalid";
  }
}

function getOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = dtf.formatToParts(date).reduce((acc: Record<string, string>, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUTC = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
  return (asUTC - date.getTime()) / 60000;
}

export default function Page() {
  const now = new Date();
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [time, setTime] = useState(now.toTimeString().slice(0, 5));
  const [source, setSource] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [targets, setTargets] = useState<string[]>(["America/New_York", "Europe/London", "Asia/Tokyo"]);

  const results = useMemo(
    () => targets.map((tz) => ({ tz, display: nowInZone(date, time, source, tz) })),
    [targets, date, time, source]
  );

  const addTarget = (tz: string) => {
    if (!targets.includes(tz)) setTargets((t) => [...t, tz]);
  };

  const removeTarget = (tz: string) => setTargets((t) => t.filter((z) => z !== tz));

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Date">
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Time">
            <input type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Source timezone">
            <select className={inputClass} value={source} onChange={(e) => setSource(e.target.value)}>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-[var(--text-dim)] mb-2.5">Compare against</p>
          <div className="flex flex-col gap-2">
            {results.map(({ tz, display }) => (
              <div
                key={tz}
                className="flex items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3"
              >
                <span className="text-sm text-[var(--text-dim)]">{tz.replace("_", " ")}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{display}</span>
                  <button onClick={() => removeTarget(tz)} aria-label={`Remove ${tz}`} className="text-[var(--text-dim)] hover:text-[var(--danger)]">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <select
              className={inputClass}
              value=""
              onChange={(e) => e.target.value && addTarget(e.target.value)}
            >
              <option value="">+ Add a city/timezone…</option>
              {zones.filter((z) => !targets.includes(z)).map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>
    </ToolShell>
  );
}
