import { Video } from "@remotion/media";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import type { Segment } from "./timeline";

export type ClipMeta = {
  readonly file: string;
  /** Tâm mặt trong khung nguồn 1080×1920 */
  readonly faceX: number;
  readonly faceY: number;
  /** Vùng có hình; clip 3–4 có viền đen trên dưới */
  readonly contentTop: number;
  readonly contentHeight: number;
  readonly voiceVolume?: number;
};

export const clips = {
  mau: { file: "mau-nguoi-noi", faceX: 540, faceY: 760, contentTop: 0, contentHeight: 1920 },
} satisfies Record<string, ClipMeta>;

/**
 * Hình quay bác sĩ trong một khung bất kỳ, giữ mặt ở điểm (targetX, targetY).
 * Nhiều đoạn được nối liền nhau theo `segments`, nên phần bị cắt không xuất hiện.
 */
export const Footage = ({
  clip,
  segments,
  width,
  height,
  zoom = 1,
  targetX,
  targetY,
  filter,
  muted = false,
}: {
  readonly clip: ClipMeta;
  readonly segments: readonly Segment[];
  readonly width: number;
  readonly height: number;
  readonly zoom?: number;
  readonly targetX?: number;
  readonly targetY?: number;
  readonly filter?: string;
  readonly muted?: boolean;
}) => {
  const { fps } = useVideoConfig();
  const place = (contentTop: number, contentHeight: number) => {
    const scale = Math.max(height / contentHeight, width / 1080) * zoom;
    return {
      scale,
      left: Math.min(0, Math.max(width - 1080 * scale, (targetX ?? width / 2) - clip.faceX * scale)),
      top: Math.min(
        -contentTop * scale,
        Math.max(height - (contentTop + contentHeight) * scale, (targetY ?? height * 0.42) - clip.faceY * scale),
      ),
    };
  };

  let cursor = 0;
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", backgroundColor: "#000" }}>
      {segments.map((s, i) => {
        const from = Math.round((cursor / 1000) * fps);
        const trimBefore = Math.round((s.fromMs / 1000) * fps);
        const trimAfter = Math.round((s.toMs / 1000) * fps);
        cursor += s.toMs - s.fromMs;
        const { scale, left, top } = place(s.contentTop ?? clip.contentTop, s.contentHeight ?? clip.contentHeight);
        return (
          <Sequence key={i} from={from} durationInFrames={trimAfter - trimBefore} layout="none" name={`Đoạn ${i + 1}`}>
            <Video
              src={staticFile(`${clip.file}.mp4`)}
              trimBefore={trimBefore}
              trimAfter={trimAfter}
              volume={muted ? 0 : (clip.voiceVolume ?? 1)}
              style={{
                position: "absolute",
                left,
                top,
                width: 1080 * scale,
                height: 1920 * scale,
                maxWidth: "none",
                filter,
              }}
            />
          </Sequence>
        );
      })}
    </div>
  );
};
