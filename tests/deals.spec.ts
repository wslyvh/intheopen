import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import type { Deal } from "../src/utils/deals";

function catalog(): Deal[] {
  return JSON.parse(
    readFileSync(
      join(process.cwd(), "data/deals/black-friday-2026.json"),
      "utf8",
    ),
  );
}

test("the deals overview renders every catalog entry and its official link", async ({
  page,
  request,
}) => {
  const response = await page.goto("/explore/deals");
  expect(response?.status()).toBe(200);
  const deals = catalog();
  expect(deals.length).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Black Friday privacy deals",
  );
  await expect(page.locator("article")).toHaveCount(deals.length);
  for (const deal of deals) {
    const card = page.getByRole("article", { name: deal.title, exact: true });
    await expect(
      card.getByRole("heading", { name: deal.title, exact: true }),
    ).toBeVisible();
    await expect(card).toContainText(deal.description);
    await expect(card).toContainText(deal.deal);
    await expect(
      card.getByRole("link", { name: "View official deal" }),
    ).toHaveAttribute("href", deal.url);
    if (deal.code) await expect(card.locator("code")).toHaveText(deal.code);
    if (deal.terms) await expect(card).toContainText(deal.terms);
    if (deal.expires)
      await expect(card.locator("time")).toHaveAttribute(
        "datetime",
        deal.expires,
      );
    else await expect(card.locator("time")).toHaveCount(0);
  }
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.intheopen.cc/explore/deals",
  );
  const graph = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.flatMap(
        (script) => JSON.parse(script.textContent ?? "{}")["@graph"] ?? [],
      ),
    );
  expect(graph.some((entry) => entry["@type"] === "CollectionPage")).toBe(true);
  const list = graph.find((entry) => entry["@type"] === "ItemList");
  expect(list.numberOfItems).toBe(deals.length);
  expect(
    list.itemListElement.map(
      (entry: { item: { url: string } }) => entry.item.url,
    ),
  ).toEqual(deals.map((deal) => deal.url));
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    "https://www.intheopen.cc/explore/deals",
  );
  await page.goto("/explore/private-ai");
  await expect(
    page.getByRole("link", { name: "Black Friday privacy deals", exact: true }),
  ).toHaveAttribute("href", "/explore/deals");
});

test("search and category/tag filters narrow deals and can be cleared", async ({
  page,
}) => {
  const deals = catalog();
  const example = deals.find((deal) => deal.tags.length > 0)!;
  expect(example).toBeTruthy();
  await page.goto("/explore/deals");
  const search = page.getByRole("searchbox", { name: "Search deals" });
  await search.fill(`  ${example.title.toUpperCase()}  `);
  await expect(
    page.getByRole("article", { name: example.title, exact: true }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(
    deals.filter((deal) =>
      [
        deal.title,
        deal.description,
        deal.deal,
        deal.category,
        ...deal.tags,
        deal.code,
        deal.terms,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(example.title.toLowerCase()),
    ).length,
  );
  await search.fill("");
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption(example.category);
  await expect(page.locator("article h2")).toHaveText(
    deals
      .filter((deal) => deal.category === example.category)
      .map((deal) => deal.title),
  );
  await page
    .getByRole("combobox", { name: "Tag", exact: true })
    .selectOption(example.tags[0]);
  await expect(page.locator("article h2")).toHaveText(
    deals
      .filter(
        (deal) =>
          deal.category === example.category &&
          deal.tags.includes(example.tags[0]),
      )
      .map((deal) => deal.title),
  );
  await search.fill("no-matching-deal-zzzz");
  await expect(page.locator("article")).toHaveCount(0);
  await expect(page.getByText("No deals match your filters.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(search).toHaveValue("");
  await expect(
    page.getByRole("combobox", { name: "Category", exact: true }),
  ).toHaveValue("");
  await expect(
    page.getByRole("combobox", { name: "Tag", exact: true }),
  ).toHaveValue("");
  await expect(page.locator("article")).toHaveCount(deals.length);
});

test("deals and filters fit a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/explore/deals");
  await expect(page.locator("article")).toHaveCount(catalog().length);
  await expect(
    page.getByRole("searchbox", { name: "Search deals" }),
  ).toBeVisible();
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(320);
  for (const card of await page.locator("article").all()) {
    const bounds = await card.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  }
});
