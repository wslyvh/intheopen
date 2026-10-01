import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  FileMinus2,
  ScanFace,
  TextCursorInput,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { site } from "@/utils/site";
import { privacyTools } from "@/utils/tools";

const title = "Privacy tools";
const description =
  "Simple privacy tools to redact sensitive information from your everyday digital life.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools" },
  openGraph: {
    type: "website",
    title: `${title} | ${site.name}`,
    description,
    url: "/tools",
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

const icons = {
  "text-redaction": TextCursorInput,
  "image-redaction": ScanFace,
  "metadata-removal": FileMinus2,
};

export default function ToolsPage() {
  return (
    <>
      <PageHeader />
      <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <nav
            aria-label="Breadcrumb"
            className="text-primary font-mono text-sm font-bold lowercase"
          >
            <ol>
              <li aria-current="page">tools</li>
            </ol>
          </nav>
          <h1 className="mt-4 text-5xl leading-none font-medium tracking-[-0.04em] lowercase sm:text-7xl">
            practical privacy tools
          </h1>
          <p className="text-base-content/65 mt-6 max-w-2xl text-lg leading-8">
            {description}
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {privacyTools.map((tool) => {
            const Icon = icons[tool.id];
            const available = tool.status === "available";
            const content = (
              <>
                <div className="flex items-center justify-between gap-4">
                  <Icon
                    className="size-7"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {!available && (
                    <span className="text-base-content/55 font-mono text-xs font-bold lowercase">
                      coming soon
                    </span>
                  )}
                </div>
                <div className="mt-6 flex flex-1 items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-medium lowercase">
                      {tool.title}
                    </h2>
                    <p className="text-base-content/65 mt-3 text-base leading-7">
                      {tool.description}
                    </p>
                  </div>
                  {available && (
                    <ArrowUpRight
                      className="size-4 shrink-0 self-end transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </>
            );

            return "href" in tool ? (
              <Link
                key={tool.id}
                href={tool.href}
                className="group border-base-content/15 bg-primary/5 hover:bg-primary/10 focus-visible:outline-primary before:bg-primary relative flex flex-col border p-6 pt-7 transition-colors before:absolute before:inset-x-0 before:top-0 before:h-1 focus-visible:outline-2 focus-visible:outline-offset-4 sm:p-7"
              >
                {content}
              </Link>
            ) : (
              <article
                key={tool.id}
                data-status="coming-soon"
                className="border-base-content/10 text-base-content/65 relative flex flex-col border p-6 pt-7 sm:p-7"
              >
                {content}
              </article>
            );
          })}
        </div>

        <p className="text-base-content/55 mt-8 max-w-2xl text-sm leading-6">
          All tools run locally in your browser. Your data is never sent to a
          server.
        </p>
      </section>
    </>
  );
}
