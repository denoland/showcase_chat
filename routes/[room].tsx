/** @jsx h */
import { ComponentChildren, h, PageProps, tw } from "../client_deps.ts";
import {
  getCookies,
  Handler,
  HandlerContext,
  supabase,
} from "../server_deps.ts";
import AddRoom from "../islands/AddRoom.tsx";
import Chat, { Message, User } from "../islands/Chat.tsx";

interface Data {
  messages: Message[];
  login: User;
}

export const handler: Handler<Data> = async (
  req: Request,
  ctx: HandlerContext<Data>,
): Promise<Response> => {
  // Get cookie from request header and parse it
  const accessToken = getCookies(req.headers)["deploy_chat_token"];
  if (!accessToken) {
    return Response.redirect(new URL(req.url).origin);
  }
  const login = await supabase
    .from("users")
    .select("login,avatar_url")
    .eq("access_token", accessToken);
  if (login.error) {
    console.log(login.error);
    return new Response(login.error.message, { status: 400 });
  }

  if (isNaN(+ctx.params.room)) {
    return new Response("Invalid room id", { status: 400 });
  }

  const messages = await supabase
    .from("messages")
    .select("message,from(login,avatar_url)")
    .eq("room", +ctx.params.room);
  if (messages.error) {
    console.log(messages.error);
    return new Response(messages.error.message, { status: 400 });
  }

  return ctx.render({ messages: messages.data, login: login.data[0] });
};

export default function Room({ data, params }: PageProps<Data>) {
  return (
    <div>
      <Sidebar>
        <Chat
          room={+params.room}
          initialMessages={data.messages}
          login={data.login}
        />
      </Sidebar>
    </div>
  );
}

function Sidebar({ children }: { children: ComponentChildren }) {
  return (
    <div className={tw`flex h-screen pb-16`}>
      <div
        className={tw
          `flex flex-col flex-shrink-0 h-full px-2 py-4 border-r border-gray-300 inset-y-0 z-10 flex flex-shrink-0 bg-white border-r static`}
      >
        <div
          className={tw
            `flex flex-col items-center justify-center flex-1 space-y-4`}
        >
          <AddRoom />
          <a className={tw`inline-block font-bold tracking-wider`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={tw`h-6 w-6`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </a>
          <div
            className={tw
              `flex flex-col items-center justify-end flex-1 space-y-4`}
          >
            <Link href="/api/logout">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={tw`h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <div className={tw`flex flex-1 h-screen overflow-y-scroll`}>
        {children}
      </div>
    </div>
  );
}

function Header({ children, data }: any) {
  return (
    <ul className={tw`flex p-2 justify-between`}>
      <li className={tw`mr-6`}>
        <a>
          <div
            className={tw
              `flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-full text-green-700 bg-green-100 border border-green-300`}
            style="width: fit-content;"
          >
            <div
              class={tw`text-xs font-normal leading-none flex-initial`}
            >
              Logged in as {data.login}
            </div>
          </div>
        </a>
      </li>
      <li className={tw`mr-2 flex items-center space-x-2`}>
        <Link href="/api/logout">
          Logout
        </Link>
      </li>
    </ul>
  );
}

function Link(
  { children, href }: { href: string; children: ComponentChildren },
) {
  return (
    <a
      href={href}
      className={tw
        `text-sm rounded flex justify-start items-center cursor-pointer`}
    >
      {children}
    </a>
  );
}
