import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileBottomBar from "@/components/MobileBottomBar";
import { ToastProvider } from "@/components/Toast";
import { CommandPaletteProvider } from "@/components/CommandPalette";
import PageTransition from "@/components/PageTransition";

const title = "Workbench — Every tool you keep googling, in one place";
const description =
  "Compress images, merge PDFs, convert units, format JSON, and more — all in your browser, nothing uploaded.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000")
  ),
  title,
  description,
  keywords: ["online tools", "image compress", "pdf merge", "json formatter", "unit converter", "browser tools"],
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09080A" },
    { media: "(prefers-color-scheme: light)", color: "#F8F7FF" },
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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full">
        <div className="grid-texture" />
        <div className="grain" />
        <ToastProvider>
          <CommandPaletteProvider>
            <div className="flex min-h-screen relative" style={{ zIndex: 2 }}>
              <Sidebar />
              <main className="flex-1 min-w-0 mobile-bottom-pad pt-14 lg:pt-0">
                <PageTransition>{children}</PageTransition>
              </main>
            </div>
            {/* Mobile bottom tab bar — outside main so it layers above everything */}
            <MobileBottomBar />
          </CommandPaletteProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
