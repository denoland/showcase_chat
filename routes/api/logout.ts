import { deleteCookie, HandlerContext } from "../../server_deps.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const response = Response.redirect(new URL(req.url).origin);
  deleteCookie(response.headers, "deploy_access_token");
  return response;
};
