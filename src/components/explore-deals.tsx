import Image from "next/image";
import { DealSubmissionForm } from "@/components/deal-submission-form";

import type { Deal } from "@/utils/deals";

// Keep the card surface and layout aligned with ProjectCard in explore-projects.
const projectSurface =
  "group border-base-300 bg-base-200 hover:bg-base-300/40 focus-visible:outline-primary border transition-colors focus-visible:outline-2 focus-visible:outline-offset-4";
const metadataBadge =
  "badge badge-soft badge-sm h-auto min-h-5 whitespace-normal font-mono";

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  return (
    <a
      href={deal.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-labelledby={`deal-${index}-title`}
      className={`${projectSurface} relative flex items-start gap-4 p-4 sm:gap-6 sm:p-6`}
    >
      <div className="bg-base-100 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md sm:size-20">
        {deal.icon ? (
          <Image
            src={deal.icon}
            alt=""
            width={80}
            height={80}
            sizes="(min-width: 640px) 80px, 48px"
            className="size-full object-contain"
            unoptimized
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
      <div className="min-w-0 flex-1 break-words">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3
            id={`deal-${index}-title`}
            className="min-w-0 basis-full text-lg font-medium sm:basis-auto sm:text-xl"
          >
            {deal.title}
          </h3>
          <div className="ml-auto flex max-w-full flex-wrap justify-end gap-2 text-right sm:max-w-[55%] sm:shrink-0">
            {deal.lifetime && <span className={metadataBadge}>Lifetime</span>}
            <span className={metadataBadge}>{deal.category}</span>
          </div>
        </div>
        <p className="text-base-content/75 mt-2 text-sm leading-6 sm:text-base">
          {deal.description}
        </p>
        <p className="bg-primary/10 mt-3 inline-block max-w-full px-2 py-1 text-sm leading-6 font-medium">
          {deal.deal}
          {deal.code && (
            <>
              {" · Code: "}
              <code className="font-mono [overflow-wrap:anywhere]">
                {deal.code}
              </code>
            </>
          )}
        </p>
      </div>
    </a>
  );
}

export function ExploreDeals({ deals }: { deals: Deal[] }) {
  const categories = [...new Set(deals.map((deal) => deal.category))].sort();
  return (
    <div aria-label="Deals">
      {categories.map((category, index) => (
        <section
          key={category}
          aria-labelledby={`deal-category-${index}`}
          className="mt-12"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              id={`deal-category-${index}`}
              className="min-w-0 text-2xl font-medium lowercase"
            >
              {category}
            </h2>
            {index === 0 && <DealSubmissionForm categories={categories} />}
          </div>
          <div className="mt-5 grid gap-3">
            {deals
              .filter((deal) => deal.category === category)
              .sort((a, b) => a.title.localeCompare(b.title, "en"))
              .map((deal) => (
                <DealCard
                  key={deal.title}
                  deal={deal}
                  index={deals.indexOf(deal)}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
