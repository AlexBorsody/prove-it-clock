import { NextResponse } from "next/server";

/**
 * The /embed/* widget routes are designed to be iframed by third parties.
 * Strip X-Frame-Options there even if a global header is added later.
 * Scoped by matcher to embed routes only — the rest of the site is untouched.
 */
export function middleware() {
  const res = NextResponse.next();
  res.headers.delete("x-frame-options");
  return res;
}

export const config = {
  matcher: "/embed/:path*",
};
