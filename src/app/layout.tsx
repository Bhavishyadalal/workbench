import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Toolbox — Every tool you keep googling, in one place",
  description:
    "Compress images, merge PDFs, convert units, format JSON, and more — all in your browser, nothing uploaded.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <div className="grid-texture" />
        <div className="grain" />
        <div className="flex min-h-screen relative" style={{ zIndex: 2 }}>
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
