import assert from "node:assert/strict";
import test from "node:test";
import { cleanUrl } from "../index.js";

test("removes tracking from shared links and embedded redirects", () => {
  assert.equal(
    cleanUrl(" https://youtu.be/dQw4w9WgXcQ?si=shareIdentifier-123\n"),
    "https://youtu.be/dQw4w9WgXcQ",
  );
  const destination =
    "https://www.amazon.com/dp/PRODUCT/ref=share?tag=creator-21&variant=blue#utm_medium=social&chapter=2";
  assert.equal(
    cleanUrl(`https://www.google.com/url?q=${encodeURIComponent(destination)}`),
    "https://www.amazon.com/dp/PRODUCT?variant=blue#chapter=2",
  );
});

test("allows referrals only when requested", () => {
  const link =
    "https://www.amazon.com/dp/PRODUCT?tag=creator-21&utm_source=mail";
  assert.equal(cleanUrl(link), "https://www.amazon.com/dp/PRODUCT");
  assert.equal(
    cleanUrl(link, { allowReferrals: true }),
    "https://www.amazon.com/dp/PRODUCT?tag=creator-21",
  );
});

test("preserves useful fields and their original encoding", () => {
  assert.equal(
    cleanUrl(
      "https://example.org/?q=hello%20world&x=a+b&x=%2f&utm_source=mail#chapter-2",
    ),
    "https://example.org/?q=hello%20world&x=a+b&x=%2f#chapter-2",
  );
});

test("respects provider exceptions", () => {
  const link = "https://github.com/owner/repo?ref=main&utm_source=mail";
  assert.equal(cleanUrl(link), link);
});

test("does not rewrite recognised signed links", () => {
  for (const query of [
    "X-Amz-Signature=abc",
    "X-Goog-Signature=abc",
    "sv=2025&sig=abc&se=2026",
    "Signature=abc&Key-Pair-Id=key&Expires=123",
  ]) {
    const link = `https://files.example.org/a?${query}&utm_source=mail`;
    assert.equal(cleanUrl(link), link);
  }
});

test("leaves unsupported or malformed input unchanged", () => {
  for (const link of [
    "not a link",
    "javascript:alert(1)",
    "https://example.org/a b",
    "https://example.org/?bad%ZZ=x&utm_source=mail",
  ]) {
    assert.equal(cleanUrl(link), link);
  }
});
