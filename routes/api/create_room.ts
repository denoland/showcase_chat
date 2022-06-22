import { Handlers } from "$fresh/server.ts";
import { databaseLoader } from "@/communication/database.ts";
import { badWordsCleanerLoader } from "@/helpers/bad_words.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const badWordsCleaner = await badWordsCleanerLoader.getInstance();
    const name = badWordsCleaner.clean(await req.text());
    const database = await databaseLoader.getInstance();
    const roomId = await database.ensureRoom(name);

    return new Response(roomId, {
      status: 201,
    });
  },
};
