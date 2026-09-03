"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { ArrowLeftRight } from "lucide-react";

const tool = findTool("unit-converter")!;

type Group = {
  label: string;
  units: Record<string, number>; // multiplier to base unit
};

const groups: Record<string, Group> = {
  length: {
    label: "Length",
    units: { Meters: 1, Kilometers: 1000, Centimeters: 0.01, Millimeters: 0.001, Miles: 1609.34, Yards: 0.9144, Feet: 0.3048, Inches: 0.0254 },
  },
  weight: {
    label: "Weight",
    units: { Kilograms: 1, Grams: 0.001, Milligrams: 0.000001, Pounds: 0.453592, Ounces: 0.0283495, Tonnes: 1000 },
  },
  temperature: {
    label: "Temperature",
    units: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 }, // handled specially
  },
  volume: {
    label: "Volume",
    units: { Liters: 1, Milliliters: 0.001, "US Gallons": 3.78541, "US Quarts": 0.946353, Cups: 0.24, "Fluid Ounces": 0.0295735 },
  },
  speed: {
    label: "Speed",
    units: { "km/h": 1, "m/s": 3.6, "mph": 1.60934, Knots: 1.852 },
  },
};

function convertTemp(value: number, from: string, to: string): number {
  let celsius = value;
  if (from === "Fahrenheit") celsius = ((value - 32) * 5) / 9;
  if (from === "Kelvin") celsius = value - 273.15;
  if (to === "Celsius") return celsius;
  if (to === "Fahrenheit") return (celsius * 9) / 5 + 32;
  if (to === "Kelvin") return celsius + 273.15;
  return celsius;
}

export default function Page() {
  const [groupKey, setGroupKey] = useState("length");
  const group = groups[groupKey];
  const unitNames = Object.keys(group.units);
  const [from, setFrom] = useState(unitNames[0]);
  const [to, setTo] = useState(unitNames[1]);
  const [value, setValue] = useState("1");

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    if (groupKey === "temperature") {
      return convertTemp(num, from, to).toFixed(4).replace(/\.?0+$/, "");
    }
    const base = num * group.units[from];
    const out = base / group.units[to];
    return out.toFixed(6).replace(/\.?0+$/, "");
  }, [value, from, to, group, groupKey]);

  const switchGroup = (key: string) => {
    setGroupKey(key);
    const names = Object.keys(groups[key].units);
    setFrom(names[0]);
    setTo(names[1]);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(groups).map(([key, g]) => (
            <button
              key={key}
              onClick={() => switchGroup(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                groupKey === key
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <Field label="From">
            <select className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)}>
              {unitNames.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>

          <button
            onClick={() => {
              setFrom(to);
              setTo(from);
            }}
            aria-label="Swap units"
            className="mb-2.5 p-2.5 rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors justify-self-center"
          >
            <ArrowLeftRight size={16} />
          </button>

          <Field label="To">
            <select className={inputClass} value={to} onChange={(e) => setTo(e.target.value)}>
              {unitNames.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <Field label={from}>
            <input
              type="number"
              className={inputClass}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Field>
          <Field label={to}>
            <div className={`${inputClass} bg-[var(--bg)] font-semibold text-[var(--accent)]`}>
              {result || "—"}
            </div>
          </Field>
        </div>
      </Card>
    </ToolShell>
  );
}
