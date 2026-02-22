import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    platform: "browser",
    external: ["prismjs"],
  },
  {
    entry: { server: "src/server.ts" },
    format: ["esm", "cjs"],
    dts: true,
    platform: "node",
    external: ["prismjs"],
  },
]);
