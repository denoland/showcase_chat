/** @jsx h */
/** @jsxFrag Fragment */
import { ComponentChildren, Fragment, h } from "preact";
import { tw } from "@twind";
import { Footer } from "./Footer.tsx";

export function Page({ children }: { children: ComponentChildren }) {
  return (
    <>
      <img
        src="/background.png"
        alt="bg"
        class={tw
          `absolute top-0 left-0 w-full min-h-screen -z-10 overflow-hidden`}
      />
      <div
        class={tw
          `flex flex-col justify-center items-center w-full h-screen children:(bg-[#F9F9F9] border-1 border-gray-300)`}
      >
        {children}
        <Footer />
      </div>
    </>
  );
}
