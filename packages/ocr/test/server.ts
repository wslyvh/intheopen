import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

// Static fixture/asset server for package tests; no website or UI dependency.
const root = process.cwd();
const types: Record<string, string> = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".wasm": "application/wasm",
  ".png": "image/png",
};

createServer(async (request, response) => {
  const pathname = new URL(request.url!, "http://127.0.0.1:3101").pathname;
  if (pathname === "/") {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end("<!doctype html><title>OCR package tests</title>");
    return;
  }
  const path = resolve(
    root,
    `.${pathname.startsWith("/ocr/") ? `/test/.public${pathname}` : pathname}`,
  );
  if (!path.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(path);
    response.writeHead(200, {
      "Content-Type": types[extname(path)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(3101, "127.0.0.1");
