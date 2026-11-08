import type React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Word } from "../talking-slides/KaraokeCaptions";


// Watercolor palette, matched to the Flow illustrations
export const wash = {
  paper: "#F4EEE1",
  ink: "#2C3A32",
  sage: "#5F8069",
  sageSoft: "#DDE6D8",
  card: "rgba(255,253,247,0.94)",
  orange: "#FF8C1E",
};

const FADE = 0.4;

export const useSeconds = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

const inWindow = (t: number, from: number, to: number) =>
  interpolate(t, [from - FADE, from, to, to + FADE], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const useEnter = (at: number): React.CSSProperties => {
  const t = useSeconds();
  return {
    opacity: interpolate(t, [at, at + 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    translate: interpolate(t, [at, at + 0.7], ["0px 40px", "0px 0px"], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.spring({ damping: 200 }),
    }),
  };
};

/** Full-bleed Flow illustration with a slow push-in, cross-fading into the next one. */
export const FlowImage = ({ src, from, to }: { readonly src: string; readonly from: number; readonly to: number }) => {
  const t = useSeconds();
  if (t < from - FADE || t > to + FADE) return null;
  const scale = interpolate(t, [from - FADE, to + FADE], [1, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity: from === 0 ? 1 : interpolate(t, [from - FADE, from], [0, 1], { extrapolateRight: "clamp" }) }}>
      <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(scale) }} />
    </AbsoluteFill>
  );
};

const Kicker = ({ text, at }: { readonly text: string; readonly at: number }) => (
  <div
    style={{
      ...useEnter(at),
      color: wash.sage,
      fontSize: 44,
      fontWeight: 800,
      letterSpacing: 2,
      textTransform: "uppercase",
    }}
  >
    {text}
  </div>
);

const SourceLine = ({ text, at }: { readonly text: string; readonly at: number }) => (
  <div style={{ ...useEnter(at), marginTop: 30, fontSize: 28, fontWeight: 500, lineHeight: 1.35 }}>{text}</div>
);

const cardBase: React.CSSProperties = {
  backgroundColor: wash.card,
  border: `3px solid ${wash.sageSoft}`,
  borderRadius: 28,
  boxShadow: "0 14px 34px rgba(70,90,76,0.16)",
};

export type StepItem = { readonly title: string; readonly sub: string; readonly at: number };

const StepCard = ({ n, item }: { readonly n: number; readonly item: StepItem }) => (
  <div style={{ ...cardBase, ...useEnter(item.at), minHeight: 330, padding: "34px 32px" }}>
    <div style={{ color: wash.sage, fontSize: 64, fontWeight: 800, lineHeight: 1 }}>{n}</div>
    <div style={{ marginTop: 24, fontSize: 56, fontWeight: 800, lineHeight: 1.12 }}>{item.title}</div>
    <div style={{ marginTop: 12, fontSize: 36, fontWeight: 500 }}>{item.sub}</div>
  </div>
);

/** 2x2 cards for steps or parallel points. */
export const StepsSlide = ({
  kicker,
  at,
  items,
  source = "",
}: {
  readonly kicker: string;
  readonly at: number;
  readonly items: readonly StepItem[];
  readonly source?: string;
}) => (
  <div style={{ position: "absolute", top: 270, left: 70, right: 70 }}>
    <Kicker text={kicker} at={at} />
    <div style={{ marginTop: 44, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 34 }}>
      {items.map((item, i) => (
        <StepCard key={item.title} n={i + 1} item={item} />
      ))}
    </div>
    {source ? <SourceLine text={source} at={at + 0.6} /> : null}
  </div>
);

export type ValueRow = { readonly value: string; readonly label: string; readonly at: number };

const ValueCard = ({ row, until }: { readonly row: ValueRow; readonly until: number }) => {
  const t = useSeconds();
  const active = t >= row.at && t < until;
  return (
    <div
      style={{
        ...cardBase,
        ...useEnter(row.at),
        marginTop: 30,
        padding: "30px 40px",
        borderColor: active ? wash.sage : wash.sageSoft,
      }}
    >
      <div style={{ color: active ? wash.sage : wash.ink, fontSize: 92, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>{row.value}</div>
      <div style={{ marginTop: 8, fontSize: 42, fontWeight: 500 }}>{row.label}</div>
    </div>
  );
};

/** Stacked large values (prices, key numbers); the row being spoken is highlighted. */
export const ValuesSlide = ({
  kicker,
  at,
  rows,
  footer,
  source = "",
}: {
  readonly kicker: string;
  readonly at: number;
  readonly rows: readonly ValueRow[];
  readonly footer?: { readonly text: string; readonly at: number };
  readonly source?: string;
}) => (
  <div style={{ position: "absolute", top: 230, left: 70, right: 70 }}>
    <Kicker text={kicker} at={at} />
    {rows.map((row, i) => (
      <ValueCard key={row.value} row={row} until={rows[i + 1]?.at ?? footer?.at ?? Infinity} />
    ))}
    {footer ? (
      <div style={{ ...useEnter(footer.at), marginTop: 30, fontSize: 42, fontWeight: 700, color: wash.sage }}>{footer.text}</div>
    ) : null}
    {source ? <SourceLine text={source} at={at + 0.6} /> : null}
  </div>
);

export type StudyBar = { readonly label: string; readonly value: number; readonly highlight: boolean };

const StudyBarRow = ({ bar, at }: { readonly bar: StudyBar; readonly at: number }) => {
  const t = useSeconds();
  const grow = interpolate(t, [at, at + 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const color = bar.highlight ? wash.sage : "#A9B3A8";
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 38, fontWeight: 700 }}>
        <span>{bar.label}</span>
        <span style={{ color, fontWeight: 800 }}>{(bar.value * grow).toFixed(1)}%</span>
      </div>
      <div style={{ marginTop: 10, height: 34, borderRadius: 17, overflow: "hidden", backgroundColor: wash.sageSoft }}>
        <div style={{ width: `${bar.value * grow}%`, height: "100%", backgroundColor: color }} />
      </div>
    </div>
  );
};

/** Figures from one verified study: required at least once in any video with medical claims. */
export const StudySlide = ({
  kicker,
  at,
  title,
  population,
  metric,
  bars,
  barsAt,
  source,
}: {
  readonly kicker: string;
  readonly at: number;
  readonly title: string;
  readonly population: string;
  readonly metric: string;
  readonly bars: readonly StudyBar[];
  readonly barsAt: number;
  readonly source: string;
}) => (
  <div style={{ position: "absolute", top: 230, left: 70, right: 70 }}>
    <Kicker text={kicker} at={at} />
    <div style={{ ...cardBase, ...useEnter(at + 0.2), marginTop: 30, padding: "30px 36px" }}>
      <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.15 }}>{title}</div>
      <div style={{ marginTop: 10, fontSize: 34, fontWeight: 500 }}>{population}</div>
    </div>
    <div style={{ ...useEnter(barsAt - 0.3), marginTop: 34 }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: wash.sage }}>{metric}</div>
      {bars.map((bar, i) => (
        <StudyBarRow key={bar.label} bar={bar} at={barsAt + i * 0.25} />
      ))}
    </div>
    <SourceLine text={source} at={at + 0.6} />
  </div>
);

/** A dimmed paper veil keeps the illustration visible behind the cards. */
export const SlideLayer = ({ from, to, children }: { readonly from: number; readonly to: number; readonly children: React.ReactNode }) => {
  const t = useSeconds();
  const shown = inWindow(t, from, to);
  if (shown === 0) return null;
  return (
    <AbsoluteFill style={{ opacity: shown, color: wash.ink }}>
      <AbsoluteFill style={{ backgroundColor: wash.paper, opacity: 0.78 }} />
      {children}
    </AbsoluteFill>
  );
};

export const Headline = ({ text, from, to }: { readonly text: string; readonly from: number; readonly to: number }) => {
  const t = useSeconds();
  return (
    <div
      style={{
        position: "absolute",
        top: 190,
        left: 80,
        right: 80,
        textAlign: "center",
        color: wash.ink,
        fontSize: 64,
        fontWeight: 800,
        lineHeight: 1.2,
        textShadow: `0 0 18px ${wash.paper}, 0 0 8px ${wash.paper}`,
        opacity: inWindow(t, from, to),
      }}
    >
      {text}
    </div>
  );
};

const toPages = (all: readonly Word[]) => {
  const pages: Word[][] = [[]];
  for (const w of all) {
    pages[pages.length - 1].push(w);
    if (w.pageBreakAfter) pages.push([]);
  }
  return pages.filter((p) => p.length > 0);
};

/** Single-line karaoke: the spoken word turns orange, same look as the Flow videos. */
export const FlowCaptions = ({ words }: { readonly words: readonly Word[] }) => {
  const ms = useSeconds() * 1000;
  const page = [...toPages(words)].reverse().find((p) => p[0].startMs <= ms);
  if (!page || ms > page[page.length - 1].endMs + 600) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 1440,
        left: 60,
        right: 60,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        fontSize: 62,
        fontWeight: 800,
        lineHeight: 1.25,
        color: "white",
        textShadow: "0 0 10px rgba(30,24,18,0.95), 0 3px 8px rgba(30,24,18,0.9)",
      }}
    >
      {page.map((w, i) => (
        <span key={i} style={{ whiteSpace: "pre", color: ms >= w.startMs ? wash.orange : undefined }}>
          {i ? ` ${w.text}` : w.text}
        </span>
      ))}
    </div>
  );
};

export const ProgressBar = () => {
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
        backgroundColor: wash.sage,
      }}
    />
  );
};

export const IllustrationNote = () => (
  <div
    style={{
      position: "absolute",
      bottom: 60,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: 26,
      fontWeight: 500,
      color: wash.ink,
      opacity: 0.7,
    }}
  >
    Hình minh hoạ
  </div>
);
