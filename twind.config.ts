import { Options } from "$fresh/plugins/twind.ts";

export default {
  selfURL: import.meta.url,
  theme: {
    extend: {
      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
      },
    },
  },
} as Options;
