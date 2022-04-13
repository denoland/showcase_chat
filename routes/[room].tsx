/** @jsx h */
import { h } from "../client_deps.ts";
import { getCookies, HandlerContext, supabase } from "../server_deps.ts";

export const handler = async (
  req: Request,
  ctx: HandlerContext,
): Promise<Response> => {
  // Get cookie from request header and parse it
  const accessToken = getCookies(req.headers)["deploy_chat_token"];
  if (!accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { room } = ctx.params;
  // TBD
};
