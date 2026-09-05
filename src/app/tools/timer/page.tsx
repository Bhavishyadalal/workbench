"use client";

import { useState, useEffect, useRef } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Badge, Tabs } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { useSound } from "@/lib/hooks";
import { Play, Pause, RotateCcw, Flag, Clock, Timer as TimerIcon, Brain, Maximize2, Minimize2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tool = findTool("timer")!;

type TimerMode = "stopwatch" | "countdown" | "pomodoro";

interface Lap {
  id: number;
  time: number;
  split: number;
}

export default function Page() {
  const { push } = useToast();
  const { chime } = useSound();
  const [mode, setMode] = useState<TimerMode>("stopwatch");

  // Stopwatch state
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);

  // Countdown state
  const [duration, setDuration] = useState(300); // seconds
  const [cdRemaining, setCdRemaining] = useState(300);
  const [cdRunning, setCdRunning] = useState(false);

  // Pomodoro state
  const [pomoType, setPomoType] = useState<"focus" | "short" | "long">("focus");
  const [pomoRemaining, setPomoRemaining] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // References for precision timing
  const startRef = useRef<number | null>(null);
  const baseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(running);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Stopwatch RAF Loop
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const tickStopwatch = () => {
    if (startRef.current === null) return;
    const now = performance.now();
    setElapsed(baseRef.current + (now - startRef.current));
    if (runningRef.current) {
      rafRef.current = requestAnimationFrame(tickStopwatch);
    }
  };

  useEffect(() => {
    if (running) {
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tickStopwatch);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      baseRef.current = elapsed;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Countdown timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cdRunning && cdRemaining > 0) {
      interval = setInterval(() => {
        setCdRemaining((prev) => {
          if (prev <= 1) {
            setCdRunning(false);
            chime();
            push("Time's up! Countdown finished.", "success");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cdRunning, cdRemaining, chime, push]);

  // Pomodoro interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pomoRunning && pomoRemaining > 0) {
      interval = setInterval(() => {
        setPomoRemaining((prev) => {
          if (prev <= 1) {
            setPomoRunning(false);
            chime();
            if (pomoType === "focus") {
              setCompletedSessions((c) => c + 1);
              push("Pomodoro focus session complete! Take a break.", "success");
              setPomoType("short");
              return 5 * 60;
            } else {
              push("Break over! Ready to focus?", "info");
              setPomoType("focus");
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomoRunning, pomoRemaining, pomoType, chime, push]);

  // Laps handling
  const addLap = () => {
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const split = elapsed - lastLapTime;
    const newLap: Lap = {
      id: laps.length + 1,
      time: elapsed,
      split,
    };
    setLaps((prev) => [newLap, ...prev]);
  };

  const resetStopwatch = () => {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
    setLaps([]);
  };

  const copyLaps = async () => {
    if (laps.length === 0) return;
    const text = laps
      .map((l) => `Lap ${l.id}: ${formatStopwatch(l.time)} (Split: ${formatStopwatch(l.split)})`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    push("Laps copied to clipboard", "success");
  };

  // Format stopwatch ms to HH:MM:SS.CC
  const formatStopwatch = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const cs = Math.floor((ms % 1000) / 10);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };

  // Format seconds to MM:SS
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const setPresetCountdown = (sec: number) => {
    setDuration(sec);
    setCdRemaining(sec);
    setCdRunning(false);
  };

  const switchPomoType = (t: "focus" | "short" | "long") => {
    setPomoType(t);
    setPomoRunning(false);
    if (t === "focus") setPomoRemaining(25 * 60);
    if (t === "short") setPomoRemaining(5 * 60);
    if (t === "long") setPomoRemaining(15 * 60);
  };

  // Find fastest & slowest laps
  const fastestSplit = laps.length > 1 ? Math.min(...laps.map((l) => l.split)) : null;
  const slowestSplit = laps.length > 1 ? Math.max(...laps.map((l) => l.split)) : null;

  return (
    <ToolShell tool={tool}>
      <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none overflow-y-auto flex flex-col justify-center" : ""}>
        {/* Mode Switcher */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex-1">
            <Tabs
              value={mode}
              onChange={(m) => {
                setMode(m);
                setRunning(false);
                setCdRunning(false);
                setPomoRunning(false);
              }}
              options={[
                { value: "stopwatch", label: "Stopwatch", icon: TimerIcon },
                { value: "countdown", label: "Countdown", icon: Clock },
                { value: "pomodoro", label: "Pomodoro", icon: Brain },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            className="press p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* 1. STOPWATCH VIEW */}
        {mode === "stopwatch" && (
          <div className="flex flex-col items-center">
            <div className="py-12 sm:py-16 text-center">
              <span
                className="font-mono text-5xl sm:text-7xl font-bold tracking-tight text-[var(--text)]"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatStopwatch(elapsed)}
              </span>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3">
              <Button
                variant={running ? "secondary" : "primary"}
                onClick={() => setRunning((r) => !r)}
                className="!px-8 !py-3 text-base"
              >
                {running ? <Pause size={18} /> : <Play size={18} />}
                {running ? "Pause" : "Start"}
              </Button>

              <Button
                variant="secondary"
                onClick={addLap}
                disabled={!running && elapsed === 0}
                className="!px-6"
              >
                <Flag size={16} /> Lap
              </Button>

              <Button variant="ghost" onClick={resetStopwatch} disabled={elapsed === 0}>
                <RotateCcw size={16} /> Reset
              </Button>
            </div>

            {/* Laps List */}
            {laps.length > 0 && (
              <div className="w-full max-w-md mt-8 pt-6 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs text-[var(--text-dim)] font-semibold uppercase tracking-wider mb-2.5">
                  <span>Laps ({laps.length})</span>
                  <button onClick={copyLaps} className="hover:text-[var(--accent)] flex items-center gap-1 transition-colors">
                    <Copy size={13} /> Copy Laps
                  </button>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {laps.map((lap) => {
                    const isFastest = laps.length > 1 && lap.split === fastestSplit;
                    const isSlowest = laps.length > 1 && lap.split === slowestSplit;
                    return (
                      <div
                        key={lap.id}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
                          isFastest
                            ? "border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color-mix(in_srgb,var(--success)_8%,var(--bg-elevated))]"
                            : isSlowest
                            ? "border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,var(--bg-elevated))]"
                            : "border-[var(--border)] bg-[var(--bg-elevated)]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-dim)]">#{lap.id}</span>
                          {isFastest && <span className="text-[10px] text-[var(--success)] font-sans font-bold">Fastest</span>}
                          {isSlowest && <span className="text-[10px] text-[var(--danger)] font-sans font-bold">Slowest</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[var(--text-dim)]">+{formatStopwatch(lap.split)}</span>
                          <span className="font-bold text-[var(--text)]">{formatStopwatch(lap.time)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. COUNTDOWN VIEW */}
        {mode === "countdown" && (
          <div className="flex flex-col items-center">
            {/* Circular Progress Ring */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-6 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-[var(--bg-elevated)]"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-[var(--accent)] transition-all duration-300"
                  strokeWidth="6"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 * (1 - cdRemaining / (duration || 1))}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-[var(--text)]">
                  {formatSeconds(cdRemaining)}
                </span>
                {cdRemaining === 0 && (
                  <Badge variant="accent" className="mt-2">
                    Time is up!
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-sm">
              {[
                { label: "1m", sec: 60 },
                { label: "5m", sec: 300 },
                { label: "10m", sec: 600 },
                { label: "15m", sec: 900 },
                { label: "25m", sec: 1500 },
                { label: "30m", sec: 1800 },
                { label: "60m", sec: 3600 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPresetCountdown(p.sec)}
                  className={`press px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    duration === p.sec
                      ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-bright)]"
                      : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:text-[var(--text)]"
                  }`}
                >
                  +{p.label}
                </button>
              ))}
            </div>

            <div className="flex justify-center items-center gap-3">
              <Button
                variant={cdRunning ? "secondary" : "primary"}
                onClick={() => setCdRunning((r) => !r)}
                disabled={cdRemaining === 0}
                className="!px-8 !py-3 text-base"
              >
                {cdRunning ? <Pause size={18} /> : <Play size={18} />}
                {cdRunning ? "Pause" : "Start"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setCdRunning(false);
                  setCdRemaining(duration);
                }}
              >
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          </div>
        )}

        {/* 3. POMODORO VIEW */}
        {mode === "pomodoro" && (
          <div className="flex flex-col items-center">
            {/* Pomodoro phase tabs */}
            <div className="flex gap-2 mb-6">
              {[
                { id: "focus", label: "Focus (25m)" },
                { id: "short", label: "Short Break (5m)" },
                { id: "long", label: "Long Break (15m)" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchPomoType(t.id as any)}
                  className={`press px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                    pomoType === t.id
                      ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-bright)] shadow-[var(--shadow-sm)]"
                      : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:text-[var(--text)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="py-10 text-center">
              <span className="font-mono text-6xl sm:text-8xl font-bold tracking-tight text-[var(--text)]">
                {formatSeconds(pomoRemaining)}
              </span>
              <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-3">
                {pomoType === "focus" ? "Stay focused on your task" : "Relax and recharge"}
              </p>
            </div>

            {/* Completed sessions indicator */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-[var(--text-dim)] font-medium">Completed:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={`w-3 h-3 rounded-full transition-all ${
                      n <= completedSessions % 4
                        ? "bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                        : "bg-[var(--bg-elevated)] border border-[var(--border)]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-mono text-[var(--text-dim)]">({completedSessions})</span>
            </div>

            <div className="flex justify-center items-center gap-3">
              <Button
                variant={pomoRunning ? "secondary" : "primary"}
                onClick={() => setPomoRunning((r) => !r)}
                className="!px-8 !py-3 text-base"
              >
                {pomoRunning ? <Pause size={18} /> : <Play size={18} />}
                {pomoRunning ? "Pause" : "Start"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => switchPomoType(pomoType)}
              >
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
