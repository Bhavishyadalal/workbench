import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0D0C0A",
          backgroundImage:
            "linear-gradient(#221F17 1px, transparent 1px), linear-gradient(90deg, #221F17 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #C4842A",
              color: "#EFB347",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            /
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, color: "#F6F3EA" }}>Workbench</div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.15,
            color: "#F6F3EA",
            maxWidth: 920,
            marginBottom: 24,
          }}
        >
          Every tool you keep
          <span
            style={{
              backgroundImage: "linear-gradient(90deg, #EFB347, #E8703D)",
              backgroundClip: "text",
              color: "transparent",
              marginLeft: 16,
            }}
          >
            re-googling.
          </span>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#9A9585", maxWidth: 760 }}>
          35+ tools that run entirely in your browser — nothing you work with is ever uploaded.
        </div>
      </div>
    ),
    { ...size }
  );
}
