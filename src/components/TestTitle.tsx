import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface TestTitleProps {
  title: string;
  subtitle?: string;
}

export const TestTitle: React.FC<TestTitleProps> = ({
  title,
  subtitle = "Fase 01 — Base Remotion",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 100,
    },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        padding: "0 60px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 24px",
          borderRadius: "9999px",
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#94a3b8",
          fontSize: "24px",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "36px",
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#38bdf8",
            boxShadow: "0 0 12px #38bdf8",
          }}
        />
        {subtitle}
      </div>

      <h1
        style={{
          fontSize: "88px",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          background: "linear-gradient(135deg, #ffffff 30%, #93c5fd 70%, #3b82f6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          margin: 0,
        }}
      >
        {title}
      </h1>

      <div
        style={{
          marginTop: "48px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: "22px",
          color: "#64748b",
          letterSpacing: "0.04em",
        }}
      >
        <span>1080 × 1920</span>
        <span>•</span>
        <span>30 FPS</span>
        <span>•</span>
        <span>5s</span>
      </div>
    </div>
  );
};
