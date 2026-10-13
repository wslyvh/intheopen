# Image to text

Extract text from images locally in the browser with PaddleOCR Tiny. Images and text are never uploaded.

## Usage

```ts
import { createOcr } from "@intheopen/ocr";

const ocr = createOcr();
try {
  const text = await ocr.parse(image); // PNG, JPEG or WebP Blob/File
} finally {
  await ocr.dispose();
}
```

Reuse a client for sequential images. Images are limited to 20 MB and 20 megapixels.
Prepare browser assets with `ocr-assets public/ocr`; they are served from `/ocr/paddle/` by default.
Pass `{ assetBaseUrl }` to `createOcr()` to use another same-origin path.

## Notice

PaddleOCR.js and PP-OCRv6 Tiny retain [Apache-2.0](data/paddle/LICENSE.txt); ONNX Runtime retains its [MIT licence](data/paddle/ORT-LICENSE.txt) and [upstream notices](data/paddle/ORT-NOTICES.txt).
Pinned model sources and checksums are in [models.json](data/paddle/models.json).
The Paddle worker and model assets are unmodified; weights and configuration are repackaged for browser hosting.
Prepared browser assets include the upstream licences for PaddleOCR, ONNX Runtime, OpenCV, js-yaml and clipper-lib, plus notices embedded in the worker.
