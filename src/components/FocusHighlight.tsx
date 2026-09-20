import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { usePresetTheme } from "../presets";

export interface FocusHighlightTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
  shape?: "rect" | "circle";
}

export interface FocusHighlightProps {
  target: FocusHighlightTarget;
  dimOpacity?: number;
  pulse?: boolean;
  active?: boolean;
  entryFrame?: number;
  color?: string;
  style?: React.CSSProperties;
}

export const FocusHighlight: React.FC<FocusHighlightProps> = ({
  target,
  dimOpacity = 0.65,
  pulse = true,
  active = true,
  entryFrame = 0,
  color,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = usePresetTheme();

  const activeFrame = Math.max(0, frame - entryFrame);
  const entrance = spring({
    frame: activeFrame,
    fps,
    config: theme.motion.springConfig,
  });

  if (!active) return null;

  const currentDim = interpolate(entrance, [0, 1], [0, dimOpacity]);
  const highlightColor = color || theme.colors.accent;

  // Animación de pulso continuo (oscilación sutil en escala/borde)
  const pulsePhase = (frame % 45) / 45;
  const pulseScale = pulse
    ? interpolate(Math.sin(pulsePhase * Math.PI * 2), [-1, 1], [0.99, 1.02])
    : 1;
  const pulseGlow = pulse
    ? interpolate(Math.sin(pulsePhase * Math.PI * 2), [-1, 1], [0.4, 0.9])
    : 0.6;

  const isCircle = target.shape === "circle";
  const radius = isCircle ? "50%" : `${target.borderRadius ?? 16}px`;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 35,
        ...style,
      }}
    >
      {/* SVG Mask to darken everything except the cutout */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <mask id={`focus-mask-${entryFrame}`}>
            {/* White covers all (visible) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cutout over target (invisible) */}
            {isCircle ? (
              <circle
                cx={target.x + target.width / 2}
                cy={target.y + target.height / 2}
                r={Math.min(target.width, target.height) / 2}
                fill="black"
              />
            ) : (
              <rect
                x={target.x}
                y={target.y}
                width={target.width}
                height={target.height}
                rx={target.borderRadius ?? 16}
                ry={target.borderRadius ?? 16}
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Dim overlay with cutout mask applied */}
        <rect
          width="100%"
          height="100%"
          fill="#000000"
          opacity={currentDim}
          mask={`url(#focus-mask-${entryFrame})`}
        />
      </svg>

      {/* Target Focus Border and Glow */}
      <div
        style={{
          position: "absolute",
          left: `${target.x}px`,
          top: `${target.y}px`,
          width: `${target.width}px`,
          height: `${target.height}px`,
          borderRadius: radius,
          border: `3px solid ${highlightColor}`,
          boxShadow: `0 0 28px ${highlightColor}${Math.round(pulseGlow * 255).toString(16).padStart(2, "0")}, inset 0 0 16px ${highlightColor}33`,
          transform: `scale(${pulseScale})`,
          transformOrigin: "center center",
          opacity: interpolate(entrance, [0, 1], [0, 1]),
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};
