import { createPaddleEngine } from "./paddle.js";

export type OcrClient = {
  load(): Promise<void>;
  parse(image: Blob): Promise<string>;
  dispose(): Promise<void>;
};

/** Optional replacement engine. Use one instance per client. */
export type OcrEngine = {
  load(signal: AbortSignal): Promise<void>;
  parse(image: HTMLCanvasElement): Promise<string>;
  dispose(): Promise<void>;
};

export type OcrOptions = {
  /** Same-origin directory containing the prepared assets. */
  assetBaseUrl?: string;
  engine?: OcrEngine;
};

const MAX_BYTES = 20 * 1024 * 1024;
const MAX_PIXELS = 20_000_000;

async function imageCanvas(
  image: Blob,
  signal: AbortSignal,
): Promise<HTMLCanvasElement> {
  if (!(image instanceof Blob) || !image.size) {
    throw new Error("Choose a PNG, JPEG, or WebP image.");
  }
  if (image.size > MAX_BYTES) throw new Error("Choose an image under 20 MB.");

  // Check content, including clipboard files with an empty MIME type.
  const bytes = new Uint8Array(await image.slice(0, 12).arrayBuffer());
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!png && !jpeg && !webp) {
    throw new Error("Choose a PNG, JPEG, or WebP image.");
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(image);
  } catch {
    throw new Error("This image could not be read. Try another image.");
  }
  try {
    signal.throwIfAborted();
    if (bitmap.width * bitmap.height > MAX_PIXELS) {
      throw new Error("Choose an image under 20 megapixels.");
    }
    const canvas = document.createElement("canvas");
    // Preserve source pixels.
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not read this image.");
    // Give transparent screenshots a predictable background.
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    bitmap.close();
  }
}

/** One engine instance per client; the wrapper owns validation and lifecycle. */
export function createOcr({
  assetBaseUrl,
  engine = createPaddleEngine({ assetBaseUrl }),
}: OcrOptions = {}): OcrClient {
  const controller = new AbortController();
  let loading: Promise<void> | undefined;
  let parsing = false;

  function active<T>(promise: Promise<T>): Promise<T> {
    const signal = controller.signal;
    signal.throwIfAborted();
    return new Promise<T>((resolve, reject) => {
      const abort = () => reject(signal.reason);
      signal.addEventListener("abort", abort, { once: true });
      promise.then(
        (result) => {
          signal.removeEventListener("abort", abort);
          resolve(result);
        },
        (error) => {
          signal.removeEventListener("abort", abort);
          reject(error);
        },
      );
    });
  }

  async function load() {
    controller.signal.throwIfAborted();
    loading ??= (async () => {
      try {
        await engine.load(controller.signal);
        controller.signal.throwIfAborted();
      } catch (error) {
        loading = undefined;
        await engine.dispose();
        throw error;
      }
    })();
    await active(loading);
  }

  async function parse(image: Blob) {
    controller.signal.throwIfAborted();
    if (parsing) throw new Error("An image is already being read.");
    parsing = true;
    let canvas: HTMLCanvasElement | undefined;
    try {
      canvas = await active(imageCanvas(image, controller.signal));
      await load();
      try {
        const text = await active(engine.parse(canvas));
        if (typeof text !== "string")
          throw new Error("The OCR engine did not return text.");
        return text.trim();
      } catch (error) {
        // Validation errors above leave a loaded reader intact; inference errors
        // release it so the same client can initialize again on the next image.
        loading = undefined;
        await engine.dispose();
        throw error;
      }
    } finally {
      if (canvas) canvas.width = canvas.height = 0;
      parsing = false;
    }
  }

  async function dispose() {
    controller.abort(new DOMException("OCR disposed", "AbortError"));
    await engine.dispose();
  }

  return { load, parse, dispose };
}
