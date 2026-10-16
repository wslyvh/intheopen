import { expect, test } from "@playwright/test";
import projects from "../data/private-ai.json";

test("the Private AI hub links to every profile from its category data", async ({
  request,
}) => {
  const hub = await request.get("/explore/private-ai");
  expect(hub.status()).toBe(200);
  const html = await hub.text();
  for (const project of projects) {
    expect(html).toContain(`href="/explore/${project.id}"`);
    const response = await request.get(`/explore/${project.id}`);
    expect(response.status()).toBe(200);
    const profile = await response.text();
    expect(profile).toContain(project.name);
    expect(profile).toContain(`href="${project.links.website}"`);
    expect(profile).toContain(project.checked_at);
    expect(profile).not.toContain('id="project-sources"');
  }
});

test("Explore redirects to its first category and returns 404 for unknown profiles", async ({
  request,
}) => {
  const redirect = await request.get("/explore", { maxRedirects: 0 });
  expect(redirect.status()).toBe(307);
  expect(redirect.headers().location).toBe("/explore/private-ai");
  const missing = await request.get("/explore/not-a-project");
  expect(missing.status()).toBe(404);
});

test("main navigation opens Explore without changing the four homepage work cards", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", {
    name: "Main",
    exact: true,
  });
  await expect(navigation.getByRole("link")).toHaveText([
    "explore",
    "tools",
    "about",
  ]);
  await expect(page.locator("main .sm\\:grid-cols-2 > a")).toHaveCount(4);
  await expect(
    page.getByRole("link", { name: "Explore private AI", exact: true }),
  ).toHaveCount(0);
  await navigation.getByRole("link", { name: "explore", exact: true }).click();
  await expect(page).toHaveURL(/\/explore\/private-ai$/);
  await expect(
    page.getByRole("navigation", { name: "Main", exact: true }),
  ).toBeVisible();
});

const entries = [{ id: "private-ai", name: "Private AI" }, ...projects];
for (const entry of entries) {
  test(`${entry.name} has complete rendered metadata and structured data`, async ({
    page,
    request,
  }) => {
    await page.route("https://stats.westech.studio/**", (route) =>
      route.fulfill({ status: 200, body: "" }),
    );
    await page.goto(`/explore/${entry.id}`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(entry.name);
    const seo = await page.evaluate(() => ({
      title: document.title,
      canonical: document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]',
      )?.href,
      meta: Object.fromEntries(
        [...document.querySelectorAll("meta[name], meta[property]")].map(
          (meta) => [
            meta.getAttribute("name") ?? meta.getAttribute("property"),
            meta.getAttribute("content"),
          ],
        ),
      ),
      graph: [
        ...document.querySelectorAll('script[type="application/ld+json"]'),
      ].flatMap(
        (script) => JSON.parse(script.textContent ?? "{}")["@graph"] ?? [],
      ),
    }));
    expect(seo.title).toContain(entry.name);
    expect(seo.title.length).toBeLessThanOrEqual(65);
    expect(seo.meta.description?.length).toBeGreaterThan(50);
    expect(seo.meta.description?.length).toBeLessThanOrEqual(160);
    expect(seo.meta["og:title"]).toBe(seo.title);
    expect(seo.meta["twitter:title"]).toBe(seo.title);
    expect(seo.meta["og:description"]).toBe(seo.meta.description);
    expect(seo.meta["twitter:description"]).toBe(seo.meta.description);
    expect(seo.meta["og:url"]).toBe(seo.canonical);
    expect(seo.canonical).toMatch(new RegExp(`/explore/${entry.id}$`));
    expect(seo.meta.robots).not.toContain("noindex");
    expect(seo.meta.robots).toContain("index");
    expect(seo.meta.keywords).toBeTruthy();
    expect(seo.meta["twitter:card"]).toBe("summary_large_image");
    expect(seo.meta["og:image:width"]).toBe("1200");
    expect(seo.meta["og:image:height"]).toBe("630");
    expect(seo.meta["og:image"]).toContain(
      `/explore/${entry.id}/opengraph-image`,
    );
    expect(seo.meta["twitter:image"]).toContain(
      `/explore/${entry.id}/opengraph-image`,
    );
    const graph = seo.graph as Record<string, unknown>[];
    const types = graph.map((node) => node["@type"]);
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain(
      entry.id === "private-ai" ? "CollectionPage" : "WebPage",
    );
    expect(types).toContain(
      entry.id === "private-ai" ? "ItemList" : "SoftwareApplication",
    );
    if (entry.id !== "private-ai") {
      const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(
        breadcrumb.getByRole("link", { name: "Home", exact: true }),
      ).toHaveAttribute("href", "/");
      await expect(
        breadcrumb.getByRole("link", { name: "Private AI", exact: true }),
      ).toHaveAttribute("href", "/explore/private-ai");
      expect(
        await page
          .getByRole("region", { name: "Project facts", exact: true })
          .locator("dt")
          .allTextContents(),
      ).toEqual([
        "Operator",
        "Country",
        "Code license",
        "Features",
        "Platforms",
        "Pricing",
      ]);
      const projectLinks = page.getByRole("navigation", {
        name: "Project links",
      });
      await expect(
        projectLinks.getByRole("link", { name: "Website", exact: true }),
      ).toHaveClass(/btn-primary/);
      await expect(
        projectLinks
          .getByRole("link", { name: "Website", exact: true })
          .locator("svg"),
      ).toHaveCount(0);
      if (projects.find((item) => item.id === entry.id)!.links.twitter) {
        const twitter = projectLinks.getByRole("link", {
          name: "Twitter",
          exact: true,
        });
        await expect(twitter).toHaveText("");
        await expect(twitter.locator("svg")).toHaveCount(1);
      }
      await expect(
        page
          .getByRole("navigation", { name: "Project links" })
          .getByRole("link", { name: "Website", exact: true }),
      ).toHaveAttribute(
        "href",
        projects.find((item) => item.id === entry.id)!.links.website,
      );
      await expect(
        page.locator('[aria-labelledby="project-alternatives"] a'),
      ).toHaveCount(projects.length - 1);
      await expect(
        page.locator('[aria-labelledby="project-alternatives"] .badge'),
      ).toHaveCount(projects.length - 1);
      for (const alternative of projects.filter(
        (item) => item.id !== entry.id,
      )) {
        await expect(
          page
            .locator('[aria-labelledby="project-alternatives"]')
            .getByRole("link", {
              name: new RegExp(
                alternative.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              ),
            }),
        ).toHaveAttribute("href", `/explore/${alternative.id}`);
      }
      await expect(
        page.getByRole("heading", { name: "sources", exact: true }),
      ).toHaveCount(0);
      await expect(page.getByRole("link", { name: /Back to/ })).toHaveCount(0);
      expect(
        await page
          .locator('[aria-labelledby="protection-legend"] h3')
          .allTextContents(),
      ).toEqual(["Basic", "Enhanced", "Maximum"]);
    }
    if (entry.id === "private-ai") {
      const list = graph.find((node) => node["@type"] === "ItemList");
      expect(list?.numberOfItems).toBe(projects.length);
      expect(list?.itemListElement).toHaveLength(projects.length);
    } else {
      const application = graph.find(
        (node) => node["@type"] === "SoftwareApplication",
      );
      expect(application?.name).toBe(entry.name);
      expect(application).not.toHaveProperty("offers");
      expect(application).not.toHaveProperty("aggregateRating");
      expect(application).not.toHaveProperty("license");
    }
    const imageUrl = new URL(seo.meta["og:image"]!);
    const image = await request.get(imageUrl.pathname + imageUrl.search);
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toContain("image/png");
    const bytes = await image.body();
    expect(bytes.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    expect(bytes.readUInt32BE(16)).toBe(1200);
    expect(bytes.readUInt32BE(20)).toBe(630);
    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain(`<loc>${seo.canonical}</loc>`);
  });
}
