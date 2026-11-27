"use client";

import { useRef, useState, type FormEvent } from "react";

export function DealSubmissionForm({ categories }: { categories: string[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const field =
    "border-base-300 bg-base-200 focus-visible:outline-primary mt-2 w-full border px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/deal-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(
          result.error ||
            "Could not send your submission. Please try again later.",
        );
      }
      form.reset();
      setStatus("sent");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not send your submission. Please try again later.",
      );
      setStatus("idle");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="bg-primary text-primary-content hover:bg-primary/90 focus-visible:outline-primary shrink-0 px-4 py-2 text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Submit a deal
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="submit-deal-title"
        className="border-base-300 bg-base-100 text-base-content backdrop:bg-neutral/40 fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto border p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="submit-deal-title" className="text-2xl font-medium">
            Submit a deal
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="focus-visible:outline-primary px-2 py-1 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Close
          </button>
        </div>
        {status === "sent" ? (
          <p role="status" className="mt-4 text-sm">
            Thanks. Your suggestion has been sent for review.
          </p>
        ) : (
          <form
            aria-label="Suggest a privacy deal"
            onSubmit={submit}
            className="mt-5 grid gap-4 text-sm"
          >
            <p className="text-base-content/75">
              Suggest a privacy-focused project and its offer. We review
              suggestions before listing them.
            </p>
            <label>
              Title
              <input name="title" required className={field} />
            </label>
            <label>
              Category
              <select
                aria-label="Category"
                name="category"
                required
                className={field}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              Short description
              <textarea
                name="description"
                required
                rows={2}
                className={field}
              />
            </label>
            <label>
              Offer link
              <input name="offerUrl" type="url" required className={field} />
            </label>
            <label>
              Discount / offer
              <input
                name="discount"
                required
                placeholder="e.g. 30% off your first year"
                className={field}
              />
            </label>
            <label>
              Coupon code (optional)
              <input name="couponCode" className={field} />
            </label>
            <label>
              Contact name
              <input
                name="contactName"
                autoComplete="name"
                required
                className={field}
              />
            </label>
            <label>
              Contact email
              <input
                name="contactEmail"
                type="email"
                autoComplete="email"
                required
                className={field}
              />
            </label>
            <p className="text-base-content/75">
              Your contact details are used to review your suggestion and won’t
              be published.
            </p>
            {error && (
              <p role="alert" className="text-error">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="bg-primary/15 hover:bg-primary/25 focus-visible:outline-primary w-fit px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Submit deal"}
            </button>
          </form>
        )}
      </dialog>
    </>
  );
}
