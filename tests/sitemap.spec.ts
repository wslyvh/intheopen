import { expect, test } from "@playwright/test";

test("robots advertises the canonical XML sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const robots = await response.text();
  expect(robots).toContain("Sitemap: https://www.intheopen.cc/sitemap.xml");
  expect(robots).toContain("Allow: /");
  expect(robots).not.toContain("sitemap.txt");
  expect(robots).not.toMatch(/^Host:/m);
});

test("XML sitemap exposes unique canonical URLs and the recovery endpoint is removed", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/xml");
  const xml = await response.text();
  expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  expect(xml.charCodeAt(0)).not.toBe(0xfeff);
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  expect(urls.length).toBeGreaterThan(0);
  expect(new Set(urls).size).toBe(urls.length);
  for (const url of urls) {
    expect(new URL(url).origin).toBe("https://www.intheopen.cc");
    expect(url).not.toMatch(/\s/);
  }
  expect((await request.head("/sitemap.xml")).status()).toBe(200);
  expect((await request.get("/sitemap.txt")).status()).toBe(404);
});
