import type { PaddleOCR } from "@paddleocr/paddleocr-js";
import type { OcrEngine } from "./index.js";

export function createPaddleEngine({
  assetBaseUrl = "/ocr/paddle/",
}: { assetBaseUrl?: string } = {}): OcrEngine {
  let pipeline: Awaited<ReturnType<typeof PaddleOCR.create>> | undefined;
  return {
    async load(signal) {
      const base = new URL(assetBaseUrl, location.href);
      if (base.origin !== location.origin) {
        throw new Error("OCR assets must be hosted on this site's origin.");
      }
      if (!base.pathname.endsWith("/")) base.pathname += "/";
      const sdkUrl = new URL("sdk.mjs", base).href;
      const { PaddleOCR }: typeof import("@paddleocr/paddleocr-js") =
        await import(
          /* webpackIgnore: true */ /* turbopackIgnore: true */ sdkUrl
        );
      signal.throwIfAborted();
      const name = "PP-OCRv6_tiny";
      pipeline = await PaddleOCR.create({
        textDetectionModelName: `${name}_det`,
        textRecognitionModelName: `${name}_rec`,
        textDetectionModelAsset: { url: new URL(`${name}_det.tar`, base).href },
        textRecognitionModelAsset: {
          url: new URL(`${name}_rec.tar`, base).href,
        },
        textRecScoreThresh: 0.5,
        worker: true,
        ortOptions: {
          backend: "wasm",
          wasmPaths: base.href,
          numThreads: 1,
          simd: true,
        },
      });
    },
    async parse(canvas) {
      const [result] = await pipeline!.predict(canvas);
      // The SDK's line order is preserved. Tables are still plain text.
      return (
        result.items
          // Chinese is unsupported; interface icons can be misread as Han text.
          .map((item) => item.text.replace(/\p{Script=Han}+/gu, "").trim())
          .filter(Boolean)
          .join("\n")
      );
    },
    async dispose() {
      const current = pipeline;
      pipeline = undefined;
      await current?.dispose();
    },
  };
}
