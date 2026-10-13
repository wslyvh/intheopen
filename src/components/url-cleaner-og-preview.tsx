import { cleanUrl } from "@intheopen/url-cleaner";
import { ogColors as c } from "@/components/open-graph-template";

const link = "https://youtu.be/dQw4w9WgXcQ?si=shareIdentifier-123";
const original = new URL(link);
const cleaned = cleanUrl(link);

export function UrlCleanerPreview() {
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
          top: 56,
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
          top: 38,
          width: 670,
          height: 620,
          display: "flex",
          flexDirection: "column",
          padding: "50px 44px",
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
          link
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "JetBrains Mono",
            fontSize: 23,
            lineHeight: 1.55,
          }}
        >
          <div style={{ display: "flex" }}>{original.origin}</div>
          <div style={{ display: "flex" }}>{original.pathname}</div>
          <div
            style={{
              display: "flex",
              color: c.muted,
              textDecoration: "line-through",
            }}
          >
            {original.search}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "JetBrains Mono",
            fontSize: 14,
            color: c.muted,
            marginTop: 44,
            marginBottom: 24,
          }}
        >
          cleaned link
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "JetBrains Mono",
            fontSize: 27,
            lineHeight: 1.5,
            color: c.green,
          }}
        >
          <div style={{ display: "flex" }}>{new URL(cleaned).origin}</div>
          <div style={{ display: "flex" }}>{new URL(cleaned).pathname}</div>
        </div>
      </div>
    </div>
  );
}
