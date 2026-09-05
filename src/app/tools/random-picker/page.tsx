"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, inputClass, EmptyState, Badge, Tabs } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { useSound } from "@/lib/hooks";
import { Shuffle, Dices, CircleDot, Hash, ListFilter, Sparkles, RefreshCw } from "lucide-react";

const tool = findTool("random-picker")!;

type PickerMode = "list" | "number" | "coin" | "dice";

export default function Page() {
  const { push } = useToast();
  const { chime, click } = useSound();
  const [mode, setMode] = useState<PickerMode>("list");

  // List mode
  const [listText, setListText] = useState("Pizza\nSushi\nTacos\nBurgers\nThai Curry\nRamen");
  const [eliminate, setEliminate] = useState(false);
  const [listResult, setListResult] = useState<string | null>(null);

  // Number mode
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [numberResults, setNumberResults] = useState<number[]>([]);

  // Coin mode
  const [coinResult, setCoinResult] = useState<"HEADS" | "TAILS" | null>(null);
  const [coinTally, setCoinTally] = useState({ heads: 0, tails: 0 });
  const [coinFlipping, setCoinFlipping] = useState(false);

  // Dice mode
  const [diceType, setDiceType] = useState<number>(6); // d6
  const [diceCount, setDiceCount] = useState<number>(2);
  const [diceResults, setDiceResults] = useState<number[]>([]);

  const [spinKey, setSpinKey] = useState(0);

  const pickList = () => {
    click();
    const items = listText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) return;

    // Slot machine ticker effect
    const chosen = items[Math.floor(Math.random() * items.length)];
    setListResult(chosen);
    setSpinKey((k) => k + 1);
    chime();

    if (eliminate) {
      const remaining = items.filter((item) => item !== chosen);
      setListText(remaining.join("\n"));
      push(`Picked "${chosen}" and removed from list`, "success");
    }
  };

  const shuffleList = () => {
    const items = listText.split("\n").map((s) => s.trim()).filter(Boolean);
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    setListText(items.join("\n"));
    push("List shuffled", "info");
  };

  const pickNumbers = () => {
    click();
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const range = hi - lo + 1;
    const qty = Math.min(count, allowDuplicates ? 100 : range);

    const results: number[] = [];
    if (allowDuplicates) {
      for (let i = 0; i < qty; i++) {
        results.push(Math.floor(Math.random() * range) + lo);
      }
    } else {
      const pool = Array.from({ length: range }, (_, i) => lo + i);
      for (let i = 0; i < qty; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        results.push(pool.splice(idx, 1)[0]);
      }
    }
    setNumberResults(results);
    setSpinKey((k) => k + 1);
    chime();
  };

  const flipCoin = () => {
    click();
    setCoinFlipping(true);
    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? "HEADS" : "TAILS";
      setCoinResult(outcome);
      setCoinTally((prev) => ({
        heads: prev.heads + (outcome === "HEADS" ? 1 : 0),
        tails: prev.tails + (outcome === "TAILS" ? 1 : 0),
      }));
      setCoinFlipping(false);
      chime();
    }, 600);
  };

  const rollDice = () => {
    click();
    const rolls: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * diceType) + 1);
    }
    setDiceResults(rolls);
    setSpinKey((k) => k + 1);
    chime();
  };

  const diceSum = diceResults.reduce((a, b) => a + b, 0);

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Mode Switcher */}
        <div className="mb-6">
          <Tabs
            value={mode}
            onChange={setMode}
            options={[
              { value: "list", label: "Pick from List", icon: ListFilter },
              { value: "number", label: "Number Gen", icon: Hash },
              { value: "coin", label: "Flip a Coin", icon: CircleDot },
              { value: "dice", label: "Roll Dice", icon: Dices },
            ]}
          />
        </div>

        {/* 1. LIST MODE */}
        {mode === "list" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                Items (One per line)
              </span>
              <button
                type="button"
                onClick={shuffleList}
                className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-medium"
              >
                <Shuffle size={12} /> Shuffle Items
              </button>
            </div>

            <textarea
              value={listText}
              onChange={(e) => setListText(e.target.value)}
              rows={6}
              className={`${inputClass} font-mono text-xs resize-y mb-3`}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            />

            <label className="flex items-center gap-2 cursor-pointer select-none mb-6">
              <input
                type="checkbox"
                checked={eliminate}
                onChange={(e) => setEliminate(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
              />
              <span className="text-xs text-[var(--text)] font-medium">
                Remove picked item from list (Elimination mode)
              </span>
            </label>

            {/* Display Area */}
            <div className="flex flex-col items-center justify-center py-10 min-h-[160px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl mb-6">
              <AnimatePresence mode="wait">
                {listResult ? (
                  <motion.div
                    key={spinKey}
                    initial={{ opacity: 0, scale: 0.7, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="text-center px-4"
                  >
                    <span className="text-3xl sm:text-5xl font-extrabold text-[var(--accent-bright)] tracking-tight block">
                      {listResult}
                    </span>
                    <Badge variant="accent" className="mt-3">
                      Selected Winner
                    </Badge>
                  </motion.div>
                ) : (
                  <EmptyState icon={Shuffle} title="Nothing Picked Yet" hint="Tap the button below to randomly choose an item." />
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center">
              <Button onClick={pickList} className="!px-8 !py-3 text-base">
                <Shuffle size={18} /> Pick Winner
              </Button>
            </div>
          </div>
        )}

        {/* 2. NUMBER MODE */}
        {mode === "number" && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <Field label="Minimum">
                <input
                  type="number"
                  className={inputClass}
                  value={min}
                  onChange={(e) => setMin(Number(e.target.value))}
                />
              </Field>
              <Field label="Maximum">
                <input
                  type="number"
                  className={inputClass}
                  value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                />
              </Field>
              <Field label="Quantity">
                <input
                  type="number"
                  min={1}
                  max={20}
                  className={inputClass}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none mb-6">
              <input
                type="checkbox"
                checked={allowDuplicates}
                onChange={(e) => setAllowDuplicates(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
              />
              <span className="text-xs text-[var(--text)] font-medium">Allow Duplicate Numbers</span>
            </label>

            {/* Display Area */}
            <div className="flex flex-col items-center justify-center py-10 min-h-[160px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl mb-6 px-4">
              <AnimatePresence mode="wait">
                {numberResults.length > 0 ? (
                  <motion.div
                    key={spinKey}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-wrap justify-center gap-3"
                  >
                    {numberResults.map((n, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--accent)] shadow-lg flex items-center justify-center font-mono text-2xl sm:text-3xl font-bold text-[var(--accent-bright)]"
                      >
                        {n}
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState icon={Hash} title="No Numbers Generated" hint="Configure your range and hit Generate." />
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center">
              <Button onClick={pickNumbers} className="!px-8 !py-3 text-base">
                <Hash size={18} /> Generate Random Number
              </Button>
            </div>
          </div>
        )}

        {/* 3. COIN FLIP MODE */}
        {mode === "coin" && (
          <div className="flex flex-col items-center">
            {/* 3D Animated Coin */}
            <div className="py-8 flex justify-center">
              <motion.div
                animate={{
                  rotateY: coinFlipping ? 1800 : 0,
                  scale: coinFlipping ? [1, 1.25, 1] : 1,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-[var(--accent)] bg-[radial-gradient(circle,var(--bg-elevated)_0%,var(--bg-card)_100%)] shadow-2xl flex flex-col items-center justify-center text-center p-4 relative"
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-[var(--accent-dim)] flex flex-col items-center justify-center">
                  <span className="font-extrabold text-2xl sm:text-3xl tracking-widest text-[var(--accent-bright)] font-mono">
                    {coinFlipping ? "…" : coinResult || "FLIP"}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Scoreboard */}
            <div className="flex items-center gap-4 mb-8 bg-[var(--bg-elevated)] border border-[var(--border)] px-5 py-2.5 rounded-2xl text-xs font-mono">
              <div>
                Heads: <strong className="text-[var(--accent)]">{coinTally.heads}</strong>
              </div>
              <div className="w-px h-4 bg-[var(--border)]" />
              <div>
                Tails: <strong className="text-[var(--accent)]">{coinTally.tails}</strong>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={flipCoin} disabled={coinFlipping} className="!px-8 !py-3 text-base">
                <CircleDot size={18} /> Flip Coin
              </Button>
            </div>
          </div>
        )}

        {/* 4. DICE MODE */}
        {mode === "dice" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Dice Type selection */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] block mb-1.5">
                  Dice Sides
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[4, 6, 8, 10, 12, 20, 100].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiceType(d)}
                      className={`press px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                        diceType === d
                          ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent-bright)]"
                          : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"
                      }`}
                    >
                      d{d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dice Count */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] block mb-1.5">
                  Dice Count
                </span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 6].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDiceCount(c)}
                      className={`press px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        diceCount === c
                          ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent-bright)]"
                          : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"
                      }`}
                    >
                      {c}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Area */}
            <div className="flex flex-col items-center justify-center py-10 min-h-[160px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl mb-6 px-4">
              <AnimatePresence mode="wait">
                {diceResults.length > 0 ? (
                  <motion.div
                    key={spinKey}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex flex-wrap justify-center gap-3 mb-4">
                      {diceResults.map((r, i) => (
                        <div
                          key={i}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--accent)] shadow-xl flex items-center justify-center font-mono text-2xl sm:text-3xl font-bold text-[var(--text)]"
                        >
                          {r}
                        </div>
                      ))}
                    </div>
                    <Badge variant="accent" className="!px-3 !py-1 text-sm">
                      Total Sum: {diceSum}
                    </Badge>
                  </motion.div>
                ) : (
                  <EmptyState icon={Dices} title="No Dice Rolled" hint="Select sides and roll." />
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center">
              <Button onClick={rollDice} className="!px-8 !py-3 text-base">
                <Dices size={18} /> Roll {diceCount}d{diceType}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
