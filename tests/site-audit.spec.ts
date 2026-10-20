import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`homepage H1 has real accessible text without changing the design at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.route("https://stats.westech.studio/**", (route) =>
      route.fulfill({ status: 200, body: "" }),
    );
    await page.goto("/");
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((image) => image.decode().catch(() => {})),
      );
    });
    const heading = page.getByRole("heading", {
      level: 1,
      name: "In the Open",
      exact: true,
    });
    await expect(heading).toHaveText("In the Open");
    await expect(heading.locator("img")).toHaveAttribute("alt", "");
    const hidden = heading.locator(".sr-only");
    const box = await hidden.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(1);
    expect(box?.height).toBeLessThanOrEqual(1);
    const after = await page.screenshot({ animations: "disabled" });
    // Recreate the original image-only heading in the same loaded page.
    await heading.evaluate((element) => {
      element.querySelector("span")?.remove();
      element.querySelector("img")?.setAttribute("alt", "In the Open");
    });
    const before = await page.screenshot({ animations: "disabled" });
    expect(after.equals(before)).toBe(true);
  });
}

test("the five revised descriptions are complete and URL cleaner has its missing OG type", async ({
  page,
}) => {
  await page.route("https://stats.westech.studio/**", (route) =>
    route.fulfill({ status: 200, body: "" }),
  );
  for (const path of [
    "/tools",
    "/events",
    "/tools/image-to-text",
    "/tools/url-cleaner",
    "/explore/confer",
  ]) {
    await page.goto(path);
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description!.length).toBeGreaterThanOrEqual(110);
    expect(description!.length).toBeLessThanOrEqual(160);
    for (const name of ["og:description", "twitter:description"]) {
      await expect(
        page.locator(
          `meta[${name.startsWith("og:") ? "property" : "name"}="${name}"]`,
        ),
      ).toHaveAttribute("content", description!);
    }
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
  }
});
