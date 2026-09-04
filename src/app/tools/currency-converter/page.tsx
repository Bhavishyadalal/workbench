"use client";

import { useState, useEffect, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, inputClass, Skeleton } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { ArrowLeftRight } from "lucide-react";

const tool = findTool("currency-converter")!;

const popular = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CNY", "CHF", "SGD"];

export default function Page() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [amount, setAmount] = useState("1");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/currency?base=${from}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load rates");
        setRates(data.rates);
        setDate(data.date);
      })
      .catch((e) => setError(e.message || "Couldn't load exchange rates."))
      .finally(() => setLoading(false));
  }, [from]);

  const result = useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || !rates || !rates[to]) return "";
    return (num * rates[to]).toFixed(2);
  }, [amount, rates, to]);

  const currencyOptions = useMemo(() => {
    const codes = rates ? Object.keys(rates) : popular;
    return Array.from(new Set([...popular, ...codes])).sort();
  }, [rates]);

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <Field label="From">
            <select className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)}>
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <button
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            aria-label="Swap currencies"
            className="mb-2.5 p-2.5 rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors justify-self-center"
          >
            <ArrowLeftRight size={16} />
          </button>

          <Field label="To">
            <select className={inputClass} value={to} onChange={(e) => setTo(e.target.value)}>
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <Field label={`Amount (${from})`}>
            <input
              type="number"
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label={`Converted (${to})`}>
            {loading ? (
              <Skeleton className="h-[42px] w-full" />
            ) : (
              <div className={`${inputClass} bg-[var(--bg)] font-semibold text-[var(--accent)] flex items-center gap-2`}>
                {result || "—"}
              </div>
            )}
          </Field>
        </div>

        {error && <p className="text-sm text-[var(--danger)] mt-4">{error}</p>}
        {!error && date && (
          <p className="text-xs text-[var(--text-dim)] mt-4">Rates as of {date}</p>
        )}
      </Card>
    </ToolShell>
  );
}
