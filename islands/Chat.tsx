/** @jsx h */
import {
  h,
  tw,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "../client_deps.ts";
import type { MessageView, UserView } from "../communication/types.ts";
import { server } from "../communication/server.ts";

export default function Chat(
  { roomId, initialMessages, login }: {
    roomId: number;
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
        case "isTyping":
          if (typing) {
            clearInterval(typing.interval);
          }
          const interval = setTimeout(() => {
            setTyping(null);
          }, 5000);
          setTyping({ user: msg.from, interval });
          break;
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
    <div className={tw`flex flex-1 h-screen`}>
      <div
        className={tw`mb-20 overflow-y-scroll w-full`}
        ref={messagesContainer}
      >
        {messages.map((msg) => <Message message={msg} />)}
        {typing && (
          <div className={tw`py-0.5 pr-16 pl-4 text-sm text-gray-600`}>
            {typing.user.name} is typing...
          </div>
        )}
      </div>
      <ChatInput
        input={input}
        onInput={(input) => {
          setInput(input);
          server.sendIsTyping(roomId);
        }}
        onSend={send}
      />
    </div>
  );
}

function ChatInput({ input, onInput, onSend }: {
  input: string;
  onInput: (input: string) => void;
  onSend: () => void;
}) {
  return (
    <div
      className={tw
        `flex items-center justify-between border-t border-gray-300 bg-white fixed inset-x-0 bottom-0 p-4 z-40`}
    >
      <input
        type="text"
        placeholder="Message"
        className={tw
          `block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700`}
        value={input}
        onInput={(e) => onInput(e.currentTarget.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <button onClick={onSend}>
        <svg
          className={tw
            `w-5 h-5 text-gray-500 origin-center transform rotate-90`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </div>
  );
}

function Message({ message }: { message: MessageView }) {
  return (
    <div
      className={tw
        `flex py-0.5 pr-16 pl-4 mt-[17px] leading-[22px] hover:bg-gray-950/[.07]`}
    >
      <div
        className={tw
          `overflow-hidden relative mt-0.5 mr-4 w-10 min-w-fit h-10 rounded-full`}
      >
        <img
          src={message.from.avatarUrl}
          alt={`${message.from.name}'s avatar`}
          className={tw`absolute w-full h-full object-cover`}
        />
      </div>
      <div>
        <p className={tw`flex items-baseline`}>
          <span className={tw`mr-2 font-medium`}>
            {message.from.name}
          </span>
        </p>
        <p className={tw`text-gray-800`}>{message.message}</p>
      </div>
    </div>
  );
}
