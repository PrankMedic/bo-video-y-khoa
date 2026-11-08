import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fontFamily } from "./theme";

// Remotion's hosted sound effects
export const SFX = {
  whoosh: "https://remotion.media/whoosh.wav",
  ding: "https://remotion.media/ding.wav",
  switch: "https://remotion.media/switch.wav",
  click: "https://remotion.media/mouse-click.wav",
};

/** Progress bar, topic label and big outlined index; fades in after the full-frame intro. */
export const Header = ({
  index,
  label,
  introEndSeconds,
}: {
  readonly index: string;
  readonly label: string;
  readonly introEndSeconds: number;
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const shown = interpolate(frame, [introEndSeconds * fps, (introEndSeconds + 0.6) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ fontFamily, opacity: shown }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 10,
          width: `${(frame / durationInFrames) * 100}%`,
          backgroundColor: colors.red,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 80,
          fontSize: 40,
          fontWeight: 700,
          color: colors.ink,
        }}
      >
        <span style={{ color: colors.red, fontWeight: 800, marginRight: 14 }}>{index}</span>
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 40,
          fontSize: 340,
          fontWeight: 800,
          fontStyle: "italic",
          color: "transparent",
          WebkitTextStroke: `3px ${colors.red}`,
          opacity: 0.15,
        }}
      >
        {index}
      </div>
    </AbsoluteFill>
  );
};
