# @intheopen/ocr

Standalone TypeScript browser OCR using PaddleOCR v6 Tiny. This package owns
model/runtime assets, image validation, inference and cleanup. ITO owns the UI
and serves prepared assets. No React, Next.js or Magpii dependency.

```ts
import { createOcr } from "@intheopen/ocr";

const ocr = createOcr();
try {
  await ocr.load(); // Optional: parse() loads on demand.
  const text = await ocr.parse(image); // PNG/JPEG/WebP Blob or File → string
} finally {
  await ocr.dispose();
}
```

Reuse a client for sequential images. Limits: 20 MB and 20 megapixels. Source
pixels are preserved; transparency is composited onto white. `dispose()` rejects
pending calls and releases resources, including initialization that finishes late.
A disposed client cannot be reused. `createOcr({ engine })` accepts a replacement
adapter with the same three methods (see the generated `dist/index.d.ts`).
Rejected images leave a loaded reader intact. Initialization/inference errors
release failed resources so the next image can retry with the same client.

PaddleOCR discards snippets with recognition confidence below 0.5 and removes
unsupported Han characters to reduce icon noise. Other scripts, accents and
punctuation are kept. Incorrect or missing text is still possible.

Inside this package, run `npm run build` to generate ESM and types in `dist/`.
Prepare browser assets with `node dist/assets.js /path/to/site/public/ocr`;
installed consumers can use `ocr-assets public/ocr`. The default asset URL is
`/ocr/paddle/`; `assetBaseUrl` can change it on the same origin. First use downloads
about 19 MB with gzip. Images and text are never uploaded or stored by OCR.
Versions and weights are pinned; builds need no model downloads. Sources/checksums
are in [`data/paddle/models.json`](data/paddle/models.json), licenses in [`NOTICE.txt`](NOTICE.txt).

Run `npm test` inside this package, or `npm run test:ocr` from ITO. Its own static
server and Chromium tests call the real API on thirteen original images, without
the website. Coverage includes light/dark text, small fonts, documents, tables,
forms, handwriting, desktop interfaces and invoices. Expectations are transcribed
from the images; only case and whitespace are normalized. Raw output is attached
to results. Known recognition failures stay visible. Passing selected phrases does not
establish full-image accuracy. Table structure, checkbox states and PDF input are
not supported. ITO's `npm run test:e2e` separately checks its website integration.

Fixtures supplied from web search are test examples, not actual patient records;
email/chat/contact images are synthetic. Original search URLs/licenses were not
supplied. Tests and fixtures are excluded from the distributed package.
