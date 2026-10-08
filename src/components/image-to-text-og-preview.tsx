import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ogColors as c } from "@/components/open-graph-template";

const handwriting = readFile(
  join(process.cwd(), "public/images/og/diary-note.png"),
);

// The crossed-out sample was tested with the live OCR tool. An illustration,
// not a website screenshot. The output remains editable in the actual tool.
export async function ImageToTextPreview() {
  const image = await handwriting;
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 42,
          top: 174,
          width: 670,
          height: 620,
          background: "#e8dfcd",
          transform: "rotate(-6deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 156,
          width: 670,
          height: 620,
          display: "flex",
          flexDirection: "column",
          padding: "94px 44px 50px",
          background: "#fffdf7",
          transform: "rotate(-6deg)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "JetBrains Mono",
            fontSize: 14,
            color: c.muted,
            marginBottom: 30,
          }}
        >
          extracted text
        </div>
        <div
          style={{
            display: "flex",
            width: 470,
            fontSize: 34,
            lineHeight: 1.25,
            whiteSpace: "pre-wrap",
            letterSpacing: "-1.4px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", marginBottom: 8 }}>Dear diary,</div>
            <div style={{ display: "flex", gap: 8 }}>
              I have{" "}
              <span style={{ textDecoration: "line-through" }}>nothing</span>
            </div>
            <div style={{ display: "flex" }}>something to hide...</div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 18,
          width: 508,
          height: 230,
          background: "#e8dfcd",
          transform: "rotate(5deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 8,
          width: 508,
          height: 230,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          padding: "28px 30px",
          transform: "rotate(5deg)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "JetBrains Mono",
            fontSize: 12,
            color: c.muted,
            marginBottom: 18,
          }}
        >
          note.png
        </div>
        <img
          src={`data:image/png;base64,${image.toString("base64")}`}
          width={448}
          height={140}
          alt="Dear diary, I have nothing something to hide, with nothing crossed out"
        />
      </div>
    </div>
  );
}
