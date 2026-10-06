import { expect, test } from "@playwright/test";

import { screenshots } from "./fixtures";

for (const screenshot of screenshots) {
  test(`OCR screenshot: ${screenshot.name}`, async ({ page }, testInfo) => {
    const requests: { url: string; method: string }[] = [];
    page.on("request", (request) => {
      requests.push({ url: request.url(), method: request.method() });
    });
    await page.goto("/");
    const raw = await page.evaluate(async (file) => {
      const moduleUrl = "/dist/index.js";
      const { createOcr } = (await import(
        moduleUrl
      )) as typeof import("../src/index.js");
      const ocr = createOcr();
      try {
        const response = await fetch(`/test/fixtures/${file}`);
        if (!response.ok) throw new Error(`Missing fixture: ${file}`);
        return await ocr.parse(await response.blob());
      } finally {
        await ocr.dispose();
      }
    }, screenshot.file);
    await testInfo.attach("recognized-text.txt", {
      body: raw,
      contentType: "text/plain",
    });
    // Recognition may download local assets, but must never send the image/text.
    expect(
      requests.every(
        ({ url, method }) =>
          new URL(url).origin === "http://127.0.0.1:3101" && method === "GET",
      ),
    ).toBe(true);
    await expect.poll(() => page.workers().length).toBe(0);
    const text = raw.replace(/\s+/g, " ").toLowerCase();
    for (const expected of screenshot.text) {
      expect
        .soft(text, `${screenshot.file}: missing ${JSON.stringify(expected)}`)
        .toContain(expected.toLowerCase());
    }
    if (screenshot.file === "gnu-health.png") {
      // This English screenshot contains icons, but no Chinese text.
      expect(text, "Interface icons must not become Chinese text").not.toMatch(
        /\p{Script=Han}/u,
      );
    }
  });
}
