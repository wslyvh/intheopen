import { renderOpenGraph, ogSize } from "@/components/open-graph-template";
import { ToolsPreview } from "@/components/tools-og-preview";

export const alt = "In the Open: practical privacy tools";
export const size = ogSize;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return renderOpenGraph({
    title: "practical privacy tools",
    eyebrow: "privacy tools",
    brandFooter: true,
    visual: <ToolsPreview />,
  });
}
