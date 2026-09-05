import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { CommandPaletteProvider } from "@/components/CommandPalette";
import PageTransition from "@/components/PageTransition";

// Self-hosted as static woff2 files (see src/app/fonts) rather than
// next/font/google: no external request at build or runtime, works
// offline, no dependency on fonts.googleapis.com being reachable.
// Preloaded automatically by next/font/local, swapped in with zero
// layout shift via the `variable` CSS custom property below.
const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/fraunces-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/fraunces-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/fraunces-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "./fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const title = "Workbench — Every tool you keep googling, in one place";
const description =
  "Compress images, merge PDFs, convert units, format JSON, and more — all in your browser, nothing uploaded.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title,
  description,
  applicationName: "Workbench",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Workbench",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Workbench",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0D0C0A" },
    { media: "(prefers-color-scheme: light)", color: "#FAF7EF" },
  ],
};

// Runs before paint to set the theme attribute from localStorage,
// avoiding a flash of the wrong theme on load.
const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem('wb:theme');
    var theme = stored === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full">
        <div className="grid-texture" />
        <div className="grain" />
        <ToastProvider>
          <CommandPaletteProvider>
            <div className="flex min-h-screen relative" style={{ zIndex: 2 }}>
              <Sidebar />
              <main className="flex-1 min-w-0">
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
          </CommandPaletteProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
