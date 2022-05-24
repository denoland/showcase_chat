import { PageConfig } from "../../client_deps.ts";
import { RoomChannel } from "../../communication/channel.ts";
import { HandlerContext } from "../../server_deps.ts";

export function handler(_req: Request, ctx: HandlerContext): Response {
  const channel = new RoomChannel(+ctx.params.room);

  const stream = new ReadableStream({
    start: (controller) => {
      channel.onMessage((message) => {
        const body = `data: ${JSON.stringify(message)}\n\n`;
        controller.enqueue(body);
      });
    },
    cancel() {
      channel.close();
    },
  });

  return new Response(stream.pipeThrough(new TextEncoderStream()), {
    headers: { "content-type": "text/event-stream" },
  });
}

export const config: PageConfig = {
  routeOverride: "/api/connect/:room",
};
