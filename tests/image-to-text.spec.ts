import { expect, test, type Page } from "@playwright/test";
import { site } from "../src/utils/site";

async function image(page: Page, text: string, mimeType = "image/png") {
  const bytes = await page.evaluate(
    async ({ text, mimeType }) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1100;
      canvas.height = 180;
      const context = canvas.getContext("2d")!;
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "black";
      context.font = "40px Arial";
      context.fillText(text, 40, 100);
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((value) => resolve(value!), mimeType),
      );
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    },
    { text, mimeType },
  );
  return { bytes, mimeType };
}

test("real OCR loads only on demand, stays on origin, and copies edited text", async ({
  page,
  context,
}) => {
  const requests: string[] = [];
  await context.route("**/*", (route) => {
    const url = route.request().url();
    // The site shell loads analytics independently of OCR. Block it in this test.
    if (url === site.analytics.umami.script) return route.abort();
    requests.push(url);
    return new URL(url).origin === "http://127.0.0.1:3100"
      ? route.continue()
      : route.abort();
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/tools/image-to-text");
  expect(requests.filter((url) => url.includes("/ocr/"))).toEqual([]);
  const fixture = await image(page, "Contact alex@example.com");
  await page.getByLabel("your image", { exact: true }).setInputFiles({
    name: "screenshot.png",
    mimeType: fixture.mimeType,
    buffer: Buffer.from(fixture.bytes),
  });
  const output = page.getByLabel("extracted text", { exact: true });
  await expect(output).toHaveValue(/Contact alex@example\.com/);
  expect(requests.some((url) => url.includes("/ocr/"))).toBe(true);
  expect(
    requests.filter((url) => new URL(url).origin !== "http://127.0.0.1:3100"),
  ).toEqual([]);
  await expect(page.locator("#ocr-privacy-note")).toContainText(
    "never uploaded",
  );
  await output.fill("Reviewed text.");
  await page.getByRole("button", { name: "copy", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Text copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "Reviewed text.",
  );
  await page.getByRole("button", { name: "clear", exact: true }).click();
  await expect(output).toHaveValue("");
  await expect.poll(() => page.workers().length).toBe(0);
});

test("page-wide JPEG drop shows a target and WebP paste reuses the worker", async ({
  page,
}) => {
  await page.goto("/tools/image-to-text");
  const jpeg = await image(page, "Hello from In the Open", "image/jpeg");
  await page.locator("body").evaluate((element, fixture) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([new Uint8Array(fixture.bytes)], "dropped.jpg", {
        type: fixture.mimeType,
      }),
    );
    element.dispatchEvent(
      new DragEvent("dragenter", {
        bubbles: true,
        dataTransfer: transfer,
      }),
    );
  }, jpeg);
  const target = page.getByText("Drop an image to read its text", {
    exact: true,
  });
  await expect(target).toBeVisible();
  await page.getByLabel("your image", { exact: true }).evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(["image"], "image.jpg", { type: "image/jpeg" }),
    );
    for (const type of ["dragenter", "dragleave"]) {
      element.dispatchEvent(
        new DragEvent(type, { bubbles: true, dataTransfer: transfer }),
      );
    }
  });
  await expect(target).toBeVisible();
  await page.locator("body").evaluate((element, fixture) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([new Uint8Array(fixture.bytes)], "dropped.jpg", {
        type: fixture.mimeType,
      }),
    );
    element.dispatchEvent(
      new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer,
      }),
    );
  }, jpeg);
  const output = page.getByLabel("extracted text", { exact: true });
  await expect(target).toBeHidden();
  await expect(output).toHaveValue(/Hello from In the Open/);
  const worker = page.workers()[0];
  const webp = await image(page, "Contact alex@example.com", "image/webp");
  await output.evaluate((element, fixture) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([new Uint8Array(fixture.bytes)], "pasted.webp", {
        type: fixture.mimeType,
      }),
    );
    element.dispatchEvent(
      new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: transfer,
      }),
    );
  }, webp);
  await expect(output).toHaveValue(/Contact alex@example\.com/);
  expect(page.workers()).toEqual([worker]);
});

test("rejected files preserve the previous result and reuse a loaded reader", async ({
  page,
}) => {
  const assets: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/ocr/")) assets.push(request.url());
  });
  await page.goto("/tools/image-to-text");
  const picker = page.getByLabel("your image", { exact: true });
  await picker.setInputFiles({
    name: "disguised.png",
    mimeType: "image/png",
    buffer: Buffer.from("<svg></svg>"),
  });
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Choose a PNG, JPEG, or WebP image.",
  );
  await picker.setInputFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  });
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "This image could not be read. Try another image.",
  );
  expect(assets).toEqual([]);

  const fixture = await image(page, "Contact alex@example.com");
  await picker.setInputFiles({
    name: "original.png",
    mimeType: fixture.mimeType,
    buffer: Buffer.from(fixture.bytes),
  });
  const output = page.getByLabel("extracted text", { exact: true });
  await expect(output).toHaveValue(/Contact alex@example\.com/);
  const worker = page.workers()[0];
  const originalText = await output.inputValue();
  await picker.setInputFiles({
    name: "rejected.png",
    mimeType: "image/png",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Choose a PNG, JPEG, or WebP image.",
  );
  await expect(output).toHaveValue(originalText);
  await expect(page.getByText("original.png", { exact: true })).toBeVisible();
  await expect(page.getByText("rejected.png", { exact: true })).toHaveCount(0);
  expect(page.workers()).toEqual([worker]);
  await picker.setInputFiles({
    name: "next.png",
    mimeType: fixture.mimeType,
    buffer: Buffer.from(fixture.bytes),
  });
  await expect(page.getByText("next.png", { exact: true })).toBeVisible();
  await expect(output).toHaveValue(originalText);
  expect(page.workers()).toEqual([worker]);
});

test("cancel during loading discards the pending result and releases the worker", async ({
  page,
}) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/ocr/paddle/assets/worker-entry-*.js", async (route) => {
    await held;
    await route.continue();
  });
  await page.goto("/tools/image-to-text");
  const fixture = await image(page, "Contact alex@example.com");
  const requested = page.waitForRequest(
    "**/ocr/paddle/assets/worker-entry-*.js",
  );
  const workerStarted = page.waitForEvent("worker");
  await page.getByLabel("your image", { exact: true }).setInputFiles({
    name: "screenshot.png",
    mimeType: fixture.mimeType,
    buffer: Buffer.from(fixture.bytes),
  });
  await requested;
  const working = page.getByRole("button", { name: "analysing…", exact: true });
  await expect(working).toBeDisabled();
  await expect(working).toHaveAttribute("aria-busy", "true");
  await expect(page.getByRole("status")).toHaveText("Analysing image…");
  await page.getByRole("button", { name: "cancel", exact: true }).click();
  release();
  await workerStarted;
  await expect(page.getByLabel("extracted text", { exact: true })).toHaveValue(
    "",
  );
  await expect(page.getByRole("status")).toBeEmpty();
  await expect.poll(() => page.workers().length).toBe(0);
  await expect(page.getByLabel("your image", { exact: true })).toBeEnabled();
});

test("no readable text gives a clear result", async ({ page }) => {
  await page.goto("/tools/image-to-text");
  const fixture = await image(page, "");
  await page.getByLabel("your image", { exact: true }).setInputFiles({
    name: "blank.png",
    mimeType: fixture.mimeType,
    buffer: Buffer.from(fixture.bytes),
  });
  await expect(page.getByRole("status")).toHaveText(
    "No text found. Try a clearer image.",
  );
  await expect(
    page.getByRole("button", { name: "copy", exact: true }),
  ).toBeDisabled();
});

test("a failed model load can be retried without refreshing the page", async ({
  page,
}) => {
  let first = true;
  await page.route("**/ocr/paddle/PP-OCRv6_tiny_rec.tar", (route) => {
    if (!first) return route.continue();
    first = false;
    return route.abort();
  });
  await page.goto("/tools/image-to-text");
  const fixture = await image(page, "Contact alex@example.com");
  const picker = page.getByLabel("your image", { exact: true });
  await picker.setInputFiles({
    name: "contact.png",
    mimeType: fixture.mimeType,
    buffer: Buffer.from(fixture.bytes),
  });
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  await picker.setInputFiles({
    name: "retry.png",
    mimeType: fixture.mimeType,
    buffer: Buffer.from(fixture.bytes),
  });
  await expect(page.getByLabel("extracted text", { exact: true })).toHaveValue(
    /Contact alex@example\.com/,
  );
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
});

test("redactor accepts uploaded, pasted and dropped images without replacing text", async ({
  page,
  context,
}) => {
  await context.route("**/magpii/worker-v3.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `self.addEventListener("message", ({data}) => {
        self.postMessage(data.kind === "warmup"
          ? {kind: "ready", id: data.id}
          : {kind: "result", id: data.id, detections: []});
      });`,
    }),
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/tools/text-redaction");
  const input = page.getByLabel("your text", { exact: true });
  await input.fill("Notes: ");
  await page.evaluate(() => navigator.clipboard.writeText("existing draft."));
  await input.press("ControlOrMeta+V");
  await expect(input).toHaveValue("Notes: existing draft.");
  expect(page.workers()).toEqual([]);

  const fixture = await image(page, "Contact alex@example.com");
  const choosing = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "upload image", exact: true }).click();
  await (
    await choosing
  ).setFiles({
    name: "contact.png",
    mimeType: fixture.mimeType,
    buffer: Buffer.from(fixture.bytes),
  });
  const combined = "Notes: existing draft.\n\nContact alex@example.com";
  await expect(input).toHaveValue(combined);
  const reader = page.workers()[0];
  await expect(
    page.getByLabel("redacted text", { exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "redact", exact: true }).click();
  await expect(page.getByLabel("redacted text", { exact: true })).toHaveValue(
    "Notes: existing draft.\n\nContact [EMAIL]",
  );

  await input.evaluate((element, fixture) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([new Uint8Array(fixture.bytes)], "pasted.png", {
        type: fixture.mimeType,
      }),
    );
    element.dispatchEvent(
      new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: transfer,
      }),
    );
  }, fixture);
  await expect(input).toHaveValue(`${combined}\n\nContact alex@example.com`);
  await expect(
    page.getByText("Source changed. Redact again to update this result."),
  ).toBeVisible();
  expect(page.workers()).toContain(reader);

  await page.locator("body").evaluate((element, fixture) => {
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([new Uint8Array(fixture.bytes)], "dropped.png", {
        type: fixture.mimeType,
      }),
    );
    element.dispatchEvent(
      new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer: transfer,
      }),
    );
  }, fixture);
  await expect(input).toHaveValue(
    `${combined}\n\nContact alex@example.com\n\nContact alex@example.com`,
  );
  expect(page.workers()).toContain(reader);
  await page.getByRole("button", { name: "clear", exact: true }).click();
  await expect(input).toHaveValue("");
  await expect(page.getByLabel("redacted text", { exact: true })).toHaveValue(
    "",
  );
  await expect.poll(() => page.workers().length).toBe(0);
});

test("redactor cancels OCR without appending a late result or clearing the draft", async ({
  page,
}) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/ocr/paddle/assets/worker-entry-*.js", async (route) => {
    await held;
    await route.continue();
  });
  await page.goto("/tools/text-redaction");
  const input = page.getByLabel("your text", { exact: true });
  await input.fill("Keep my draft.");
  const fixture = await image(page, "Contact alex@example.com");
  const requested = page.waitForRequest(
    "**/ocr/paddle/assets/worker-entry-*.js",
  );
  const workerStarted = page.waitForEvent("worker");
  await page.getByLabel("upload image", { exact: true }).setInputFiles({
    name: "pending.png",
    mimeType: fixture.mimeType,
    buffer: Buffer.from(fixture.bytes),
  });
  await requested;
  await expect(
    page.getByRole("button", { name: "analysing…", exact: true }),
  ).toBeDisabled();
  await expect(input).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "upload image", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "cancel", exact: true }).click();
  release();
  await workerStarted;
  await expect.poll(() => page.workers().length).toBe(0);
  await expect(input).toHaveValue("Keep my draft.");
  await expect(input).toBeEnabled();
  await expect(page.getByText("pending.png", { exact: true })).toHaveCount(0);
  await page.getByLabel("upload image", { exact: true }).setInputFiles({
    name: "retry.png",
    mimeType: fixture.mimeType,
    buffer: Buffer.from(fixture.bytes),
  });
  await expect(input).toHaveValue("Keep my draft.\n\nContact alex@example.com");
});
