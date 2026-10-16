import { notFound } from "next/navigation";
import {
  ogColors,
  ogSize,
  renderOpenGraph,
} from "@/components/open-graph-template";
import { categoryCopy, getExploreEntry } from "@/utils/explore";

export const alt = "AI assistant features and privacy | In the Open";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getExploreEntry(slug);
  if (!entry) notFound();
  const project = entry.project;
  const copy = categoryCopy(entry.category.slug);
  return renderOpenGraph({
    title: project?.name ?? copy.title,
    eyebrow: `explore / ${copy.title.toLowerCase()}`,
    footer: "features / pricing / privacy",
    visual: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: 36,
          border: `1px solid ${ogColors.line}`,
          gap: 28,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, lineHeight: 1.35 }}>
          {project?.description ?? copy.description}
        </div>
        {project && (
          <div
            style={{
              display: "flex",
              fontSize: 23,
              lineHeight: 1.4,
              color: ogColors.muted,
            }}
          >
            {project.privacy.highlights[0]}
          </div>
        )}
      </div>
    ),
  });
}
