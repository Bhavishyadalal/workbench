"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/lib/hooks";

export default function SoundToggle({ className = "" }: { className?: string }) {
  const { enabled, toggle } = useSound();

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? "Mute sound effects" : "Unmute sound effects"}
      title={enabled ? "Sound effects on" : "Sound effects off"}
      className={`tap-target press w-8 h-8 flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent-dim)] transition-colors shrink-0 ${className}`}
    >
      {enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
    </button>
  );
}
