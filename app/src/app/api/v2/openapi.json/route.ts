import { openApiSpecV2 } from "@/lib/openapi-spec";

/** GET /api/v2/openapi.json — the OpenAPI spec behind the /developers v2 docs. */
export async function GET() {
  return Response.json(openApiSpecV2);
}
