"use client";

import Link from "next/link";
import { motion, Variants, Easing } from "framer-motion";
import { useRef, useMemo } from "react";

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
} from "lucide-react";
import { tools, categoryMeta, ToolCategory, toolsByCategory, findTool } from "@/lib/tools-registry";
import { useFavorites, useRecentTools } from "@/lib/hooks";

const categories = Object.keys(categoryMeta) as ToolCategory[];

const categoryIcon: Record<ToolCategory, typeof ImageIcon> = {
  image: ImageIcon,
  pdf: FileText,
  convert: Repeat,
  text: Type,
  extras: Wrench,
};

// Curated "trending" slugs — hardcoded since there's no real analytics backend.
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
  show: {
    transition: { staggerChildren: 0.025 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeOut } },
};

function ToolCard({ tool, accent }: { tool: (typeof tools)[number]; accent: string }) {
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
        className="tool-card group flex flex-col justify-between h-full bg-[var(--bg-card)] border border-[var(--border)] p-4 transition-colors hover:bg-[var(--bg-card-hover)]"
        style={
          {
            borderLeftWidth: "2px",
            borderLeftColor: "var(--border)",
            "--card-glow": accent,
          } as React.CSSProperties
        }
        onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = accent)}
        onMouseLeave={(e) => (e.currentTarget.style.borderLeftColor = "var(--border)")}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-[var(--text)]">{tool.name}</h3>
          <ArrowUpRight
            size={15}
            className="shrink-0 text-[var(--text-dim)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--text)]"
          />
        </div>
        <p className="text-xs text-[var(--text-dim)] mt-1.5">{tool.short}</p>
      </Link>
    </motion.div>
  );
}

/** Compact horizontal-strip card used for Recents / Favorites / Trending rows. */
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
    <motion.div variants={item} className="shrink-0 w-[190px] sm:w-[210px]">
      <Link
        href={`/tools/${tool.slug}`}
        className="group flex flex-col justify-between h-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3.5 transition-all hover:border-[var(--accent-dim)] hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
            style={{ background: accent }}
          />
          {badge}
        </div>
        <h3 className="text-sm font-medium text-[var(--text)] leading-snug">{tool.name}</h3>
        <p className="text-xs text-[var(--text-dim)] mt-1 line-clamp-2">{tool.short}</p>
      </Link>
    </motion.div>
  );
}

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
    <section className="px-5 pt-2 pb-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={15} style={{ color: iconColor || "var(--text-dim)" }} />
        <h2 className="text-sm font-medium tracking-wide text-[var(--text-dim)] uppercase">
          {title}
        </h2>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none"
      >
        {children}
      </motion.div>
    </section>
  );
}

export default function HomeClient() {
  const { recents } = useRecentTools();
  const { favorites } = useFavorites();

  const recentTools = useMemo(
    () => recents.map((slug) => findTool(slug)).filter(Boolean) as typeof tools,
    [recents]
  );
  const favoriteTools = useMemo(
    () => favorites.map((slug) => findTool(slug)).filter(Boolean) as typeof tools,
    [favorites]
  );
  const trendingTools = useMemo(
    () => TRENDING_SLUGS.map((slug) => findTool(slug)).filter(Boolean) as typeof tools,
    []
  );

  const stats: [string, string][] = [
    [String(tools.length), "tools, one tab"],
    ["0", "files ever uploaded"],
    ["5", "categories"],
    ["100%", "runs on-device"],
  ];

  const trustSteps = [
    {
      icon: Cpu,
      title: "Processing happens on your device",
      body: "Every tool runs with JavaScript already loaded in your tab — WebAssembly, Canvas, and browser APIs do the work, not a server.",
    },
    {
      icon: EyeOff,
      title: "Nothing you work with is uploaded",
      body: "Drop in a PDF, an image, a password — it's read into memory locally and never sent anywhere. Close the tab and it's gone.",
    },
    {
      icon: ShieldCheck,
      title: "Verify it yourself",
      body: "Open your browser's network tab while you use any tool here. You'll see it stay quiet — no file leaves your machine.",
    },
  ];

  return (
    <div>
      {/* Hero — one orchestrated entrance with a live gradient mesh */}
      <section className="relative px-5 pt-16 pb-14 sm:pt-24 sm:pb-16 border-b border-[var(--border-soft)] overflow-hidden">
        <div className="mesh-glow" aria-hidden />
        <div className="relative max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="inline-flex items-center gap-2 text-xs text-[var(--text-dim)] mb-7 font-mono"
          >
            <span className="w-1.5 h-1.5 bg-[var(--accent)] animate-glow rounded-full" />
            {tools.length} tools · runs locally · nothing uploaded
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: easeOut }}
            className="text-[2.6rem] sm:text-6xl font-semibold tracking-tight leading-[1.05] max-w-2xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            One bench, every
            <br />
            <span className="text-gradient">tool you keep</span>
            <br />
            re&#8209;googling.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease: easeOut }}
            className="mt-6 text-base sm:text-lg text-[var(--text-dim)] max-w-lg leading-relaxed"
          >
            Compress, convert, merge, format — every file and text tool runs
            in your browser tab. Your files never leave your device.
          </motion.p>
        </div>
      </section>

      {/* Changelog marquee strip */}
      <section className="border-b border-[var(--border-soft)] py-2.5 overflow-hidden">
        <div className="flex items-center gap-2 px-5 max-w-6xl mx-auto mb-0">
          <div className="marquee-track flex gap-8 whitespace-nowrap will-change-transform">
            {[...CHANGELOG, ...CHANGELOG].map((line, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-xs text-[var(--text-dim)]">
                <Sparkles size={11} className="text-[var(--accent)] shrink-0" />
                {line}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="px-5 py-8 border-b border-[var(--border-soft)]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10">
          {stats.map(([value, label], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: easeOut }}
              className="stat-underline inline-block"
            >
              <div
                className="text-3xl sm:text-4xl font-semibold tracking-tight text-gradient"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {value}
              </div>
              <div className="text-xs text-[var(--text-dim)] mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Favorites row */}
      {favoriteTools.length > 0 && (
        <ScrollRow title="Favorites" icon={Star} iconColor="var(--accent)">
          {favoriteTools.map((tool) => (
            <StripCard key={tool.slug} tool={tool} accent={categoryMeta[tool.category].accent} />
          ))}
        </ScrollRow>
      )}

      {/* Recently used row */}
      {recentTools.length > 0 && (
        <ScrollRow title="Recently used" icon={Clock}>
          {recentTools.map((tool) => (
            <StripCard key={tool.slug} tool={tool} accent={categoryMeta[tool.category].accent} />
          ))}
        </ScrollRow>
      )}

      {/* Trending row */}
      <ScrollRow title="Popular right now" icon={TrendingUp} iconColor="var(--accent-2)">
        {trendingTools.map((tool) => (
          <StripCard key={tool.slug} tool={tool} accent={categoryMeta[tool.category].accent} />
        ))}
      </ScrollRow>

      {/* How it works / trust section */}
      <section className="px-5 py-14 border-y border-[var(--border-soft)] bg-[var(--bg-elevated)]/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="mb-10 max-w-xl"
          >
            <h2
              className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How &ldquo;nothing uploaded&rdquo; actually works
            </h2>
            <p className="text-sm text-[var(--text-dim)]">
              Not a privacy promise — a technical fact you can check yourself.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {trustSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: easeOut }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5"
              >
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-md mb-4 border border-[var(--accent-dim)]"
                  style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}
                >
                  <step.icon size={16} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text)] mb-1.5">
                  {i + 1}. {step.title}
                </h3>
                <p className="text-xs text-[var(--text-dim)] leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool grid */}
      <section className="px-5 pt-12 pb-24 max-w-6xl mx-auto">
        {categories.map((cat) => {
          const meta = categoryMeta[cat];
          const items = toolsByCategory(cat);
          const Icon = categoryIcon[cat];
          return (
            <div key={cat} className="mb-12">
              <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-[var(--border-soft)]">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 flex items-center justify-center"
                    style={{ color: meta.accent }}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <h2
                    className="text-xl font-semibold tracking-tight"
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
            </div>
          );
        })}
      </section>

      <footer className="px-5 py-8 text-center text-xs text-[var(--text-dim)] border-t border-[var(--border-soft)]">
        Runs in your browser. Files never touch a server, except live currency rates.
      </footer>
    </div>
  );
}
