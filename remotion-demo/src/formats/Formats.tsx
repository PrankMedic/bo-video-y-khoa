import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { DuckedMusic } from "../talking-slides/DuckedMusic";
import { SFX } from "../talking-slides/Header";
import { Footage, type ClipMeta } from "./Footage";
import type { IconName } from "./icons/data";
import { LineIcon } from "./icons/LineIcon";
import { BeatCard, EditorialCaption, IconChip, Progress, PunchCaption, SourceLine, StudyBars, useEnter, useMs } from "./parts";
import { body, themes, type Theme } from "./theme";
import { sentenceStarts, type Segment, type Word } from "./timeline";
import { BRAND } from "../brand";

export const END_CARD_FRAMES = 75;

export type Beat = {
  readonly icon: IconName;
  readonly title: string;
  readonly sub?: string;
  readonly atMs: number;
  readonly untilMs: number;
  readonly source?: string;
};

export type Panel = {
  readonly atMs: number;
  readonly untilMs: number;
  readonly kicker: string;
  readonly source?: string;
} & (
  | {
      readonly kind: "study";
      readonly chips: readonly string[];
      readonly title: string;
      readonly population: string;
      readonly bars: readonly { label: string; value: number; highlight?: boolean }[];
      readonly barsAtMs: number;
      readonly note: string;
      readonly warning?: string;
    }
  | {
      readonly kind: "list";
      readonly items: readonly { icon: IconName; title: string; sub?: string; atMs: number }[];
    }
);

type Common = {
  readonly clip: ClipMeta;
  readonly segments: readonly Segment[];
  readonly words: readonly Word[];
  readonly lengthMs: number;
};

const hooks = (beats: readonly { atMs: number }[], fps: number) =>
  beats.map((b, i) => (
    <Sequence key={i} from={Math.round((b.atMs / 1000) * fps)} durationInFrames={45} layout="none" name={`Hiệu ứng ${i + 1}`}>
      <Audio src={i % 3 === 2 ? SFX.ding : SFX.whoosh} volume={i % 3 === 2 ? 0.3 : 0.35} />
    </Sequence>
  ));

const Music = ({ words }: { readonly words: readonly Word[] }) => (
  <DuckedMusic src={staticFile("music/bg-pad.wav")} words={words} speechVolume={0.2} gapVolume={0.36} fadeOutSeconds={2} />
);

/** Khung kết: nhắc tham khảo bác sĩ. Không có lời kêu gọi cam kết kết quả. */
export const EndCard = ({ theme, lengthMs }: { readonly theme: Theme; readonly lengthMs: number }) => {
  const { fps, width, height } = useVideoConfig();
  const { p, visible } = useEnter(lengthMs);
  if (!visible) return null;
  const portrait = height > width;
  return (
    <Sequence from={Math.round((lengthMs / 1000) * fps)} layout="none" name="Khung kết">
      <AbsoluteFill
        style={{
          backgroundColor: theme.bg,
          opacity: p,
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 100,
        }}
      >
        <div style={{ fontFamily: theme.display, fontWeight: 700, fontSize: portrait ? 150 : 130, letterSpacing: 10, color: theme.accent }}>{BRAND.name}</div>
        <div style={{ fontFamily: theme.text, fontWeight: 500, fontSize: portrait ? 44 : 38, lineHeight: 1.35, color: theme.ink, marginTop: 28, maxWidth: 860 }}>
          Thông tin tham khảo, không thay thế tư vấn của bác sĩ.
        </div>
      </AbsoluteFill>
    </Sequence>
  );
};

/** Mức zoom đổi theo câu, chuyển nhanh rồi trôi rất chậm. */
const useSentenceZoom = (words: readonly Word[], levels: readonly number[]) => {
  const ms = useMs();
  const starts = sentenceStarts(words);
  let idx = 0;
  for (let i = 0; i < starts.length; i++) if (starts[i] <= ms) idx = i;
  const level = levels[idx % levels.length];
  const prev = levels[(idx + levels.length - 1) % levels.length];
  const start = starts[idx] ?? 0;
  const snap = interpolate(ms, [start, start + 220], [idx ? prev : level, level], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
  });
  return snap * (1 + Math.min(0.02, (ms - start) / 250000));
};

/** ① Thẳng mặt: bác sĩ toàn màn hình, tự phóng gần theo câu, phụ đề lớn, thẻ nhấn ý. */
export const ThangMat = ({
  clip,
  segments,
  words,
  lengthMs,
  hook,
  beats,
  keywords,
}: Common & {
  readonly hook: string;
  readonly beats: readonly Beat[];
  readonly keywords: readonly string[];
}) => {
  const { fps } = useVideoConfig();
  const theme = themes.sage;
  const zoom = useSentenceZoom(words, [1, 1.14, 1.05, 1.22]);
  const { p, out, visible } = useEnter(150, 3400);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Footage clip={clip} segments={segments} width={1080} height={1920} zoom={zoom} targetY={760} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.34) 0%, transparent 24%, transparent 58%, rgba(0,0,0,.62) 100%)" }} />
      {visible ? (
        <div
          style={{
            position: "absolute",
            top: 170,
            left: 60,
            right: 60,
            padding: "30px 40px",
            borderRadius: 30,
            backgroundColor: theme.accent,
            color: theme.onAccent,
            fontFamily: body,
            fontWeight: 800,
            fontSize: 72,
            lineHeight: 1.14,
            textAlign: "center",
            opacity: out,
            transform: `scale(${0.9 + 0.1 * p}) rotate(${(1 - p) * -2}deg)`,
          }}
        >
          {hook}
        </div>
      ) : null}
      {beats.map((b, i) => (
        <BeatCard key={i} theme={theme} {...b} style={{ top: 180, left: 60, right: 60 }} />
      ))}
      <PunchCaption words={words} theme={theme} top={1340} keywords={keywords} />
      <Progress color={theme.accent2} />
      <Music words={words} />
      {hooks(beats, fps)}
      <EndCard theme={theme} lengthMs={lengthMs} />
    </AbsoluteFill>
  );
};

/** ② Tạp chí: nền đen ấm, khung hình mảnh, chữ có chân, không hiệu ứng ồn. */
export const TapChi = ({
  clip,
  segments,
  words,
  lengthMs,
  issue,
  beats,
}: Common & { readonly issue: string; readonly beats: readonly Beat[] }) => {
  const theme = themes.noir;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <div style={{ position: "absolute", top: 110, left: 90, right: 120, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: theme.display, color: theme.ink }}>
        <span style={{ fontSize: 56, letterSpacing: 8, fontWeight: 500 }}>{BRAND.name}</span>
        <span style={{ fontSize: 32, fontStyle: "italic", color: theme.accent }}>{issue}</span>
      </div>
      <div style={{ position: "absolute", top: 196, left: 90, right: 120, height: 1, backgroundColor: theme.accent }} />
      <div style={{ position: "absolute", top: 232, left: 90 }}>
        <Footage clip={clip} segments={segments} width={870} height={1020} zoom={1} targetX={435} targetY={470} filter="saturate(.8) contrast(1.05) brightness(.98)" />
      </div>
      {beats.map((b, i) => (
        <Note key={i} theme={theme} beat={b} />
      ))}
      <EditorialCaption words={words} theme={theme} unreadOpacity={0.72} fontSize={56} style={{ top: 1280, left: 90, right: 120 }} />
      <Music words={words} />
      <EndCard theme={theme} lengthMs={lengthMs} />
    </AbsoluteFill>
  );
};

const Note = ({ theme, beat }: { readonly theme: Theme; readonly beat: Beat }) => {
  const { p, out, visible } = useEnter(beat.atMs, beat.untilMs);
  if (!visible) return null;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 870,
          boxSizing: "border-box",
          top: 870,
          height: 382,
          padding: "28px 36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: "#14110F",
          opacity: Math.min(p, out),
        }}
      >
        <div style={{ fontFamily: theme.display, fontSize: 100, lineHeight: 1.08, color: theme.accent, transform: `translateY(${(1 - p) * 24}px)` }}>{beat.title}</div>
        {beat.sub ? <div style={{ fontFamily: theme.display, fontStyle: "italic", fontSize: 44, lineHeight: 1.25, color: theme.ink, marginTop: 8 }}>{beat.sub}</div> : null}
      </div>
      {beat.source ? <SourceLine text={beat.source} theme={theme} style={{ top: 1450, left: 90, right: 120, opacity: Math.min(p, out) }} /> : null}
    </>
  );
};

/** Nội dung bảng dữ liệu, dùng chung cho bản dọc và bản ngang. */
export const PanelBody = ({ panel, theme, compact }: { readonly panel: Panel; readonly theme: Theme; readonly compact?: boolean }) => (
  <>
    <div style={{ fontFamily: body, fontWeight: 700, fontSize: compact ? 28 : 34, letterSpacing: 2, textTransform: "uppercase", color: theme.accent }}>{panel.kicker}</div>
    {panel.kind === "study" ? (
      <StudyPanel panel={panel} theme={theme} compact={compact} />
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 18 : 34, marginTop: 24 }}>
        {panel.items.map((it) => (
          <ListItem key={it.title} item={it} theme={theme} compact={compact} />
        ))}
      </div>
    )}
  </>
);

const StudyPanel = ({ panel, theme, compact }: { readonly panel: Extract<Panel, { kind: "study" }>; readonly theme: Theme; readonly compact?: boolean }) => (
  <>
    <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
      {panel.chips.map((c) => (
        <span key={c} style={{ padding: "6px 18px", borderRadius: 40, border: `2px solid ${theme.muted}`, fontFamily: body, fontWeight: 500, fontSize: compact ? 24 : 28, color: theme.ink }}>
          {c}
        </span>
      ))}
    </div>
    <div style={{ fontFamily: body, fontWeight: 800, fontSize: compact ? 44 : 60, lineHeight: 1.15, color: theme.ink, marginTop: 20 }}>{panel.title}</div>
    <div style={{ fontFamily: body, fontWeight: 500, fontSize: compact ? 26 : 34, lineHeight: 1.3, color: theme.muted, margin: "10px 0 24px" }}>{panel.population}</div>
    <StudyBars theme={theme} bars={panel.bars} atMs={panel.barsAtMs} labelSize={compact ? 28 : 38} numberSize={compact ? 46 : 66} />
    <div style={{ fontFamily: body, fontWeight: 700, fontSize: compact ? 28 : 38, lineHeight: 1.25, color: theme.ink, marginTop: 24 }}>{panel.note}</div>
    {panel.warning ? (
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, color: theme.accent2, fontFamily: body, fontWeight: 700, fontSize: compact ? 27 : 36 }}>
        <LineIcon name="canh-bao" size={compact ? 40 : 56} color={theme.accent2} />
        {panel.warning}
      </div>
    ) : null}
  </>
);

const ListItem = ({
  item,
  theme,
  compact,
}: {
  readonly item: { icon: IconName; title: string; sub?: string; atMs: number };
  readonly theme: Theme;
  readonly compact?: boolean;
}) => {
  const { p } = useEnter(item.atMs);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: p, transform: `translateX(${(1 - p) * 50}px)` }}>
      <IconChip icon={item.icon} theme={theme} draw={p} size={compact ? 62 : 88} box={compact ? 92 : 128} />
      <div>
        <div style={{ fontFamily: body, fontWeight: 800, fontSize: compact ? 40 : 56, lineHeight: 1.12, color: theme.ink }}>{item.title}</div>
        {item.sub ? <div style={{ fontFamily: body, fontWeight: 500, fontSize: compact ? 26 : 34, lineHeight: 1.25, color: theme.muted, marginTop: 4 }}>{item.sub}</div> : null}
      </div>
    </div>
  );
};

/** ③ Phủ đồ hoạ: bác sĩ toàn màn hình, tới đoạn số liệu thì thu lên nửa trên nhường chỗ bảng dữ liệu. */
export const PhuDoHoa = ({
  clip,
  segments,
  words,
  lengthMs,
  panels,
  keywords,
}: Common & { readonly panels: readonly Panel[]; readonly keywords: readonly string[] }) => {
  const theme = themes.navy;
  const { fps } = useVideoConfig();
  const ms = useMs();
  const zoom = useSentenceZoom(words, [1, 1.1]);
  const active = panels.find((p) => ms >= p.atMs - 400 && ms < p.untilMs);
  const split = panels.reduce((acc, p) => {
    const v = interpolate(ms, [p.atMs - 300, p.atMs + 150, p.untilMs - 350, p.untilMs], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.65, 0, 0.35, 1),
    });
    return Math.max(acc, v);
  }, 0);
  const videoH = 1920 - split * (1920 - 700);
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <div style={{ position: "absolute", top: 0, left: 0 }}>
        <Footage clip={clip} segments={segments} width={1080} height={videoH} zoom={zoom} targetY={videoH * 0.44} />
      </div>
      {active ? (
        <div
          style={{
            position: "absolute",
            top: 700,
            left: 0,
            right: 0,
            height: 1220,
            padding: "46px 64px",
            backgroundColor: theme.bg,
            transform: `translateY(${(1 - split) * 1220}px)`,
          }}
        >
          <PanelBody panel={active} theme={theme} />
          {active.source ? <SourceLine text={active.source} theme={theme} style={{ left: 64, right: 64, top: 1035 }} /> : null}
        </div>
      ) : null}
      <PunchCaption words={words} theme={theme} top={split > 0.5 ? 1620 : 1340} fontSize={split > 0.5 ? 54 : 74} maxWords={split > 0.5 ? 6 : 4} maxChars={split > 0.5 ? 30 : 22} keywords={keywords} />
      <Progress color={theme.accent} />
      <Music words={words} />
      {hooks(panels, fps)}
      <EndCard theme={theme} lengthMs={lengthMs} />
    </AbsoluteFill>
  );
};

/** ④ Bản ngang 16:9 cho YouTube: bảng dữ liệu bên trái, bác sĩ bên phải. */
export const BanNgang = ({
  clip,
  segments,
  words,
  lengthMs,
  title,
  panels,
}: Common & { readonly title: string; readonly panels: readonly Panel[] }) => {
  const theme = themes.blush;
  const { fps } = useVideoConfig();
  const ms = useMs();
  const active = panels.find((p) => ms >= p.atMs && ms < p.untilMs);
  const zoom = useSentenceZoom(words, [1, 1.08]);
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <div style={{ position: "absolute", left: 1200, top: 60, width: 660, height: 960, borderRadius: 36, overflow: "hidden" }}>
        <Footage clip={clip} segments={segments} width={660} height={960} zoom={zoom} targetY={380} />
      </div>
      <div style={{ position: "absolute", left: 70, top: 58, width: 1070, fontFamily: theme.display, fontWeight: 700, fontSize: 62, color: theme.ink }}>{title}</div>
      <div style={{ position: "absolute", left: 70, top: 160, width: 1070, height: 660 }}>
        {active ? <PanelBody panel={active} theme={theme} compact /> : null}
      </div>
      {active?.source ? <SourceLine text={active.source} theme={theme} style={{ left: 70, width: 1070, top: 992 }} /> : null}
      <div style={{ position: "absolute", left: 40, width: 1130, top: 840 }}>
        <PunchCaption words={words} theme={theme} top={0} fontSize={52} maxWords={7} maxChars={38} plain />
      </div>
      <Music words={words} />
      {hooks(panels, fps)}
      <EndCard theme={theme} lengthMs={lengthMs} />
    </AbsoluteFill>
  );
};
