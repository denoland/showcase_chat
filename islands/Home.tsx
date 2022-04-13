/** @jsx h */
import { h, tw, useEffect, useReducer, useState } from "../client_deps.ts";

type UserMessage = {
  message: string;
  login: string;
  avatar_url: string;
};

export default function Home({ data }) {
  if (!data?.login) {
    return (
      <div
        className={tw`min-h-screen flex justify-center items-center flex-col`}
      >
        <a
          href="/api/login"
          className={tw
            `bg-gray-900 text-gray-100 hover:text-white shadow font-bold text-sm py-3 px-4 rounded flex justify-start items-center cursor-pointer mt-2`}
        >
          <svg
            viewBox="0 0 24 24"
            className={tw`fill-current mr-4 w-6 h-6`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <span>Sign up with Github</span>
        </a>
      </div>
    );
  }

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
          <a
            href="/api/logout"
            className={tw
              `text-sm rounded flex justify-start items-center cursor-pointer`}
          >
            Logout
          </a>
        </li>
      </ul>
      <ul className={tw`pb-20`}>
        {messages.map((msg) => <Message message={msg} />)}
      </ul>

      <div
        className={tw
          `flex items-center justify-between border-t border-gray-300 bg-white fixed inset-x-0 bottom-0 p-4`}
      >
        <input
          type="text"
          placeholder="Message"
          className={tw
            `block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700`}
          value={input}
          onInput={(e) => setInput(e.target.value)}
        />
        <button onClick={send}>
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
