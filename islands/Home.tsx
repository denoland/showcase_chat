/** @jsx h */
import { h } from "../client_deps.ts";

export default function Home({ data }) {
  if (!data.login) {
    return <a href="/api/login">Login with Github</a>;
  }

  return (
    <div>
      <p>hi {data.login}</p>
      <img src={data.avatar_url} />
    </div>
  );
}
