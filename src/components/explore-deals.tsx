"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Deal } from "@/utils/deals";

const metadataBadge =
  "text-base-content/75 bg-base-content/5 inline-flex items-center rounded-full px-2.5 py-1 text-xs";

function DealIcon({ deal }: { deal: Deal }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="bg-base-100 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md sm:size-20">
      {deal.icon && !failed ? (
        <Image
          src={deal.icon}
          alt=""
          width={80}
          height={80}
          sizes="(min-width: 640px) 80px, 48px"
          className="size-full object-contain"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="text-base-content/75 text-2xl font-medium"
          aria-hidden="true"
        >
          {deal.title[0]}
        </span>
      )}
    </div>
  );
}

function expiryLabel(expires: string) {
  const date = new Date(expires);
  if (Number.isNaN(date.getTime())) return expires;
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "long",
      ...(expires.includes("T") ? { timeStyle: "short" } : {}),
      timeZone: "UTC",
    }).format(date) + (expires.includes("T") ? " UTC" : "")
  );
}

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  return (
    <article
      aria-labelledby={`deal-${index}-title`}
      className="group border-base-300 bg-base-200 hover:bg-base-300/40 flex min-w-0 items-start gap-4 border p-4 transition-colors sm:gap-6 sm:p-6"
    >
      <DealIcon deal={deal} />
      <div className="min-w-0 flex-1 break-words">
        <h2
          id={`deal-${index}-title`}
          className="text-lg font-medium sm:text-xl"
        >
          {deal.title}
        </h2>
        <p className="text-base-content/75 mt-2 text-sm leading-6 sm:text-base">
          {deal.description}
        </p>
        <p className="mt-4 text-lg leading-7 font-medium sm:text-xl">
          {deal.deal}
        </p>
        <ul
          aria-label="Category and tags"
          className="mt-3 flex flex-wrap gap-2"
        >
          <li className={metadataBadge}>{deal.category}</li>
          {deal.tags.map((tag) => (
            <li key={tag} className={metadataBadge}>
              {tag}
            </li>
          ))}
        </ul>
        {deal.terms && (
          <p className="text-base-content/75 mt-4 text-sm leading-6">
            {deal.terms}
          </p>
        )}
        {deal.code && (
          <p className="mt-3 text-sm leading-6">
            Code:{" "}
            <code className="bg-base-100 px-2 py-1 font-mono [overflow-wrap:anywhere]">
              {deal.code}
            </code>
          </p>
        )}
        {deal.expires && (
          <p className="text-base-content/75 mt-3 text-sm leading-6">
            Ends{" "}
            <time dateTime={deal.expires}>{expiryLabel(deal.expires)}</time>
          </p>
        )}
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-base-content/75 focus-visible:outline-primary mt-3 inline-flex min-h-11 items-center gap-2 font-mono text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          View official deal{" "}
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function ExploreDeals({ deals }: { deals: Deal[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const categories = [...new Set(deals.map((deal) => deal.category))].sort();
  const tags = [...new Set(deals.flatMap((deal) => deal.tags))].sort();
  const search = query.trim().toLowerCase();
  const filtered = deals.filter(
    (deal) =>
      (!category || deal.category === category) &&
      (!tag || deal.tags.includes(tag)) &&
      (!search ||
        [
          deal.title,
          deal.description,
          deal.deal,
          deal.category,
          ...deal.tags,
          deal.code,
          deal.terms,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search)),
  );
  const field =
    "border-base-300 bg-base-200 focus-visible:outline-primary mt-2 min-h-11 w-full min-w-0 border px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <section aria-label="Deals" className="mt-10">
      <form
        role="search"
        aria-label="Filter deals"
        onSubmit={(event) => event.preventDefault()}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_14rem_12rem]"
      >
        <label className="min-w-0 sm:col-span-2 lg:col-span-1">
          <span className="font-mono text-sm">Search deals</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, offers, or codes"
            className={field}
          />
        </label>
        <label className="min-w-0">
          <span className="font-mono text-sm">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={field}
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="font-mono text-sm">Tag</span>
          <select
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className={field}
          >
            <option value="">All tags</option>
            {tags.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </form>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p role="status" className="text-base-content/75 text-sm">
          Showing {filtered.length} of {deals.length} deals
        </p>
        <button
          type="button"
          disabled={!query && !category && !tag}
          onClick={() => {
            setQuery("");
            setCategory("");
            setTag("");
          }}
          className="hover:text-base-content/75 focus-visible:outline-primary min-h-11 font-mono text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>
      <div className="mt-3 grid gap-3">
        {filtered.map((deal, index) => (
          <DealCard key={deal.title} deal={deal} index={index} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="border-base-300 bg-base-200 mt-3 border p-6">
          <p className="font-medium">No deals match your filters.</p>
          <p className="text-base-content/75 mt-2 text-sm leading-6">
            Try another search or clear the filters to see all deals.
          </p>
        </div>
      )}
    </section>
  );
}
