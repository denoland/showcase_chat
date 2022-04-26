import { PageConfig } from "../../client_deps.ts";
import { HandlerContext } from "../../server_deps.ts";

export function handler(_req: Request, ctx: HandlerContext): Response {
  const channel = new BroadcastChannel(ctx.params.room);

  const stream = new ReadableStream({
    start: (controller) => {
      channel.onmessage = (e) => {
        const body = `data: ${JSON.stringify(e.data)}\n\n`;
        controller.enqueue(body);
      };
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
