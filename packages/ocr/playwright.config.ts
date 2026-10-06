import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  timeout: 120_000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3101",
    browserName: "chromium",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  webServer: {
    command:
      "npm run build && node dist/assets.js test/.public/ocr && node --experimental-strip-types test/server.ts",
    url: "http://127.0.0.1:3101",
    timeout: 120_000,
  },
});
