"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createOcr, type OcrClient } from "@intheopen/ocr";

export function useOcr(onText: (text: string) => void) {
  const [busy, setBusy] = useState(false);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const client = useRef<OcrClient | null>(null);
  const job = useRef(0);
  const running = useRef(false);

  useEffect(
    () => () => {
      job.current += 1;
      void client.current?.dispose();
      client.current = null;
      running.current = false;
    },
    [],
  );

  const clearFeedback = useCallback(() => {
    setError("");
    setMessage("");
  }, []);

  const cancel = useCallback(() => {
    job.current += 1;
    void client.current?.dispose();
    client.current = null;
    running.current = false;
    setBusy(false);
    clearFeedback();
  }, [clearFeedback]);

  const clear = useCallback(() => {
    cancel();
    setFilename("");
  }, [cancel]);

  const read = useCallback(
    async (files: FileList | File[]) => {
      if (running.current || !files.length) return;
      clearFeedback();
      if (files.length !== 1) {
        setError("Choose one image at a time.");
        return;
      }
      running.current = true;
      const currentJob = ++job.current;
      const image = files[0];
      setBusy(true);
      try {
        client.current ??= createOcr();
        const text = await client.current.parse(image);
        if (job.current !== currentJob) return;
        onText(text);
        setFilename(image.name || "Clipboard image");
        setMessage(text ? "" : "No text found. Try a clearer image.");
      } catch (cause) {
        if (job.current !== currentJob) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Text recognition could not finish. Please try again.",
        );
      } finally {
        if (job.current === currentJob) {
          running.current = false;
          setBusy(false);
        }
      }
    },
    [clearFeedback, onText],
  );

  return { read, busy, filename, error, message, cancel, clear, clearFeedback };
}
