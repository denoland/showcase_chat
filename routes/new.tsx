/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Page } from "@/helpers/Page.tsx";
import AddRoom from "@/islands/AddRoom.tsx";

export default function NewRoom() {
  return (
    <Page>
      <div class={tw`rounded-2xl w-5/12 pt-4 pb-8 px-7`}>
        <div class={tw`h-8 flex-none flex justify-between items-center mb-9`}>
          <a href="/">
            <img src="/arrow.svg" alt="Left Arrow" />
          </a>
          <div class={tw`font-medium text-lg flex items-center`}>
            <div
              class={tw`w-6 h-6 flex justify-center items-center mr-1.5`}
            >
              <img src="/plus.svg" alt="Plus" />
            </div>
            New Room
          </div>
          <div />
        </div>
        <AddRoom />
      </div>
    </Page>
  );
}
