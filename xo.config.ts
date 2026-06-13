import { type FlatXoConfig } from "xo";

const xoConfig: FlatXoConfig = [
  {
    prettier: "compat",
  },
  {
    rules: {
      "@typescript-eslint/no-restricted-types": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-arguments": "off",
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/promise-function-async": "off",
      "import-x/extensions": "off",
    },
  },
  {
    files: ["src/**/*.test-d.ts"],
    rules: {
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
];

export default xoConfig;
