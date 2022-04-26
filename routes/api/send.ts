import { getCookies, HandlerContext, emojify, supabase } from "../../server_deps.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const accessToken = getCookies(req.headers)["deploy_chat_token"];
  if (!accessToken) {
    return new Response("Not signed in", { status: 401 });
  }
  const { data, error } = await supabase
    .from("users")
    .select("id,login,avatar_url")
    .eq("access_token", accessToken);
  if (error) {
    return new Response(error.message, { status: 400 });
  }

  const { login, id, avatar_url } = data[0];
  let { isTyping, message, room } = await req.json();
  message = emojify(message);
  const channel = new BroadcastChannel(room);
  if (isTyping) {
    // Send `is typing...` indicator.
    channel.postMessage({ isTyping, from: { login, avatar_url } });
    channel.close();
    return new Response("OK");
  }

  channel.postMessage({ message, from: { login, avatar_url } });
  channel.close();

  await supabase
    .from("messages")
    .insert([{
      message,
      room,
      from: id,
    }], { returning: "minimal" });

  return new Response("OK");
};
