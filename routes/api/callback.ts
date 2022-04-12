import {
  createOAuthUserAuth,
  HandlerContext,
  supabase,
} from "../../server_deps.ts";

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const request = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: JSON.stringify({
      client_id: Deno.env.get("CLIENT_ID"),
      client_secret: Deno.env.get("CLIENT_SECRET"),
      code,
    }),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  });
  const { access_token, scope } = await request.json();

  if (!access_token) {
    return new Response("Bad Request", { status: 400 });
  }

  // Get user info
  const userInfoRequest = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${access_token}`,
    },
  });
  const { login, id, avatar_url } = await userInfoRequest.json();

  // Insert user into database
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        login,
        id,
        avatar_url,
      },
    ], { upsert: true, returning: "minimal" });
  if (error) {
    console.log(error);
    return new Response(error.message, { status: 400 });
  }

  console.log(data);
  return new Response(`Welcome ${login}!`, { status: 200 });
};
