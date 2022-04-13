import { HandlerContext } from "../../server_deps.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const channel = new BroadcastChannel("test");

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
};
