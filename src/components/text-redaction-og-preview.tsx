import { ogColors as c } from "@/components/open-graph-template";

// An editorial illustration of redaction, not a screenshot or live tool output.
export function TextRedactionPreview() {
  const mask = (width: number) => (
    <span
      style={{
        display: "flex",
        width,
        height: 29,
        background: c.ink,
        margin: "0 9px",
        transform: "translateY(7px)",
      }}
    />
  );
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
            marginBottom: 36,
          }}
        >
          redacted text
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 29,
            lineHeight: 1.4,
          }}
        >
          <div style={{ display: "flex" }}>Hello{mask(193)},</div>
          <div style={{ display: "flex", marginTop: 12 }}>
            Your review is ready.
          </div>
          <div style={{ display: "flex", marginTop: 20 }}>Email{mask(265)}</div>
          <div style={{ display: "flex" }}>or call{mask(216)}.</div>
          <div style={{ display: "flex", marginTop: 20 }}>
            Please reply before Friday.
          </div>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", marginTop: 24 }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: 12,
              color: c.muted,
              marginBottom: 14,
            }}
          >
            review identifiers
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {["name", "email", "phone"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  padding: "10px 15px",
                  background: "#e6efe3",
                  color: c.ink,
                  fontFamily: "JetBrains Mono",
                  fontSize: 13,
                }}
              >
                ✓ {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
