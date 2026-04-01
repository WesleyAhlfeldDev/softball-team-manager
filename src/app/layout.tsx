import type { Metadata, Viewport } from "next";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/app/globals.css";
// Initialise the FA library (registers all icons)
import "@/lib/fontawesome";

export const metadata: Metadata = {
  title: {
    default: "Team Manager",
    template: "%s | Team Manager",
  },
  description: "Manage your team roster, schedule, lineup, and live scorebook.",
  robots: { index: false, follow: false }, // private app — no indexing
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // prevent zoom on number tap in scorebook
  themeColor: "#07070f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-surface-bg)] text-[var(--color-text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
