"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";

const tool = findTool("base-converter")!;

const bases = [
  { label: "Binary", base: 2, regex: /^[01]*$/ },
  { label: "Octal", base: 8, regex: /^[0-7]*$/ },
  { label: "Decimal", base: 10, regex: /^[0-9]*$/ },
  { label: "Hexadecimal", base: 16, regex: /^[0-9a-fA-F]*$/ },
];

export default function Page() {
  const [decimal, setDecimal] = useState<number | null>(42);

  const values = useMemo(() => {
    if (decimal === null || isNaN(decimal) || decimal < 0) return null;
    return bases.reduce((acc, b) => {
      acc[b.label] = decimal.toString(b.base);
      return acc;
    }, {} as Record<string, string>);
  }, [decimal]);

  const handleChange = (base: number, regex: RegExp, raw: string) => {
    if (raw === "") {
      setDecimal(null);
      return;
    }
    if (!regex.test(raw)) return;
    const parsed = parseInt(raw, base);
    setDecimal(isNaN(parsed) ? null : parsed);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          {bases.map((b) => (
            <Field key={b.label} label={b.label}>
              <input
                className={`${inputClass} font-mono`}
                value={values?.[b.label] ?? ""}
                onChange={(e) => handleChange(b.base, b.regex, e.target.value)}
                placeholder="0"
              />
            </Field>
          ))}
        </div>
        <p className="text-xs text-[var(--text-dim)] mt-4">
          Type in any field — the others update automatically.
        </p>
      </Card>
    </ToolShell>
  );
}
