import { HandlerContext } from "../../server_deps.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const channel = new BroadcastChannel("test");
  channel.postMessage("hello");
  channel.close();
  return new Response("ok");
};
