"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import { useToast } from "@/components/Toast";
import { Card, Button, Dropzone, ResultBar } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Copy, Check } from "lucide-react";

const tool = findTool("image-base64")!;

export default function Page() {
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFile = (files: File[]) => {
    const f = files[0];
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setBase64(reader.result as string);
    reader.readAsDataURL(f);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(base64);
    push("Copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone
          onFiles={handleFile}
          accept="image/*"
          hint="PNG, JPG, WebP, GIF, or SVG"
          file={file}
          onClear={() => {
            setFile(null);
            setBase64("");
          }}
        />

        {base64 && (
          <>
            <textarea
              readOnly
              value={base64}
              rows={8}
              className="w-full mt-5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-xs font-mono text-[var(--text-dim)] resize-none outline-none"
            />
            <ResultBar>
              <span className="text-xs text-[var(--text-dim)]">{(base64.length / 1024).toFixed(1)} KB as text</span>
              <Button variant="secondary" onClick={copy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy to clipboard"}
              </Button>
            </ResultBar>
          </>
        )}
      </Card>
    </ToolShell>
  );
}
