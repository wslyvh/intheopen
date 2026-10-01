import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TextRedactor } from "@/components/text-redactor";
import { site } from "@/utils/site";
import { magpii } from "@/utils/magpii";

const title = "Text redaction";
const description =
  "Use Magpii to find and mask personal information in text, locally in your browser. Review the results and copy the redacted text.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/text-redaction" },
  openGraph: {
    type: "website",
    title: `${title} | ${site.name}`,
    description,
    url: "/tools/text-redaction",
    siteName: site.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@intheopencc",
    creator: "@intheopencc",
    title: `${title} | ${site.name}`,
    description,
    images: ["/opengraph-image"],
  },
};

export default function TextRedactionPage() {
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
                text redaction
              </li>
            </ol>
          </nav>
          <h1 className="mt-4 text-5xl leading-none font-medium tracking-[-0.04em] lowercase sm:text-7xl">
            text redaction
          </h1>
          <p className="text-base-content/65 mt-6 max-w-2xl text-lg leading-8">
            Find and redact names, addresses, email addresses, phone numbers,
            BSNs, IBANs, and payment cards. Runs locally in your browser. Review
            before sharing.{" "}
            <Link
              href={magpii.href}
              className="hover:text-primary focus-visible:outline-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Learn more
            </Link>
          </p>
        </div>

        <TextRedactor />
      </section>
    </>
  );
}
