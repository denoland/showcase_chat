/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { tw } from "@twind";
import { server } from "@/communication/server.ts";

export default function AddRoom() {
  const [roomName, setRoomName] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const create = server.createRoom(roomName);
        try {
          const roomId = await create;
          location.pathname = "/" + roomId;
        } catch (err) {
          alert(`Cannot create room: ${err.message}`);
        }
      }}
    >
      <label>
        <div class={tw`mb-2.5`}>
          <p class={tw`font-semibold`}>Name</p>
          <p class={tw`font-medium text-xs text-gray-500`}>
            The name of the chat room.
          </p>
        </div>
        <input
          class={tw`w-96 h-9 rounded-md border border-gray-300 pl-3.5`}
          type="text"
          name="roomName"
          id="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.currentTarget.value)}
        />
      </label>
      <button
        class={tw
          `mt-7 flex flex items-center rounded-md h-8 py-2 px-4 bg-gray-800 font-medium text-sm text-white`}
        type="submit"
      >
        create
      </button>
    </form>
  );
}
