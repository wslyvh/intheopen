import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import {
  CategoryProjects,
  ProjectProfile,
} from "@/components/explore-projects";
import {
  loadCategories,
  categoryCopy,
  getExploreEntry,
  featureLabels,
  platformLabels,
} from "@/utils/explore";
import { site } from "@/utils/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return loadCategories().flatMap((category) => [
    { slug: category.slug },
    ...category.projects.map((project) => ({ slug: project.id })),
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getExploreEntry(slug);
  if (!entry) notFound();
  const { title, description } = entry.project
    ? {
        title: `${entry.project.name}: Privacy and features`,
        description: entry.project.description,
      }
    : {
        ...categoryCopy(slug),
        title: `${categoryCopy(slug).title} assistants`,
      };
  const path = `/explore/${slug}`;
  return {
    title,
    description,
    keywords: entry.project
      ? [
          entry.project.name,
          `${entry.project.name} privacy`,
          "AI assistants",
          "AI privacy",
        ]
      : ["private AI", "AI assistants", "AI privacy"],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${title} | ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      locale: site.locale,
      images: [
        {
          url: `${path}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${title} | ${site.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      site: "@intheopencc",
      creator: "@intheopencc",
      images: [
        { url: `${path}/opengraph-image`, alt: `${title} | ${site.name}` },
      ],
    },
  };
}

export default async function ExplorePage({ params }: Props) {
  const { slug } = await params;
  const entry = getExploreEntry(slug);
  if (!entry) notFound();
  const title = entry.project?.name ?? categoryCopy(slug).title;
  const url = `${site.url}/explore/${slug}`;
  const project = entry.project;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": project ? "WebPage" : "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: title,
        description: project?.description ?? categoryCopy(slug).description,
        inLanguage: site.language,
        isPartOf: { "@id": `${site.url}/#website` },
        publisher: { "@id": `${site.url}/#organization` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: { "@id": `${url}#${project ? "application" : "projects"}` },
        ...(project ? { lastReviewed: project.checked_at } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: site.url,
          },
          ...(project
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: categoryCopy(entry.category.slug).title,
                  item: `${site.url}/explore/${entry.category.slug}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: project ? 3 : 2,
            name: title,
            item: url,
          },
        ],
      },
      project
        ? {
            "@type": "SoftwareApplication",
            "@id": `${url}#application`,
            name: project.name,
            description: project.description,
            url: project.links.website,
            applicationCategory: "ProductivityApplication",
            featureList: project.features.map(
              (feature) => featureLabels[feature] ?? feature,
            ),
            ...(project.platforms.some((platform) => platform !== "web")
              ? {
                  operatingSystem: project.platforms
                    .filter((platform) => platform !== "web")
                    .map((platform) => platformLabels[platform] ?? platform)
                    .join(", "),
                }
              : {}),
          }
        : {
            "@type": "ItemList",
            "@id": `${url}#projects`,
            numberOfItems: entry.category.projects.length,
            itemListOrder: "https://schema.org/ItemListUnordered",
            itemListElement: entry.category.projects.map((item) => ({
              "@type": "ListItem",
              item: {
                "@type": "WebPage",
                name: item.name,
                url: `${site.url}/explore/${item.id}`,
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
                className="text-base-content focus-visible:outline-primary hover:text-base-content/75 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-base-content/40">
              /
            </li>
            {entry.project && (
              <>
                <li>
                  <Link
                    href={`/explore/${entry.category.slug}`}
                    className="text-base-content focus-visible:outline-primary hover:text-base-content/75 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    {categoryCopy(entry.category.slug).title}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-base-content/40">
                  /
                </li>
              </>
            )}
            <li aria-current="page" className="text-base-content/75">
              {title}
            </li>
          </ol>
        </nav>
        {entry.project ? (
          <ProjectProfile
            project={entry.project}
            alternatives={entry.category.projects
              .filter((item) => item.id !== slug)
              .sort((a, b) => a.name.localeCompare(b.name, "en"))}
          />
        ) : (
          <CategoryProjects
            slug={entry.category.slug}
            projects={entry.category.projects}
          />
        )}
      </section>
    </>
  );
}
