import type { Metadata } from "next";
import ApiDocs from "@/components/api-docs";
import { openApiSpec, openApiSpecV2 } from "@/lib/openapi-spec";
import { searchMeta } from "@/lib/search-sections";

export const metadata: Metadata = {
  title: "API Docs",
  description: "Prove Value API: three-meter verdicts, per-category rankings, the promise ledger, and supporting context.",
};

export default function DevelopersPage() {
  return (
    <>
      <div className="search-section" {...searchMeta({ id: "developers-overview", title: "Prove Value API", kind: "API", keywords: "OpenAPI developer scores endpoints" })}>
      <h1 className="page-title">API</h1>
      <p className="page-sub">
        Read-only promise records and verdicts, free to use.
        Try every endpoint live below.
      </p>
      </div>
      <div className="panel">
        <h2>v2 endpoints</h2>
        <p className="panel-sub">
          The three-meter contract: weighted verdicts, per-category rankings behind
          the reviewed-weight availability gate, the promise ledger with evidence,
          and the methodology record. Spec at <code>/api/v2/openapi.json</code>.
        </p>
        {Object.entries(openApiSpecV2.paths).map(([path, operations]) => (
          <section
            key={path}
            className="search-section"
            {...searchMeta({
              id: `developers-v2-get-${path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
              title: `GET /api/v2${path}: ${operations.get.summary}`,
              kind: "API",
              keywords: `OpenAPI v2 ${path}`,
            })}
          >
            <h3><code>GET /api/v2{path}</code></h3>
            <p><strong>{operations.get.summary}</strong></p>
            <p>{operations.get.description}</p>
          </section>
        ))}
      </div>
      <div className="panel">
        <h2>v1 endpoints</h2>
        <p className="panel-sub">
          Legacy read-only endpoints for promises, CODE, and HYPE. Spec at{" "}
          <code>/api/v1/openapi.json</code>.
        </p>
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
