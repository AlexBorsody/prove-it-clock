import HypeExplorer from "@/components/hype-explorer";
import { searchMeta } from "@/lib/search-sections";

export default function HypePage() {
  return (
    <>
      <div className="search-section" {...searchMeta({ id: "hype-overview", title: "HYPE attention", kind: "HYPE", keywords: "news social mentions" })}>
        <h1 className="page-title">HYPE</h1>
        <p className="page-sub">
          Observed attention. Never proof of support or delivery.
        </p>
      </div>
      <HypeExplorer />
    </>
  );
}
