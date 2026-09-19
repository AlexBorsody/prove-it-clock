import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static-friendly: the leaderboard and project pages render from JSON
  // snapshots at build/request time. No upstream API calls from page loads.
  // Project detail pages read data/*.json + methodology/*.json from disk at
  // request time (SupabaseStore delegates seed reads to JsonFileStore), so
  // trace those files into the serverless function bundle on Vercel.
  outputFileTracingIncludes: {
    "/": ["./data/**/*", "./methodology/**/*"],
    "/projects/[slug]": ["./data/**/*", "./methodology/**/*"],
    "/methodology": ["./methodology/**/*"],
  },
};

export default nextConfig;
