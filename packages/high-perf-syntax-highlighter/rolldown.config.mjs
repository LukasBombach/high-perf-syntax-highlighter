import { defineConfig } from "rolldown";

export default defineConfig({
  input: {
    index: "src/index.ts",
    core: "src/core.ts"
  },
  output: [
    {
      dir: "dist",
      format: "esm",
      entryFileNames: "[name].js",
      sourcemap: true
    },
    {
      dir: "dist",
      format: "cjs",
      entryFileNames: "[name].cjs",
      exports: "named",
      sourcemap: true
    }
  ]
});
