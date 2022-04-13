import {
  createOAuthUserAuth,
  getCookies,
  HandlerContext,
  setCookie,
  supabase,
} from "../server_deps.ts";
import Home from "../islands/Home.tsx";

export const handler = async (
  req: Request,
  ctx: HandlerContext,
): Promise<Response> => {
  // Get cookie from request header and parse it
  const maybeAccessToken = getCookies(req.headers)["deploy_chat_token"];
  if (maybeAccessToken) {
    const { data, error } = await supabase
      .from("users")
      .select("login,avatar_url")
      .eq("access_token", maybeAccessToken);
    if (error) {
      console.log(error);
      return new Response(error.message, { status: 400 });
    }

    return ctx.render(data[0]);
  }

  // This is an oauth callback request.
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return ctx.render({});
  }

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
    return ctx.render({});
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
        access_token,
      },
    ], { upsert: true, returning: "minimal" });
  if (error) {
    console.log(error);
    return new Response(error.message, { status: 400 });
  }
  const response = ctx.render({ login, avatar_url });
  setCookie(response.headers, {
    name: "deploy_chat_token",
    value: access_token,
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
  });
  return response;
};

export default Home;
