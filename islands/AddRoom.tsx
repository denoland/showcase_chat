/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, IS_BROWSER, tw, useState } from "../client_deps.ts";

type UserMessage = {
  message: string;
  login: string;
  avatar_url: string;
};

function Modal() {
  return (
    <div class={tw`absolute top-0 left-0 w-full`}>
      <div class={tw`relative bg-gray-500 opacity-40 w-full h-screen`}></div>
      <div
        class={tw
          `absolute top-0 left-0 flex justify-center content-center items-center w-full h-screen`}
      >
        <div className={tw`bg-white shadow sm:rounded-lg `}>
          <div className={tw`px-4 py-5 sm:p-6`}>
            <h3 className={tw`text-lg leading-6 font-medium text-gray-900`}>
              Create a room
            </h3>
            <div className={tw`mt-5 sm:flex sm:items-center`}>
              <div className={tw`w-full sm:max-w-xs`}>
                <label htmlFor="roomName" className="sr-only">
                  Room Name
                </label>
                <input
                  type="text"
                  name="roomName"
                  id="roomName"
                  className={tw
                    `shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md`}
                  placeholder="Example"
                />
              </div>
              <button
                type="submit"
                className={tw
                  `mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
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
      {modalIsOpen && <Modal />}
    </>
  );
}
