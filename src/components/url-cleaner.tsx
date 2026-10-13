"use client";

import { useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { cleanUrl } from "@intheopen/url-cleaner";

const buttonClass =
  "focus-visible:outline-primary inline-flex min-h-11 items-center justify-center px-5 py-3 font-mono text-xs font-bold lowercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4";
const textareaClass =
  "border-base-content/20 bg-base-100 focus-visible:outline-primary placeholder:text-base-content/40 mt-4 block min-h-32 w-full resize-y border p-4 text-base leading-7 focus-visible:outline-2 focus-visible:outline-offset-2";

export function UrlCleaner() {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const version = useRef(0);
  const url = input.trim();
  let valid = false;
  try {
    valid =
      /^https?:\/\//i.test(url) &&
      /^https?:$/.test(new URL(url).protocol) &&
      !/[\s\u0000]/.test(url);
  } catch {}
  const output = valid ? cleanUrl(input) : "";

  async function copy() {
    const current = version.current;
    try {
      await navigator.clipboard.writeText(output);
      if (current === version.current) setFeedback("Link copied.");
    } catch {
      if (current === version.current)
        setFeedback(
          "Could not copy automatically. Select the link and copy it manually.",
        );
    }
  }

  return (
    <div className="mt-12">
      <div className="border-base-content/15 border">
        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="original-url"
              className="block font-mono text-sm font-bold lowercase"
            >
              link
            </label>
            <textarea
              id="original-url"
              value={input}
              onChange={(event) => {
                version.current += 1;
                setInput(event.target.value);
                setFeedback("");
              }}
              rows={5}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              aria-invalid={Boolean(url && !valid)}
              aria-describedby="url-help"
              placeholder="https://example.org/article?utm_source=newsletter"
              className={textareaClass}
            />
            <p
              id="url-help"
              className="text-base-content/55 mt-3 text-sm leading-6"
            >
              {url && !valid
                ? "Paste one complete link starting with https:// or http://."
                : "Paste one link. It is cleaned as you type."}
            </p>
          </div>
          <div>
            <label
              htmlFor="cleaned-url"
              className="block font-mono text-sm font-bold lowercase"
            >
              cleaned link
            </label>
            <textarea
              id="cleaned-url"
              value={output}
              readOnly
              rows={5}
              spellCheck={false}
              aria-describedby="url-privacy-note"
              placeholder="Your cleaned link will appear here…"
              className={textareaClass}
            />
            <button
              type="button"
              onClick={() => void copy()}
              disabled={!output}
              className={`${buttonClass} bg-primary text-primary-content hover:bg-primary/85 mt-4 disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {feedback === "Link copied." ? "copied" : "copy"}
            </button>
            <p
              role="status"
              aria-live="polite"
              className={
                feedback && feedback !== "Link copied."
                  ? "text-base-content/65 mt-3 text-sm leading-6"
                  : "sr-only"
              }
            >
              {feedback}
            </p>
          </div>
        </div>
        <p
          id="url-privacy-note"
          className="border-base-content/15 text-base-content/55 flex items-start gap-2 border-t px-5 py-4 text-xs leading-5 sm:px-6"
        >
          <ShieldCheck
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          Links are processed locally in your browser. No links are shared or
          opened.
        </p>
      </div>
    </div>
  );
}
