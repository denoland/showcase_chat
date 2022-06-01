/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, tw } from "../client_deps.ts";
import { Page } from "../helpers/Page.tsx";
import AddRoom from "../islands/AddRoom.tsx";

export default function NewRoom() {
  return (
    <Page>
      <div class={tw`rounded-2xl w-5/12 pt-4 pb-8 px-7`}>
        <div class={tw`h-8 flex-none flex justify-between items-center mb-9`}>
          <a href="/">
            <img src="/arrow.svg" alt="Left Arrow" />
          </a>
          <div class={tw`font-medium text-lg`}>
            <img src="/plus.svg" alt="Plus" /> New Room
          </div>
          <div />
        </div>
        <AddRoom />
      </div>
    </Page>
  );
}
