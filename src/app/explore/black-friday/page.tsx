import type { Metadata } from "next";
import Link from "next/link";
import { ExploreDeals } from "@/components/explore-deals";

import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { dealsDescription, dealsTitle, loadDeals } from "@/utils/deals";
import { site } from "@/utils/site";

const path = "/explore/black-friday";
const url = `${site.url}${path}`;

export const metadata: Metadata = {
  title: dealsTitle,
  description: dealsDescription,
  keywords: ["Black Friday", "privacy deals", "privacy tools"],
  alternates: { canonical: path },
  openGraph: {
    type: "website",
    title: `${dealsTitle} | ${site.name}`,
    description: dealsDescription,
    url: path,
    siteName: site.name,
    locale: site.locale,
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: site.name },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${dealsTitle} | ${site.name}`,
    description: dealsDescription,
    site: "@intheopencc",
    creator: "@intheopencc",
    images: [{ url: "/opengraph-image", alt: site.name }],
  },
};

export default function DealsPage() {
  const deals = loadDeals();
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: dealsTitle,
        description: dealsDescription,
        inLanguage: site.language,
        isPartOf: { "@id": `${site.url}/#website` },
        publisher: { "@id": `${site.url}/#organization` },

        mainEntity: { "@id": `${url}#deals` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#deals`,
        numberOfItems: deals.length,
        itemListOrder: "https://schema.org/ItemListUnordered",
        itemListElement: deals.map((deal, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "WebPage",
            name: deal.title,
            description: deal.deal,
            url: deal.url,
          },
        })),
      },
    ],
  };
  return (
    <>
      <JsonLd data={schema} />
      <PageHeader />
      <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <nav
          aria-label="Breadcrumb"
          className="font-mono text-sm font-bold lowercase"
        >
          <ol className="flex flex-wrap items-center gap-3">
            <li>
              <Link
                href="/"
                className="hover:text-base-content/75 focus-visible:outline-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-base-content/40">
              /
            </li>
            <li>
              <Link
                href="/explore/private-ai"
                className="hover:text-base-content/75 focus-visible:outline-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Explore
              </Link>
            </li>
            <li aria-hidden="true" className="text-base-content/40">
              /
            </li>
            <li aria-current="page" className="text-base-content/75">
              Black Friday
            </li>
          </ol>
        </nav>
        <h1 className="mt-4 text-5xl leading-none font-medium tracking-[-0.04em] lowercase sm:text-7xl">
          {dealsTitle}
        </h1>
        <p className="text-base-content/75 mt-6 max-w-2xl text-lg leading-8">
          {dealsDescription}
        </p>
        <ExploreDeals deals={deals} />
      </section>
    </>
  );
}
