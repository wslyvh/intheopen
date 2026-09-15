import type { Metadata } from "next";
import { ArrowUpRight, MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { upcomingEvents } from "@/utils/events";
import { site } from "@/utils/site";

const title = "Events";
const description =
  "Upcoming events about privacy, digital rights, and open technology.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/events" },
  openGraph: {
    type: "website",
    title: `${title} | ${site.name}`,
    description,
    url: "/events",
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

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00Z`));
}

export default function EventsPage() {
  const events = upcomingEvents();

  return (
    <>
      <PageHeader />
      <section className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-primary font-mono text-sm font-bold lowercase">
            / connect
          </p>
          <h1 className="mt-4 text-5xl leading-none font-medium tracking-[-0.04em] lowercase sm:text-7xl">
            upcoming events
          </h1>
          <p className="text-base-content/65 mt-6 max-w-2xl text-lg leading-8">
            Gatherings for privacy, digital rights, open source, and a more
            autonomous digital future.
          </p>
        </div>

        <div className="border-base-content/15 mt-14 border-t">
          {events.length > 0 ? (
            events.map((event) => (
              <a
                key={`${event.date}-${event.title}`}
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border-base-content/15 hover:bg-primary/10 focus-visible:outline-primary grid gap-5 border-b py-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 sm:grid-cols-[11rem_1fr_auto] sm:items-center sm:px-4"
              >
                <time
                  dateTime={event.date}
                  className="font-mono text-sm font-bold lowercase"
                >
                  {formatDate(event.date)}
                </time>
                <div>
                  <h2 className="text-xl font-medium lowercase sm:text-2xl">
                    {event.title}
                  </h2>
                  <p className="text-base-content/55 mt-1 flex items-center gap-1.5 text-sm">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {event.location}
                  </p>
                </div>
                <ArrowUpRight
                  className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  aria-hidden="true"
                />
              </a>
            ))
          ) : (
            <p className="text-base-content/60 py-10 lowercase">
              no upcoming events right now. check back soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
