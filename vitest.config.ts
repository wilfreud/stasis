import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", // Matches Express runtime
    include: ["src/**/*.test.ts"],
    // coverage: {
    //   provider: "v8", // Optional: code coverage
    // },
  },
});
