import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, context }) => {
  // Supply contextual detection through a worker fixture. Model assets are blocked.
  await context.route("**/magpii/**", async (route) => {
    if (!route.request().url().endsWith("/worker.js")) return route.abort();
    await route.fulfill({
      contentType: "text/javascript",
      body: `
        self.addEventListener("message", ({ data }) => {
          if (data.kind === "warmup") {
            self.postMessage({ kind: "ready", id: data.id });
          } else if (data.text === "hold analysis") {
            self.blocked = true;
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
    page.getByRole("button", { name: "analyzing…", exact: true }),
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
  await expect(status).toHaveText("Analyzing your text locally…");
  await expect(status).toHaveClass("sr-only");
  await expect(page.getByText(/Source changed/)).toHaveCount(0);

  await input.fill("Email alex@example.com.");
  await expect(status).toBeEmpty();
  await redact.click();
  await expect(output).toHaveValue("Email [EMAIL].");
  await expect(status).toHaveText("1 identifiers found and redacted.");
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
