import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import tanstack from "ultracite/oxlint/tanstack";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, tanstack, vitest],
  ignorePatterns: core.ignorePatterns ?? [],
  overrides: [
    {
      files: ["e2e/tanstack-start/src/routes/**/*.tsx"],
      rules: {
        "react/react-compiler": "off",
      },
    },
  ],
  rules: {
    "func-style": "off",
    "no-use-before-define": ["error", { functions: false }],
    "sort-keys": "off",
    "typescript/consistent-type-definitions": ["error", "type"],
  },
});
