import type { Metadata } from "next";
import SwRegister from "@/components/sw-register";

export const metadata: Metadata = {
  title: "Bubble or Build: Crypto Accountability, Evidence-Driven",
  description:
    "Did the project do what it said it would? Promises count only while the evidence holds, with the full history on a graph.",
  metadataBase: new URL("https://bubbleorbuild.com"),
  applicationName: "Bubble or Build",
  openGraph: {
    title: "Bubble or Build: Crypto Accountability, Evidence-Driven",
    description: "Did the project do what it said it would? Follow the promises, evidence, and outcomes.",
    siteName: "Bubble or Build",
    type: "website",
    images: [{ url: "/icons/pwa/icon-512.png", width: 512, height: 512, alt: "Bubble or Build logo" }],
  },
  twitter: {
    card: "summary",
    title: "Bubble or Build: Crypto Accountability, Evidence-Driven",
    description: "Did the project do what it said it would? Follow the promises, evidence, and outcomes.",
    images: [{ url: "/icons/pwa/icon-512.png", alt: "Bubble or Build logo" }],
  },
  manifest: "/manifest.webmanifest",
  themeColor: "#0a0e14",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Bubble or Build" },
  icons: {
    icon: [
      { url: "/icons/pwa/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/pwa/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/pwa/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

/**
 * Root layout: intentionally bare. Site chrome lives in `(site)/layout.tsx`;
 * the embeddable widget lives in `(embed)/layout.tsx`. Route groups share the
 * URL space, so no public URL changes.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
