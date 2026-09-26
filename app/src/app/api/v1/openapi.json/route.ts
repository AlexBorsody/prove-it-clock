import { openApiSpec } from "@/lib/openapi-spec";

/** GET /api/v1/openapi.json — the OpenAPI spec behind the /developers docs. */
export async function GET() {
  return Response.json(openApiSpec);
}
