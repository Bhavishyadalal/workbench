"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/components/ToolShell";
import { Card, Button, Field, Dropzone, ResultBar, inputClass } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { Download, Loader2 } from "lucide-react";

const tool = findTool("pdf-protect")!;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError("");
  };

  const protect = async () => {
    if (!file || !password) return;
    setBusy(true);
    setError("");
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const outBytes = await doc.save({
        // @ts-expect-error pdf-lib encryption option is not in the public type defs
        userPassword: password,
        ownerPassword: password,
        permissions: { printing: "highResolution" },
      });
      const blob = new Blob([outBytes as BlobPart], { type: "application/pdf" });
      setResult(URL.createObjectURL(blob));
    } catch {
      setError(
        "Couldn't apply a password to that PDF. pdf-lib's encryption support is limited — for stronger protection, use a dedicated desktop PDF tool."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        <Dropzone
          onFiles={handleFile}
          accept="application/pdf"
          file={file}
          onClear={() => {
            setFile(null);
            setResult(null);
          }}
        />

        <div className="mt-5">
          <Field label="Password">
            <input
              type="text"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
            />
          </Field>
        </div>

        <p className="text-xs text-[var(--text-dim)] mt-3">
          Encryption runs fully in your browser. Note: in-browser PDF encryption support
          is limited compared to desktop tools like Adobe Acrobat — treat this as light
          protection, not vault-grade security.
        </p>

        {error && <p className="text-sm text-[var(--danger)] mt-3">{error}</p>}

        <div className="mt-5">
          <Button onClick={protect} disabled={!file || !password || busy}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            {busy ? "Encrypting…" : "Protect PDF"}
          </Button>
        </div>

        {result && (
          <ResultBar>
            <a href={result} download={`protected-${file?.name ?? "file.pdf"}`}>
              <Button variant="secondary">
                <Download size={15} /> Download
              </Button>
            </a>
          </ResultBar>
        )}
      </Card>
    </ToolShell>
  );
}
