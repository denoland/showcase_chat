/** @jsx h */
import { h, useEffect, useReducer, useState } from "../client_deps.ts";

export default function Home({ data }) {
  if (!data?.login) {
    return <a href="/api/login">Login with Github</a>;
  }

  const [input, setInput] = useState("");
  const [messages, addMessage] = useReducer<string[], string>(
    (msgs, msg) => [...msgs, msg],
    [],
  );

  useEffect(async () => {
    // Get message history
    const msgs = await fetch("/api/history")
      .then((res) => res.json());
    msgs.forEach(({ message, from }) =>
      addMessage(`${from.login}: ${message}`)
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
      <p>hi {data.login}</p>
      <img src={data.avatar_url} />
      <br />
      <input
        type="text"
        value={input}
        onInput={(e) => setInput(e.target.value)}
      />
      <button onClick={send}>Send</button>
      <ul>
        {messages.map((msg) => <li>{msg}</li>)}
      </ul>
    </div>
  );
}
