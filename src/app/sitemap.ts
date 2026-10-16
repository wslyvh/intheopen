import type { MetadataRoute } from "next";
import { site } from "@/utils/site";
import { loadCategories } from "@/utils/explore";

const lastModified = "2026-09-23";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/about`,
      lastModified: "2026-10-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/tools`,
      lastModified: "2026-10-01",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site.url}/tools/image-to-text`,
      lastModified: "2026-10-06",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/tools/text-redaction`,
      lastModified: "2026-10-01",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/tools/url-cleaner`,
      lastModified: "2026-10-09",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${site.url}/events`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${site.url}/projects/magpii`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...loadCategories().flatMap((category) => [
      {
        url: `${site.url}/explore/${category.slug}`,
        lastModified: category.projects
          .map((project) => project.checked_at)
          .sort()
          .at(-1),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
      ...category.projects.map((project) => ({
        url: `${site.url}/explore/${project.id}`,
        lastModified: project.checked_at,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ]),
  ];
}
