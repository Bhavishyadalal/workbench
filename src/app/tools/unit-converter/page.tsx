"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, inputClass, CopyButton } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { ArrowLeftRight, HardDrive, Ruler, Scale, Thermometer, Box, Gauge, Calendar, Maximize, Copy, Check } from "lucide-react";
import { useToast } from "@/components/Toast";

const tool = findTool("unit-converter")!;

type Group = {
  label: string;
  icon: any;
  units: Record<string, number>; // multiplier to base unit
};

const groups: Record<string, Group> = {
  length: {
    label: "Length",
    icon: Ruler,
    units: {
      Meters: 1,
      Kilometers: 1000,
      Centimeters: 0.01,
      Millimeters: 0.001,
      Miles: 1609.344,
      Yards: 0.9144,
      Feet: 0.3048,
      Inches: 0.0254,
      "Nautical Miles": 1852,
    },
  },
  weight: {
    label: "Weight",
    icon: Scale,
    units: {
      Kilograms: 1,
      Grams: 0.001,
      Milligrams: 0.000001,
      Pounds: 0.45359237,
      Ounces: 0.028349523,
      Tonnes: 1000,
      Stone: 6.35029,
    },
  },
  digital: {
    label: "Digital Storage",
    icon: HardDrive,
    units: {
      Bytes: 1,
      Kilobytes: 1024,
      Megabytes: 1024 * 1024,
      Gigabytes: 1024 * 1024 * 1024,
      Terabytes: 1024 * 1024 * 1024 * 1024,
      Petabytes: 1024 * 1024 * 1024 * 1024 * 1024,
    },
  },
  area: {
    label: "Area",
    icon: Maximize,
    units: {
      "Square Meters": 1,
      "Square Kilometers": 1000000,
      "Square Feet": 0.092903,
      "Square Yards": 0.836127,
      Acres: 4046.86,
      Hectares: 10000,
    },
  },
  temperature: {
    label: "Temperature",
    icon: Thermometer,
    units: { Celsius: 1, Fahrenheit: 1, Kelvin: 1, Rankine: 1 },
  },
  volume: {
    label: "Volume",
    icon: Box,
    units: {
      Liters: 1,
      Milliliters: 0.001,
      "US Gallons": 3.78541,
      "UK Gallons": 4.54609,
      "US Quarts": 0.946353,
      Cups: 0.24,
      "Fluid Ounces": 0.0295735,
    },
  },
  speed: {
    label: "Speed",
    icon: Gauge,
    units: { "km/h": 1, "m/s": 3.6, mph: 1.60934, Knots: 1.852, Mach: 1225.044 },
  },
  time: {
    label: "Time",
    icon: Calendar,
    units: {
      Seconds: 1,
      Minutes: 60,
      Hours: 3600,
      Days: 86400,
      Weeks: 604800,
      Months: 2629746,
      Years: 31556952,
    },
  },
};

function convertTemp(value: number, from: string, to: string): number {
  let celsius = value;
  if (from === "Fahrenheit") celsius = ((value - 32) * 5) / 9;
  if (from === "Kelvin") celsius = value - 273.15;
  if (from === "Rankine") celsius = ((value - 491.67) * 5) / 9;

  if (to === "Celsius") return celsius;
  if (to === "Fahrenheit") return (celsius * 9) / 5 + 32;
  if (to === "Kelvin") return celsius + 273.15;
  if (to === "Rankine") return (celsius + 273.15) * 1.8;
  return celsius;
}

export default function Page() {
  const { push } = useToast();
  const [groupKey, setGroupKey] = useState("length");
  const group = groups[groupKey];
  const unitNames = Object.keys(group.units);
  const [from, setFrom] = useState(unitNames[0]);
  const [to, setTo] = useState(unitNames[1]);
  const [value, setValue] = useState("1");
  const [copiedUnit, setCopiedUnit] = useState<string | null>(null);

  const switchGroup = (key: string) => {
    setGroupKey(key);
    const names = Object.keys(groups[key].units);
    setFrom(names[0]);
    setTo(names[1]);
  };

  const convertValue = (val: number, fromUnit: string, toUnit: string): string => {
    if (isNaN(val)) return "—";
    if (groupKey === "temperature") {
      const converted = convertTemp(val, fromUnit, toUnit);
      return converted.toFixed(2).replace(/\.?0+$/, "");
    }
    const base = val * group.units[fromUnit];
    const out = base / group.units[toUnit];
    if (out === 0) return "0";
    if (Math.abs(out) < 0.0001 || Math.abs(out) >= 10000000) {
      return out.toExponential(4);
    }
    return out.toFixed(6).replace(/\.?0+$/, "");
  };

  const currentResult = useMemo(() => {
    const num = parseFloat(value);
    return convertValue(num, from, to);
  }, [value, from, to, groupKey]);

  // Convert to all other units in this category
  const allConversions = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return [];
    return unitNames.map((u) => ({
      name: u,
      val: convertValue(num, from, u),
    }));
  }, [value, from, unitNames, groupKey]);

  const copyVal = async (u: string, val: string) => {
    await navigator.clipboard.writeText(val);
    push(`Copied ${val} ${u}`, "success");
    setCopiedUnit(u);
    setTimeout(() => setCopiedUnit(null), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {Object.entries(groups).map(([key, g]) => {
            const Icon = g.icon;
            const active = groupKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => switchGroup(key)}
                className={`press px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-bright)] shadow-[var(--shadow-sm)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)] hover:text-[var(--text)]"
                }`}
              >
                <Icon size={14} className={active ? "text-[var(--accent)]" : "opacity-70"} />
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Units Selector & Conversion Inputs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <Field label="From Unit">
              <select className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)}>
                {unitNames.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="button"
              onClick={() => {
                const temp = from;
                setFrom(to);
                setTo(temp);
              }}
              aria-label="Swap units"
              className="press mb-2 p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--accent)] hover:border-[var(--accent-dim)] transition-all justify-self-center"
              title="Swap From & To"
            >
              <ArrowLeftRight size={16} />
            </button>

            <Field label="To Unit">
              <select className={inputClass} value={to} onChange={(e) => setTo(e.target.value)}>
                {unitNames.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <Field label={`Amount in ${from}`}>
              <input
                type="number"
                className={`${inputClass} font-mono !text-base font-semibold`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="1"
              />
            </Field>

            <Field label={`Result in ${to}`}>
              <div className={`${inputClass} bg-[var(--bg-card)] font-mono !text-base font-bold text-[var(--accent-bright)] flex items-center justify-between`}>
                <span className="truncate mr-2">{currentResult}</span>
                <button
                  type="button"
                  onClick={() => copyVal(to, currentResult)}
                  className="p-1 text-[var(--text-dim)] hover:text-[var(--accent)]"
                  title="Copy result"
                >
                  <Copy size={15} />
                </button>
              </div>
            </Field>
          </div>
        </div>

        {/* All Units Live Grid */}
        <div className="mt-6 pt-5 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              Convert to All {group.label} Units
            </span>
            <span className="text-xs font-mono text-[var(--text-dim)]">
              {value} {from} =
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {allConversions.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => copyVal(item.name, item.val)}
                className={`press p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  item.name === to
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[var(--shadow-sm)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent-dim)]"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                    {item.name}
                  </div>
                  <div className="font-mono text-sm font-semibold text-[var(--text)] truncate mt-0.5">
                    {item.val}
                  </div>
                </div>
                <div className="shrink-0 p-1 text-[var(--text-dim)] hover:text-[var(--accent)]">
                  {copiedUnit === item.name ? (
                    <Check size={14} className="text-[var(--success)]" />
                  ) : (
                    <Copy size={14} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </ToolShell>
  );
}
