export * from "https://raw.githubusercontent.com/lucacasonato/fresh/ec388f87fb19cf5c247ad62c9a0beb771170da07/runtime.ts";
// Setup twind
import { IS_BROWSER } from "https://raw.githubusercontent.com/lucacasonato/fresh/ec388f87fb19cf5c247ad62c9a0beb771170da07/runtime.ts";
export { default as twas } from "https://esm.sh/twas@2.1.2?pin=v76";
import { apply, setup, tw } from "https://esm.sh/twind@0.16.16";
export { apply, setup, tw };
if (IS_BROWSER) {
  setup({});
}
