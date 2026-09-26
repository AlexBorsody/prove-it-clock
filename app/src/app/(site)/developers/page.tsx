import type { Metadata } from "next";
import ApiDocs from "@/components/api-docs";

export const metadata: Metadata = {
  title: "API Docs",
  description: "Prove-It Scores API: read-only endpoints for hearts, the Shitcoin warning dial, CODE, and HYPE.",
};

export default function DevelopersPage() {
  return (
    <>
      <h1 className="page-title">API</h1>
      <p className="page-sub">
        Read-only scores, free to use. Hearts are earned only; the Shitcoin warning dial reads
        1-10. Try every endpoint live below.
      </p>
      <ApiDocs />
    </>
  );
}
