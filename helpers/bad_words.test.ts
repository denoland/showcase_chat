import { assertEquals } from "$std/testing/asserts.ts";
import { BadWordsCleanerLoader } from "./bad_words.ts";

Deno.test("clean bad words", async () => {
  const listLoader = new BadWordsCleanerLoader(
    () => Promise.resolve("bad\nword\r\nlist\n"),
  );
  const list = await listLoader.getInstance();
  assertEquals(
    list.clean("This is a BAD wOrd list."),
    "This is a *** **** ****.",
  );
});

Deno.test("loading bad words", async () => {
  let loadFunc: () => Promise<string> = async () => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    throw new Error("FAIL");
  };
  let currentTime = 1;
  const loader = new BadWordsCleanerLoader(() => loadFunc(), () => currentTime);
  const load1 = loader.getInstance();
  const load2 = loader.getInstance();

  // should use the identity cleaner when it fails
  assertEquals((await load1).clean("test"), "test");
  assertEquals((await load2).clean("test"), "test");

  loadFunc = () => Promise.resolve("word\nother");
  // should still not work because not enough time has passed
  assertEquals((await loader.getInstance()).clean("words"), "words");

  // increase the time to equal the reset threshold
  currentTime += 1_000 * 10;
  assertEquals((await loader.getInstance()).clean("words"), "words");

  // increase the time to be above the threshold and it should reload
  currentTime += 1;
  assertEquals((await loader.getInstance()).clean("words"), "****s");

  // should not reload and will use the cached list because
  // it has loaded successfully before
  currentTime += 1_000 * 10 * 5;
  loadFunc = () => Promise.reject(new Error("FAIL"));
  const cleaner2 = await loader.getInstance();
  assertEquals(cleaner2.clean("words"), "****s");
});
