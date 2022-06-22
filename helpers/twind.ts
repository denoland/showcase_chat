import { IS_BROWSER } from "$fresh/runtime.ts";
import { Configuration, setup } from "twind";
export * from "twind";
export const config: Configuration = {
  theme: {
    extend: {
      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
      },
    },
  },
};
if (IS_BROWSER) setup(config);
