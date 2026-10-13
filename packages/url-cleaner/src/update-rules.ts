import { mkdir, readFile, writeFile } from "node:fs/promises";
import type rules from "./rules.json";

async function download(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.text();
}

// Development-only: runtime cleaning never fetches rules.
const revision: string =
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
const { providers } = JSON.parse(text) as typeof rules;
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
  ] as const) {
    if (!Array.isArray(provider[field])) throw new Error(`Missing ${field}.`);
    for (const pattern of provider[field]) new RegExp(pattern, "i");
  }
}
const root = new URL("../", import.meta.url);
await mkdir(new URL("src/", root), { recursive: true });
await writeFile(new URL("src/rules.json", root), text);
await mkdir(new URL("licenses/", root), { recursive: true });
await writeFile(new URL("licenses/ClearURLs-LGPL-3.0.txt", root), license);
const readme = new URL("README.md", root);
await writeFile(
  readme,
  (await readFile(readme, "utf8")).replace(
    /Rules\/blob\/[a-f0-9]{40}\/LICENSE/,
    `Rules/blob/${revision}/LICENSE`,
  ),
);
console.log(
  `Bundled ClearURLs rules at ${revision}. Run npm test before using them.`,
);
