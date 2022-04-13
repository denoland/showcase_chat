import { HandlerContext } from "../../server_deps.ts";

export const handler = async (
  req: Request,
  ctx: HandlerContext,
): Promise<Response> => {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", Deno.env.get("CLIENT_ID") || "");
  url.searchParams.set("redirect_uri", new URL(req.url).origin);
  return Response.redirect(url, 302);
};
