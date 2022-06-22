/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { tw } from "@twind";
import { HandlerContext, PageProps } from "$fresh/server.ts";
import twas from "twas";
import { getCookies, setCookie } from "$std/http/cookie.ts";
import { databaseLoader } from "@/communication/database.ts";
import { gitHubApi } from "@/communication/github.ts";
import { Footer } from "@/helpers/Footer.tsx";
import type { RoomView } from "@/communication/types.ts";

export async function handler(
  req: Request,
  ctx: HandlerContext,
): Promise<Response> {
  // Get cookie from request header and parse it
  const maybeAccessToken = getCookies(req.headers)["deploy_chat_token"];
  const database = await databaseLoader.getInstance();
  if (maybeAccessToken) {
    const user = await database.getUserByAccessToken(maybeAccessToken);
    if (user) {
      return ctx.render({ rooms: await database.getRooms() });
    }
  }

  // This is an oauth callback request.
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return ctx.render(false);
  }

  const accessToken = await gitHubApi.getAccessToken(code);
  const userData = await gitHubApi.getUserData(accessToken);

  await database.insertUser({
    userId: userData.userId,
    userName: userData.userName,
    accessToken,
    avatarUrl: userData.avatarUrl,
  });

  const response = await ctx.render({
    rooms: await database.getRooms(),
  });
  setCookie(response.headers, {
    name: "deploy_chat_token",
    value: accessToken,
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
  });
  return response;
}

export default function Main({ url, data }: PageProps<{ rooms: RoomView[] }>) {
  return (
    <>
      <img
        src="/background.png"
        alt="bg"
        class={tw`absolute top-0 left-0 w-full min-h-screen -z-10 bg-gray-900`}
      />
      <div class={tw`flex justify-center items-center h-screen text-gray-600`}>
        <div>
          <div class={tw`mb-16 mx-8 text-center`}>
            <img
              class={tw`h-24 mx-auto mb-6`}
              src="/logo.svg"
              alt="Deno Logo"
            />
            <span class={tw`block text-3xl font-bold text-black mb-3`}>
              Deno Chat
            </span>
            <span class={tw`block text-lg -mb-1.5`}>
              A minimal chat platform template.
            </span>
            <span class={tw`block text-lg`}>
              It uses{" "}
              <a
                class={tw`font-bold underline`}
                href="https://fresh.deno.dev"
                rel="noopener noreferrer"
                target="_blank"
              >
                Fresh
              </a>
              {" + "}
              <a
                class={tw`font-bold underline`}
                href="https://supabase.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                Supabase
              </a>
              {" + "}
              <a
                class={tw`font-bold underline`}
                href="https://twind.dev/"
                rel="noopener noreferrer"
                target="_blank"
              >
                twind
              </a>
              {" + "}
              <a
                class={tw`font-bold underline`}
                href="https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API"
                rel="noopener noreferrer"
                target="_blank"
              >
                Broadcast Channel API
              </a>{" "}
              on Deno Deploy.
            </span>
          </div>
          {data
            ? (
              <ul
                role="list"
                class={tw`max-h-[21.375rem] overflow-y-scroll space-y-4.5`}
              >
                <li>
                  <a
                    href="/new"
                    class={tw
                      `flex justify-center items-center bg-white rounded-full h-18 border-2 border-gray-300`}
                  >
                    <div
                      class={tw
                        `w-8 h-8 flex justify-center items-center mr-2.5`}
                    >
                      <img src="/plus.svg" alt="Plus" />
                    </div>
                    <span class={tw`text-xl font-bold text-gray-900`}>
                      New Room
                    </span>
                  </a>
                </li>

                {data.rooms.map((room) => {
                  return (
                    <li key={room.roomId}>
                      <a
                        href={new URL(room.roomId.toString(), url).href}
                        class={tw
                          `grid grid-cols-3 items-center bg-white rounded-full h-18 border-2 border-gray-300`}
                      >
                        <div />
                        <p
                          class={tw
                            `text-xl font-bold text-gray-900 justify-self-center`}
                        >
                          {room.name}
                        </p>
                        <p
                          class={tw
                            `font-medium text-gray-400 mr-8 justify-self-end`}
                        >
                          {room.lastMessageAt
                            ? twas(new Date(room.lastMessageAt).getTime())
                            : "No messages"}
                        </p>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )
            : (
              <div class={tw`flex justify-center items-center flex-col`}>
                <a
                  href="/api/login"
                  class={tw
                    `bg-gray-900 text-gray-100 hover:text-white shadow font-bold text-sm py-3 px-4 rounded flex justify-start items-center cursor-pointer mt-2`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    class={tw`fill-current mr-4 w-6 h-6`}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  <span>Sign up with Github</span>
                </a>
              </div>
            )}
          <Footer />
        </div>
      </div>
    </>
  );
}
