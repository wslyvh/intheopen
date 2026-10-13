import { renderOpenGraph, ogSize } from "@/components/open-graph-template";
import { UrlCleanerPreview } from "@/components/url-cleaner-og-preview";

export const alt =
  "In the Open: URL cleaner, a tracked link and its cleaned version";
export const size = ogSize;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return renderOpenGraph({
    title: "url cleaner",
    eyebrow: "privacy tools",
    brandFooter: true,
    visual: <UrlCleanerPreview />,
  });
}
