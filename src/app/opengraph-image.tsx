import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/utils/site";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const [logo, hero] = await Promise.all([
  readFile(join(process.cwd(), "public/images/logo.png")),
  readFile(join(process.cwd(), "public/images/og-hero.png")),
]);

const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
const heroSrc = `data:image/png;base64,${hero.toString("base64")}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#f7f3e8",
        color: "#133b2e",
        padding: "52px 60px 38px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "stretch",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: 665,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <img
            src={logoSrc}
            alt=""
            width={450}
            height={88}
            style={{ objectFit: "contain" }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 96,
              fontSize: 50,
              lineHeight: 1.48,
              color: "#2fa36b",
            }}
          >
            <div style={{ display: "flex" }}>Privacy, open technology</div>
            <div style={{ display: "flex" }}>and digital autonomy.</div>
          </div>
        </div>

        <div
          style={{
            width: 430,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <img
            src={heroSrc}
            alt=""
            width={430}
            height={211}
            style={{ objectFit: "contain", opacity: 0.9 }}
          />
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: 1,
          display: "flex",
          background: "#dcd2bd",
        }}
      />
      <div
        style={{
          height: 61,
          display: "flex",
          alignItems: "flex-end",
          fontSize: 20,
          color: "#2fa36b",
        }}
      >
        build / connect / grow
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 42,
          left: 610,
          display: "flex",
          color: "#e66a4c",
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        +
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 150,
          left: 750,
          display: "flex",
          color: "#2fa36b",
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        +
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 105,
          right: 68,
          display: "flex",
          color: "#133b2e",
          fontSize: 25,
          fontWeight: 700,
        }}
      >
        +
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 150,
          left: 445,
          display: "flex",
          color: "#8ebced",
          fontSize: 31,
          fontWeight: 700,
        }}
      >
        +
      </div>
    </div>,
    size,
  );
}
