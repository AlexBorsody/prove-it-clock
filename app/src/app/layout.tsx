import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Prove-It Clock — Crypto Accountability, Evidence-Driven",
  description:
    "Measuring the distance between crypto's promises and reality. Versioned, evidence-traceable project scores.",
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
