"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Shuffle } from "lucide-react";

const tool = findTool("random-picker")!;

export default function Page() {
  const [mode, setMode] = useState<"list" | "number">("list");
  const [listText, setListText] = useState("Pizza\nSushi\nTacos\nBurgers\nSalad");
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [result, setResult] = useState<string | null>(null);
  const [spinKey, setSpinKey] = useState(0);

  const pick = () => {
    if (mode === "list") {
      const items = listText.split("\n").map((s) => s.trim()).filter(Boolean);
      if (items.length === 0) return;
      setResult(items[Math.floor(Math.random() * items.length)]);
    } else {
      const lo = Math.min(min, max);
      const hi = Math.max(min, max);
      setResult(String(Math.floor(Math.random() * (hi - lo + 1)) + lo));
    }
    setSpinKey((k) => k + 1);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("list")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${mode === "list" ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)]"}`}
          >
            Pick from list
          </button>
          <button
            onClick={() => setMode("number")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${mode === "number" ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)]"}`}
          >
            Random number
          </button>
        </div>

        {mode === "list" ? (
          <Field label="One option per line">
            <textarea
              value={listText}
              onChange={(e) => setListText(e.target.value)}
              rows={6}
              className={`${inputClass} resize-y`}
            />
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min">
              <input type="number" className={inputClass} value={min} onChange={(e) => setMin(Number(e.target.value))} />
            </Field>
            <Field label="Max">
              <input type="number" className={inputClass} value={max} onChange={(e) => setMax(Number(e.target.value))} />
            </Field>
          </div>
        )}

        <div className="flex flex-col items-center py-8">
          <AnimatePresence mode="wait">
            {result && (
              <motion.span
                key={spinKey}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-4xl font-semibold text-center"
                style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}
              >
                {result}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center">
          <Button onClick={pick}>
            <Shuffle size={16} /> Pick randomly
          </Button>
        </div>
      </Card>
    </ToolShell>
  );
}
