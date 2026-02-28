import { buildConfig } from "@mcp-html-artifacts-preview/eslint-config";

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
