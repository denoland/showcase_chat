import { deleteCookie, HandlerContext } from "../../server_deps.ts";

export async function handler(
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> {
  const headers = new Headers({
    "location": new URL(req.url).origin,
  });
  deleteCookie(headers, "deploy_access_token");
  return new Response(null, {
    status: 302,
    headers,
  });
}
