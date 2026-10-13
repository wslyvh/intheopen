import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.text();
}

// Development-only: runtime cleaning never fetches rules.
const revision =
  process.argv[2] ??
  JSON.parse(
    await download(
      "https://api.github.com/repos/ClearURLs/Rules/commits/master",
    ),
  ).sha;
if (!/^[a-f0-9]{40}$/.test(revision))
  throw new Error("Expected a full commit SHA.");
const base = `https://raw.githubusercontent.com/ClearURLs/Rules/${revision}`;
const [text, license] = await Promise.all([
  download(`${base}/data.min.json`),
  download(`${base}/LICENSE`),
]);
const { providers } = JSON.parse(text);
if (!providers || !Object.keys(providers).length)
  throw new Error("Missing providers.");
for (const provider of Object.values(providers)) {
  new RegExp(provider.urlPattern, "i");
  for (const field of [
    "rules",
    "exceptions",
    "rawRules",
    "redirections",
    "referralMarketing",
  ]) {
    if (!Array.isArray(provider[field])) throw new Error(`Missing ${field}.`);
    for (const pattern of provider[field]) new RegExp(pattern, "i");
  }
}
await mkdir(new URL("./src/", import.meta.url), { recursive: true });
await writeFile(new URL("./src/rules.json", import.meta.url), text);
await writeFile(new URL("./LICENSE", import.meta.url), license);
await writeFile(
  new URL("./NOTICE.txt", import.meta.url),
  `ClearURLs rules: https://github.com/ClearURLs/Rules\nRevision: ${revision}\nUpstream SHA-256: ${createHash("sha256").update(text).digest("hex")}\nRules licensed under LGPL-3.0; see LICENSE.\n`,
);
console.log(
  `Bundled ClearURLs rules at ${revision}. Run npm test before using them.`,
);
