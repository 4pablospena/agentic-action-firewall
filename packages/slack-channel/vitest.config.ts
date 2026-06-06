import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@agent-firewall/core": join(__dirname, "../core/src/index.ts"),
      "@agent-firewall/langchain": join(__dirname, "../langchain/src/index.ts"),
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
  },
});
