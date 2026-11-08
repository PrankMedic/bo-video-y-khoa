import type React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fontFamily } from "./theme";

// Slides sit above the speaker circle: y 330..1240
const AREA: React.CSSProperties = {
  position: "absolute",
  left: 80,
  right: 80,
  top: 330,
  fontFamily,
  color: colors.ink,
};

const useEnter = (delaySeconds: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delaySeconds * fps;
  return {
    opacity: interpolate(f, [0, 0.35 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    translate: interpolate(f, [0, 0.7 * fps], ["0px 50px", "0px 0px"], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.spring({ damping: 200 }),
    }),
  };
};

const Kicker = ({ text }: { readonly text: string }) => (
  <div
    style={{
      ...useEnter(0),
      display: "flex",
      alignItems: "center",
      gap: 18,
      color: colors.red,
      fontSize: 38,
      fontWeight: 800,
      letterSpacing: 4,
      textTransform: "uppercase",
    }}
  >
    <div style={{ width: 22, height: 22, backgroundColor: colors.red }} />
    {text}
  </div>
);

// Citation line at the bottom of the frame, below the speaker circle
const SourceLine = ({ text }: { readonly text: string }) => {
  const enter = useEnter(0.6);
  if (!text) return null;
  return (
    <div
      style={{
        ...enter,
        position: "absolute",
        top: 1450,
        left: 0,
        right: 0,
        fontSize: 26,
        fontWeight: 500,
        lineHeight: 1.35,
        color: "#6F665D",
      }}
    >
      {text}
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  backgroundColor: colors.card,
  border: `4px solid ${colors.ink}`,
  boxShadow: `14px 14px 0 ${colors.red}`,
};

const NumberTag = ({ n }: { readonly n: string }) => (
  <div
    style={{
      position: "absolute",
      top: -50,
      left: 18,
      padding: "0 10px",
      backgroundColor: colors.paper,
      color: colors.red,
      fontSize: 72,
      fontWeight: 800,
      lineHeight: 1.2,
    }}
  >
    {n}
  </div>
);

/* ---------- Stat: title + one big number ---------- */

const StatSlideInner = ({
  kicker,
  source,
  title,
  stat,
  unit,
  statDelaySeconds,
}: {
  readonly kicker: string;
  readonly source: string;
  readonly title: string;
  readonly stat: string;
  readonly unit: string;
  readonly statDelaySeconds: number;
}) => (
  <div style={AREA}>
    <Kicker text={kicker} />
    <div
      style={{
        ...useEnter(0.25),
        marginTop: 36,
        fontSize: 104,
        fontWeight: 800,
        lineHeight: 1.12,
        letterSpacing: -2,
      }}
    >
      {title}
    </div>
    <div
      style={{
        ...cardStyle,
        ...useEnter(statDelaySeconds),
        marginTop: 90,
        padding: "40px 56px",
        display: "flex",
        alignItems: "baseline",
        gap: 32,
      }}
    >
      <div
        style={{
          fontSize: 230,
          fontWeight: 800,
          color: colors.red,
          lineHeight: 1,
          letterSpacing: -6,
        }}
      >
        {stat}
      </div>
      <div style={{ fontSize: 64, fontWeight: 700, whiteSpace: "nowrap" }}>{unit}</div>
    </div>
    <SourceLine text={source} />
  </div>
);

export const StatSlide = Interactive.create({
  Component: StatSlideInner,
  layout: "absolute-fill",
  schema: {
    kicker: { type: "string", default: "", description: "Kicker" },
    source: { type: "string", default: "", description: "Source line" },
    title: { type: "string", default: "", description: "Title" },
    stat: { type: "string", default: "", description: "Big number" },
    unit: { type: "string", default: "", description: "Unit" },
    statDelaySeconds: {
      type: "number",
      default: 0,
      min: 0,
      step: 0.1,
      description: "Number entrance delay",
      hiddenFromList: false,
    },
  },
});

/* ---------- Compare: OK vs warning ---------- */

const CompareCard = ({
  badge,
  tone,
  title,
  body,
  delaySeconds,
}: {
  readonly badge: string;
  readonly tone: "ok" | "warn";
  readonly title: string;
  readonly body: string;
  readonly delaySeconds: number;
}) => (
  <div
    style={{
      ...cardStyle,
      ...useEnter(delaySeconds),
      boxShadow: `14px 14px 0 ${tone === "ok" ? colors.ink : colors.red}`,
      padding: "40px 48px",
      marginTop: 60,
    }}
  >
    <div
      style={{
        display: "inline-block",
        padding: "6px 22px",
        backgroundColor: tone === "ok" ? colors.ink : colors.red,
        color: "white",
        fontSize: 36,
        fontWeight: 800,
      }}
    >
      {badge}
    </div>
    <div style={{ marginTop: 22, fontSize: 64, fontWeight: 800, lineHeight: 1.15 }}>
      {title}
    </div>
    <div style={{ marginTop: 14, fontSize: 42, fontWeight: 500, lineHeight: 1.3 }}>
      {body}
    </div>
  </div>
);

const CompareSlideInner = ({
  kicker,
  source,
  okBadge = "✓ Bình thường",
  okTitle,
  okBody,
  okDelaySeconds,
  warnBadge = "! Kích ứng",
  warnTitle,
  warnBody,
  warnDelaySeconds,
}: {
  readonly kicker: string;
  readonly source: string;
  readonly okBadge?: string;
  readonly okTitle: string;
  readonly okBody: string;
  readonly okDelaySeconds: number;
  readonly warnBadge?: string;
  readonly warnTitle: string;
  readonly warnBody: string;
  readonly warnDelaySeconds: number;
}) => (
  <div style={AREA}>
    <Kicker text={kicker} />
    <CompareCard
      badge={okBadge}
      tone="ok"
      title={okTitle}
      body={okBody}
      delaySeconds={okDelaySeconds}
    />
    <CompareCard
      badge={warnBadge}
      tone="warn"
      title={warnTitle}
      body={warnBody}
      delaySeconds={warnDelaySeconds}
    />
    <SourceLine text={source} />
  </div>
);

export const CompareSlide = Interactive.create({
  Component: CompareSlideInner,
  layout: "absolute-fill",
  schema: {
    kicker: { type: "string", default: "", description: "Kicker" },
    source: { type: "string", default: "", description: "Source line" },
    okTitle: { type: "string", default: "", description: "Normal: title" },
    okBody: { type: "string", default: "", description: "Normal: body" },
    okDelaySeconds: { type: "number", default: 0, min: 0, step: 0.1, description: "Normal: delay", hiddenFromList: false },
    warnTitle: { type: "string", default: "", description: "Warning: title" },
    warnBody: { type: "string", default: "", description: "Warning: body" },
    warnDelaySeconds: { type: "number", default: 0, min: 0, step: 0.1, description: "Warning: delay", hiddenFromList: false },
  },
});

/* ---------- Grid: 2x2 numbered cards ---------- */

export type GridItem = {
  readonly title: string;
  readonly sub: string;
  readonly delaySeconds: number;
};

const GridCard = ({ n, item }: { readonly n: string; readonly item: GridItem }) => (
  <div
    style={{
      ...cardStyle,
      ...useEnter(item.delaySeconds),
      height: 320,
      padding: "56px 32px 24px",
    }}
  >
    <NumberTag n={n} />
    <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>{item.title}</div>
    <div style={{ marginTop: 14, fontSize: 36, fontWeight: 500, lineHeight: 1.3 }}>
      {item.sub}
    </div>
  </div>
);

const GridSlideInner = ({
  kicker,
  source,
  items,
}: {
  readonly kicker: string;
  readonly source: string;
  readonly items: readonly GridItem[];
}) => (
  <div style={AREA}>
    <Kicker text={kicker} />
    <div
      style={{
        marginTop: 100,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        columnGap: 44,
        rowGap: 96,
      }}
    >
      {items.map((item, i) => (
        <GridCard key={i} n={String(i + 1).padStart(2, "0")} item={item} />
      ))}
    </div>
    <SourceLine text={source} />
  </div>
);

export const GridSlide = Interactive.create({
  Component: GridSlideInner,
  layout: "absolute-fill",
  schema: {
    kicker: { type: "string", default: "", description: "Kicker" },
    source: { type: "string", default: "", description: "Source line" },
  },
});

/* ---------- Study: data from one verified study ---------- */

export type StudyBar = {
  readonly label: string;
  readonly value: number;
  readonly highlight: boolean;
};

const Chip = ({ text }: { readonly text: string }) => (
  <div
    style={{
      padding: "6px 18px",
      border: `3px solid ${colors.ink}`,
      fontSize: 30,
      fontWeight: 800,
    }}
  >
    {text}
  </div>
);

const Bar = ({ bar, delaySeconds }: { readonly bar: StudyBar; readonly delaySeconds: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = interpolate(frame, [delaySeconds * fps, (delaySeconds + 1.2) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const color = bar.highlight ? colors.red : colors.muted;
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 36, fontWeight: 700 }}>
        <span>{bar.label}</span>
        <span style={{ color, fontWeight: 800 }}>{(bar.value * grow).toFixed(1)}%</span>
      </div>
      <div style={{ marginTop: 10, height: 34, backgroundColor: "#E6DED4" }}>
        <div style={{ width: `${bar.value * grow}%`, height: "100%", backgroundColor: color }} />
      </div>
    </div>
  );
};

const StudySlideInner = ({
  kicker,
  chips,
  title,
  population,
  metric,
  bars,
  barsDelaySeconds,
  note,
  noteDelaySeconds,
  warning,
  warningDelaySeconds,
  source,
}: {
  readonly kicker: string;
  readonly chips: readonly string[];
  readonly title: string;
  readonly population: string;
  readonly metric: string;
  readonly bars: readonly StudyBar[];
  readonly barsDelaySeconds: number;
  readonly note: string;
  readonly noteDelaySeconds: number;
  readonly warning: string;
  readonly warningDelaySeconds: number;
  readonly source: string;
}) => (
  <div style={AREA}>
    <Kicker text={kicker} />
    <div style={{ ...cardStyle, ...useEnter(0.2), marginTop: 36, padding: "30px 40px" }}>
      <div style={{ display: "flex", gap: 14 }}>
        {chips.map((c) => (
          <Chip key={c} text={c} />
        ))}
      </div>
      <div style={{ marginTop: 18, fontSize: 48, fontWeight: 800, lineHeight: 1.15 }}>{title}</div>
      <div style={{ marginTop: 10, fontSize: 34, fontWeight: 500 }}>{population}</div>
    </div>
    <div style={{ ...useEnter(barsDelaySeconds - 0.3), marginTop: 36 }}>
      <div style={{ fontSize: 34, fontWeight: 800, color: colors.red }}>{metric}</div>
      {bars.map((b, i) => (
        <Bar key={b.label} bar={b} delaySeconds={barsDelaySeconds + i * 0.25} />
      ))}
    </div>
    <div style={{ ...useEnter(noteDelaySeconds), marginTop: 26, fontSize: 34, fontWeight: 700 }}>
      {note}
    </div>
    <div
        style={{
          ...useEnter(warningDelaySeconds),
          display: warning ? "block" : "none",
          marginTop: 22,
          padding: "16px 24px",
          backgroundColor: colors.red,
          color: "white",
          fontSize: 32,
          fontWeight: 800,
        }}
      >
        {warning}
      </div>
    <SourceLine text={source} />
  </div>
);

export const StudySlide = Interactive.create({
  Component: StudySlideInner,
  layout: "absolute-fill",
  schema: {
    kicker: { type: "string", default: "", description: "Kicker" },
    title: { type: "string", default: "", description: "Study title" },
    population: { type: "string", default: "", description: "Population · duration" },
    metric: { type: "string", default: "", description: "Metric label" },
    barsDelaySeconds: { type: "number", default: 0, min: 0, step: 0.1, description: "Bars delay", hiddenFromList: false },
    note: { type: "string", default: "", description: "Note" },
    noteDelaySeconds: { type: "number", default: 0, min: 0, step: 0.1, description: "Note delay", hiddenFromList: false },
    warning: { type: "string", default: "", description: "Warning strip" },
    warningDelaySeconds: { type: "number", default: 0, min: 0, step: 0.1, description: "Warning delay", hiddenFromList: false },
    source: { type: "string", default: "", description: "Source line" },
  },
});
