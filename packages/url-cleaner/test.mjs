import assert from "node:assert/strict";
import test from "node:test";
import { cleanUrl } from "./dist/index.js";

test("trims surrounding whitespace before cleaning HTTP links", () => {
  assert.equal(
    cleanUrl(" \t\nhttps://youtu.be/dQw4w9WgXcQ?si=shareIdentifier-123\r\n "),
    "https://youtu.be/dQw4w9WgXcQ",
  );
  assert.equal(
    cleanUrl(" https://example.org/?q=%20hello%20 "),
    "https://example.org/?q=%20hello%20",
  );
  const signed =
    "https://files.example.org/a?X-Amz-Signature=abc&utm_source=mail";
  assert.equal(cleanUrl(` ${signed}\n`), signed);
  const malformed = "https://example.org/?bad%ZZ=x&utm_source=mail";
  assert.equal(cleanUrl(` ${malformed} `), malformed);
  assert.equal(cleanUrl(" not a URL "), " not a URL ");
});

test("returns malformed and unsupported input unchanged", () => {
  for (const input of [
    "",
    "not a link",
    "/relative?utm_source=mail",
    "ftp://example.org/a",
    "javascript:alert(1)",
    "https://example.org/a b?utm_source=mail",
    "https://example.org/?bad%ZZ=x&utm_source=mail",
  ]) {
    assert.equal(cleanUrl(input), input);
  }
});

test("keeps useful video parameters and removes repeated encoded tracking keys", () => {
  assert.equal(
    cleanUrl("https://youtu.be/VIDEO?si=share&t=120&list=PLAYLIST"),
    "https://youtu.be/VIDEO?t=120&list=PLAYLIST",
  );
  assert.equal(
    cleanUrl(
      "https://example.org/?%75tm_source=mail&utm_source=other&id=1&id=2",
    ),
    "https://example.org/?id=1&id=2",
  );
});

test("applies site-specific raw fragment rules", () => {
  assert.equal(
    cleanUrl("https://pantip.com/topic/123#leadshare"),
    "https://pantip.com/topic/123",
  );
});

test("cleans nested wrappers without network access and is stable on repeat", () => {
  const fetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error("Cleaning must not fetch.");
  };
  try {
    const destination = "https://example.org/article?utm_source=mail&id=123";
    const inner = `https://www.google.com/url?q=${encodeURIComponent(destination)}`;
    const cleaned = cleanUrl(
      `https://www.google.com/url?q=${encodeURIComponent(inner)}`,
    );
    assert.equal(cleaned, "https://example.org/article?id=123");
    assert.equal(cleanUrl(cleaned), cleaned);
  } finally {
    globalThis.fetch = fetch;
  }
});

test("preserves untouched URLs and upstream exceptions exactly", () => {
  for (const url of [
    "https://example.org/a?",
    "https://example.org/a#",
    "https://example.org/a?#",
    "https://example.org/a?token=abc&signature=value#/account?tab=settings",
    "https://github.com/owner/repo?ref=main&utm_source=mail",
    "https://www.amazon.com/s?k=ukulele&tag=creator-21",
  ])
    assert.equal(cleanUrl(url, { preserveReferrals: true }), url);
});

test("can preserve referral attribution while removing ordinary tracking", () => {
  assert.equal(
    cleanUrl(
      "https://www.amazon.com/dp/PRODUCT?tag=creator-21&ascsubtag=share&utm_source=mail",
      { preserveReferrals: true },
    ),
    "https://www.amazon.com/dp/PRODUCT?tag=creator-21&ascsubtag=share",
  );
});

test("leaves recognised signed links intact, including wrapped destinations", () => {
  const urls = [
    "https://files.example.org/a?X-Amz-Signature=abc&X-Amz-Credential=key&utm_source=mail",
    "https://files.example.org/a?X-Goog-Signature=abc&utm_source=mail",
    "https://store.blob.core.windows.net/a?sv=2025&sig=abc&se=2026&utm_source=mail",
    "https://cdn.example.org/a?Signature=abc&Key-Pair-Id=key&Expires=123&utm_source=mail",
  ];
  for (const url of urls) {
    assert.equal(cleanUrl(url), url);
    assert.equal(
      cleanUrl(`https://www.google.com/url?q=${encodeURIComponent(url)}`),
      url,
    );
  }
});

test("removes tracking without re-encoding useful query fields", () => {
  assert.equal(
    cleanUrl(
      "https://example.org/a?q=hello%20world&utm_source=mail&x=a+b&x=%2f#chapter-2",
    ),
    "https://example.org/a?q=hello%20world&x=a+b&x=%2f#chapter-2",
  );
});

test("cleans tracking redirects, path baggage, referrals and fragment fields", () => {
  const destination =
    "https://www.amazon.com/dp/PRODUCT/ref=share?tag=creator-21&variant=blue&utm_source=mail#utm_medium=social&chapter=2";
  assert.equal(
    cleanUrl(`https://www.google.com/url?q=${encodeURIComponent(destination)}`),
    "https://www.amazon.com/dp/PRODUCT?variant=blue#chapter=2",
  );
});
