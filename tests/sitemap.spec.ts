import { expect, test } from "@playwright/test";

test("robots advertises the recovery sitemap without unsupported Host directive", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const robots = await response.text();
  expect(robots).toContain("Sitemap: https://www.intheopen.cc/sitemap.txt");
  expect(robots).toContain("Allow: /");
  expect(robots).not.toMatch(/^Host:/m);
});

// Recovery path for Google's persistently failed XML sitemap submission.
test("plain-text sitemap exposes the same canonical URLs as XML", async ({
  request,
}) => {
  const response = await request.get("/sitemap.txt");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  const text = await response.text();
  expect(text.charCodeAt(0)).not.toBe(0xfeff);
  const urls = text.trim().split("\n");
  expect(urls.length).toBeGreaterThan(0);
  expect(new Set(urls).size).toBe(urls.length);
  for (const url of urls) {
    expect(new URL(url).origin).toBe("https://www.intheopen.cc");
    expect(url).not.toMatch(/\s/);
  }
  const xml = await request.get("/sitemap.xml");
  expect(xml.status()).toBe(200);
  const xmlUrls = [...(await xml.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(urls.sort()).toEqual(xmlUrls.sort());
  const head = await request.head("/sitemap.txt");
  expect(head.status()).toBe(200);
  expect(head.headers()["content-type"]).toContain("text/plain");
});
