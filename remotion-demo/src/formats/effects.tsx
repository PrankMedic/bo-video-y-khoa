import { Audio } from "@remotion/media";
import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useMs } from "./parts";
import { body, hand } from "./theme";

/**
 * Một cụm chữ tối đa hai hàng, tính cả dòng dẫn viết tay.
 * Kiểu dữ liệu không cho phép dòng dẫn đi cùng hai dòng chữ chính.
 */
export type CueLines =
  | { readonly kicker: string; readonly main: string; readonly main2?: never }
  | { readonly kicker?: never; readonly main: string; readonly main2?: string };

/** Co chữ theo số ký tự để một dòng luôn nằm trong khung, không tự rớt thành hàng thứ ba. */
const fitSize = (text: string, width: number, max: number) => Math.min(max, width / (text.length * 0.68));

export const TwoLineCue = ({
  lines,
  atMs,
  untilMs,
  color,
  top = 190,
  size = 128,
  kickerSize = 78,
  width = 960,
  light = false,
}: {
  readonly lines: CueLines;
  readonly atMs: number;
  readonly untilMs: number;
  readonly color: string;
  readonly top?: number;
  readonly size?: number;
  readonly kickerSize?: number;
  readonly width?: number;
  /** Nền sáng: quầng màu nền thay cho bóng đen và glow */
  readonly light?: string | false;
}) => {
  const ms = useMs();
  if (ms < atMs || ms > untilMs) return null;
  const inOut = (start: number) =>
    Math.min(
      interpolate(ms, [start, start + 320], [0, 1], { extrapolateRight: "clamp", easing: Easing.bezier(0.2, 0.8, 0.2, 1) }),
      interpolate(ms, [untilMs - 200, untilMs], [1, 0], { extrapolateLeft: "clamp" }),
    );
  const halo = light ? `0 0 8px ${light}, 0 0 20px ${light}, 0 0 44px ${light}` : null;
  const bold = halo ?? `0 0 4px ${color}4D, 0 0 14px ${color}38, 0 0 34px ${color}1F, 0 4px 10px rgba(0,0,0,.6), 0 12px 34px rgba(0,0,0,.42)`;
  const soft = halo ?? "0 3px 8px rgba(0,0,0,.6), 0 8px 26px rgba(0,0,0,.4)";
  const mains = [lines.main, lines.main2].filter((l): l is string => Boolean(l));
  const fontSize = Math.min(...mains.map((l) => fitSize(l, width, size)));
  const line = (text: string, start: number) => {
    const p = inOut(start);
    return (
      <div key={text} style={{ whiteSpace: "nowrap", opacity: p, transform: `translateY(${(1 - p) * 34}px)`, fontFamily: body, fontWeight: 800, fontSize, lineHeight: 1.1, color, textShadow: bold }}>
        {text}
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 9, textAlign: "center" }}>
      {lines.kicker ? (
        <div style={{ whiteSpace: "nowrap", opacity: inOut(atMs), fontFamily: hand, fontSize: kickerSize, lineHeight: 1.05, color: light ? color : "#fff", textShadow: soft }}>{lines.kicker}</div>
      ) : null}
      {mains.map((l, i) => line(l, atMs + (lines.kicker ? 120 : 0) + i * 120))}
    </div>
  );
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Dải màu của mép cháy: cam đất ở ngoài, hổ phách, rồi trắng ấm phủ khung lúc cắt. */
const burnRamp = (v: number): [number, number, number] => [
  214 + 41 * smooth(0, 0.5, v),
  92 + 110 * smooth(0.1, 0.55, v) + 42 * smooth(0.55, 1, v),
  40 + 30 * smooth(0.3, 0.7, v) + 150 * smooth(0.65, 1, v),
];
const leakRamp = (v: number): [number, number, number] => [255, 170 + 76 * smooth(0, 1, v), 120 + 110 * smooth(0.3, 1, v)];

const WIDTH = 135;
const HEIGHT = 240;

/**
 * Chuyển cảnh film burn hoặc light leak, vẽ theo từng khung nên không cần file video.
 * Đỉnh sáng rơi đúng `atMs`. `blend="normal"` cho nền sáng, nơi blend screen gần như không thấy.
 */
export const LightTransition = ({
  atMs,
  kind = "burn",
  durationMs = 800,
  seed = 1,
  blend = "screen",
  direction = 1,
}: {
  readonly atMs: number;
  readonly kind?: "burn" | "leak";
  readonly durationMs?: number;
  readonly seed?: number;
  readonly blend?: "screen" | "normal";
  readonly direction?: 1 | -1;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const p = ((frame / fps) * 1000 - (atMs - durationMs / 2)) / durationMs;
  const active = p >= 0 && p <= 1;

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx || !active) return;
    const image = ctx.createImageData(WIDTH, HEIGHT);
    // Một mép duy nhất lướt qua khung: phía sau mép đã phủ kín để che điểm cắt, rồi cả lớp mờ dần lộ cảnh mới.
    const front = -0.3 + 2.4 * p;
    const edge = kind === "burn" ? 0.34 : 0.6;
    const peak = kind === "burn" ? 1 : 0.62;
    const fade = peak * (1 - smooth(0.55, 1, p));
    const ramp = kind === "burn" ? burnRamp : leakRamp;
    for (let y = 0; y < HEIGHT; y++) {
      const v = y / HEIGHT;
      const wobble = 0.09 * Math.sin(v * 3.1 + seed + p * 2) + 0.035 * Math.sin(v * 7.3 - seed * 2 + p * 3);
      for (let x = 0; x < WIDTH; x++) {
        const u = (direction === 1 ? x : WIDTH - 1 - x) / WIDTH;
        const slant = kind === "leak" ? 0.3 * (v - 0.5) : 0;
        const level = 1 - smooth(0, edge, u - front - wobble - slant + edge * 0.3);
        const [r, g, b] = ramp(level);
        const i = (y * WIDTH + x) * 4;
        const alpha = smooth(0.01, 0.35, level) * fade;
        image.data[i] = blend === "screen" ? r * alpha : r;
        image.data[i + 1] = blend === "screen" ? g * alpha : g;
        image.data[i + 2] = blend === "screen" ? b * alpha : b;
        image.data[i + 3] = blend === "screen" ? 255 : 255 * alpha;
      }
    }
    ctx.putImageData(image, 0, 0);
  }, [active, blend, direction, kind, p, seed]);

  if (!active) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: blend, pointerEvents: "none" }}>
      <canvas ref={ref} width={WIDTH} height={HEIGHT} style={{ width: "100%", height: "100%", filter: "blur(6px)" }} />
    </AbsoluteFill>
  );
};

/** Giây từ đầu file đến đỉnh tiếng, để đỉnh rơi đúng điểm cần nhấn (xem work/tao_sfx.py). */
const SFX_PEAK = { whoosh: 0.3, digital: 0 };

/** SFX riêng trong public/sfx/, tạo bằng work/tao_sfx.py. */
export const Sfx = ({ kind, atMs, volume = 1 }: { readonly kind: keyof typeof SFX_PEAK; readonly atMs: number; readonly volume?: number }) => {
  const { fps } = useVideoConfig();
  const from = Math.max(0, Math.round((atMs / 1000 - SFX_PEAK[kind]) * fps));
  return (
    <Sequence from={from} durationInFrames={Math.round(fps)} layout="none" name={kind}>
      <Audio src={staticFile(`sfx/${kind}.wav`)} volume={volume} />
    </Sequence>
  );
};
