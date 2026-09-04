"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { useToast } from "@/components/Toast";
import { Card, Dropzone, Skeleton } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check } from "lucide-react";

const tool = findTool("file-hash")!;

const algos: { label: string; algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" }[] = [
  { label: "SHA-1", algo: "SHA-1" },
  { label: "SHA-256", algo: "SHA-256" },
  { label: "SHA-384", algo: "SHA-384" },
  { label: "SHA-512", algo: "SHA-512" },
];

function bufferToHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function Page() {
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setBusy(true);
    setHashes({});
    try {
      const buf = await f.arrayBuffer();
      const results: Record<string, string> = {};
      for (const { label, algo } of algos) {
        const digest = await crypto.subtle.digest(algo, buf);
        results[label] = bufferToHex(digest);
      }
      setHashes(results);
    } finally {
      setBusy(false);
    }
  };

  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    push("Copied to clipboard");
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone
          onFiles={handleFile}
          accept="*"
          file={file}
          onClear={() => {
            setFile(null);
            setHashes({});
          }}
          hint="Any file type — hashing happens locally"
        />

        {busy && (
          <div className="flex flex-col gap-2 mt-5">
            {algos.map(({ label }) => (
              <Skeleton key={label} className="h-[52px]" />
            ))}
          </div>
        )}

        {!busy && Object.keys(hashes).length > 0 && (
          <div className="flex flex-col gap-2 mt-5">
            {algos.map(({ label }) => (
              <button
                key={label}
                onClick={() => copy(label, hashes[label])}
                className="flex items-center justify-between gap-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 hover:border-[var(--accent-dim)] transition-colors text-left"
              >
                <div className="min-w-0">
                  <div className="text-[10px] text-[var(--text-dim)] font-medium">{label}</div>
                  <div className="text-xs font-mono mt-0.5 truncate">{hashes[label]}</div>
                </div>
                {copiedKey === label ? (
                  <Check size={15} className="text-[var(--accent)] shrink-0" />
                ) : (
                  <Copy size={15} className="text-[var(--text-dim)] shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
