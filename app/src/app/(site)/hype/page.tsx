import HypeExplorer from "@/components/hype-explorer";
import { searchMeta } from "@/lib/search-sections";

export default function HypePage() {
  return (
    <>
      <div className="search-section" {...searchMeta({ id: "hype-overview", title: "Hype attention", kind: "Hype", keywords: "news social mentions" })}>
        <h1 className="page-title">Hype</h1>
        <p className="page-sub">
          Observed attention. Never proof of support or delivery.
        </p>
      </div>
      <HypeExplorer />
    </>
  );
}
