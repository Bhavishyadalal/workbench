"use client";

import Link from "next/link";
import { motion, Variants, Easing } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";

const easeOut: Easing = [0.16, 1, 0.3, 1];
import {
  ArrowUpRight,
  ImageIcon,
  FileText,
  Repeat,
  Type,
  Wrench,
  Clock,
  Star,
  TrendingUp,
  ShieldCheck,
  Cpu,
  EyeOff,
  Sparkles,
  Zap,
  Lock,
  Globe,
} from "lucide-react";
import {
  tools,
  categoryMeta,
  ToolCategory,
  toolsByCategory,
  findTool,
} from "@/lib/tools-registry";
import { useFavorites, useRecentTools } from "@/lib/hooks";
import BackToTop from "@/components/BackToTop";
import Tour from "@/components/Tour";

const categories = Object.keys(categoryMeta) as ToolCategory[];

const categoryIcon: Record<ToolCategory, typeof ImageIcon> = {
  image: ImageIcon,
  pdf: FileText,
  convert: Repeat,
  text: Type,
  extras: Wrench,
};

const TRENDING_SLUGS = [
  "pdf-merge",
  "image-compress",
  "json-formatter",
  "password-generator",
  "qr-generator",
  "word-counter",
];

const CHANGELOG = [
  "Added command palette — press ⌘K to jump anywhere",
  "New: light mode toggle in the sidebar",
  "Favorites — star any tool to pin it up top",
  "Recently used tools now show on the homepage",
  "Toast confirmations on every copy action",
  "Smoother page transitions between tools",
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

/* ── Animated count-up hook ── */
function useCountUp(target: string, inView: boolean) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!inView) return;
    const num = parseInt(target.replace(/\D/g, ""), 10);
    if (isNaN(num)) { setDisplay(target); return; }
    const suffix = target.replace(/[\d]/g, "");
    const duration = 900;
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * num) + suffix);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return display;
}

function StatCard({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, inView);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: easeOut }}
      className="stat-underline group cursor-default"
    >
      <div
        className="text-4xl sm:text-5xl font-bold tracking-tight text-gradient tabular-nums"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {count}
      </div>
      <div className="text-xs text-[var(--text-dim)] mt-1.5 font-medium">{label}</div>
    </motion.div>
  );
}

/* ── Tool card ── */
function ToolCard({
  tool,
  accent,
}: {
  tool: (typeof tools)[number];
  accent: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <motion.div variants={item}>
      <Link
        ref={ref}
        href={`/tools/${tool.slug}`}
        onMouseMove={handleMove}
        className="tool-card card-gradient-border group flex flex-col justify-between h-full bg-[var(--bg-card)] border border-[var(--border)] p-4 sm:p-5 min-h-[100px]"
        style={{ "--card-glow": accent } as React.CSSProperties}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background: `color-mix(in srgb, ${accent} 15%, var(--bg-elevated))`,
              border: `1px solid color-mix(in srgb, ${accent} 30%, var(--border))`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: accent }}
            />
          </div>
          <ArrowUpRight
            size={15}
            className="shrink-0 text-[var(--text-muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] leading-snug mb-1">
            {tool.name}
          </h3>
          <p className="text-xs text-[var(--text-dim)] leading-relaxed line-clamp-2">
            {tool.short}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Strip card for rows ── */
function StripCard({
  tool,
  accent,
  badge,
}: {
  tool: (typeof tools)[number];
  accent: string;
  badge?: React.ReactNode;
}) {
  return (
    <motion.div variants={item} className="shrink-0 w-[200px] sm:w-[220px]">
      <Link
        href={`/tools/${tool.slug}`}
        className="group flex flex-col h-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 transition-all hover:border-[var(--accent-dim)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${accent} 15%, var(--bg-elevated))`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: accent }}
            />
          </div>
          {badge}
        </div>
        <h3 className="text-sm font-semibold text-[var(--text)] leading-snug">
          {tool.name}
        </h3>
        <p className="text-xs text-[var(--text-dim)] mt-1 line-clamp-2 leading-relaxed">
          {tool.short}
        </p>
      </Link>
    </motion.div>
  );
}

/* ── Scroll row ── */
function ScrollRow({
  title,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  icon: typeof Clock;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 sm:px-6 pt-2 pb-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} style={{ color: iconColor || "var(--text-dim)" }} />
        <h2 className="text-xs font-bold tracking-widest text-[var(--text-dim)] uppercase">
          {title}
        </h2>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </motion.div>
    </section>
  );
}

/* ── Category filter pills ── */
function CategoryFilter({
  active,
  onChange,
}: {
  active: ToolCategory | "all";
  onChange: (cat: ToolCategory | "all") => void;
}) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 -mx-4 sm:-mx-0 px-4 sm:px-0"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <button
        onClick={() => onChange("all")}
        className={`cat-pill ${active === "all" ? "active" : ""}`}
      >
        All tools
      </button>
      {categories.map((cat) => {
        const meta = categoryMeta[cat];
        const Icon = categoryIcon[cat];
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`cat-pill ${active === cat ? "active" : ""}`}
            style={
              active === cat
                ? ({ "--cat-accent": meta.accent } as React.CSSProperties)
                : undefined
            }
          >
            <Icon size={12} style={{ color: active === cat ? meta.accent : undefined }} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

export default function HomeClient() {
  const { recents } = useRecentTools();
  const { favorites } = useFavorites();
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");

  const recentTools = useMemo(
    () => recents.map((slug) => findTool(slug)).filter(Boolean) as typeof tools,
    [recents]
  );
  const favoriteTools = useMemo(
    () =>
      favorites.map((slug) => findTool(slug)).filter(Boolean) as typeof tools,
    [favorites]
  );
  const trendingTools = useMemo(
    () =>
      TRENDING_SLUGS.map((slug) => findTool(slug)).filter(Boolean) as typeof tools,
    []
  );

  const stats: [string, string][] = [
    [String(tools.length), "tools available"],
    ["0", "files uploaded"],
    ["5", "categories"],
    ["100%", "runs on-device"],
  ];

  const trustSteps = [
    {
      icon: Cpu,
      color: "var(--accent)",
      title: "Runs on your device",
      body: "WebAssembly, Canvas, and browser APIs do the work — never a server.",
    },
    {
      icon: EyeOff,
      color: "var(--accent-2)",
      title: "Nothing is uploaded",
      body: "Files are read into memory locally and vanish the moment you close the tab.",
    },
    {
      icon: ShieldCheck,
      color: "var(--accent-3)",
      title: "Verify it yourself",
      body: "Open your network tab. You'll see it stay silent while you work.",
    },
  ];

  const filteredCategories =
    activeCategory === "all"
      ? categories
      : categories.filter((c) => c === activeCategory);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative px-4 sm:px-6 pt-8 pb-12 sm:pt-16 sm:pb-20 border-b border-[var(--border-soft)] overflow-hidden">
        <div className="mesh-glow" aria-hidden />
        <div className="mesh-glow-3" aria-hidden />

        <div className="relative max-w-4xl mx-auto">
          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
              style={{
                background: "color-mix(in srgb, var(--accent) 10%, var(--bg-card))",
                borderColor: "color-mix(in srgb, var(--accent) 30%, var(--border))",
                color: "var(--accent-bright)",
              }}
            >
              <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-glow" />
              <Zap size={11} className="inline" />
              {tools.length} tools · runs locally · nothing uploaded
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: easeOut }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] max-w-3xl mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            One bench,{" "}
            <span className="text-gradient">every tool</span>
            <br />
            you keep re&#8209;googling.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: easeOut }}
            className="text-base sm:text-xl text-[var(--text-dim)] max-w-xl leading-relaxed mb-10"
          >
            Compress, convert, merge, format — every file and text tool runs in
            your browser tab. Your files never leave your device.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: easeOut }}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
              <Lock size={12} className="text-[var(--success)]" />
              Private by design
            </div>
            <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
            <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
              <Globe size={12} className="text-[var(--accent-3)]" />
              No account needed
            </div>
            <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
            <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
              <Zap size={12} className="text-[var(--accent)]" />
              Works offline
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Changelog marquee ── */}
      <section className="border-b border-[var(--border-soft)] py-3 overflow-hidden">
        <div className="marquee-track flex gap-10 whitespace-nowrap will-change-transform">
          {[...CHANGELOG, ...CHANGELOG].map((line, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-xs text-[var(--text-dim)]"
            >
              <Sparkles size={10} className="text-[var(--accent)] shrink-0" />
              {line}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-4 sm:px-6 py-10 border-b border-[var(--border-soft)]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12">
          {stats.map(([value, label], i) => (
            <StatCard key={label} value={value} label={label} index={i} />
          ))}
        </div>
      </section>

      {/* ── Favorites row ── */}
      {favoriteTools.length > 0 && (
        <ScrollRow title="Pinned" icon={Star} iconColor="var(--accent)">
          {favoriteTools.map((tool) => (
            <StripCard
              key={tool.slug}
              tool={tool}
              accent={categoryMeta[tool.category].accent}
              badge={
                <Star size={12} fill="var(--accent)" className="text-[var(--accent)]" />
              }
            />
          ))}
        </ScrollRow>
      )}

      {/* ── Recently used ── */}
      {recentTools.length > 0 && (
        <ScrollRow title="Recently used" icon={Clock}>
          {recentTools.map((tool) => (
            <StripCard
              key={tool.slug}
              tool={tool}
              accent={categoryMeta[tool.category].accent}
            />
          ))}
        </ScrollRow>
      )}

      {/* ── Trending ── */}
      <ScrollRow
        title="Popular right now"
        icon={TrendingUp}
        iconColor="var(--accent-2)"
      >
        {trendingTools.map((tool) => (
          <StripCard
            key={tool.slug}
            tool={tool}
            accent={categoryMeta[tool.category].accent}
          />
        ))}
      </ScrollRow>

      {/* ── How it works ── */}
      <section className="px-4 sm:px-6 py-14 border-y border-[var(--border-soft)] cv-auto" style={{ background: "color-mix(in srgb, var(--bg-elevated) 40%, var(--bg))" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="mb-10 max-w-lg"
          >
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How &ldquo;nothing uploaded&rdquo; actually works
            </h2>
            <p className="text-sm text-[var(--text-dim)]">
              Not a privacy promise — a technical fact you can verify yourself.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trustSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: easeOut }}
                className="glass rounded-2xl p-6 card-gradient-border"
                style={{ "--card-glow": step.color } as React.CSSProperties}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-xl mb-5 relative overflow-hidden"
                  style={{
                    background: `color-mix(in srgb, ${step.color} 12%, var(--bg-elevated))`,
                    border: `1px solid color-mix(in srgb, ${step.color} 25%, var(--border))`,
                  }}
                >
                  <step.icon size={18} style={{ color: step.color }} />
                  <div
                    className="absolute inset-0 rounded-xl animate-glow"
                    style={{
                      background: `radial-gradient(circle, color-mix(in srgb, ${step.color} 20%, transparent), transparent 70%)`,
                    }}
                  />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: step.color }}>
                  Step {i + 1}
                </p>
                <h3 className="text-sm font-semibold text-[var(--text)] mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool grid ── */}
      <section className="px-4 sm:px-6 pt-10 pb-28 sm:pb-16 max-w-6xl mx-auto">
        {/* Category filter pills */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="flex items-center justify-between gap-4 mb-4 flex-wrap"
          >
            <h2
              className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Browse all tools
            </h2>
            <span className="text-xs text-[var(--text-dim)]">
              {activeCategory === "all"
                ? tools.length
                : toolsByCategory(activeCategory).length}{" "}
              tools
            </span>
          </motion.div>
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        </div>

        {filteredCategories.map((cat) => {
          const meta = categoryMeta[cat];
          const items = toolsByCategory(cat);
          const Icon = categoryIcon[cat];
          return (
            <motion.div
              key={cat}
              layout
              className="mb-10"
              data-tour={cat === categories[0] ? "categories" : undefined}
            >
              <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-[var(--border-soft)]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 flex items-center justify-center rounded-lg"
                    style={{
                      background: `color-mix(in srgb, ${meta.accent} 15%, var(--bg-elevated))`,
                      border: `1px solid color-mix(in srgb, ${meta.accent} 25%, var(--border))`,
                    }}
                  >
                    <Icon size={14} style={{ color: meta.accent }} strokeWidth={2} />
                  </div>
                  <h2
                    className="text-lg font-bold tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {meta.label}
                  </h2>
                </div>
                <span className="text-xs text-[var(--text-dim)] hidden sm:block">
                  {meta.blurb}
                </span>
              </div>

              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {items.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} accent={meta.accent} />
                ))}
              </motion.div>
            </motion.div>
          );
        })}
      </section>

      {/* ── Footer ── */}
      <footer className="px-4 sm:px-6 py-10 border-t border-[var(--border-soft)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className="text-sm font-semibold text-gradient"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Workbench
            </span>
            <span className="text-[var(--text-muted)] text-xs">
              — {tools.length} tools, all in your browser
            </span>
          </div>
          <p className="text-xs text-[var(--text-dim)] text-center sm:text-right">
            Files never touch a server
            <span className="mx-2 text-[var(--border)]">·</span>
            except live currency rates
          </p>
        </div>
      </footer>

      <BackToTop />
      <Tour />
    </div>
  );
}
