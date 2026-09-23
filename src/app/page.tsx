import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/utils/site";

const work = [
  {
    label: "news",
    title: "monthly privacy brief",
    description: "Developments, wins, tools, resources, and events.",
    href: site.links.newsletter,
    treatment: "before:bg-accent hover:bg-accent/15",
  },
  {
    label: "projects",
    title: "paperweight",
    description: "Local-first personal data analysis for your inbox.",
    href: site.links.paperweight,
    treatment: "before:bg-primary hover:bg-primary/15",
  },
  {
    label: "projects",
    title: "magpii",
    description: "Keep personal data out of AI",
    href: "/projects/magpii",
    treatment: "before:bg-warning hover:bg-warning/15",
  },
  {
    label: "events",
    title: "upcoming calendar",
    description: "Privacy, digital rights, and open technology gatherings.",
    href: "/events",
    treatment: "before:bg-secondary hover:bg-secondary/15",
  },
] as const;

export default function HomePage() {
  return (
    <section className="mx-auto grid w-full max-w-7xl flex-1 grid-rows-[minmax(0,1fr)_auto] px-5 pt-4 sm:px-8 sm:pt-6">
      <div className="relative grid min-h-0 items-start gap-6 py-6 lg:grid-cols-[minmax(24rem,0.9fr)_minmax(28rem,1.1fr)] lg:items-stretch lg:gap-12 lg:py-2">
        <div
          className="pointer-events-none absolute inset-0 hidden font-mono font-bold sm:block"
          aria-hidden="true"
        >
          <span className="text-secondary absolute top-[10%] left-[46%] hidden text-2xl xl:block">
            +
          </span>
          <span className="text-primary absolute top-[24%] right-[2%] text-xl">
            +
          </span>
          <span className="text-accent absolute top-[58%] left-[43%] text-3xl">
            +
          </span>
          <span className="text-secondary absolute right-[30%] bottom-[8%] text-lg">
            +
          </span>
        </div>
        <div className="relative z-10 flex min-h-0 flex-col lg:h-full">
          <div className="lg:flex lg:flex-1 lg:items-center">
            <div>
              <h1>
                <Image
                  src="/images/logo.png"
                  alt={site.name}
                  width={1000}
                  height={195}
                  className="h-auto w-full max-w-[29rem]"
                  priority
                />
              </h1>
              <p className="text-base-content/70 mt-8 max-w-[31rem] text-xl leading-8 lg:whitespace-nowrap">
                {site.tagline}
              </p>
            </div>
          </div>
          <div className="mt-16 lg:mt-auto">
            <h2 className="mb-6 font-mono text-xs font-bold lowercase">
              partners
            </h2>
            <nav aria-label="Partners" className="flex items-center gap-8">
              {site.partners.map((partner) => (
                <a
                  key={partner.name}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={partner.name}
                  className="focus-visible:outline-primary opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    width={64}
                    height={64}
                    className="size-16"
                  />
                </a>
              ))}
            </nav>
          </div>
        </div>
        <Image
          src="/images/hero.png"
          alt="A pixel-art scene of open technology, nature, and community"
          width={1208}
          height={593}
          className="relative z-10 mx-auto h-auto max-h-[36svh] w-[92%] object-contain lg:self-end"
          priority
          sizes="(max-width: 1024px) 90vw, 58vw"
        />
      </div>

      <div className="mt-16 pb-2 sm:mt-20">
        <h2 className="mb-3 font-mono text-xs font-bold lowercase">
          what we’re working on
        </h2>
        <div className="border-base-content/15 grid border sm:grid-cols-2">
          {work.map((item) => {
            const external = item.href.startsWith("http");
            const content = (
              <>
                <p className="text-primary font-mono text-xs font-bold lowercase">
                  {item.label}
                </p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium lowercase sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="text-base-content/55 mt-1 text-sm leading-5">
                      {item.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </div>
              </>
            );
            const className = `group border-base-content/15 focus-visible:outline-primary relative border-b p-5 pt-6 transition-colors before:absolute before:inset-x-0 before:top-0 before:h-1 last:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-2 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0 ${item.treatment}`;

            return external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            ) : (
              <Link key={item.label} href={item.href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
