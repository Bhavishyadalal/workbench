"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import ToolShell from "@/components/ToolShell";
import { useToast } from "@/components/Toast";
import { Card, Field, Button, Badge, Tabs } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check, RefreshCw, Shield, KeyRound, Hash, Sparkles, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tool = findTool("password-generator")!;

type GenMode = "random" | "passphrase" | "pin";

const sets = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  ambiguous: "0O1lI|",
};

const wordsList = [
  "apple", "anchor", "beacon", "breeze", "castle", "canyon", "comet", "crater", "dagger", "desert",
  "dragon", "eagle", "ember", "falcon", "forest", "galaxy", "glacier", "harbor", "haven", "island",
  "jungle", "knight", "lagoon", "lantern", "legend", "matrix", "meadow", "meteor", "nebula", "nexus",
  "oasis", "ocean", "orbit", "phoenix", "planet", "prism", "pulsar", "quantum", "quasar", "radar",
  "raven", "ridge", "river", "shadow", "shield", "siren", "solace", "spark", "summit", "thunder",
  "titan", "torch", "valley", "vapor", "vector", "vortex", "voyage", "whisper", "zenith", "zephyr"
];

function calculateEntropy(password: string, poolSize: number): number {
  if (!password) return 0;
  return Math.round(password.length * Math.log2(Math.max(2, poolSize)));
}

function estimateCrackTime(entropy: number): { text: string; tier: number; label: string; color: string } {
  if (entropy < 28) return { text: "Instant crack", tier: 1, label: "Very Weak", color: "var(--danger)" };
  if (entropy < 45) return { text: "Few minutes to hours", tier: 2, label: "Weak", color: "#FB923C" };
  if (entropy < 65) return { text: "Months to decades", tier: 3, label: "Good", color: "var(--warn)" };
  if (entropy < 85) return { text: "Thousands of years", tier: 4, label: "Strong", color: "var(--success)" };
  return { text: "Trillions of years", tier: 4, label: "Unbreakable", color: "var(--accent)" };
}

export default function Page() {
  const { push } = useToast();
  const [mode, setMode] = useState<GenMode>("random");

  // Random settings
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

  // Passphrase settings
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(true);
  const [appendNumber, setAppendNumber] = useState(true);

  // PIN settings
  const [pinLength, setPinLength] = useState(6);

  // Generated outputs & history
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);
  const [showBulk, setShowBulk] = useState(false);

  const pool = useMemo(() => {
    let p = "";
    if (useLower) p += sets.lower;
    if (useUpper) p += sets.upper;
    if (useNumbers) p += sets.numbers;
    if (useSymbols) p += sets.symbols;
    if (excludeAmbiguous) {
      p = p.split("").filter((c) => !sets.ambiguous.includes(c)).join("");
    }
    return p;
  }, [useLower, useUpper, useNumbers, useSymbols, excludeAmbiguous]);

  const generateSingle = useCallback(() => {
    if (mode === "random") {
      if (!pool) return "";
      const arr = new Uint32Array(length);
      crypto.getRandomValues(arr);
      return Array.from(arr, (n) => pool[n % pool.length]).join("");
    } else if (mode === "passphrase") {
      const arr = new Uint32Array(wordCount);
      crypto.getRandomValues(arr);
      let selected = Array.from(arr, (n) => wordsList[n % wordsList.length]);
      if (capitalize) {
        selected = selected.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
      }
      let phrase = selected.join(separator);
      if (appendNumber) {
        const randNum = Math.floor(Math.random() * 90 + 10);
        phrase += `${separator}${randNum}`;
      }
      return phrase;
    } else {
      // PIN
      const arr = new Uint8Array(pinLength);
      crypto.getRandomValues(arr);
      return Array.from(arr, (n) => n % 10).join("");
    }
  }, [mode, pool, length, wordCount, separator, capitalize, appendNumber, pinLength]);

  const generate = useCallback(() => {
    const nextPass = generateSingle();
    setPassword(nextPass);
    if (nextPass) {
      setHistory((prev) => [nextPass, ...prev.filter((p) => p !== nextPass)].slice(0, 5));
    }
  }, [generateSingle]);

  const generateBulk = () => {
    const items: string[] = [];
    for (let i = 0; i < 6; i++) {
      items.push(generateSingle());
    }
    setBulkPasswords(items);
    setShowBulk(true);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pool, length, wordCount, separator, capitalize, appendNumber, pinLength]);

  const entropy = useMemo(() => {
    if (mode === "random") return calculateEntropy(password, pool.length);
    if (mode === "passphrase") return calculateEntropy(password, wordsList.length);
    return calculateEntropy(password, 10);
  }, [password, mode, pool.length]);

  const strength = estimateCrackTime(entropy);

  const copy = async (txt?: string) => {
    const target = txt || password;
    if (!target) return;
    await navigator.clipboard.writeText(target);
    push("Password copied to clipboard", "success");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyAllBulk = async () => {
    if (bulkPasswords.length === 0) return;
    await navigator.clipboard.writeText(bulkPasswords.join("\n"));
    push("All 6 passwords copied", "success");
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Mode Switcher */}
        <Tabs
          value={mode}
          onChange={setMode}
          options={[
            { value: "random", label: "Random Password", icon: KeyRound },
            { value: "passphrase", label: "Passphrase", icon: Sparkles },
            { value: "pin", label: "PIN Code", icon: Hash },
          ]}
        />

        {/* Main Password Display Box */}
        <div className="mt-5 relative">
          <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border-2 border-[var(--border)] focus-within:border-[var(--accent)] rounded-2xl px-4 py-4 transition-all">
            <span className="flex-1 font-mono text-lg sm:text-xl font-bold tracking-wider break-all text-[var(--text)] select-all">
              {password || "—"}
            </span>
            <button
              onClick={generate}
              aria-label="Regenerate"
              className="press p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent-dim)] transition-colors"
              title="Regenerate (or press Enter)"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => copy()}
              aria-label="Copy password"
              className="press p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent-dim)] transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check size={18} className="text-[var(--success)]" /> : <Copy size={18} />}
            </button>
          </div>

          {/* Strength Meter Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold flex items-center gap-1.5" style={{ color: strength.color }}>
                <Shield size={13} /> {strength.label} · <span className="text-[var(--text-dim)] font-normal">{strength.text}</span>
              </span>
              <span className="font-mono text-[var(--text-dim)]">{entropy} bits entropy</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className="rounded-full transition-all duration-300"
                  style={{
                    background: step <= strength.tier ? strength.color : "var(--bg-elevated)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Controls per mode */}
        <div className="mt-6 space-y-5">
          {mode === "random" && (
            <>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Password Length
                  </span>
                  <span className="font-mono text-sm font-bold text-[var(--accent)]">{length} characters</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[8, 12, 16, 20, 24, 32].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLength(l)}
                      className={`press px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        length === l
                          ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-bright)]"
                          : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={6}
                  max={64}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full accent-[var(--accent)] h-2 bg-[var(--bg-elevated)] rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Lowercase (a-z)", val: useLower, set: setUseLower },
                  { label: "Uppercase (A-Z)", val: useUpper, set: setUseUpper },
                  { label: "Numbers (0-9)", val: useNumbers, set: setUseNumbers },
                  { label: "Symbols (!@#$)", val: useSymbols, set: setUseSymbols },
                  { label: "Exclude ambiguous (0,O,l,1)", val: excludeAmbiguous, set: setExcludeAmbiguous },
                ].map((item, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent-dim)] cursor-pointer select-none transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={(e) => item.set(e.target.checked)}
                      className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
                    />
                    <span className="text-xs font-medium text-[var(--text)]">{item.label}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {mode === "passphrase" && (
            <>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                    Number of Words
                  </span>
                  <span className="font-mono text-sm font-bold text-[var(--accent)]">{wordCount} words</span>
                </div>
                <div className="flex gap-2 mb-3">
                  {[3, 4, 5, 6, 8].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWordCount(w)}
                      className={`press px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        wordCount === w
                          ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-bright)]"
                          : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={3}
                  max={8}
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full accent-[var(--accent)] h-2 bg-[var(--bg-elevated)] rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl">
                  <label className="text-xs font-semibold text-[var(--text-dim)] block mb-1.5">Separator</label>
                  <div className="flex gap-1.5">
                    {["-", ".", "_", " "].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSeparator(s)}
                        className={`flex-1 py-1 text-center rounded-lg border text-xs font-mono font-bold ${
                          separator === s
                            ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                            : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-dim)]"
                        }`}
                      >
                        {s === " " ? "space" : s}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent-dim)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={capitalize}
                    onChange={(e) => setCapitalize(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[var(--text)]">Capitalize Words</span>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--accent-dim)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={appendNumber}
                    onChange={(e) => setAppendNumber(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[var(--text)]">Append Random Number</span>
                </label>
              </div>
            </>
          )}

          {mode === "pin" && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                  PIN Digits
                </span>
                <span className="font-mono text-sm font-bold text-[var(--accent)]">{pinLength} digits</span>
              </div>
              <div className="flex gap-2 mb-3">
                {[4, 6, 8, 10, 12].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setPinLength(l)}
                    className={`press px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      pinLength === l
                        ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-bright)]"
                        : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)]"
                    }`}
                  >
                    {l} digits
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={4}
                max={12}
                value={pinLength}
                onChange={(e) => setPinLength(Number(e.target.value))}
                className="w-full accent-[var(--accent)] h-2 bg-[var(--bg-elevated)] rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button onClick={generate} disabled={mode === "random" && !pool}>
              <RefreshCw size={15} /> Generate New
            </Button>
            <Button variant="secondary" onClick={generateBulk}>
              Bulk Generate (6)
            </Button>
          </div>
        </div>

        {/* Bulk Passwords Modal / Expand */}
        {showBulk && bulkPasswords.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider">
                Batch Generated Passwords
              </span>
              <Button variant="ghost" onClick={copyAllBulk} className="!px-2.5 !py-1 text-xs">
                <Copy size={13} /> Copy All
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {bulkPasswords.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl font-mono text-xs"
                >
                  <span className="truncate mr-2 font-medium">{p}</span>
                  <button
                    onClick={() => copy(p)}
                    className="p-1 text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password History */}
        {history.length > 1 && (
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2.5">
              <History size={13} /> Recent Passwords (Stored locally)
            </div>
            <div className="space-y-1.5">
              {history.slice(1).map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl font-mono text-xs text-[var(--text-dim)] hover:text-[var(--text)] transition-colors"
                >
                  <span className="truncate mr-2">{p}</span>
                  <button
                    onClick={() => copy(p)}
                    className="p-1 hover:text-[var(--accent)] transition-colors"
                    title="Copy this password"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
