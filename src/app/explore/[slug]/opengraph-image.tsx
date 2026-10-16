import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import sharp from "sharp";
import {
  ogColors,
  ogSize,
  renderOpenGraph,
} from "@/components/open-graph-template";
import {
  categoryCopy,
  featureLabels,
  getExploreEntry,
  platformLabels,
  type Project,
} from "@/utils/explore";
import { protectionLevels } from "@/utils/protection-levels";

export const alt = "AI assistant features and privacy | In the Open";
export const size = ogSize;
export const contentType = "image/png";

const card = 168;
const gap = 20;

async function pngDataUrl(publicPath: string) {
  const file = join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  const png = await sharp(await readFile(file))
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

function LogoCard({ src, size = card }: { src: string; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        background: "#fffdf8",
        border: `1px solid ${ogColors.line}`,
      }}
    >
      <img
        src={src}
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        alt=""
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

function ProtectionMark({ level }: { level: Project["protection_level"] }) {
  const active = protectionLevels.findIndex((entry) => entry.id === level) + 1;
  return (
    <svg width="28" height="22" viewBox="0 0 20 16" style={{ display: "flex" }}>
      {[4, 8, 12].map((height, index) => (
        <rect
          key={height}
          x={2 + index * 6}
          y={14 - height}
          width="4"
          height={height}
          rx="0.5"
          fill={index < active ? ogColors.green : ogColors.line}
        />
      ))}
    </svg>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          fontFamily: "JetBrains Mono",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 0.4,
          color: ogColors.muted,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Chips({ values }: { values: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {values.map((value) => (
        <div
          key={value}
          style={{
            display: "flex",
            padding: "7px 14px",
            borderRadius: 999,
            background: "#eceadf",
            color: "#4c695c",
            fontSize: 20,
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
      ))}
    </div>
  );
}

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
  const logos = Object.fromEntries(
    await Promise.all(
      entry.category.projects.flatMap((item) =>
        item.image
          ? [pngDataUrl(item.image).then((src) => [item.id, src] as const)]
          : [],
      ),
    ),
  );
  if (!project) {
    const columns: { offset: number; ids: string[] }[] = [
      { offset: 0, ids: ["brave-leo", "duck-ai"] },
      { offset: 94, ids: ["proton-lumo", "venice"] },
      { offset: 36, ids: ["confer"] },
    ];
    return renderOpenGraph({
      title: "Private AI",
      eyebrow: "explore",
      footer: null,
      footerDivider: false,
      domainColor: ogColors.muted,
      visual: (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "flex-start",
            justifyContent: "center",
            gap,
          }}
        >
          {columns.map((column) => (
            <div
              key={column.offset}
              style={{
                display: "flex",
                flexDirection: "column",
                gap,
                marginTop: column.offset,
              }}
            >
              {column.ids.map((id) => (
                <LogoCard key={id} src={logos[id]} />
              ))}
            </div>
          ))}
        </div>
      ),
    });
  }
  const level = protectionLevels.find(
    (entry) => entry.id === project.protection_level,
  );
  return renderOpenGraph({
    title: project.name,
    eyebrow: `explore / ${copy.title.toLowerCase()}`,
    footer: null,
    footerDivider: false,
    domainColor: ogColors.muted,
    visual: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: 34,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {logos[project.id] && <LogoCard src={logos[project.id]} size={76} />}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                fontFamily: "JetBrains Mono",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 0.4,
                color: ogColors.muted,
              }}
            >
              protection
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ProtectionMark level={project.protection_level} />
              <div style={{ display: "flex", fontSize: 28, lineHeight: 1.2 }}>
                {level?.title}
              </div>
            </div>
          </div>
        </div>
        <Fact label="features">
          <Chips
            values={project.features.map(
              (feature) => featureLabels[feature] ?? feature,
            )}
          />
        </Fact>
        <Fact label="platforms">
          <Chips
            values={project.platforms.map(
              (platform) => platformLabels[platform] ?? platform,
            )}
          />
        </Fact>
      </div>
    ),
  });
}
