import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Review pages read the repository's shared editorial Markdown at build time.
  outputFileTracingRoot: path.join(process.cwd(), ".."),
  outputFileTracingIncludes: {
    "/case-studies": ["../docs/archive/case-studies-2026-09-25/*.md"],
    "/case-studies/*": ["../docs/archive/case-studies-2026-09-25/*.md", "../docs/implementation.md"],
  },
};

export default nextConfig;
