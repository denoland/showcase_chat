## `showcase_chat`

A minimal chat platform template. It uses [Fresh](https://fresh.deno.dev) +
[Supabase](https://supabase.io) + [twind](https://twind.dev) +
[BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
on Deno Deploy.

To get started, setup your `.env` with Supabase and Github OAuth credentials:

```
CLIENT_ID=abc
CLIENT_SECRET=abc123
SUPABASE_DB_PASSWORD=xyz123
SUPABASE_ANON_KEY=xyz
```

and fire up the server:

```
deno run -A --no-check main.ts
```
