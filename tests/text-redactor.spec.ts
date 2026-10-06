import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

test.beforeEach(async ({ page, context }) => {
  // Supply contextual detection through a worker fixture. Model assets are blocked.
  await context.route("**/magpii/**", async (route) => {
    if (!route.request().url().endsWith("/worker-v3.js")) return route.abort();
    await route.fulfill({
      contentType: "text/javascript",
      body: `
        self.addEventListener("message", ({ data }) => {
          if (data.kind === "warmup" && data.assets.model === "full") {
            self.modelBaseUrl = data.assets.modelBaseUrl;
            self.blocked = true;
            self.postMessage({ kind: "progress", id: data.id, loaded: 100000000, total: 249626087 });
          } else if (data.kind === "warmup") {
            self.postMessage({ kind: "ready", id: data.id });
          } else if (data.text === "hold analysis") {
            self.blocked = true;
          } else if (data.text.startsWith("Ada is 42 on")) {
            self.postMessage({ kind: "result", id: data.id, detections: [
              { start: 0, end: 3, type: "GIVEN_NAME", source: "model" },
              { start: 7, end: 9, type: "AGE", source: "model" },
              { start: 13, end: 23, type: "DATE", source: "model" },
            ] });
          } else if (data.text === "BSN 111222333") {
            self.postMessage({ kind: "result", id: data.id, detections: [
              { start: 4, end: 13, type: "GOVERNMENT_ID", source: "model" },
            ] });
          } else {
            self.postMessage({ kind: "result", id: data.id, detections: [] });
          }
        });
      `,
    });
  });
  await page.goto("/tools/text-redaction");
  await page
    .getByLabel("your text", { exact: true })
    .fill("Email jan@example.nl.");
  await page.getByRole("button", { name: "redact", exact: true }).click();
  await expect(page.getByLabel("redacted text", { exact: true })).toBeEnabled();
});

test("source edits retain the reviewed result and its original matches", async ({
  page,
}) => {
  const input = page.getByLabel("your text", { exact: true });
  const output = page.getByLabel("redacted text", { exact: true });
  const originalMatch = page.getByRole("checkbox", {
    name: /Email jan@example.nl/,
  });
  await output.fill("Manually reviewed text.");
  await input.fill("Different draft: alex@example.com.");
  await expect(output).toHaveValue("Manually reviewed text.");
  await expect(originalMatch).toBeChecked();

  page.once("dialog", (dialog) => dialog.accept());
  await originalMatch.uncheck();
  await expect(output).toHaveValue("Email jan@example.nl.");
  await originalMatch.check();
  await expect(output).toHaveValue("Email [EMAIL].");

  await page.getByRole("button", { name: "redact", exact: true }).click();
  await expect(output).toHaveValue("Different draft: [EMAIL].");
  await expect(originalMatch).toHaveCount(0);
  await input.fill("");
  await expect(output).toHaveValue("Different draft: [EMAIL].");
  await page.getByRole("button", { name: "clear", exact: true }).click();
  await expect(output).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "copy", exact: true }),
  ).toBeDisabled();
});

test("editing the source terminates analysis and allows a new run immediately", async ({
  page,
}) => {
  const input = page.getByLabel("your text", { exact: true });
  const output = page.getByLabel("redacted text", { exact: true });
  const redact = page.getByRole("button", { name: "redact", exact: true });
  const worker = page.workers()[0]!;
  await input.fill("hold analysis");
  const sourceNote = page.getByText(
    "Source changed. Redact again to update this result.",
  );
  await expect(sourceNote).toBeVisible();
  await redact.click();
  await expect
    .poll(() => worker.evaluate(() => Reflect.get(self, "blocked")))
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "analysing…", exact: true }),
  ).toBeVisible();
  await expect(sourceNote).toHaveCount(0);
  await expect(output).toHaveAttribute("aria-describedby", "privacy-note");

  await input.fill("New draft: alex@example.com.");
  await expect(redact).toBeEnabled();
  await expect(output).toBeEnabled();
  await expect(output).toHaveValue("Email [EMAIL].");
  await expect(sourceNote).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);

  await redact.click();
  await expect(output).toHaveValue("New draft: [EMAIL].");
  await expect(sourceNote).toHaveCount(0);
});

test("no-match feedback clears when the source changes", async ({ page }) => {
  const input = page.getByLabel("your text", { exact: true });
  const output = page.getByLabel("redacted text", { exact: true });
  const redact = page.getByRole("button", { name: "redact", exact: true });
  const status = page.getByRole("status");

  await input.fill("Meeting notes for Friday.");
  await redact.click();
  await expect(output).toHaveValue("Meeting notes for Friday.");
  await expect(status).toHaveText(
    "No supported identifiers found. Review your text before sharing.",
  );
  await expect(status).not.toHaveClass("sr-only");

  await input.fill("hold analysis");
  await expect(status).toBeEmpty();
  await expect(status).toHaveClass("sr-only");
  await expect(output).toHaveValue("Meeting notes for Friday.");
  await redact.click();
  await expect(status).toHaveText("Analysing your text locally…");
  await expect(status).toHaveClass("sr-only");
  await expect(page.getByText(/Source changed/)).toHaveCount(0);

  await input.fill("Email alex@example.com.");
  await expect(status).toBeEmpty();
  await redact.click();
  await expect(output).toHaveValue("Email [EMAIL].");
  await expect(status).toHaveText(
    "1 identifiers found. 1 selected for redaction.",
  );
});

test("all identifiers start checked and can be deselected independently", async ({
  page,
}) => {
  await page
    .getByLabel("your text", { exact: true })
    .fill("Ada is 42 on 2026-10-05. https://example.com");
  await page.getByRole("button", { name: "redact", exact: true }).click();
  const output = page.getByLabel("redacted text", { exact: true });
  await expect(output).toHaveValue("[GIVEN_NAME] is [AGE] on [DATE]. [URL]");
  await expect(
    page.getByRole("checkbox", { name: "Given name Ada" }),
  ).toBeChecked();
  const age = page.getByRole("checkbox", { name: "Age 42" });
  const url = page.getByRole("checkbox", { name: "URL https://example.com" });
  await expect(age).toBeChecked();
  await expect(url).toBeChecked();
  const date = page.getByRole("checkbox", { name: "Date 2026-10-05" });
  await expect(date).toBeChecked();
  await date.uncheck();
  await expect(output).toHaveValue(
    "[GIVEN_NAME] is [AGE] on 2026-10-05. [URL]",
  );
  await age.uncheck();
  await url.uncheck();
  await expect(output).toHaveValue(
    "[GIVEN_NAME] is 42 on 2026-10-05. https://example.com",
  );
  await date.check();
  await expect(output).toHaveValue(
    "[GIVEN_NAME] is 42 on [DATE]. https://example.com",
  );
});

test("overlapping candidates produce one review match for the default mask", async ({
  page,
}) => {
  await page.getByLabel("your text", { exact: true }).fill("BSN 111222333");
  await page.getByRole("button", { name: "redact", exact: true }).click();
  const match = page.getByRole("checkbox", { name: "Dutch BSN 111222333" });
  await expect(match).toBeChecked();
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await expect(page.getByLabel("redacted text", { exact: true })).toHaveValue(
    "BSN [BSN]",
  );
  await match.uncheck();
  await expect(page.getByLabel("redacted text", { exact: true })).toHaveValue(
    "BSN 111222333",
  );
});

test("manual edits survive until replacing them is explicitly confirmed", async ({
  page,
}) => {
  const output = page.getByLabel("redacted text", { exact: true });
  const match = page.getByRole("checkbox", { name: /Email jan@example.nl/ });
  await output.fill("Manually reviewed text.");

  page.once("dialog", (dialog) => dialog.dismiss());
  await match.click();
  await expect(match).toBeChecked();
  await expect(output).toHaveValue("Manually reviewed text.");

  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "redact", exact: true }).click();
  await expect(output).toHaveValue("Manually reviewed text.");

  page.once("dialog", (dialog) => dialog.accept());
  await match.uncheck();
  await expect(output).toHaveValue("Email jan@example.nl.");
});

test("clipboard feedback ignores results for an older output", async ({
  page,
}) => {
  const output = page.getByLabel("redacted text", { exact: true });
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () =>
          new Promise<void>((resolve, reject) => {
            window.addEventListener(
              "settle-copy",
              (event) => {
                if ((event as CustomEvent).detail === "success") resolve();
                else reject(new Error("Clipboard failed"));
              },
              { once: true },
            );
          }),
      },
    });
  });

  const copy = page.getByRole("button", { name: "copy", exact: true });
  for (const outcome of ["success", "failure"]) {
    await output.fill("First reviewed output.");
    await copy.click();
    await output.fill("Second reviewed output.");
    await page.evaluate((detail) => {
      window.dispatchEvent(new CustomEvent("settle-copy", { detail }));
    }, outcome);
    await expect(copy).toBeVisible();
    await expect(page.getByRole("status")).not.toContainText("copied");
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  }

  await copy.click();
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("settle-copy", { detail: "success" }));
  });
  await expect(
    page.getByRole("button", { name: "copied", exact: true }),
  ).toBeVisible();
});

test("Full is opt-in and cancelling its download preserves the reviewed result", async ({
  page,
}) => {
  const model = page.getByLabel("model", { exact: true });
  test.skip(
    (await model.count()) === 0,
    "Full model assets are not configured.",
  );
  const output = page.getByLabel("redacted text", { exact: true });
  await model.selectOption("full");
  await expect(output).toHaveValue("Email [EMAIL].");
  await expect(
    page.getByText("Model changed. Redact again to update this result."),
  ).toBeVisible();
  await expect.poll(() => page.workers().length).toBe(0);
  await page
    .getByRole("button", { name: "download & redact", exact: true })
    .click();
  await expect(
    page.getByRole("progressbar", { name: "Model download" }),
  ).toHaveAttribute("value", "100000000");
  await page.getByRole("button", { name: "cancel", exact: true }).click();
  await expect.poll(() => page.workers().length).toBe(0);
  await expect(output).toHaveValue("Email [EMAIL].");
  await expect(
    page.getByRole("button", { name: "download & redact", exact: true }),
  ).toBeEnabled();
  await model.selectOption("mini");
  await page.getByRole("button", { name: "redact", exact: true }).click();
  await expect(output).toHaveValue("Email [EMAIL].");
  await expect(page.getByText(/Model changed/)).toHaveCount(0);
});

test("a failed Full run clears session readiness without losing the reviewed result", async ({
  page,
  context,
}) => {
  const model = page.getByLabel("model", { exact: true });
  test.skip(
    (await model.count()) === 0,
    "Full model assets are not configured.",
  );
  await context.route("**/worker-v3.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `
        let runs = 0;
        self.addEventListener("message", ({ data }) => {
          if (data.kind === "warmup") {
            self.postMessage({ kind: "ready", id: data.id });
          } else if (++runs === 1) {
            self.postMessage({ kind: "result", id: data.id, detections: [] });
          } else {
            self.postMessage({ kind: "error", id: data.id, message: "Inference failed" });
          }
        });
      `,
    }),
  );
  await model.selectOption("full");
  await page
    .getByRole("button", { name: "download & redact", exact: true })
    .click();
  const sessionHint = page.getByText("Full model loaded for this session.");
  await expect(sessionHint).toBeVisible();
  const redact = page.getByRole("button", { name: "redact", exact: true });
  await expect(redact).toBeEnabled();
  await redact.click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "The local detector could not finish.",
  );
  await expect(sessionHint).toHaveCount(0);
  await expect(page.getByText(/Downloads about 250 MB/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "download & redact", exact: true }),
  ).toBeEnabled();
  await expect.poll(() => page.workers().length).toBe(0);
  await expect(page.getByLabel("redacted text", { exact: true })).toHaveValue(
    "Email [EMAIL].",
  );
});

test("saved Full files load without download progress and stay removed after a stale cache check", async ({
  page,
  context,
}) => {
  const model = page.getByLabel("model", { exact: true });
  test.skip(
    (await model.count()) === 0,
    "Full model assets are not configured.",
  );
  const lock = JSON.parse(
    readFileSync(
      "node_modules/@intheopen/magpii/assets/full-model-lock.json",
      "utf8",
    ),
  );
  await model.selectOption("full");
  await page
    .getByRole("button", { name: "download & redact", exact: true })
    .click();
  await expect
    .poll(async () => {
      const worker = page.workers()[0];
      return worker?.evaluate(() => Reflect.get(self, "blocked"));
    })
    .toBe(true);
  const baseUrl = await page
    .workers()[0]!
    .evaluate(() => Reflect.get(self, "modelBaseUrl") as string);
  await page.getByRole("button", { name: "cancel", exact: true }).click();
  // Seed availability only. The worker fixture holds local loading below.
  // SDK browser tests separately verify real file checksums and persistence.
  await page.evaluate(
    async ({ lock, baseUrl }) => {
      const root = new URL(baseUrl, location.href);
      const cache = await caches.open(
        "magpii-full-v2-int4-" +
          lock.files["onnx/full-int4.onnx"].slice(0, 8) +
          "-" +
          lock.files["onnx/full-int4.onnx.data"].slice(0, 8),
      );
      for (const file of [
        "config.json",
        "tokenizer.json",
        "tokenizer_config.json",
        "onnx/full-int4.onnx",
        "onnx/full-int4.onnx.data",
      ]) {
        await cache.put(new URL(file, root), new Response("fixture"));
      }
    },
    { lock, baseUrl },
  );
  await model.selectOption("mini");
  await model.selectOption("full");
  await expect(
    page.getByText("Full model saved in this browser."),
  ).toBeVisible();
  await context.route("**/worker-v3.js", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `self.addEventListener("message", () => { self.blocked = true; });`,
    }),
  );
  await page.getByRole("button", { name: "redact", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "analysing…", exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => {
      const worker = page.workers()[0];
      return worker?.evaluate(() => Reflect.get(self, "blocked"));
    })
    .toBe(true);
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await page.getByRole("button", { name: "cancel", exact: true }).click();
  await expect(page.getByLabel("redacted text", { exact: true })).toHaveValue(
    "Email [EMAIL].",
  );
  // Hold a positive cache response while removal deletes the saved files.
  await page.evaluate(() => {
    const match = Cache.prototype.match;
    let held = false;
    Cache.prototype.match = async function (...args) {
      const response = await match.apply(this, args);
      if (response && !held) {
        held = true;
        await new Promise<void>((resolve) => {
          Reflect.set(window, "releaseCacheCheck", resolve);
        });
      }
      return response;
    };
  });
  await model.selectOption("mini");
  await model.selectOption("full");
  await expect
    .poll(() => page.evaluate(() => Reflect.has(window, "releaseCacheCheck")))
    .toBe(true);
  await page
    .getByRole("button", { name: "remove download", exact: true })
    .click();
  await expect(page.getByText(/Downloads about 250 MB/)).toBeVisible();
  await page.evaluate(async () => {
    Reflect.get(window, "releaseCacheCheck")();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
  await expect(page.getByText("Full model saved in this browser.")).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "remove download" }),
  ).toHaveCount(0);
  await expect(page.getByText(/Downloads about 250 MB/)).toBeVisible();
  await expect(page.getByRole("status")).not.toContainText(
    "Saved model removed.",
  );
});
