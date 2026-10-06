# In the Open

The public website for [In the Open](https://intheopen.cc): privacy, open technology, and digital autonomy.

## Getting started

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run build
npm run check
npm run format
```

## Image to text

`/tools/image-to-text` extracts editable, copyable text from a single PNG, JPEG,
or WebP image. File selection, clipboard paste, and drag and drop share the same
reusable OCR API, using PaddleOCR v6 Tiny locally in a browser worker. Recognition
can miss text or misread characters; users review and edit the result.

The package lives in [`packages/ocr`](packages/ocr/README.md), separate
from React and Magpii. OCR loads on demand; images and text stay in the browser.
`predev` and `prebuild` compile the TypeScript package and prepare browser assets in
`public/ocr/`, excluded from Git. Builds do not fetch weights from the network.
The complete first-use runtime/model download is about 19 MB with compression.
`npm run test:ocr` runs the package’s independent fixture tests; `npm run test:e2e`
runs website integration tests.

## Text redaction SDK

The website owns the editor and its integration. Detection, masking, model files, and browser runtime come from the compiled SDK archive in `vendor/`. `npm ci` installs it, and `npm run build` prepares its browser assets automatically.

Mini model files are saved in browser storage for later visits when available. Each visit still loads the model into memory. Clearing site storage or browser eviction can require another download.

After replacing the archive, refresh the dependency lock and rebuild:

```bash
npm install ./vendor/intheopen-magpii-0.2.1.tgz
npm run build
```

## Optional Full demo

Mini remains the default. Full downloads about 250 MB only after the user's explicit download action. The SDK owns export, checksums, asset installation, runtime and browser caching. The website owns selection, progress and cancellation. Full assets are excluded from the standard SDK archive and Git.

The public demo uses the Cloudflare R2 bucket `intheopen`, with the seven compiled model/config/license files under `tools/masker-full/a207f14a31c7/int4-8303f93e-50a51293/`. Its public endpoint allows reads; uploads require account credentials. CORS allows `GET` and `HEAD` from any origin. The source checkpoint and model hashes are pinned by the SDK.

The default URL is configured in `next.config.ts`. `NEXT_PUBLIC_MAGPII_FULL_MODEL_URL` can override it before building. Set it to an empty string to hide Full. The current `r2.dev` endpoint is for the demo; a custom asset domain can replace it for production traffic.

Browsers fetch Full directly from the asset host after the user's download action. The website build does not download or export the model. The SDK verifies and caches the files locally.
