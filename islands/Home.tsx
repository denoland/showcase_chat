/** @jsx h */
import { h, tw, useEffect, useReducer, useState } from "../client_deps.ts";

type UserMessage = {
  message: string;
  login: string;
  avatar_url: string;
};

export default function Home({ data }) {
  const [input, setInput] = useState("");
  const [messages, addMessage] = useReducer<Message[], Message>(
    (msgs, msg) => [...msgs, msg],
    [],
  );

  useEffect(async () => {
    // Get message history
    const msgs = await fetch("/api/history")
      .then((res) => res.json());
    msgs.forEach(({ message, from }) =>
      addMessage({ message, login: from.login, avatar_url: from.avatar_url })
    );

    const events = new EventSource("/api/connect");
    events.addEventListener("message", (e) => {
      addMessage(JSON.parse(e.data));
    });
  }, [data.login]);

  const send = () => {
    fetch("/api/send", {
      method: "POST",
      body: input,
    });
    setInput("");
  };

  return (
    <div>
      <ul className={tw`pb-20`}>
        {messages.map((msg) => <Message message={msg} />)}
      </ul>
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={send}
      />
    </div>
  );
}

function ChatInput({ input, onInput, onSend }) {
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
        onInput={(e) => onInput(e.target.value)}
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

function Message({ message }) {
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
          src={message.avatar_url}
          className={tw`absolute w-full h-full object-cover`}
        />
      </div>
      <div>
        <p className={tw`flex items-baseline`}>
          <span className={tw`mr-2 font-medium`}>
            {message.login}
          </span>
        </p>
        <p className={tw`text-gray-800`}>{message.message}</p>
      </div>
    </div>
  );
}
