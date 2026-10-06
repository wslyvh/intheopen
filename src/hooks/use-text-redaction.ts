"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  maskText,
  mergeDetections,
  redactText,
  type Detection,
} from "@intheopen/magpii";
import {
  createBrowserDetector,
  isFullModelCached,
  clearFullModelCache,
  type BrowserDetectorClient,
} from "@intheopen/magpii/browser";

const fullModelBaseUrl = process.env.NEXT_PUBLIC_MAGPII_FULL_MODEL_URL;

export function useTextRedaction() {
  const [model, setModel] = useState<"mini" | "full">("mini");
  const [reviewModel, setReviewModel] = useState<"mini" | "full">("mini");
  const [fullCached, setFullCached] = useState(false);
  const [fullReady, setFullReady] = useState(false);
  const [download, setDownload] = useState<{
    loaded: number;
    total: number;
  } | null>(null);
  const [input, setInput] = useState("");
  const [reviewInput, setReviewInput] = useState("");
  const [output, setOutput] = useState("");
  const [detections, setDetections] = useState<Detection[] | null>(null);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<"idle" | "loading" | "cleaning">("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const detector = useRef<BrowserDetectorClient | null>(null);
  const inputVersion = useRef(0);
  const outputVersion = useRef(0);
  const generatedOutput = useRef("");
  const job = useRef(0);
  const running = useRef(false);
  const busy = phase !== "idle";
  const downloading =
    model === "full" &&
    phase === "loading" &&
    !fullCached &&
    (!download || download.loaded < download.total);
  const sourceChanged = detections !== null && input !== reviewInput;
  const modelChanged = detections !== null && model !== reviewModel;

  const cancel = useCallback(() => {
    job.current += 1;
    running.current = false;
    detector.current?.dispose();
    detector.current = null;
    setPhase("idle");
    setDownload(null);
    setFullReady(false);
  }, []);

  useEffect(() => {
    let active = true;
    const currentJob = job.current;
    if (model === "full" && fullModelBaseUrl) {
      void isFullModelCached(fullModelBaseUrl).then((cached) => {
        if (active && job.current === currentJob) setFullCached(cached);
      });
    }
    return () => {
      active = false;
    };
  }, [model]);

  useEffect(() => {
    return () => {
      job.current += 1;
      outputVersion.current += 1;
      detector.current?.dispose();
      detector.current = null;
    };
  }, []);

  function updateOutput(text: string) {
    outputVersion.current += 1;
    setOutput(text);
    setCopied(false);
    setMessage("");
  }

  function generateOutput(text: string) {
    generatedOutput.current = text;
    updateOutput(text);
  }

  function canRegenerateOutput() {
    return (
      output === generatedOutput.current ||
      window.confirm(
        "This will replace your edits to the redacted text. Continue?",
      )
    );
  }

  function updateInput(text: string) {
    inputVersion.current += 1;
    if (running.current) cancel();
    setInput(text);
    setError("");
    setMessage("");
  }

  const appendInput = useCallback(
    (text: string) => {
      if (!text) return;
      if (running.current) cancel();
      inputVersion.current += 1;
      setInput((current) => (current.trim() ? `${current}\n\n${text}` : text));
      setError("");
      setMessage("");
    },
    [cancel],
  );

  function clearFeedback() {
    setError("");
    setMessage("");
  }

  function selectModel(next: "mini" | "full") {
    cancel();
    setModel(next);
    clearFeedback();
  }

  async function removeDownload() {
    cancel();
    try {
      await clearFullModelCache();
      setFullCached(false);
    } catch {
      setError(
        "Could not remove the saved model. Clear this site's storage in your browser settings.",
      );
    }
  }

  function clear() {
    cancel();
    inputVersion.current += 1;
    setInput("");
    setError("");
    setReviewInput("");
    generateOutput("");
    setDetections(null);
    setSelected([]);
  }

  async function redact() {
    if (running.current || !input.trim()) return;
    if (!canRegenerateOutput()) return;
    running.current = true;
    const text = input;
    const version = inputVersion.current;
    const currentJob = ++job.current;
    setError("");
    setMessage("");
    setPhase("loading");
    setDownload(null);

    try {
      if (model === "full" && fullModelBaseUrl) {
        const cached = await isFullModelCached(fullModelBaseUrl);
        if (job.current !== currentJob || inputVersion.current !== version)
          return;
        setFullCached(cached);
      }
      detector.current ??= createBrowserDetector({
        assetBaseUrl: "/magpii/",
        model,
        fullModelBaseUrl,
        onProgress: (progress) => {
          if (job.current === currentJob) {
            setFullCached(false);
            setDownload(progress);
          }
        },
      });
      const currentDetector = detector.current;
      await currentDetector.warmup();
      if (job.current !== currentJob || inputVersion.current !== version)
        return;
      if (model === "full" && fullModelBaseUrl) {
        const cached = await isFullModelCached(fullModelBaseUrl);
        if (job.current !== currentJob || inputVersion.current !== version)
          return;
        setFullReady(true);
        setFullCached(cached);
      }
      if (job.current !== currentJob) return;
      setDownload(null);
      setPhase("cleaning");
      const result = await redactText(text, { detector: currentDetector });
      if (job.current !== currentJob || inputVersion.current !== version)
        return;

      setReviewInput(text);
      setReviewModel(model);
      // Review each span once, with every detected identifier selected.
      const reviewDetections = mergeDetections(result.detections, text.length);
      setDetections(reviewDetections);
      setSelected(reviewDetections.map(() => true));
      generateOutput(maskText(text, reviewDetections));
      setMessage(
        reviewDetections.length
          ? `${reviewDetections.length} identifiers found. ${reviewDetections.length} selected for redaction.`
          : "No supported identifiers found. Review your text before sharing.",
      );
    } catch {
      if (job.current !== currentJob) return;
      detector.current?.dispose();
      detector.current = null;
      setFullReady(false);
      if (inputVersion.current === version) {
        setError(
          "The local detector could not finish. Check your connection while it loads, then try again. Your text has not been sent anywhere.",
        );
      }
    } finally {
      if (job.current === currentJob) {
        running.current = false;
        setPhase("idle");
        setDownload(null);
      }
    }
  }

  function toggleDetection(index: number) {
    if (running.current || !detections || !canRegenerateOutput()) return;
    const next = selected.map((value, position) =>
      position === index ? !value : value,
    );
    setSelected(next);
    generateOutput(
      maskText(
        reviewInput,
        detections.filter((_, position) => next[position]),
      ),
    );
    setMessage(
      `${next.filter(Boolean).length} identifiers selected for redaction.`,
    );
  }

  async function copy() {
    const version = outputVersion.current;
    setError("");
    try {
      await navigator.clipboard.writeText(output);
      if (outputVersion.current !== version) return;
      setCopied(true);
      setMessage("Redacted text copied.");
    } catch {
      if (outputVersion.current === version) {
        setError(
          "Could not copy automatically. Select the redacted text and copy it manually.",
        );
      }
    }
  }

  return {
    input,
    updateInput,
    appendInput,
    output,
    updateOutput,
    model,
    selectModel,
    fullModelEnabled: Boolean(fullModelBaseUrl),
    fullCached,
    fullReady,
    download,
    downloading,
    removeDownload,
    detections,
    selected,
    reviewInput,
    sourceChanged,
    modelChanged,
    phase,
    busy,
    error,
    message,
    copied,
    redact,
    cancel,
    clear,
    toggleDetection,
    copy,
  };
}
