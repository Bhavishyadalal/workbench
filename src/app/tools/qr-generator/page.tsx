"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import QRCode from "qrcode";
import ToolShell from "@/components/ToolShell";
import { Card, Field, Button, inputClass, Skeleton, Tabs, Badge } from "@/components/ui";
import { findTool } from "@/lib/tools-registry";
import { useToast } from "@/components/Toast";
import { Download, Copy, Check, Wifi, Globe, User, Mail, MessageSquare, FileText, Palette, Sliders } from "lucide-react";
import { motion } from "framer-motion";

const tool = findTool("qr-generator")!;

type QRType = "url" | "wifi" | "vcard" | "email" | "sms" | "text";

const colorPresets = [
  { name: "Cyber Violet", fg: "#C084FC", bg: "#0D0B18" },
  { name: "Neon Cyan", fg: "#38BDF8", bg: "#08111D" },
  { name: "Sunset Amber", fg: "#FBBF24", bg: "#161008" },
  { name: "Emerald Tech", fg: "#34D399", bg: "#091510" },
  { name: "Classic Noir", fg: "#F4F4F5", bg: "#09090B" },
  { name: "Pure White", fg: "#000000", bg: "#FFFFFF" },
];

export default function Page() {
  const { push } = useToast();
  const [type, setType] = useState<QRType>("url");

  // Type specific states
  const [url, setUrl] = useState("https://workbench-tools.vercel.app");
  
  // Wi-Fi
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiType, setWifiType] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardOrg, setVcardOrg] = useState("");

  // Email
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // SMS
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMsg, setSmsMsg] = useState("");

  // Text
  const [rawText, setRawText] = useState("");

  // Visual Customization
  const [color, setColor] = useState("#C084FC");
  const [bg, setBg] = useState("#0D0B18");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [size, setSize] = useState(280);
  const [margin, setMargin] = useState(2);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [svgData, setSvgData] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);
  const [copied, setCopied] = useState(false);

  // Compute final payload string based on active tab
  const payload = useMemo(() => {
    switch (type) {
      case "url":
        return url.trim();
      case "wifi":
        if (!wifiSsid) return "";
        return `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};H:${wifiHidden ? "true" : "false"};;`;
      case "vcard":
        if (!vcardName) return "";
        return [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `FN:${vcardName}`,
          vcardPhone ? `TEL:${vcardPhone}` : "",
          vcardEmail ? `EMAIL:${vcardEmail}` : "",
          vcardOrg ? `ORG:${vcardOrg}` : "",
          "END:VCARD",
        ].filter(Boolean).join("\n");
      case "email":
        if (!emailTo) return "";
        const q = new URLSearchParams();
        if (emailSubject) q.set("subject", emailSubject);
        if (emailBody) q.set("body", emailBody);
        const queryStr = q.toString();
        return `mailto:${emailTo}${queryStr ? `?${queryStr}` : ""}`;
      case "sms":
        if (!smsPhone) return "";
        return `smsto:${smsPhone}:${smsMsg}`;
      case "text":
        return rawText.trim();
    }
  }, [type, url, wifiSsid, wifiPass, wifiType, wifiHidden, vcardName, vcardPhone, vcardEmail, vcardOrg, emailTo, emailSubject, emailBody, smsPhone, smsMsg, rawText]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!payload) {
      setDataUrl(null);
      setSvgData(null);
      setRendering(false);
      return;
    }
    setRendering(true);

    // Render Canvas PNG
    QRCode.toCanvas(
      canvasRef.current,
      payload,
      {
        width: size,
        margin,
        errorCorrectionLevel: errorLevel,
        color: { dark: color, light: bg },
      },
      (err) => {
        if (!err && canvasRef.current) {
          setDataUrl(canvasRef.current.toDataURL("image/png"));
        }
        setRendering(false);
      }
    );

    // Generate SVG string
    QRCode.toString(
      payload,
      {
        type: "svg",
        margin,
        errorCorrectionLevel: errorLevel,
        color: { dark: color, light: bg },
      },
      (err, string) => {
        if (!err && string) {
          setSvgData(`data:image/svg+xml;utf8,${encodeURIComponent(string)}`);
        }
      }
    );
  }, [payload, color, bg, errorLevel, size, margin]);

  const copyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopied(true);
        push("QR Code image copied to clipboard", "success");
        setTimeout(() => setCopied(false), 1500);
      });
    } catch {
      push("Clipboard image copy not supported in this browser", "error");
    }
  };

  return (
    <ToolShell tool={tool}>
      <Card>
        {/* Template Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl mb-6">
          {[
            { id: "url", label: "URL", icon: Globe },
            { id: "wifi", label: "Wi-Fi", icon: Wifi },
            { id: "vcard", label: "Contact", icon: User },
            { id: "email", label: "Email", icon: Mail },
            { id: "sms", label: "SMS", icon: MessageSquare },
            { id: "text", label: "Text", icon: FileText },
          ].map((item) => {
            const active = type === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id as QRType)}
                className={`press py-2.5 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  active
                    ? "bg-[var(--bg-card)] text-[var(--accent-bright)] shadow-[var(--shadow-sm)] border border-[color-mix(in_srgb,var(--accent)_30%,var(--border))]"
                    : "text-[var(--text-dim)] hover:text-[var(--text)] border border-transparent"
                }`}
              >
                <Icon size={16} className={active ? "text-[var(--accent)]" : "opacity-70"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Input Forms */}
        <div className="space-y-4">
          {type === "url" && (
            <Field label="Website / Link URL">
              <input
                className={inputClass}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </Field>
          )}

          {type === "wifi" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Network SSID (Name)">
                <input
                  className={inputClass}
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="MyHomeWifi"
                />
              </Field>
              <Field label="Password">
                <input
                  className={inputClass}
                  type="password"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Leave empty if open"
                />
              </Field>
              <Field label="Security Type">
                <select
                  className={inputClass}
                  value={wifiType}
                  onChange={(e) => setWifiType(e.target.value as any)}
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (Open Network)</option>
                </select>
              </Field>
              <label className="flex items-center gap-2.5 sm:mt-7 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wifiHidden}
                  onChange={(e) => setWifiHidden(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
                />
                <span className="text-xs font-medium text-[var(--text)]">Hidden Network</span>
              </label>
            </div>
          )}

          {type === "vcard" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Full Name">
                <input
                  className={inputClass}
                  value={vcardName}
                  onChange={(e) => setVcardName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </Field>
              <Field label="Phone Number">
                <input
                  className={inputClass}
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  placeholder="+1 555-0199"
                />
              </Field>
              <Field label="Email Address">
                <input
                  className={inputClass}
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </Field>
              <Field label="Company / Organization">
                <input
                  className={inputClass}
                  value={vcardOrg}
                  onChange={(e) => setVcardOrg(e.target.value)}
                  placeholder="Acme Corp"
                />
              </Field>
            </div>
          )}

          {type === "email" && (
            <div className="space-y-3">
              <Field label="Recipient Email">
                <input
                  className={inputClass}
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="contact@company.com"
                />
              </Field>
              <Field label="Subject Line">
                <input
                  className={inputClass}
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Hello from Workbench"
                />
              </Field>
              <Field label="Message Body">
                <textarea
                  className={`${inputClass} resize-y`}
                  rows={3}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your email draft here…"
                />
              </Field>
            </div>
          )}

          {type === "sms" && (
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Phone Number">
                <input
                  className={inputClass}
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </Field>
              <Field label="Text Message">
                <input
                  className={inputClass}
                  value={smsMsg}
                  onChange={(e) => setSmsMsg(e.target.value)}
                  placeholder="Scan to reply"
                />
              </Field>
            </div>
          )}

          {type === "text" && (
            <Field label="Plain Text / Notes">
              <textarea
                className={`${inputClass} resize-y`}
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Type or paste any text to encode…"
              />
            </Field>
          )}
        </div>

        {/* Color Palette Presets */}
        <div className="mt-6 pt-5 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5">
              <Palette size={13} /> Color Themes
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setColor(preset.fg);
                  setBg(preset.bg);
                }}
                className={`press p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                  color === preset.fg && bg === preset.bg
                    ? "border-[var(--accent)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-dim)]"
                }`}
              >
                <div className="w-5 h-5 rounded-lg border border-[var(--border)] shrink-0 flex overflow-hidden">
                  <div className="w-1/2 h-full" style={{ background: preset.fg }} />
                  <div className="w-1/2 h-full" style={{ background: preset.bg }} />
                </div>
                <span className="text-[11px] font-medium text-[var(--text)] truncate">{preset.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <Field label="Foreground Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-[var(--border)] bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-[var(--text-dim)]">{color}</span>
              </div>
            </Field>

            <Field label="Background Color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-[var(--border)] bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-[var(--text-dim)]">{bg}</span>
              </div>
            </Field>

            <Field label="Error Correction">
              <select
                className={inputClass}
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value as any)}
              >
                <option value="L">Low (~7% recovery)</option>
                <option value="M">Medium (~15% recovery)</option>
                <option value="Q">Quartile (~25% recovery)</option>
                <option value="H">High (~30% recovery)</option>
              </select>
            </Field>

            <Field label={`QR Size — ${size}px`}>
              <input
                type="range"
                min={180}
                max={420}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-[var(--accent)] mt-3"
              />
            </Field>
          </div>
        </div>

        {/* QR Code Canvas Preview */}
        <div
          className="relative flex justify-center items-center mt-8 p-8 rounded-2xl border-2 border-[var(--border)] transition-colors shadow-[var(--shadow-sm)]"
          style={{ background: bg }}
        >
          {rendering && <Skeleton className="absolute inset-8 rounded-xl" />}
          <canvas
            ref={canvasRef}
            className="rounded-xl transition-opacity duration-200 shadow-md"
            style={{ opacity: rendering ? 0 : 1, maxWidth: "100%", height: "auto" }}
          />
        </div>

        {/* Download & Copy Action Bar */}
        {dataUrl && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Badge variant="accent">Ready to Scan</Badge>
              <span className="text-xs text-[var(--text-dim)] font-mono">{size} × {size}px</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={copyImage}>
                {copied ? <Check size={15} className="text-[var(--success)]" /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy Image"}
              </Button>

              {svgData && (
                <a href={svgData} download="qrcode.svg" onClick={() => push("QR code SVG downloaded", "success")}>
                  <Button variant="secondary">
                    <Download size={15} /> SVG Vector
                  </Button>
                </a>
              )}

              <a href={dataUrl} download="qrcode.png" onClick={() => push("QR code PNG downloaded", "success")}>
                <Button variant="primary">
                  <Download size={15} /> Download PNG
                </Button>
              </a>
            </div>
          </div>
        )}
      </Card>
    </ToolShell>
  );
}
