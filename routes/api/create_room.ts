import { HandlerContext, Handlers, supabase } from "../../server_deps.ts";

export const handler: Handlers = {
  POST: async (req: Request, _ctx: HandlerContext): Promise<Response> => {
    const name = await req.text();
    const insert = await supabase.from("rooms").insert([{ name }], {
      upsert: false,
      returning: "representation",
    });

    let id;
    if (insert.error) {
      if (insert.error.code === "23505") {
        const get = await supabase.from("rooms").select("id").eq("name", name);

        if (get.error) {
          console.log(get.error);
          return new Response(get.error.message, { status: 400 });
        } else {
          id = get.data[0].id;
        }
      } else {
        console.log(insert.error);
        return new Response(insert.error.message, { status: 400 });
      }
    } else {
      id = insert.data![0].id;
    }

    return new Response(id, {
      status: 201,
    });
  },
};
