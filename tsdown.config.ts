import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: true,
  deps: {
    neverBundle: [
      "@convex-dev/react-query",
      "@tanstack/react-query",
      "convex/server",
      "react",
    ],
  },
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  target: "es2022",
});
