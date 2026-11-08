import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EndCard, END_CARD_FRAMES } from "./Formats";
import { DuckedMusic } from "../talking-slides/DuckedMusic";
import { SFX } from "../talking-slides/Header";
import type { IconName } from "./icons/data";
import { LineIcon } from "./icons/LineIcon";
import { Progress, PunchCaption, SourceLine, StudyBars, useEnter, useMs } from "./parts";
import { themes, type Theme, type ThemeName } from "./theme";
import type { Segment, Word } from "./timeline";

export { END_CARD_FRAMES };

type Item = { readonly icon: IconName; readonly title: string; readonly sub?: string; readonly atMs: number };

/** Một cảnh hoạt hình. Thêm bản thu mới chỉ cần viết danh sách cảnh này. */
export type Scene = {
  readonly atMs: number;
  readonly kicker?: string;
  readonly speaker?: string;
  readonly source?: string;
} & (
  | { readonly kind: "hero"; readonly icon: IconName; readonly title: string; readonly sub?: string; readonly bars?: readonly { readonly label: string; readonly value: number; readonly highlight?: boolean }[] }
  | { readonly kind: "stat"; readonly value: number; readonly prefix?: string; readonly suffix?: string; readonly title: string; readonly sub?: string }
  | { readonly kind: "steps"; readonly title: string; readonly items: readonly Item[] }
  | { readonly kind: "compare"; readonly title: string; readonly left: Item; readonly right: Item }
);

const sketchFilter = "url(#giay)";

const Paper = ({ theme }: { readonly theme: Theme }) => (
  <AbsoluteFill style={{ backgroundColor: theme.bg }}>
    <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.16 }}>
      <filter id="giay">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="4" />
        <feColorMatrix values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .18  0 0 0 .8 0" />
      </filter>
      <rect width="100%" height="100%" filter={sketchFilter} />
    </svg>
    {Array.from({ length: 22 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 120 + i * 84, height: 2, backgroundColor: `${theme.accent2}1f` }} />
    ))}
  </AbsoluteFill>
);

const Glow = ({ theme }: { readonly theme: Theme }) => {
  const frame = useCurrentFrame();
  const y = 34 + 8 * Math.sin(frame / 90);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        backgroundImage: `radial-gradient(900px 900px at 50% ${y}%, ${theme.surface}, transparent 72%)`,
      }}
    />
  );
};

const Title = ({ theme, children, size = 92, sketch }: { readonly theme: Theme; readonly children: string; readonly size?: number; readonly sketch: boolean }) => (
  <div style={{ fontFamily: theme.display, fontWeight: sketch ? 400 : 800, fontSize: sketch ? size * 1.16 : size, lineHeight: 1.14, color: theme.ink, textAlign: "center" }}>{children}</div>
);

const Sub = ({ theme, children, sketch }: { readonly theme: Theme; readonly children: string; readonly sketch: boolean }) => (
  <div style={{ fontFamily: theme.text, fontWeight: 500, fontSize: sketch ? 58 : 46, lineHeight: 1.28, color: theme.muted, textAlign: "center", marginTop: 22 }}>{children}</div>
);

const StepRow = ({ item, theme, sketch }: { readonly item: Item; readonly theme: Theme; readonly sketch: boolean }) => {
  const { p } = useEnter(item.atMs);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 34, opacity: Math.min(1, p * 2), transform: sketch ? `rotate(${(1 - p) * -2}deg)` : `translateX(${(1 - p) * 70}px)` }}>
      <div style={{ flex: "none", width: 150, height: 150, borderRadius: 42, display: "grid", placeItems: "center", backgroundColor: sketch ? "transparent" : theme.accent }}>
        <LineIcon name={item.icon} size={sketch ? 136 : 104} color={sketch ? theme.ink : theme.onAccent} accent={sketch ? theme.accent : theme.accent2} draw={p} sketch={sketch} strokeWidth={sketch ? 2 : 3} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: theme.display, fontWeight: sketch ? 400 : 800, fontSize: sketch ? 74 : 60, lineHeight: 1.1, color: theme.ink }}>{item.title}</div>
        {item.sub ? <div style={{ fontFamily: theme.text, fontWeight: 500, fontSize: sketch ? 50 : 44, lineHeight: 1.22, color: theme.muted, marginTop: 6 }}>{item.sub}</div> : null}
      </div>
    </div>
  );
};

const CompareSide = ({ item, theme, sketch, color }: { readonly item: Item; readonly theme: Theme; readonly sketch: boolean; readonly color: string }) => {
  const { p } = useEnter(item.atMs);
  return (
    <div style={{ flex: 1, minWidth: 0, padding: "40px 26px", borderRadius: 40, border: `3px solid ${color}`, textAlign: "center", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 50}px)` }}>
      <div style={{ display: "grid", placeItems: "center" }}>
        <LineIcon name={item.icon} size={190} color={theme.ink} accent={color} draw={p} sketch={sketch} strokeWidth={sketch ? 2 : 3} />
      </div>
      <div style={{ fontFamily: theme.display, fontWeight: sketch ? 400 : 800, fontSize: sketch ? 68 : 52, lineHeight: 1.12, color: theme.ink, marginTop: 20 }}>{item.title}</div>
      {item.sub ? <div style={{ fontFamily: theme.text, fontWeight: 500, fontSize: sketch ? 46 : 44, lineHeight: 1.24, color: theme.muted, marginTop: 12 }}>{item.sub}</div> : null}
    </div>
  );
};

const SceneView = ({ scene, theme, sketch, untilMs }: { readonly scene: Scene; readonly theme: Theme; readonly sketch: boolean; readonly untilMs: number }) => {
  const { p, out } = useEnter(scene.atMs, untilMs);
  const frame = useCurrentFrame();
  const sway = sketch ? Math.sin(frame / 22) * 1.1 : 0;
  return (
    <AbsoluteFill style={{ padding: sketch ? "230px 60px 680px" : "230px 76px 420px", justifyContent: "center", ...(sketch ? { right: 120, width: "auto" } : {}), opacity: Math.min(Math.min(1, p * 1.6), out) }}>
      {scene.kicker ? (
        <div style={{ position: "absolute", top: 140, left: 76, right: 76, textAlign: "center", fontFamily: theme.text, fontWeight: 700, fontSize: sketch ? 58 : 36, letterSpacing: sketch ? 0 : 3, textTransform: sketch ? "none" : "uppercase", color: theme.accent }}>
          {scene.kicker}
        </div>
      ) : null}
      {scene.kind === "hero" ? (
        <>
          {scene.bars ? <div style={{ marginBottom: 32, transform: `rotate(${sway * 0.4}deg)` }}><StudyBars theme={theme} bars={scene.bars} atMs={scene.atMs} labelSize={44} numberSize={72} /></div> : <div style={{ display: "grid", placeItems: "center", marginBottom: 44, transform: `scale(${0.8 + 0.2 * p}) rotate(${sway}deg)` }}>
            <LineIcon name={scene.icon} size={420} color={theme.ink} accent={theme.accent} draw={p} sketch={sketch} strokeWidth={sketch ? 1.6 : 2.4} />
          </div>}
          <Title theme={theme} size={sketch && scene.title === "Câu trả lời: Không" ? 130 : 92} sketch={sketch}>{scene.title}</Title>
          {scene.sub ? <Sub theme={theme} sketch={sketch}>{scene.sub}</Sub> : null}
        </>
      ) : null}
      {scene.kind === "stat" ? (
        <>
          <div style={{ textAlign: "center", color: theme.accent, fontFamily: theme.display, fontWeight: sketch ? 400 : 800, fontSize: 220, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
            {scene.prefix}
            {Math.round(scene.value * p).toLocaleString("vi-VN")}
            {scene.suffix}
          </div>
          <Title theme={theme} size={70} sketch={sketch}>{scene.title}</Title>
          {scene.sub ? <Sub theme={theme} sketch={sketch}>{scene.sub}</Sub> : null}
        </>
      ) : null}
      {scene.kind === "steps" ? (
        <>
          <Title theme={theme} size={74} sketch={sketch}>{scene.title}</Title>
          <div style={{ display: "flex", flexDirection: "column", gap: 40, marginTop: 56, transform: `rotate(${sway * 0.3}deg)` }}>
            {scene.items.map((it) => (
              <StepRow key={it.title} item={it} theme={theme} sketch={sketch} />
            ))}
          </div>
        </>
      ) : null}
      {scene.kind === "compare" ? (
        <>
          <Title theme={theme} size={74} sketch={sketch}>{scene.title}</Title>
          <div style={{ display: "flex", gap: 28, marginTop: 56, ...(sketch ? { marginLeft: -36, marginRight: -36, transform: `rotate(${sway * 0.3}deg)` } : {}) }}>
            <CompareSide item={scene.left} theme={theme} sketch={sketch} color={theme.accent} />
            <CompareSide item={scene.right} theme={theme} sketch={sketch} color={theme.accent2} />
          </div>
        </>
      ) : null}
      {scene.source ? (
        <SourceLine text={scene.source} theme={theme} style={{ left: 60, right: 60, ...(sketch ? { top: 1420 } : { bottom: 76 }), textAlign: "center" }} />
      ) : null}
    </AbsoluteFill>
  );
};

/** ⑤⑥ Chỉ cần giọng nói: hoạt hình chữ và hình theo từng câu, kiểu "motion" hoặc "sketch". */
export const Animation = ({
  audio,
  segments,
  words,
  scenes,
  lengthMs,
  themeName,
  sketch = false,
  keywords = [],
  brand = true,
  disclosure,
  continuousMotion = false,
}: {
  readonly audio: string;
  readonly segments: readonly Segment[];
  readonly words: readonly Word[];
  readonly scenes: readonly Scene[];
  readonly lengthMs: number;
  readonly themeName: ThemeName;
  readonly sketch?: boolean;
  readonly keywords?: readonly string[];
  readonly brand?: boolean;
  readonly disclosure?: string;
  readonly continuousMotion?: boolean;
}) => {
  const theme = themes[themeName];
  const { fps } = useVideoConfig();
  const ms = useMs();
  const idx = scenes.reduce((a, s, i) => (s.atMs <= ms ? i : a), 0);
  const scene = scenes[idx];
  const until = scenes[idx + 1]?.atMs ?? lengthMs + 500;
  const speakerOpacity = interpolate(ms, [scene.atMs, scene.atMs + 300], [0, 1], { extrapolateRight: "clamp" });

  let cursor = 0;
  return (
    <AbsoluteFill>
      {sketch ? <Paper theme={theme} /> : <Glow theme={theme} />}
      <AbsoluteFill style={continuousMotion ? { transform: `translateY(${Math.sin(ms / 900) * 7}px) scale(${1 + 0.006 * Math.sin(ms / 1300)})` } : undefined}>
        <SceneView key={idx} scene={scene} theme={theme} sketch={sketch} untilMs={until} />
      </AbsoluteFill>
      {disclosure ? <div style={{ position: "absolute", top: 88, left: 76, padding: "10px 18px", borderRadius: 12, backgroundColor: theme.surface, color: theme.ink, fontFamily: theme.text, fontSize: 30, fontWeight: 600 }}>{disclosure}</div> : null}
      {scene.speaker ? (
        <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontFamily: theme.text, fontWeight: 500, fontSize: 32, color: theme.muted, opacity: speakerOpacity }}>{scene.speaker}</div>
      ) : null}
      <PunchCaption words={words} theme={theme} top={sketch ? 1258 : 1540} style={sketch ? { left: 60, right: 120 } : undefined} keywords={keywords} fontSize={58} maxWords={6} maxChars={28} plain />
      <Progress color={theme.accent} />
      {segments.map((s, i) => {
        const from = Math.round((cursor / 1000) * fps);
        const trimBefore = Math.round((s.fromMs / 1000) * fps);
        const trimAfter = Math.round((s.toMs / 1000) * fps);
        cursor += s.toMs - s.fromMs;
        return (
          <Sequence key={i} from={from} durationInFrames={trimAfter - trimBefore} layout="none" name={`Giọng ${i + 1}`}>
            <Audio src={staticFile(audio)} trimBefore={trimBefore} trimAfter={trimAfter} />
          </Sequence>
        );
      })}
      <DuckedMusic src={staticFile("music/bg-pad.wav")} words={words} speechVolume={0.16} gapVolume={0.3} fadeOutSeconds={2} />
      {scenes.slice(1).map((s, i) => (
        <Sequence key={i} from={Math.round((s.atMs / 1000) * fps)} durationInFrames={40} layout="none" name={`Chuyển cảnh ${i + 1}`}>
          <Audio src={SFX.whoosh} volume={0.22} />
        </Sequence>
      ))}
      {brand ? <EndCard theme={theme} lengthMs={lengthMs} /> : null}
    </AbsoluteFill>
  );
};
