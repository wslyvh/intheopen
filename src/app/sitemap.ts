import type { MetadataRoute } from "next";
import { site } from "@/utils/site";

const lastModified = new Date("2026-09-15");

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
  ];
}
