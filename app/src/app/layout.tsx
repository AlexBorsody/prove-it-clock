import type { Metadata } from "next";
import SwRegister from "@/components/sw-register";

export const metadata: Metadata = {
  title: "Prove Value: Crypto Accountability, Evidence-Driven",
  description:
    "Did the project do what it said it would? Hearts earned only while the evidence holds, with the full history on a graph.",
  manifest: "/manifest.webmanifest",
  themeColor: "#0a0e14",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Prove Value" },
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
