"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import {
  maskText,
  redactText,
  type Detection,
  type DetectionType,
} from "@intheopen/magpii";
import {
  createBrowserDetector,
  type RampartClient,
} from "@intheopen/magpii/browser";

const example =
  "Hello Alex Morgan, the invoice for 12 Oak Street, London is ready. Please transfer the amount to NL91 ABNA 0417 1643 00. We will send a copy to alex@example.com. Call +31 6 12345678 if you have any questions.";

const labels: Record<DetectionType, string> = {
  PERSON: "Name",
  ADDRESS: "Address",
  EMAIL: "Email",
  PHONE: "Phone",
  BSN: "Dutch BSN",
  IBAN: "IBAN",
  CREDIT_CARD: "Payment card",
};

const textareaClass =
  "border-base-content/20 bg-base-100 focus-visible:outline-primary block min-h-40 w-full resize-y border p-4 text-base leading-7 placeholder:text-base-content/40 focus-visible:outline-2 focus-visible:outline-offset-2";
const buttonClass =
  "focus-visible:outline-primary inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 font-mono text-xs font-bold lowercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-40";

export function TextRedactor() {
  const [input, setInput] = useState("");
  const [reviewInput, setReviewInput] = useState("");
  const [output, setOutput] = useState("");
  const [detections, setDetections] = useState<Detection[] | null>(null);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<"idle" | "loading" | "cleaning">("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const detector = useRef<RampartClient | null>(null);
  const inputVersion = useRef(0);
  const outputVersion = useRef(0);
  const generatedOutput = useRef("");
  const job = useRef(0);
  const busy = phase !== "idle";
  const sourceChanged = detections !== null && input !== reviewInput;
  const showSourceNote = sourceChanged && !busy;

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
    if (busy) cancelRun();
    setInput(text);
    setError("");
    setMessage("");
  }

  function cancelRun() {
    job.current += 1;
    detector.current?.dispose();
    detector.current = null;
    setPhase("idle");
  }

  function clear() {
    cancelRun();
    inputVersion.current += 1;
    setInput("");
    setError("");
    setReviewInput("");
    generateOutput("");
    setDetections(null);
    setSelected([]);
  }

  async function redact() {
    if (busy || !input.trim()) return;
    if (!canRegenerateOutput()) return;
    const text = input;
    const version = inputVersion.current;
    const currentJob = ++job.current;
    setError("");
    setMessage("");
    setPhase("loading");

    try {
      detector.current ??= createBrowserDetector({
        assetBaseUrl: "/magpii/",
      });
      const currentDetector = detector.current;
      await currentDetector.warmup();
      if (job.current !== currentJob || inputVersion.current !== version)
        return;
      setPhase("cleaning");
      const result = await redactText(text, { detector: currentDetector });
      if (job.current !== currentJob || inputVersion.current !== version)
        return;

      setReviewInput(text);
      setDetections(result.detections);
      setSelected(result.detections.map(() => true));
      generateOutput(result.redactedText);
      setMessage(
        result.detections.length
          ? `${result.detections.length} identifiers found and redacted.`
          : "No supported identifiers found. Review your text before sharing.",
      );
    } catch {
      if (job.current !== currentJob) return;
      detector.current?.dispose();
      detector.current = null;
      if (inputVersion.current === version) {
        setError(
          "The local detector could not finish. Check your connection while it loads, then try again. Your text has not been sent anywhere.",
        );
      }
    } finally {
      if (job.current === currentJob) setPhase("idle");
    }
  }

  function toggleDetection(index: number) {
    if (busy || !detections || !canRegenerateOutput()) return;
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

  return (
    <div className="mt-12">
      <div className="border-base-content/15 border">
        <div className="border-base-content/15 border-b p-5 sm:p-6">
          <div className="mb-4 flex min-h-5 flex-wrap items-center justify-between gap-3">
            <label
              htmlFor="source-text"
              className="font-mono text-sm font-bold lowercase"
            >
              your text
            </label>
            <button
              type="button"
              onClick={() => updateInput(example)}
              disabled={busy}
              className="hover:text-primary focus-visible:outline-primary font-mono text-xs lowercase underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40"
            >
              try an example
            </button>
          </div>
          <textarea
            id="source-text"
            value={input}
            onChange={(event) => updateInput(event.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={5}
            className={textareaClass}
            placeholder="Paste text containing personal information…"
            aria-describedby="privacy-note"
          />
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void redact()}
              disabled={busy || !input.trim()}
              className={`${buttonClass} bg-primary text-primary-content hover:bg-primary/85`}
            >
              {busy && (
                <LoaderCircle
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {busy ? "analyzing…" : "redact"}
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={!input && detections === null && !busy}
              className={`${buttonClass} border-base-content/20 hover:bg-base-200 border`}
            >
              clear
            </button>
          </div>
        </div>

        {detections !== null && detections.length > 0 && (
          <div className="border-base-content/15 border-b p-5 sm:p-6">
            <fieldset>
              <legend className="mb-4 font-mono text-sm font-bold lowercase">
                review identifiers · {detections.length} found
              </legend>
              <p className="text-base-content/55 mb-4 text-sm leading-6">
                Uncheck a match to keep it. You can also edit the result below.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {detections.map((detection, index) => (
                  <label
                    key={`${detection.start}-${detection.end}-${detection.type}`}
                    className="border-base-content/15 hover:bg-base-200 flex cursor-pointer items-start gap-3 border p-3"
                  >
                    <input
                      type="checkbox"
                      checked={selected[index] ?? false}
                      disabled={busy}
                      onChange={() => toggleDetection(index)}
                      className="accent-primary focus-visible:outline-primary mt-1 size-4 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                    <span className="min-w-0">
                      <span className="text-primary block font-mono text-xs font-bold lowercase">
                        {labels[detection.type]}
                      </span>
                      <span className="mt-1 block text-sm leading-6 break-words">
                        {reviewInput.slice(detection.start, detection.end)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <label
              htmlFor="redacted-text"
              className="block min-h-5 font-mono text-sm font-bold lowercase"
            >
              redacted text
            </label>
            {showSourceNote && (
              <p
                id="result-note"
                className="text-base-content/55 text-xs leading-5"
              >
                Source changed. Redact again to update this result.
              </p>
            )}
          </div>
          <textarea
            id="redacted-text"
            value={output}
            onChange={(event) => updateOutput(event.target.value)}
            disabled={busy || detections === null}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={5}
            className={`${textareaClass} disabled:bg-base-200/40`}
            placeholder="Your redacted text will appear here…"
            aria-describedby={
              showSourceNote ? "result-note privacy-note" : "privacy-note"
            }
          />
          <button
            type="button"
            onClick={() => void copy()}
            disabled={busy || detections === null || !output}
            className={`${buttonClass} border-base-content/20 hover:bg-base-200 mt-5 border`}
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>
        <p
          id="privacy-note"
          className="border-base-content/15 text-base-content/55 flex items-start gap-2 border-t px-5 py-4 text-xs leading-5 sm:px-6"
        >
          <ShieldCheck
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          Text redaction runs locally in your browser. Your data is never sent
          to a server.
        </p>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={
          message && detections?.length === 0 && !sourceChanged && !busy
            ? "text-base-content/65 mt-4 text-sm leading-6"
            : "sr-only"
        }
      >
        {busy ? "Analyzing your text locally…" : message}
      </p>
      {error && (
        <p role="alert" className="text-error mt-3 text-sm leading-6">
          {error}
        </p>
      )}
    </div>
  );
}
