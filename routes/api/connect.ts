import { Handlers, RouteConfig } from "$fresh/server.ts";
import { RoomChannel } from "@/communication/channel.ts";

export const handler: Handlers = {
  GET(_req, ctx) {
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
  },
};

export const config: RouteConfig = {
  routeOverride: "/api/connect/:room",
};
