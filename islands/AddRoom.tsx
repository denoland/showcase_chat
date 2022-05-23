/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, IS_BROWSER, tw, useState } from "../client_deps.ts";

function Modal({ close }: { close: () => void }) {
  const [roomName, setRoomName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div>
      <div
        class={tw`fixed top-0 left-0 bg-gray-500 opacity-40 w-full h-screen`}
      />
      <div
        class={tw
          `fixed top-0 left-0 flex justify-center content-center items-center w-full h-screen`}
      >
        {submitting
          ? (
            <div
              className={tw
                `inline-flex px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md bg-gray-100 hover:bg-gray-200 transition ease-in-out duration-150 cursor-not-allowed`}
            >
              <svg
                className={tw`animate-spin -ml-1 mr-3 h-5 w-5`}
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className={tw`opacity-25`}
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  className={tw`opacity-75`}
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                >
                </path>
              </svg>
              Creating Room...
            </div>
          )
          : (
            <div className={tw`bg-white shadow sm:rounded-lg`}>
              <div className={tw`px-4 py-5 sm:p-6`}>
                <h3 className={tw`text-lg leading-6 font-medium text-gray-900`}>
                  Create a room
                </h3>
                <div className={tw`mt-5 sm:flex sm:items-center`}>
                  <div className={tw`w-full sm:max-w-xs`}>
                    <label htmlFor="roomName" className={tw`sr-only`}>
                      Room Name
                    </label>
                    <input
                      type="text"
                      name="roomName"
                      id="roomName"
                      value={roomName}
                      onChange={(e) => setRoomName(e.currentTarget.value)}
                      className={tw
                        `shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md`}
                      placeholder="Example"
                    />
                  </div>
                  <button
                    className={tw
                      `mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
                    onClick={async () => {
                      console.log(
                        new URL("/api/create_room", location.origin).href,
                      );
                      const create = fetch(
                        new URL("/api/create_room", location.origin).href,
                        {
                          method: "POST",
                          body: roomName,
                        },
                      );
                      setSubmitting(true);
                      const res = await create;
                      console.log(res);
                      close();
                      location.pathname = "/" + await res.text();
                    }}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default function AddRoom() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  return (
    <>
      <button
        className={tw`inline-block text-xl font-bold tracking-wider`}
        onClick={() => setModalIsOpen(true)}
        disabled={!IS_BROWSER}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={tw`h-6 w-6`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
      {modalIsOpen && <Modal close={() => setModalIsOpen(false)} />}
    </>
  );
}
