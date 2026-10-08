import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogColors = {
  paper: "#f7f3e8",
  ink: "#133b2e",
  green: "#2fa36b",
  line: "#dcd2bd",
  muted: "#647568",
};

interface OpenGraphTemplateProps {
  title: string;
  eyebrow: string;
  footer?: string;
  footerDivider?: boolean;
  brandFooter?: boolean;
  visual: ReactNode;
}

// Static TTF instances of the site's Satoshi and JetBrains Mono fonts.
const assets = Promise.all([
  readFile(join(process.cwd(), "public/images/logo.png")),
  readFile(join(process.cwd(), "public/fonts/og/satoshi-medium.ttf")),
  readFile(join(process.cwd(), "public/fonts/og/jetbrains-mono-regular.ttf")),
  readFile(join(process.cwd(), "public/fonts/og/jetbrains-mono-bold.ttf")),
]);

export async function renderOpenGraph(props: OpenGraphTemplateProps) {
  const [logo, sans, mono, monoBold] = await assets;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: ogColors.paper,
        color: ogColors.ink,
        fontFamily: "Satoshi",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 52, top: 45, display: "flex" }}>
        <img
          src={`data:image/png;base64,${logo.toString("base64")}`}
          width={310}
          height={61}
          alt=""
          style={{ objectFit: "contain" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 216,
          width: 435,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "JetBrains Mono",
            fontWeight: 700,
            fontSize: 17,
            color: ogColors.green,
            marginBottom: 26,
          }}
        >
          {props.eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 63,
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "-2.5px",
          }}
        >
          {props.title}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 52,
          bottom: 44,
          display: "flex",
          flexDirection: "column",
          width: 435,
        }}
      >
        {props.footerDivider !== false && (
          <div
            style={{
              height: 1,
              width: "100%",
              background: ogColors.line,
              marginBottom: 20,
            }}
          />
        )}
        <div
          style={{
            fontFamily: props.brandFooter ? "Satoshi" : "JetBrains Mono",
            fontSize: props.brandFooter ? 20 : 19,
            color: ogColors.green,
          }}
        >
          {props.brandFooter ? "build / grow / connect" : "intheopen.cc"}
        </div>
        <div
          style={{
            fontFamily: props.brandFooter ? "Satoshi" : "JetBrains Mono",
            fontSize: props.brandFooter ? 20 : 12,
            marginTop: 12,
            color: ogColors.muted,
          }}
        >
          {props.brandFooter
            ? "intheopen.cc"
            : (props.footer ?? "runs locally in your browser")}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 544,
          top: 66,
          width: 612,
          height: 508,
          display: "flex",
        }}
      >
        {props.visual}
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Satoshi", data: sans, weight: 500, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 400, style: "normal" },
        {
          name: "JetBrains Mono",
          data: monoBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
