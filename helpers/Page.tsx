import { ComponentChildren } from "preact";
import { Footer } from "./Footer.tsx";

export function Page({ children }: { children: ComponentChildren }) {
  return (
    <>
      <img
        src="/background.png"
        alt="bg"
        class="absolute top-0 left-0 w-full min-h-screen -z-10 overflow-hidden"
      />
      <div class="flex flex-col justify-center items-center w-full h-screen children:(bg-[#F9F9F9] border-1 border-gray-300)">
        {children}
        <Footer />
      </div>
    </>
  );
}
