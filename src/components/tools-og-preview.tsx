import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { privacyTools } from "@/utils/tools";

// Static exports of the same Lucide icons used on the tools page.
const iconNames = [
  "TextCursorInput",
  "ScanText",
  "ScanFace",
  "FileMinus2",
  "ArrowUpRight",
];
const iconSources = await Promise.all(
  iconNames.map(async (name) => {
    const svg = await readFile(
      join(process.cwd(), `public/images/og/icons/${name}.svg`),
    );
    return `data:image/svg+xml;base64,${svg.toString("base64")}`;
  }),
);
function IconImage({ icon, size }: { icon: number; size: number }) {
  return <img width={size} height={size} src={iconSources[icon]} alt="" />;
}
const descriptions = [
  "Mask personal details before sharing.",
  "Turn images into editable text.",
  "Hide faces and private details.",
  "Remove hidden data from files.",
];
function Card({ index }: { index: number }) {
  const tool = privacyTools[index];
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        flexDirection: "column",
        width: 282,
        height: 225,
        background: "#edf0e2",
        border: "1px solid #bdc6b9",
        padding: "26px 24px",
        color: "#133b2e",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          height: 4,
          background: "#2fa36b",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <IconImage icon={index} size={28} />
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 27,
          lineHeight: 1.1,
          letterSpacing: "-0.6px",
        }}
      >
        {tool.title.toLowerCase()}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          marginTop: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            fontSize: 16,
            lineHeight: 1.4,
            color: "#647568",
          }}
        >
          {descriptions[index]}
        </div>
        <IconImage icon={4} size={16} />
      </div>
    </div>
  );
}
export function ToolsPreview() {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            display: "flex",
            left: (index % 2) * 300,
            top: 18 + Math.floor(index / 2) * 247,
          }}
        >
          <Card index={index} />
        </div>
      ))}
    </div>
  );
}
