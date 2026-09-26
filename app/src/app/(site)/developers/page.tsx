import type { Metadata } from "next";
import ApiDocs from "@/components/api-docs";
import { openApiSpec } from "@/lib/openapi-spec";
import { searchMeta } from "@/lib/search-sections";

export const metadata: Metadata = {
  title: "API Docs",
  description: "Prove Value Scores API: read-only endpoints for hearts, the Shitcoin warning dial, CODE, and HYPE.",
};

export default function DevelopersPage() {
  return (
    <>
      <div className="search-section" {...searchMeta({ id: "developers-overview", title: "Prove Value API", kind: "API", keywords: "OpenAPI developer scores endpoints" })}>
      <h1 className="page-title">API</h1>
      <p className="page-sub">
        Read-only scores, free to use. Hearts are earned only; the Shitcoin warning dial reads
        1-10. Try every endpoint live below.
      </p>
      </div>
      <div className="panel">
        <h2>Endpoints</h2>
        {Object.entries(openApiSpec.paths).map(([path, operations]) => (
          <section
            key={path}
            className="search-section"
            {...searchMeta({
              id: `developers-get-${path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
              title: `GET /api/v1${path}: ${operations.get.summary}`,
              kind: "API",
              keywords: `OpenAPI ${operations.get.parameters.map((parameter) => parameter.name).join(" ")}`,
            })}
          >
            <h3><code>GET /api/v1{path}</code></h3>
            <p><strong>{operations.get.summary}</strong></p>
            <p>{operations.get.description}</p>
          </section>
        ))}
      </div>
      <div data-search-ignore="true"><ApiDocs /></div>
    </>
  );
}
