"use client";

import { ImageInput } from "@/components/image-input";
import { useOcr } from "@/hooks/use-ocr";
import { useTextRedaction } from "@/hooks/use-text-redaction";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import type { DetectionType } from "@intheopen/magpii";
import { FULL_MODEL_DOWNLOAD_BYTES } from "@intheopen/magpii/browser";

const example =
  "Hello Alex Morgan, the invoice for 12 Oak Street, London is ready. Please transfer the amount to NL91 ABNA 0417 1643 00. We will send a copy to alex@example.com. Call +31 6 12345678 if you have any questions.";

const labels: Record<DetectionType, string> = {
  GIVEN_NAME: "Given name",
  SURNAME: "Surname",
  PERSON: "Name",
  STREET: "Street",
  BUILDING_NUMBER: "Building number",
  POSTAL_CODE: "Postal code",
  CITY: "City",
  ADDRESS: "Address",
  EMAIL: "Email",
  PHONE: "Phone",
  URL: "URL",
  BSN: "Dutch BSN",
  IBAN: "IBAN",
  CREDIT_CARD: "Payment card",
  GOVERNMENT_ID: "Government ID",
  DATE: "Date",
  AGE: "Age",
};

const textareaClass =
  "border-base-content/20 bg-base-100 focus-visible:outline-primary block min-h-40 w-full resize-y border p-4 text-base leading-7 placeholder:text-base-content/40 focus-visible:outline-2 focus-visible:outline-offset-2";
const buttonClass =
  "focus-visible:outline-primary inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 font-mono text-xs font-bold lowercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-40";

export function TextRedactor() {
  const redaction = useTextRedaction();
  const ocr = useOcr(redaction.appendInput);
  const {
    model,
    fullCached,
    fullReady,
    download,
    downloading,
    input,
    output,
    detections,
    selected,
    reviewInput,
    sourceChanged,
    modelChanged,
    phase,
    error,
    message,
    copied,
  } = redaction;
  const busy = redaction.busy || ocr.busy;
  const showSourceNote = (sourceChanged || modelChanged) && !busy;

  function updateInput(text: string) {
    if (ocr.busy) ocr.cancel();
    ocr.clearFeedback();
    redaction.updateInput(text);
  }

  function cancel() {
    if (ocr.busy) ocr.cancel();
    redaction.cancel();
  }

  function clear() {
    ocr.clear();
    redaction.clear();
  }

  function redact() {
    if (busy) return;
    ocr.clearFeedback();
    void redaction.redact();
  }

  return (
    <div className="mt-12">
      {redaction.fullModelEnabled && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <label
            htmlFor="redaction-model"
            className="font-mono text-xs font-bold lowercase"
          >
            model
          </label>
          <select
            id="redaction-model"
            value={model}
            onChange={(event) => {
              if (ocr.busy) ocr.cancel();
              redaction.selectModel(event.target.value as "mini" | "full");
            }}
            className="border-base-content/20 bg-base-100 focus-visible:outline-primary min-h-11 border px-3 font-mono text-xs"
          >
            <option value="mini">Mini · lightweight</option>
            <option value="full">Full · experimental</option>
          </select>
          {model === "full" && (
            <span className="text-base-content/55 text-xs leading-5">
              {fullCached
                ? "Full model saved in this browser."
                : fullReady
                  ? "Full model loaded for this session."
                  : `Downloads about ${Math.round(FULL_MODEL_DOWNLOAD_BYTES / 1_000_000)} MB. Best suited to desktop browsers.`}
            </span>
          )}
          {model === "full" && fullCached && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void redaction.removeDownload()}
              className="focus-visible:outline-primary font-mono text-xs underline underline-offset-4 disabled:opacity-40"
            >
              remove download
            </button>
          )}
        </div>
      )}
      <div className="border-base-content/15 border">
        <ImageInput
          id="redactor"
          label="your text"
          labelFor="source-text"
          disabled={busy}
          onFiles={ocr.read}
          filename={ocr.filename}
          actions={
            <button
              type="button"
              onClick={() => updateInput(example)}
              disabled={busy}
              className="hover:text-primary focus-visible:outline-primary font-mono text-xs lowercase underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40"
            >
              try an example
            </button>
          }
        >
          <textarea
            id="source-text"
            value={input}
            onChange={(event) => updateInput(event.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={5}
            disabled={ocr.busy}
            className={`${textareaClass} disabled:bg-base-200/40`}
            placeholder="Paste text containing personal information…"
            aria-describedby="privacy-note"
          />
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void redact()}
              disabled={busy || !input.trim()}
              aria-busy={busy}
              className={`${buttonClass} bg-primary text-primary-content hover:bg-primary/85`}
            >
              {busy && (
                <LoaderCircle
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {busy
                ? "analysing…"
                : model === "full" && !fullCached && !fullReady
                  ? "download & redact"
                  : "redact"}
            </button>
            <button
              type="button"
              onClick={busy ? cancel : clear}
              disabled={
                !input &&
                detections === null &&
                !busy &&
                !ocr.filename &&
                !ocr.error
              }
              className={`${buttonClass} border-base-content/20 hover:bg-base-200 border`}
            >
              {busy ? "cancel" : "clear"}
            </button>
          </div>
          {download && downloading && (
            <div className="mt-4">
              <progress
                aria-label="Model download"
                max={download.total}
                value={download.loaded}
                className="accent-primary h-1 w-full"
              />
              <p className="text-base-content/55 mt-1 text-xs">
                {Math.round((100 * download.loaded) / download.total)}% ·{" "}
                {Math.round(download.loaded / 1_000_000)} /{" "}
                {Math.round(download.total / 1_000_000)} MB
              </p>
            </div>
          )}
        </ImageInput>

        {detections !== null && detections.length > 0 && (
          <div className="border-base-content/15 border-b p-5 sm:p-6">
            <fieldset>
              <legend className="mb-4 font-mono text-sm font-bold lowercase">
                review identifiers · {detections.length} found
              </legend>
              <p className="text-base-content/55 mb-4 text-sm leading-6">
                Choose which matches to redact. You can also edit the result
                below.
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
                      onChange={() => redaction.toggleDetection(index)}
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
                {sourceChanged
                  ? "Source changed. Redact again to update this result."
                  : "Model changed. Redact again to update this result."}
              </p>
            )}
          </div>
          <textarea
            id="redacted-text"
            value={output}
            onChange={(event) => redaction.updateOutput(event.target.value)}
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
            onClick={() => void redaction.copy()}
            disabled={busy || detections === null || !output}
            className={`${buttonClass} bg-primary text-primary-content hover:bg-primary/85 mt-5`}
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
          ocr.message ||
          (message &&
            detections?.length === 0 &&
            !sourceChanged &&
            !modelChanged &&
            !busy)
            ? "text-base-content/65 mt-4 text-sm leading-6"
            : "sr-only"
        }
      >
        {ocr.busy
          ? "Analysing image…"
          : redaction.busy
            ? phase === "loading"
              ? downloading
                ? "Downloading the model…"
                : "Loading the model locally…"
              : "Analysing your text locally…"
            : ocr.message || message}
      </p>
      {!busy && (error || ocr.error) && (
        <p role="alert" className="text-error mt-3 text-sm leading-6">
          {ocr.error || error}
        </p>
      )}
    </div>
  );
}
