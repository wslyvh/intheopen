import { mkdir, readFile, writeFile } from "node:fs/promises";

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
await mkdir(new URL("./licenses/", import.meta.url), { recursive: true });
await writeFile(
  new URL("./licenses/ClearURLs-LGPL-3.0.txt", import.meta.url),
  license,
);
const readme = new URL("./README.md", import.meta.url);
await writeFile(
  readme,
  (await readFile(readme, "utf8")).replace(
    /Rules\/blob\/[a-f0-9]{40}\/data\.min\.json/,
    `Rules/blob/${revision}/data.min.json`,
  ),
);
console.log(
  `Bundled ClearURLs rules at ${revision}. Run npm test before using them.`,
);
