"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

/** Swagger UI docs for the public v1 API, client-rendered. */
export default function ApiDocs() {
  return (
    <div className="api-docs">
      <SwaggerUI url="/api/v1/openapi.json" />
    </div>
  );
}
