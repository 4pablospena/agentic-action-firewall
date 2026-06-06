import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@agent-firewall/core": join(__dirname, "../core/src/index.ts"),
      "@agent-firewall/schemas": join(__dirname, "../../schemas/lib/validate-policy.mjs"),
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
  },
});
