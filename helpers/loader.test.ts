import { assertEquals, assertRejects } from "$std/testing/asserts.ts";
import { ResourceLoader } from "./loader.ts";

Deno.test("resource loading", async () => {
  let loadFunc: () => Promise<string> = async () => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    throw new Error("FAIL");
  };
  let currentTime = 1;
  const loader = new ResourceLoader({
    load: () => loadFunc(),
    getTime: () => currentTime,
  });
  const load1 = loader.getInstance();
  const load2 = loader.getInstance();

  // should use the identity cleaner when it fails
  await assertRejects(() => load1);
  await assertRejects(() => load2);

  loadFunc = () => Promise.resolve("success");
  // should still not work because not enough time has passed
  await assertRejects(() => loader.getInstance());

  // increase the time to equal the reset threshold
  currentTime += 1_000 * 10;
  await assertRejects(() => loader.getInstance());

  // increase the time to be above the threshold and it should reload
  currentTime += 1;
  assertEquals(await loader.getInstance(), "success");

  // should not reload and will use the cached data because
  // it has loaded successfully before
  currentTime += 1_000 * 10 * 5;
  loadFunc = () => Promise.reject(new Error("FAIL"));
  assertEquals(await loader.getInstance(), "success");
});
