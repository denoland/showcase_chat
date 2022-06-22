/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h } from "preact";
import { useEffect, useReducer, useRef, useState } from "preact/hooks";
import { tw } from "@twind";
import twas from "twas";
import type { MessageView, UserView } from "../communication/types.ts";
import { server } from "@/communication/server.ts";

export default function Chat(
  { roomId, roomName, initialMessages, user }: {
    roomId: number;
    roomName: string;
    initialMessages: MessageView[];
    user: UserView;
  },
) {
  const messagesContainer = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [messages, addMessage] = useReducer<MessageView[], MessageView>(
    (msgs, msg) => [...msgs, msg],
    initialMessages,
  );
  const [typing, setTyping] = useState<
    { user: UserView; interval: number } | null
  >(null);

  useEffect(() => {
    Notification.requestPermission();

    const subscription = server.subscribeMessages(roomId, (msg) => {
      switch (msg.kind) {
        case "isTyping": {
          if (typing) {
            clearInterval(typing.interval);
          }
          const interval = setTimeout(() => {
            setTyping(null);
          }, 5000);
          setTyping({
            user: msg.from,
            interval,
          });
          break;
        }
        case "text":
          addMessage(msg);
          new Notification(`New message from ${msg.from.name}`, {
            body: msg.message,
            icon: msg.from.avatarUrl,
          });
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    const container = messagesContainer.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length]);

  const send = () => {
    if (input === "") {
      return;
    }
    server.sendMessage(roomId, input);
    setInput("");
  };

  return (
    <>
      <div
        class={tw`w-1/2 h-2/3 rounded-2xl mb-5 pl-6 flex flex-col pt-4 pb-2`}
      >
        <div
          class={tw
            `h-8 flex-none pl-1 pr-7 mb-16 flex justify-between items-center`}
        >
          <a href="/">
            <img src="/arrow.svg" alt="Left Arrow" />
          </a>
          <div class={tw`font-medium text-lg`}>{roomName}</div>
          <div />
        </div>

        <div
          class={tw`flex-auto overflow-y-scroll`}
          ref={messagesContainer}
        >
          {messages.map((msg) => <Message message={msg} />)}
        </div>

        <div class={tw`h-6 mt-1`}>
          {typing && (
            <div class={tw`text-sm text-gray-400`}>
              <span class={tw`text-gray-800`}>{typing.user.name}</span>{" "}
              is typing...
            </div>
          )}
        </div>
      </div>
      <div class={tw`w-1/2 h-16 flex-none rounded-full flex items-center`}>
        <ChatInput
          input={input}
          onInput={(input) => {
            setInput(input);
            server.sendIsTyping(roomId);
          }}
          onSend={send}
        />
      </div>
    </>
  );
}

function ChatInput({ input, onInput, onSend }: {
  input: string;
  onInput: (input: string) => void;
  onSend: () => void;
}) {
  return (
    <>
      <input
        type="text"
        placeholder="Message"
        class={tw
          `block mx-6 w-full bg-transparent outline-none focus:text-gray-700`}
        value={input}
        onInput={(e) => onInput(e.currentTarget.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <button onClick={onSend}>
        <svg
          class={tw
            `w-5 h-5 text-gray-500 origin-center transform rotate-90 mr-6`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </>
  );
}

function Message({ message }: { message: MessageView }) {
  return (
    <div class={tw`flex mb-4.5`}>
      <img
        src={message.from.avatarUrl}
        alt={`${message.from.name}'s avatar`}
        class={tw`mr-4 w-9 h-9 rounded-full`}
      />
      <div>
        <p class={tw`flex items-baseline mb-1.5`}>
          <span class={tw`mr-2 font-bold`}>
            {message.from.name}
          </span>
          <span class={tw`text-xs text-gray-400 font-extralight`}>
            {twas(new Date(message.createdAt).getTime())}
          </span>
        </p>
        <p class={tw`text-sm text-gray-800`}>{message.message}</p>
      </div>
    </div>
  );
}
