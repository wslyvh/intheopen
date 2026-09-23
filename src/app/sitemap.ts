import type { MetadataRoute } from "next";
import { site } from "@/utils/site";

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
  ];
}
