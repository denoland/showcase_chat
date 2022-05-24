import { supabase } from "../server_deps.ts";
import type { MessageView } from "./types.ts";

export interface DatabaseUser {
  userId: number;
  userName: string;
  avatarUrl: string;
}

export class Database {
  #client: supabase.SupabaseClient;

  constructor(client?: supabase.SupabaseClient) {
    this.#client = client ?? supabase.createClient(
      Deno.env.get("SUPABASE_API_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
  }

  async insertUser(user: DatabaseUser & { accessToken: string }) {
    const { error } = await this.#client
      .from("users")
      .upsert([
        {
          login: user.userName,
          id: user.userId,
          avatar_url: user.avatarUrl,
          access_token: user.accessToken,
        },
      ], { returning: "minimal" });
    if (error) {
      throw new Error(error.message);
    }
  }

  async getUserByAccessTokenOrThrow(
    accessToken: string,
  ): Promise<DatabaseUser> {
    const user = await this.getUserByAccessToken(accessToken);
    if (user == null) {
      throw new Error("Could not find user with access token.");
    }
    return user;
  }

  async getUserByAccessToken(
    accessToken: string,
  ): Promise<DatabaseUser | undefined> {
    const { data, error } = await this.#client
      .from("users")
      .select("id,login,avatar_url")
      .eq("access_token", accessToken);
    if (error) {
      throw new Error(error.message);
    }
    if (data.length === 0) {
      return undefined;
    }
    return {
      userId: data[0].id,
      userName: data[0].login,
      avatarUrl: data[0].avatar_url,
    };
  }

  async getRooms() {
    const { data, error } = await this.#client.from("rooms_with_activity")
      .select(
        "id,name,last_message_at",
      );
    if (error) {
      throw new Error(error.message);
    }
    return data.map((d) => ({
      roomId: d.id,
      name: d.name,
      lastMessageAt: d.last_message_at,
    }));
  }

  async ensureRoom(name: string) {
    const insert = await this.#client.from("rooms").insert([{ name }], {
      upsert: false,
      returning: "representation",
    });

    if (insert.error) {
      if (insert.error.code !== "23505") {
        throw new Error(insert.error.message);
      }
      const get = await this.#client.from("rooms").select("id").eq(
        "name",
        name,
      );
      if (get.error) {
        throw new Error(get.error.message);
      }
      return get.data[0].id;
    }

    return insert.data![0].id;
  }

  async insertMessage(
    message: { text: string; roomId: number; userId: number },
  ) {
    await this.#client
      .from("messages")
      .insert([{
        message: message.text,
        room: message.roomId,
        from: message.userId,
      }], { returning: "minimal" });
  }

  async getRoomMessages(roomId: number): Promise<MessageView[]> {
    const { data, error } = await this.#client
      .from("messages")
      .select("message,from(login,avatar_url)")
      .eq("room", roomId);
    if (error) {
      throw new Error(error.message);
    }
    return data.map((m) => ({
      message: m.message,
      from: {
        name: m.from.login,
        avatarUrl: m.from.avatar_url,
      },
    }));
  }
}

export const database = new Database();
