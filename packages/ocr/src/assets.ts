#!/usr/bin/env node
import { copyFile, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const output = resolve(process.argv[2] ?? "public/ocr");
await mkdir(output, { recursive: true });
await writeFile(
  join(output, "NOTICE.txt"),
  await readFile(new URL("../NOTICE.txt", import.meta.url)),
);

const paddle = join(output, "paddle");
await mkdir(paddle, { recursive: true });
const sdkEntry = fileURLToPath(import.meta.resolve("@paddleocr/paddleocr-js"));
// Keep the SDK's prebuilt worker and matching ORT 1.24.3 runtime together.
// Hosting this module avoids framework-specific worker/bundler rewrites.
await build({
  entryPoints: [sdkEntry],
  outfile: join(paddle, "sdk.mjs"),
  bundle: true,
  format: "esm",
  platform: "browser",
  minify: true,
  // OpenCV's unused Node branch references these built-ins.
  external: ["fs", "path"],
  plugins: [
    {
      name: "local-ort",
      setup(builder) {
        builder.onResolve({ filter: /^onnxruntime-web$/ }, () => ({
          path: "./ort.wasm.bundle.min.mjs",
          external: true,
        }));
      },
    },
  ],
});
await cp(join(dirname(sdkEntry), "assets"), join(paddle, "assets"), {
  recursive: true,
  filter: (source) => !source.endsWith(".map"),
});
const ort = dirname(require.resolve("onnxruntime-web/wasm"));
for (const name of [
  "ort.wasm.bundle.min.mjs",
  // The SDK's prebuilt worker uses ORT's JSEP build even with backend: wasm.
  "ort-wasm-simd-threaded.jsep.mjs",
  "ort-wasm-simd-threaded.jsep.wasm",
])
  await copyFile(join(ort, name), join(paddle, name));
for (const part of ["det", "rec"]) {
  const filename = `PP-OCRv6_tiny_${part}.tar`;
  await copyFile(
    new URL(`../data/paddle/${filename}`, import.meta.url),
    join(paddle, filename),
  );
}
await copyFile(
  new URL("../data/paddle/LICENSE.txt", import.meta.url),
  join(paddle, "PaddleOCR-LICENSE.txt"),
);
await copyFile(
  new URL("../data/paddle/ORT-LICENSE.txt", import.meta.url),
  join(paddle, "ORT-LICENSE.txt"),
);
await copyFile(
  new URL("../data/paddle/ORT-NOTICES.txt", import.meta.url),
  join(paddle, "ORT-NOTICES.txt"),
);
await copyFile(
  join(dirname(require.resolve("js-yaml/package.json")), "LICENSE"),
  join(paddle, "yaml-LICENSE.txt"),
);
await copyFile(
  join(
    dirname(require.resolve("@techstark/opencv-js/package.json")),
    "LICENSE",
  ),
  join(paddle, "opencv-LICENSE.txt"),
);
await copyFile(
  new URL("../data/paddle/clipper-LICENSE.txt", import.meta.url),
  join(paddle, "clipper-LICENSE.txt"),
);
console.log(`PaddleOCR Tiny assets prepared in ${paddle}`);
