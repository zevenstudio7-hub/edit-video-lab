import React from "react";
import { AbsoluteFill } from "remotion";
import { TestTitle } from "../components/TestTitle";
import "../styles/global.css";

export const GeminiVideoLab: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07080c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow decoration */}
      <div
        style={{
          position: "absolute",
          width: "900px",
          height: "900px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(59, 130, 246, 0.08) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <TestTitle title="Gemini Video Lab" />
    </AbsoluteFill>
  );
};
