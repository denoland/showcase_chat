/** @jsx h */
/** @jsxFrag Fragment */
import {
  ComponentChildren,
  Fragment,
  h,
  PageProps,
  tw,
} from "../client_deps.ts";
import { getCookies, Handler, HandlerContext } from "../server_deps.ts";
import { database } from "../communication/database.ts";
import Chat from "../islands/Chat.tsx";
import type { MessageView, UserView } from "../communication/types.ts";
import { Page } from "../helpers/Page.tsx";

interface Data {
  messages: MessageView[];
  roomName: string;
  user: UserView;
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
  const user = await database.getUserByAccessTokenOrThrow(accessToken);
  if (isNaN(+ctx.params.room)) {
    return new Response("Invalid room id", { status: 400 });
  }

  const [messages, roomName] = await Promise.all([
    database.getRoomMessages(+ctx.params.room),
    database.getRoomName(+ctx.params.room),
  ]);
  return ctx.render({
    messages,
    roomName,
    user: {
      name: user.userName,
      avatarUrl: user.avatarUrl,
    },
  });
};

export default function Room({ data, params }: PageProps<Data>) {
  return (
    <Page>
      <Chat
        roomId={+params.room}
        initialMessages={data.messages}
        roomName={data.roomName}
        login={data.user}
      />
    </Page>
  );
}
