import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pitchora — From spark to boardroom-ready deck, in minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PitchoraOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #07100A 0%, #0F1F12 45%, #162A18 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Aurora orbs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -80,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(123,185,74,0.55) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 240,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: 380,
            width: 360,
            height: 360,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(244,182,62,0.40) 0%, transparent 70%)",
          }}
        />

        {/* Top brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "linear-gradient(135deg, #0F1F12, #0B1A0E)",
              border: "2px solid rgba(159,205,99,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D4F08C",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            P
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#F4F7EF",
              display: "flex",
            }}
          >
            <span>Pitch</span>
            <span style={{ color: "#9FCD63" }}>ora</span>
          </div>
        </div>

        {/* Main message */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
              color: "#F4F7EF",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <span>From spark to&nbsp;</span>
            <span style={{ color: "#9FCD63" }}>boardroom-ready deck,</span>
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#F4F7EF",
              display: "flex",
            }}
          >
            in minutes.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "#C9D0C1",
              maxWidth: 920,
              lineHeight: 1.35,
              display: "flex",
            }}
          >
            The idea-to-deck studio. Brand-governed, evidence-controlled, editable PPTX, Arabic-RTL native.
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {["EN · AR", "10 quality dims", "Editable PPTX", "UAE-built"].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "10px 20px",
                  border: "1px solid rgba(159,205,99,0.32)",
                  borderRadius: 999,
                  fontSize: 20,
                  color: "#D4F08C",
                  background: "rgba(159,205,99,0.06)",
                  display: "flex",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#9FCD63",
              fontWeight: 600,
              letterSpacing: "0.05em",
              display: "flex",
            }}
          >
            pitchora.app/presentiq
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
