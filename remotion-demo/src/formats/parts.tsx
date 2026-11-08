import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LineIcon } from "./icons/LineIcon";
import type { IconName } from "./icons/data";
import { body, type Theme } from "./theme";
import { norm, toPages, type Word } from "./timeline";

export const useMs = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame / fps) * 1000;
};

/** Hiệu ứng vào/ra dùng chung, tính từ mốc `atMs`. */
export const useEnter = (atMs: number, untilMs = 1e9) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = (atMs / 1000) * fps;
  const p = spring({ frame: frame - start, fps, config: { damping: 15, stiffness: 170, mass: 0.7 } });
  const out = interpolate(frame, [(untilMs / 1000) * fps - 8, (untilMs / 1000) * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { p, out, visible: frame >= start && out > 0 };
};

/** Phụ đề lớn giữa khung: từng cụm ngắn, từ đang nói có nền màu nhấn. */
export const PunchCaption = ({
  words,
  theme,
  top,
  keywords = [],
  fontSize = 74,
  maxWords = 4,
  maxChars = 22,
  plain = false,
  style,
}: {
  readonly words: readonly Word[];
  readonly theme: Theme;
  readonly top: number;
  readonly keywords?: readonly string[];
  readonly fontSize?: number;
  readonly maxWords?: number;
  readonly maxChars?: number;
  /** Chữ màu mực, không bóng, cho nền sáng */
  readonly plain?: boolean;
  readonly style?: CSSProperties;
}) => {
  const ms = useMs();
  const pages = toPages(words, maxWords, maxChars);
  const page = [...pages].reverse().find((p) => p[0].startMs <= ms);
  if (!page || ms > page[page.length - 1].endMs + 500) return null;
  const keySet = new Set(keywords.map(norm));
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `4px ${fontSize * 0.06}px`,
        fontFamily: body,
        fontWeight: 800,
        fontSize,
        lineHeight: 1.22,
        color: "#fff",
        textAlign: "center",
        ...style,
      }}
    >
      {page.map((w, i) => {
        const active = ms >= w.startMs && ms < w.endMs;
        const key = keySet.has(norm(w.text));
        return (
          <span
            key={i}
            style={{
              padding: "2px 16px",
              borderRadius: 14,
              backgroundColor: active ? theme.accent : "transparent",
              color: active ? theme.onAccent : key ? theme.accent2 : plain ? theme.ink : "#fff",
              textShadow: active || plain ? "none" : "0 3px 6px rgba(0,0,0,.75), 0 0 22px rgba(0,0,0,.55)",
              scale: active ? 1.06 : 1,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

/** Phụ đề thanh mảnh kiểu tạp chí: một câu ngắn, từ hiện dần, không nhảy màu. */
export const EditorialCaption = ({
  words,
  theme,
  style,
  fontSize = 62,
  unreadOpacity = 0.28,
}: {
  readonly words: readonly Word[];
  readonly theme: Theme;
  readonly style: CSSProperties;
  readonly fontSize?: number;
  readonly unreadOpacity?: number;
}) => {
  const ms = useMs();
  const pages = toPages(words, 8, 34);
  const page = [...pages].reverse().find((p) => p[0].startMs <= ms);
  if (!page || ms > page[page.length - 1].endMs + 700) return null;
  return (
    <div
      style={{
        position: "absolute",
        fontFamily: theme.display,
        fontWeight: 400,
        fontStyle: "italic",
        fontSize,
        lineHeight: 1.3,
        color: theme.ink,
        ...style,
      }}
    >
      {page.map((w, i) => (
        <span
          key={i}
          style={{
            opacity: interpolate(ms, [w.startMs - 80, w.startMs + 120], [unreadOpacity, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {w.text}{" "}
        </span>
      ))}
    </div>
  );
};

/** Dòng nguồn, luôn có cỡ đủ đọc trên điện thoại. */
export const SourceLine = ({ text, theme, style }: { readonly text: string; readonly theme: Theme; readonly style: CSSProperties }) => (
  <div style={{ position: "absolute", fontFamily: body, fontWeight: 500, fontSize: 32, lineHeight: 1.35, color: theme.ink, ...style }}>
    {text}
  </div>
);

/** Thanh tiến trình mỏng ở mép trên. */
export const Progress = ({ color }: { readonly color: string }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 8,
        width: `${(frame / durationInFrames) * 100}%`,
        backgroundColor: color,
      }}
    />
  );
};

export const IconChip = ({
  icon,
  theme,
  draw,
  size = 92,
  box = 132,
}: {
  readonly icon: IconName;
  readonly theme: Theme;
  readonly draw: number;
  readonly size?: number;
  readonly box?: number;
}) => (
  <div
    style={{
      width: box,
      height: box,
      flex: "none",
      borderRadius: box * 0.28,
      backgroundColor: theme.accent,
      display: "grid",
      placeItems: "center",
    }}
  >
    <LineIcon name={icon} size={size} color={theme.onAccent} accent={theme.accent2} draw={draw} />
  </div>
);

/** Thẻ nhấn ý: icon + tiêu đề + dòng phụ, hiện đúng lúc bác sĩ nói tới. */
export const BeatCard = ({
  theme,
  icon,
  title,
  sub,
  atMs,
  untilMs,
  style,
  titleSize = 62,
}: {
  readonly theme: Theme;
  readonly icon: IconName;
  readonly title: ReactNode;
  readonly sub?: string;
  readonly atMs: number;
  readonly untilMs: number;
  readonly style: CSSProperties;
  readonly titleSize?: number;
}) => {
  const { p, out, visible } = useEnter(atMs, untilMs);
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 30,
        padding: "26px 34px",
        borderRadius: 34,
        backgroundColor: theme.surface,
        boxShadow: "0 18px 50px rgba(0,0,0,.28)",
        opacity: Math.min(p, out),
        transform: `translateY(${(1 - p) * 60}px) scale(${0.92 + 0.08 * p})`,
        ...style,
      }}
    >
      <IconChip icon={icon} theme={theme} draw={p} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: theme.display, fontWeight: 800, fontSize: titleSize, lineHeight: 1.12, color: theme.ink }}>{title}</div>
        {sub ? (
          <div style={{ fontFamily: theme.text, fontWeight: 500, fontSize: 36, lineHeight: 1.25, color: theme.muted, marginTop: 8 }}>{sub}</div>
        ) : null}
      </div>
    </div>
  );
};

/** Biểu đồ cột ngang số liệu nghiên cứu, số chạy theo chiều dài cột. */
export const StudyBars = ({
  theme,
  bars,
  atMs,
  labelSize = 36,
  numberSize = 62,
}: {
  readonly theme: Theme;
  readonly bars: readonly { readonly label: string; readonly value: number; readonly highlight?: boolean }[];
  readonly atMs: number;
  readonly labelSize?: number;
  readonly numberSize?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {bars.map((b, i) => {
        const p = spring({
          frame: frame - (atMs / 1000) * fps - i * 8,
          fps,
          config: { damping: 22, stiffness: 70 },
        });
        return (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: body, color: theme.ink }}>
              <span style={{ fontSize: labelSize, fontWeight: 500 }}>{b.label}</span>
              <span style={{ fontSize: numberSize, fontWeight: 800, color: b.highlight ? theme.accent : theme.ink, fontVariantNumeric: "tabular-nums" }}>
                {(b.value * p).toFixed(Number.isInteger(b.value) ? 0 : 1).replace(".", ",")}%
              </span>
            </div>
            <div style={{ height: 26, borderRadius: 13, backgroundColor: `${theme.muted}44`, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${b.value * p}%`, borderRadius: 13, backgroundColor: b.highlight ? theme.accent : theme.muted }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
