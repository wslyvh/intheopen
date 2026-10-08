import { renderOpenGraph, ogSize } from "@/components/open-graph-template";
import { ImageToTextPreview } from "@/components/image-to-text-og-preview";

export const alt = "In the Open: image to text";
export const size = ogSize;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return renderOpenGraph({
    title: "image to text",
    eyebrow: "privacy tools",
    brandFooter: true,
    visual: await ImageToTextPreview(),
  });
}
