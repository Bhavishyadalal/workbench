"use client";

import { useState, useEffect, useRef } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Play, Pause, RotateCcw } from "lucide-react";

const tool = findTool("timer")!;

function format(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export default function Page() {
  const [mode, setMode] = useState<"stopwatch" | "countdown">("stopwatch");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(300); // seconds, for countdown
  const startRef = useRef<number | null>(null);
  const baseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [done, setDone] = useState(false);
  const runningRef = useRef(running);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    tickRef.current = () => {
      if (startRef.current === null) return;
      const now = performance.now();
      setElapsed(baseRef.current + (now - startRef.current));
      if (runningRef.current) {
        rafRef.current = requestAnimationFrame(() => tickRef.current());
      }
    };
  });

  useEffect(() => {
    if (running) {
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(() => tickRef.current());
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      baseRef.current = elapsed;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (mode === "countdown" && elapsed >= duration * 1000) {
      setRunning((r) => (r ? false : r));
      setDone((d) => (d ? d : true));
    }
  }, [elapsed, duration, mode]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setDone(false);
  };

  const switchMode = (m: "stopwatch" | "countdown") => {
    setMode(m);
    reset();
  };

  const display = mode === "countdown" ? Math.max(0, duration * 1000 - elapsed) : elapsed;

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => switchMode("stopwatch")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${mode === "stopwatch" ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)]"}`}
          >
            Stopwatch
          </button>
          <button
            onClick={() => switchMode("countdown")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${mode === "countdown" ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)]"}`}
          >
            Countdown
          </button>
        </div>

        {mode === "countdown" && !running && elapsed === 0 && (
          <div className="mb-6">
            <Field label="Duration (minutes)">
              <input
                type="number"
                className={inputClass}
                value={duration / 60}
                onChange={(e) => setDuration(Math.max(1, Number(e.target.value)) * 60)}
              />
            </Field>
          </div>
        )}

        <div className="text-center py-8">
          <span
            className={`text-6xl font-semibold tabular-nums ${done ? "text-[var(--accent)]" : ""}`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {format(display)}
          </span>
          {done && <p className="text-sm text-[var(--accent)] mt-3">Time&apos;s up!</p>}
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={() => setRunning((r) => !r)} disabled={mode === "countdown" && done}>
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button variant="secondary" onClick={reset}>
            <RotateCcw size={16} /> Reset
          </Button>
        </div>
      </Card>
    </ToolShell>
  );
}
