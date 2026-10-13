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

- Uses [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) (Apache-2.0) and [ONNX Runtime](https://github.com/microsoft/onnxruntime) (MIT).
