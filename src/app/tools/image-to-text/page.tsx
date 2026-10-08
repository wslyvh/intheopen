import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ImageToText } from "@/components/image-to-text";
import { site } from "@/utils/site";

const title = "Image to text";
const description =
  "Extract text from images and screenshots, locally in your browser. Edit and copy the result.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/image-to-text" },
  openGraph: {
    type: "website",
    title: `${title} | ${site.name}`,
    description,
    url: "/tools/image-to-text",
    siteName: site.name,
    images: [
      { url: "/tools/image-to-text/opengraph-image", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@intheopencc",
    creator: "@intheopencc",
    title: `${title} | ${site.name}`,
    description,
    images: ["/tools/image-to-text/opengraph-image"],
  },
};

export default function ImageToTextPage() {
  return (
    <>
      <PageHeader />
      <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <nav
            aria-label="Breadcrumb"
            className="font-mono text-sm font-bold lowercase"
          >
            <ol className="flex items-center gap-3">
              <li>
                <Link
                  href="/tools"
                  className="text-primary focus-visible:outline-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  tools
                </Link>
              </li>
              <li aria-hidden="true" className="text-base-content/40">
                /
              </li>
              <li aria-current="page" className="text-base-content/55">
                image to text
              </li>
            </ol>
          </nav>
          <h1 className="mt-4 text-5xl leading-none font-medium tracking-[-0.04em] lowercase sm:text-7xl">
            image to text
          </h1>
          <p className="text-base-content/65 mt-6 max-w-2xl text-lg leading-8">
            {description}
          </p>
        </div>
        <ImageToText />
      </section>
    </>
  );
}
