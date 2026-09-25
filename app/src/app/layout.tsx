import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prove-It — Crypto Accountability, Evidence-Driven",
  description:
    "Did the project do what it said it would? Hearts earned only while the evidence holds, with the full history on a graph.",
};

/**
 * Root layout: intentionally bare. Site chrome lives in `(site)/layout.tsx`;
 * the embeddable widget lives in `(embed)/layout.tsx`. Route groups share the
 * URL space, so no public URL changes.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
