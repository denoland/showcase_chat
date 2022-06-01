/** @jsx h */
/** @jsxFrag Fragment */
import {
  Fragment,
  h,
  tw,
  twas,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "../client_deps.ts";
import type { MessageView, UserView } from "../communication/types.ts";
import { server } from "../communication/server.ts";

export default function Chat(
  { roomId, roomName, initialMessages, login }: {
    roomId: number;
    roomName: string;
    initialMessages: MessageView[];
    login: UserView;
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
  }, [login]);

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
    <div
      class={tw
        `flex flex-col justify-center items-center w-full h-screen children:(w-1/2 bg-[#F9F9F9] border-1 border-gray-300)`}
    >
      <div class={tw`h-2/3 rounded-2xl mb-5 pl-6 flex flex-col pt-4 pb-2`}>
        <div
          class={tw
            `h-8 flex-none pl-1 pr-7 mb-16 flex justify-between items-center`}
        >
          <a href="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="12"
              viewBox="0 0 18 12"
              fill="none"
            >
              <path
                d="M5.29999 11.3L0.699988 6.70002C0.599988 6.60002 0.529321 6.49169 0.487988 6.37502C0.445988 6.25836 0.424988 6.13336 0.424988 6.00002C0.424988 5.86669 0.445988 5.74169 0.487988 5.62502C0.529321 5.50836 0.599988 5.40002 0.699988 5.30002L5.32499 0.675025C5.50832 0.491691 5.73332 0.400024 5.99999 0.400024C6.26665 0.400024 6.49999 0.500024 6.69999 0.700024C6.88332 0.883357 6.97499 1.11669 6.97499 1.40002C6.97499 1.68336 6.88332 1.91669 6.69999 2.10002L3.79999 5.00002H17C17.2833 5.00002 17.5207 5.09569 17.712 5.28702C17.904 5.47902 18 5.71669 18 6.00002C18 6.28336 17.904 6.52069 17.712 6.71202C17.5207 6.90402 17.2833 7.00002 17 7.00002H3.79999L6.72499 9.92502C6.90832 10.1084 6.99999 10.3334 6.99999 10.6C6.99999 10.8667 6.89999 11.1 6.69999 11.3C6.51665 11.4834 6.28332 11.575 5.99999 11.575C5.71665 11.575 5.48332 11.4834 5.29999 11.3Z"
                fill="#999999"
              />
            </svg>
          </a>
          <div class={tw`font-medium text-lg`}>{roomName}</div>
          <div />
        </div>

        <div class={tw`flex-auto overflow-y-scroll`} ref={messagesContainer}>
          {messages.map((msg) => <Message message={msg} />)}
        </div>

        <div class={tw`h-6 mt-1`}>
          {typing && (
            <div className={tw`text-sm text-gray-400`}>
              <span className={tw`text-gray-800`}>{typing.user.name}</span>{" "}
              is typing...
            </div>
          )}
        </div>
      </div>
      <div class={tw`h-16 flex-none rounded-full flex items-center`}>
        <ChatInput
          input={input}
          onInput={(input) => {
            setInput(input);
            server.sendIsTyping(roomId);
          }}
          onSend={send}
        />
      </div>
    </div>
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
    <div class={tw`flex mb-[17px]`}>
      <img
        src={message.from.avatarUrl}
        alt={`${message.from.name}'s avatar`}
        className={tw`mr-4 w-9 h-9 rounded-full`}
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
