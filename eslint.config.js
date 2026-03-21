import { buildConfig } from "@mizunashi_mana/eslint-config-refined";

export default [
  ...buildConfig({
    entrypointFiles: [
      "packages/mcp-html-artifacts-preview/src/index.ts",
      "packages/mcp-html-artifacts-preview/src/cli.ts",
      "packages/mcp-html-artifacts-preview/scripts/cc-edit-lint-hook.mjs",
    ],
  }),
  {
    files: ["packages/mcp-html-artifacts-preview/scripts/**"],
    rules: {
      "n/hashbang": "off",
    },
  },
];
