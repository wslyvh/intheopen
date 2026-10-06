"use client";

import { useCallback, useRef, useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { ImageInput } from "@/components/image-input";
import { useOcr } from "@/hooks/use-ocr";

const buttonClass =
  "focus-visible:outline-primary inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 font-mono text-xs font-bold lowercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4";

export function ImageToText() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const textVersion = useRef(0);
  const acceptText = useCallback((result: string) => {
    textVersion.current += 1;
    setText(result);
    setCopied(false);
    setError("");
    setMessage("");
  }, []);
  const ocr = useOcr(acceptText);
  const { busy } = ocr;

  function clear() {
    ocr.clear();
    textVersion.current += 1;
    setText("");
    setError("");
    setMessage("");
    setCopied(false);
  }

  async function copy() {
    const version = textVersion.current;
    setError("");
    ocr.clearFeedback();
    try {
      await navigator.clipboard.writeText(text);
      if (textVersion.current !== version) return;
      setCopied(true);
      setMessage("Text copied.");
    } catch {
      if (textVersion.current === version) {
        setError(
          "Could not copy automatically. Select the text and copy it manually.",
        );
      }
    }
  }

  return (
    <div className="mt-12">
      <div className="border-base-content/15 border">
        <ImageInput
          id="ocr"
          label="your image"
          disabled={busy}
          onFiles={ocr.read}
          filename={ocr.filename}
        >
          <p className="text-base-content/65 text-sm leading-6">
            Choose an image, drop it on this page, or paste a screenshot here.
            PNG, JPEG or WebP.
          </p>
        </ImageInput>
        <div className="p-5 sm:p-6">
          <label
            htmlFor="extracted-text"
            className="block font-mono text-sm font-bold lowercase"
          >
            extracted text
          </label>
          <textarea
            id="extracted-text"
            value={text}
            disabled={busy}
            onChange={(event) => {
              textVersion.current += 1;
              setText(event.target.value);
              setCopied(false);
              setMessage("");
              setError("");
              ocr.clearFeedback();
            }}
            rows={8}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-describedby="ocr-privacy-note"
            placeholder="Text from your image will appear here…"
            className="border-base-content/20 bg-base-100 focus-visible:outline-primary placeholder:text-base-content/40 disabled:bg-base-200/40 mt-4 block min-h-40 w-full resize-y border p-4 text-base leading-7 focus-visible:outline-2 focus-visible:outline-offset-2"
          />
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void copy()}
              disabled={busy || !text.trim()}
              aria-busy={busy}
              className={`${buttonClass} bg-primary text-primary-content hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {busy && (
                <LoaderCircle
                  className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {busy ? "analysing…" : copied ? "copied" : "copy"}
            </button>
            <button
              type="button"
              onClick={busy ? ocr.cancel : clear}
              disabled={!busy && !ocr.filename && !text && !error && !ocr.error}
              className={`${buttonClass} border-base-content/20 hover:bg-base-200 border disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {busy ? "cancel" : "clear"}
            </button>
          </div>
        </div>
        <p
          id="ocr-privacy-note"
          className="border-base-content/15 text-base-content/55 flex items-start gap-2 border-t px-5 py-4 text-xs leading-5 sm:px-6"
        >
          <ShieldCheck
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          Images are processed locally in your browser. Your images and text are
          never uploaded.
        </p>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={
          (message || ocr.message) && !copied && !busy
            ? "text-base-content/65 mt-4 text-sm leading-6"
            : "sr-only"
        }
      >
        {busy ? "Analysing image…" : ocr.message || message}
      </p>
      {(error || ocr.error) && (
        <p role="alert" className="text-error mt-3 text-sm leading-6">
          {ocr.error || error}
        </p>
      )}
    </div>
  );
}
