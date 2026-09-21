/**
 * Embed layout: chromeless. The widget is a bare document designed to live
 * inside a third-party iframe — no topbar, no footer, no site stylesheet.
 * All styling is inline in the embed page (explicit palette hexes).
 */
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
