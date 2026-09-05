"use client";

import { useState, useMemo, useEffect } from "react";
import ToolShell from "@/components/ToolShell";
import { Card, Field, inputClass, Badge } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Cake, Calendar, Heart, Moon, Wind, Sparkles, Clock, Compass } from "lucide-react";

const tool = findTool("age-calculator")!;

const zodiacSigns = [
  { name: "Capricorn", symbol: "♑", start: "01-01", end: "01-19", element: "Earth" },
  { name: "Aquarius", symbol: "♒", start: "01-20", end: "02-18", element: "Air" },
  { name: "Pisces", symbol: "♓", start: "02-19", end: "03-20", element: "Water" },
  { name: "Aries", symbol: "♈", start: "03-21", end: "04-19", element: "Fire" },
  { name: "Taurus", symbol: "♉", start: "04-20", end: "05-20", element: "Earth" },
  { name: "Gemini", symbol: "♊", start: "05-21", end: "06-20", element: "Air" },
  { name: "Cancer", symbol: "♋", start: "06-21", end: "07-22", element: "Water" },
  { name: "Leo", symbol: "♌", start: "07-23", end: "08-22", element: "Fire" },
  { name: "Virgo", symbol: "♍", start: "08-23", end: "09-22", element: "Earth" },
  { name: "Libra", symbol: "♎", start: "09-23", end: "10-22", element: "Air" },
  { name: "Scorpio", symbol: "♏", start: "10-23", end: "11-21", element: "Water" },
  { name: "Sagittarius", symbol: "♐", start: "11-22", end: "12-21", element: "Fire" },
  { name: "Capricorn", symbol: "♑", start: "12-22", end: "12-31", element: "Earth" },
];

const chineseAnimals = [
  "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"
];

function getZodiac(month: number, day: number) {
  const mmdd = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  for (const z of zodiacSigns) {
    if (mmdd >= z.start && mmdd <= z.end) return z;
  }
  return zodiacSigns[0];
}

export default function Page() {
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));
  const [now, setNow] = useState(new Date());

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const b = new Date(birthDate + "T00:00:00");
    const t = new Date(targetDate + "T23:59:59");
    if (isNaN(b.getTime()) || isNaN(t.getTime())) return null;

    const diffMs = Math.max(0, t.getTime() - b.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalSeconds = Math.floor(diffMs / 1000);

    // Exact years, months, days
    let years = t.getFullYear() - b.getFullYear();
    let months = t.getMonth() - b.getMonth();
    let days = t.getDate() - b.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(t.getFullYear(), t.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Next birthday
    const thisYearBday = new Date(now.getFullYear(), b.getMonth(), b.getDate());
    const nextBday = thisYearBday < now ? new Date(now.getFullYear() + 1, b.getMonth(), b.getDate()) : thisYearBday;
    const daysUntilBday = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const nextBdayDayOfWeek = nextBday.toLocaleDateString("en-US", { weekday: "long" });
    const bornDayOfWeek = b.toLocaleDateString("en-US", { weekday: "long" });

    // Zodiac
    const westernZodiac = getZodiac(b.getMonth() + 1, b.getDate());
    // Chinese zodiac: 1900 was Year of the Rat
    const animalIndex = (b.getFullYear() - 1900) % 12;
    const chineseZodiac = chineseAnimals[(animalIndex + 12) % 12];

    // Fun facts
    const estimatedBreaths = totalMinutes * 16;
    const estimatedHeartbeats = totalMinutes * 78;
    const estimatedSleepYears = (years / 3).toFixed(1);

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes,
      totalSeconds,
      daysUntilBday,
      nextBdayDayOfWeek,
      bornDayOfWeek,
      westernZodiac,
      chineseZodiac,
      estimatedBreaths,
      estimatedHeartbeats,
      estimatedSleepYears,
    };
  }, [birthDate, targetDate, now]);

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Date Inputs */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Field label="Date of Birth">
            <input
              type="date"
              className={`${inputClass} font-mono font-bold`}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </Field>
          <Field label="Calculate Age As Of">
            <input
              type="date"
              className={`${inputClass} font-mono font-bold`}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </Field>
        </div>

        {stats && (
          <div className="space-y-6">
            {/* Big Age Display Header */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-center">
              <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-widest block mb-1">
                Your Exact Age
              </span>
              <div className="font-mono text-4xl sm:text-6xl font-extrabold text-[var(--accent-bright)] tracking-tight">
                {stats.years} <span className="text-xl sm:text-2xl font-normal text-[var(--text-dim)]">years</span>{" "}
                {stats.months} <span className="text-xl sm:text-2xl font-normal text-[var(--text-dim)]">months</span>{" "}
                {stats.days} <span className="text-xl sm:text-2xl font-normal text-[var(--text-dim)]">days</span>
              </div>
              <p className="text-xs text-[var(--text-dim)] mt-3">
                Born on a <strong className="text-[var(--text)]">{stats.bornDayOfWeek}</strong>
              </p>
            </div>

            {/* Next Birthday Banner */}
            <div className="p-4 rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,var(--bg-elevated))] border border-[color-mix(in_srgb,var(--accent)_25%,var(--border))] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] shrink-0">
                  <Cake size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)]">Next Birthday Countdown</div>
                  <div className="text-xs text-[var(--text-dim)]">It falls on a {stats.nextBdayDayOfWeek}</div>
                </div>
              </div>
              <Badge variant="accent" className="!text-sm !px-3 !py-1 font-mono">
                {stats.daysUntilBday} days left
              </Badge>
            </div>

            {/* Lifetime Breakdown Numbers */}
            <div>
              <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block mb-3">
                Total Time Elapsed
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] font-mono">
                  <div className="text-2xl font-bold text-[var(--text)]">{stats.totalDays.toLocaleString()}</div>
                  <div className="text-[10px] text-[var(--text-dim)] uppercase font-sans font-semibold mt-0.5">Total Days</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] font-mono">
                  <div className="text-2xl font-bold text-[var(--text)]">{stats.totalWeeks.toLocaleString()}</div>
                  <div className="text-[10px] text-[var(--text-dim)] uppercase font-sans font-semibold mt-0.5">Total Weeks</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] font-mono">
                  <div className="text-2xl font-bold text-[var(--text)]">{stats.totalHours.toLocaleString()}</div>
                  <div className="text-[10px] text-[var(--text-dim)] uppercase font-sans font-semibold mt-0.5">Total Hours</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] font-mono">
                  <div className="text-2xl font-bold text-[var(--text)]">{stats.totalMinutes.toLocaleString()}</div>
                  <div className="text-[10px] text-[var(--text-dim)] uppercase font-sans font-semibold mt-0.5">Total Minutes</div>
                </div>
              </div>
            </div>

            {/* Astrology & Life Milestones */}
            <div className="pt-2 border-t border-[var(--border)]">
              <span className="text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider block mb-3">
                Astrology & Biology Estimates
              </span>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center gap-3">
                  <div className="text-2xl">{stats.westernZodiac.symbol}</div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text)]">{stats.westernZodiac.name}</div>
                    <div className="text-[10px] text-[var(--text-dim)]">{stats.westernZodiac.element} Sign</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--bg-card)] text-[var(--accent)]">
                    <Compass size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text)]">Year of the {stats.chineseZodiac}</div>
                    <div className="text-[10px] text-[var(--text-dim)]">Chinese Zodiac</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--bg-card)] text-[var(--danger)]">
                    <Heart size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-mono">~{(stats.estimatedHeartbeats / 1000000).toFixed(0)}M</div>
                    <div className="text-[10px] text-[var(--text-dim)]">Heartbeats Taken</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--bg-card)] text-[var(--accent-2)]">
                    <Moon size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-mono">~{stats.estimatedSleepYears} years</div>
                    <div className="text-[10px] text-[var(--text-dim)]">Spent Sleeping</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
