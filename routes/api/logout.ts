import { deleteCookie } from "../../server_deps.ts";

export function handler(req: Request): Response {
  const headers = new Headers({
    "location": new URL(req.url).origin,
  });
  deleteCookie(headers, "deploy_access_token");
  return new Response(null, {
    status: 302,
    headers,
  });
}
