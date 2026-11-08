import { Video } from "@remotion/media";
import {
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { circle, colors } from "./theme";

/**
 * Full-frame speaker that shrinks into a circle after the intro.
 * faceX/faceY: point in the source frame (px) to keep centered in the circle.
 * zoomSourcePx: how many source pixels the circle's diameter covers.
 * contentTop/contentHeight: the picture area inside the 1080x1920 clip
 * (clips 3–4 are letterboxed at y=240, h=1440; clips 1–2 fill the frame).
 * voiceVolume: below 1 leaves headroom when the voice already peaks near 0 dBFS.
 */
export const SpeakerCircle = ({
  src,
  introEndSeconds,
  faceX,
  faceY,
  zoomSourcePx,
  contentTop = 240,
  contentHeight = 1440,
  voiceVolume = 1,
}: {
  readonly src: string;
  readonly introEndSeconds: number;
  readonly faceX: number;
  readonly faceY: number;
  readonly zoomSourcePx: number;
  readonly contentTop?: number;
  readonly contentHeight?: number;
  readonly voiceVolume?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { cx, cy, r } = circle;

  const p = interpolate(
    frame,
    [introEndSeconds * fps, (introEndSeconds + 0.7) * fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.65, 0, 0.35, 1),
    },
  );
  const lerp = (a: number, b: number) => a + (b - a) * p;

  // Full frame: cover the canvas with the letterboxed picture, face centered horizontally
  const fullScale = height / contentHeight;
  const fullLeft = Math.min(
    0,
    Math.max(width - width * fullScale, width / 2 - faceX * fullScale),
  );
  const circleScale = (2 * r) / zoomSourcePx;

  const box = {
    left: lerp(0, cx - r),
    top: lerp(0, cy - r),
    w: lerp(width, 2 * r),
    h: lerp(height, 2 * r),
  };
  const scale = lerp(fullScale, circleScale);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: cx - r + 14,
          top: cy - r + 14,
          width: 2 * r,
          height: 2 * r,
          borderRadius: r,
          backgroundColor: colors.red,
          opacity: p,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: box.left,
          top: box.top,
          width: box.w,
          height: box.h,
          borderRadius: lerp(0, r),
          overflow: "hidden",
          outline: `${lerp(0, 8)}px solid ${colors.ink}`,
          backgroundColor: colors.ink,
        }}
      >
        <Video
          name="Speaker"
          src={src}
          volume={voiceVolume}
          style={{
            position: "absolute",
            width: width * scale,
            height: height * scale,
            maxWidth: "none",
            left: lerp(fullLeft, r - faceX * circleScale),
            top: lerp(-contentTop * fullScale, r - faceY * circleScale),
          }}
        />
      </div>
    </>
  );
};
