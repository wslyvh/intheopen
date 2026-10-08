import { renderOpenGraph, ogSize } from "@/components/open-graph-template";
import { TextRedactionPreview } from "@/components/text-redaction-og-preview";

export const alt = "In the Open: text redaction";
export const size = ogSize;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return renderOpenGraph({
    title: "text redaction",
    eyebrow: "privacy tools",
    brandFooter: true,
    visual: <TextRedactionPreview />,
  });
}
