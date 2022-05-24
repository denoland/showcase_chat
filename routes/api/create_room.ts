import { HandlerContext, Handlers } from "../../server_deps.ts";
import { database } from "../../communication/database.ts";

export const handler: Handlers = {
  POST: async (req: Request, _ctx: HandlerContext): Promise<Response> => {
    const name = await req.text();
    const roomId = await database.ensureRoom(name);

    return new Response(roomId, {
      status: 201,
    });
  },
};
