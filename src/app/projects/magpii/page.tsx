import type { Metadata } from "next";
import { MagpiiLinks } from "@/components/magpii-links";
import { PageHeader } from "@/components/page-header";
import { magpii } from "@/utils/magpii";
import { site } from "@/utils/site";

const title = magpii.name;
const description = magpii.description;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: magpii.href },
  openGraph: {
    type: "website",
    title: `${title} | ${site.name}`,
    description,
    url: magpii.href,
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

const privacy = [
  {
    title: "Local-first",
    body: "Detection runs on your device.",
  },
  {
    title: "Open source",
    body: "The code is public and can be inspected, tested, and improved.",
  },
  {
    title: "No account",
    body: "Use Magpii without creating an account.",
  },
  {
    title: "Your data is yours",
    body: "Your text is never read, stored, or sent anywhere. There are no Magpii servers.",
  },
] as const;

export default function MagpiiPage() {
  return (
    <>
      <PageHeader />
      <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-primary font-mono text-sm font-bold lowercase">
            / build
          </p>
          <h1 className="mt-4 text-5xl leading-none font-medium tracking-[-0.04em] lowercase sm:text-7xl">
            magpii
          </h1>
          <p className="text-base-content/65 mt-6 max-w-2xl text-lg leading-8">
            {magpii.slogan}
          </p>
          <p className="text-base-content/65 mt-6 max-w-2xl text-lg leading-8">
            {magpii.description}
          </p>
          <MagpiiLinks />
        </div>

        <div className="border-base-content/15 mt-14 max-w-3xl space-y-6 border-t pt-10 text-lg leading-8">
          <p>
            Everything runs locally in your browser. Your text stays on your
            device.
          </p>
          <p>
            The current version detects common identifiers such as names,
            addresses, email addresses, phone numbers, BSNs, IBANs, and payment
            card numbers.
          </p>
        </div>

        <div
          id="privacy"
          className="border-base-content/15 mt-14 max-w-3xl border-t pt-10"
        >
          <h2 className="text-xl font-medium lowercase sm:text-2xl">privacy</h2>
          <div className="mt-6">
            {privacy.map((point) => (
              <div
                key={point.title}
                className="border-base-content/15 border-b py-6 first:border-t"
              >
                <h3 className="text-lg font-medium lowercase">{point.title}</h3>
                <p className="text-base-content/65 mt-2 text-lg leading-8">
                  {point.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
