import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { site } from "@/utils/site";

const title = "About";
const description =
  "In the Open is an independent privacy initiative for open technology and digital autonomy. Make privacy practical, understandable, and participatory.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: `${title} | ${site.name}`,
    description,
    url: "/about",
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

export default function AboutPage() {
  return (
    <>
      <PageHeader />
      <article className="mx-auto w-full max-w-6xl flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-primary font-mono text-sm font-bold lowercase">
            / about
          </p>
          <h1 className="mt-4 text-5xl leading-none font-medium tracking-[-0.04em] lowercase sm:text-7xl">
            Building privacy in the open
          </h1>

          <div className="text-base-content/75 mt-8 space-y-6 text-lg leading-8">
            <p>
              In the Open is an independent privacy initiative for open
              technology and digital autonomy. We believe privacy is
              multiplayer. It takes shared tools, public knowledge, and
              collective effort.
            </p>
            <p>
              So we build practical open-source tools, grow trustworthy
              ecosystems, and connect people, projects, and ideas around privacy
              and digital rights. Today that includes a monthly newsletter and
              projects like Paperweight and Magpii. The goal is simple: make
              privacy practical, understandable, and participatory.
            </p>
          </div>

          <section aria-labelledby="vision" className="mt-12">
            <h2
              id="vision"
              className="text-2xl font-medium lowercase sm:text-3xl"
            >
              our vision
            </h2>
            <p className="text-base-content/75 mt-4 text-lg leading-8">
              A world where people can use technology, work together, and move
              through shared digital spaces while keeping their rights.
            </p>
          </section>

          <section
            aria-labelledby="manifesto"
            className="border-base-content/15 mt-14 border-t pt-12"
          >
            <p className="text-primary font-mono text-sm font-bold lowercase">
              / manifesto
            </p>
            <h2
              id="manifesto"
              className="mt-4 text-3xl font-medium tracking-tight lowercase sm:text-4xl"
            >
              our manifesto
            </h2>

            <div className="text-base-content/75 mt-6 space-y-6 text-lg leading-8">
              <p>
                Technology shapes how we work, communicate, create, organise,
                and live.
              </p>
              <p>
                The systems around us increasingly decide who gets visibility,
                who gets access, who gets control, and how power is distributed.
              </p>
              <p className="text-base-content font-medium">
                Privacy is the power to choose how we participate.
              </p>
              <p>
                It gives us room to think, speak, build, explore, make mistakes,
                and connect on our own terms. It protects the space we need to
                participate freely in digital life.
              </p>

              <h3 className="text-base-content pt-4 text-2xl font-medium lowercase">
                privacy is multiplayer.
              </h3>
              <p>
                It depends on the tools we use, the systems we build, the rules
                we accept, and the choices we make together.
              </p>
              <p>
                That means privacy cannot live only in settings menus or
                individual habits. It needs shared tools, public knowledge, open
                infrastructure, strong rights, and collective effort.
              </p>
              <p>So we work in the open.</p>
              <ul className="marker:text-primary list-disc space-y-2 pl-6">
                <li>
                  We build tools that people can inspect, run, adapt, and
                  improve.
                </li>
                <li>We share what we learn.</li>
                <li>We support useful projects and the people behind them.</li>
                <li>
                  We turn research into practical tools, and ideas into things
                  people can use.
                </li>
              </ul>

              <h3 className="text-base-content pt-4 text-2xl font-medium lowercase">
                build / grow / connect
              </h3>
              <ul className="marker:text-primary list-disc space-y-2 pl-6">
                <li>Build useful, open, privacy-respecting technology.</li>
                <li>
                  Grow knowledge, projects, contributors, and resilient
                  ecosystems.
                </li>
                <li>
                  Connect people with tools, ideas, projects, and one another.
                </li>
              </ul>

              <p>We work with care.</p>
              <ul className="marker:text-primary list-disc space-y-2 pl-6">
                <li>Care for users.</li>
                <li>Care for maintainers.</li>
                <li>Care for contributors.</li>
                <li>Care for boundaries.</li>
                <li>Care for the wider systems our work becomes part of.</li>
              </ul>

              <div className="text-base-content space-y-2 font-medium">
                <p>Open systems should be inspectable.</p>
                <p>Private systems should be understandable.</p>
                <p>People should remain in control.</p>
              </div>

              <h3 className="text-base-content pt-4 text-2xl font-medium lowercase">
                our mission
              </h3>
              <p>Make privacy practical, understandable, and participatory.</p>
              <ul className="marker:text-primary list-disc space-y-2 pl-6">
                <li>Build openly.</li>
                <li>Grow together.</li>
                <li>Connect on your own terms.</li>
              </ul>
              <p className="text-base-content pt-4 font-medium">
                Built with love, in the open.
              </p>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
