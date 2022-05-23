export * from "https://raw.githubusercontent.com/lucacasonato/fresh/59e6398d7724f4990aa3ace12dce36e11b20e1ba/runtime.ts";
// Setup twind
import { IS_BROWSER } from "https://raw.githubusercontent.com/lucacasonato/fresh/59e6398d7724f4990aa3ace12dce36e11b20e1ba/runtime.ts";
import { apply, setup, tw } from "https://esm.sh/twind@0.16.16";
export { apply, setup, tw };
if (IS_BROWSER) {
  setup({});
}
