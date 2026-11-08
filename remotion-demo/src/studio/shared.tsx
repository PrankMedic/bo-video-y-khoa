import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { PunchCaption, Progress, SourceLine } from '../formats/parts';
import { body, type Theme } from '../formats/theme';
import { retime, saidAt, totalMs } from '../formats/timeline';
import { DuckedMusic } from '../talking-slides/DuckedMusic';
import { SFX } from '../talking-slides/Header';
import type { Anchor, BaseProps, Beat } from './types';

export const palette = (bg: string, accent: string): Theme => ({ bg, accent, ink: '#20212A', muted: '#444550', surface: '#FFFFFF', accent2: accent, onAccent: '#FFFFFF', display: body, text: body });
export const themes = {
  kinetic: palette('#FFF3C9', '#713E00'), mechanism: palette('#E4F5EE', '#005B48'),
  chart: palette('#EAF1FF', '#244EA0'), versus: palette('#FCEFE5', '#953F17'),
  myth: palette('#F5EAFE', '#70358E'), chat: palette('#E5F8FA', '#006371'),
  journey: palette('#F0F3DB', '#4B5B11'), news: palette('#FFE9EE', '#9F2341'),
  podcast: palette('#EEEAFB', '#514080'),
};
export const titleStyle: CSSProperties = { fontSize: 76, lineHeight: 1.16, fontWeight: 800, margin: '0 0 32px', overflowWrap: 'anywhere' };
export const smallStyle: CSSProperties = { fontSize: 44, lineHeight: 1.3, overflowWrap: 'anywhere' };
export const panel: CSSProperties = { padding: 32, borderRadius: 28, background: '#FFFFFF', overflowWrap: 'anywhere' };
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const asset = (path: string) => /^https?:\/\//.test(path) ? path : staticFile(path);

export const useStudio = <T extends Anchor>(props: BaseProps, beats: readonly T[]) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = frame / fps * 1000;
  const words = retime(props.words, props.segments);
  const length = totalMs(props.segments);
  if (!beats.length || !words.length) throw new Error('Cần ít nhất một cảnh và một từ trong đoạn giữ lại.');
  const starts = beats.map(b => saidAt(words, b.atPhrase, b.nth));
  if (starts.some((v, i) => i > 0 && v <= starts[i - 1])) throw new Error('Mốc cảnh phải tăng dần.');
  // Đổi góc nhìn trước 6 giây, chọn mốc từ thực tế và vẫn qua saidAt.
  const cuts = [0, ...starts.slice(1).filter(s => s > 0)];
  for (let i = 0; i < cuts.length; i++) {
    const end = cuts[i + 1] ?? length;
    if (end - cuts[i] > 6000) {
      const candidates = words.filter(w => w.startMs > cuts[i] && w.startMs <= cuts[i] + 5500);
      const w = candidates[candidates.length - 1];
      if (!w) throw new Error('Khoảng im lặng quá 6 giây: cần thêm mốc lời nói hoặc cắt đoạn.');
      // Đếm lần xuất hiện theo cùng phép chuẩn hoá của saidAt.
      const occurrence = words.filter(x => x.startMs < w.startMs && x.text.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}%]/gu, '') === w.text.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}%]/gu, '')).length;
      cuts.splice(i + 1, 0, saidAt(words, w.text, occurrence));
    }
  }
  const index = Math.max(0, starts.reduce((a, s, i) => s <= ms ? i : a, 0));
  const cutIndex = Math.max(0, cuts.reduce((a, s, i) => s <= ms ? i : a, 0));
  const since = ms - starts[index];
  return { frame, fps, ms, words, length, starts, cuts, cutIndex, index, beat: beats[index], since, p: clamp(since / 650) };
};
export type StudioState = ReturnType<typeof useStudio<Beat>>;

export const Shell = ({ props, state, theme, label, source, children, captions = true }: { props: BaseProps; state: StudioState; theme: Theme; label: string; source?: string; children: ReactNode; captions?: boolean }) => {
  let cursor = 0;
  return <AbsoluteFill style={{ background: theme.bg, color: theme.ink, fontFamily: body, overflow: 'hidden' }}>
    {label && <div style={{ position: 'absolute', left: 64, top: 36, width: 880, fontSize: 32, color: theme.accent, fontWeight: 700 }}>{label}</div>}
    <div style={{ position: 'absolute', left: 0, top: 100, width: 1080, height: 1200, overflow: 'hidden' }}>{children}</div>
    {props.aiVoice && <div style={{ position: 'absolute', left: 64, top: 1550, fontSize: 28 }}>Giọng đọc AI</div>}
    {props.notice && <div style={{ position: 'absolute', left: 64, top: 1590, width: 880, fontSize: 44, lineHeight: 1.2 }}>{props.notice}</div>}
    {source && <SourceLine text={source} theme={theme} style={{ left: 64, top: 1310, width: 880, maxHeight: 110, fontSize: 32, overflow: 'hidden' }} />}
    {captions && <PunchCaption words={state.words} theme={theme} top={1440} fontSize={64} maxWords={3} maxChars={16} plain keywords={props.keywords} style={{ left: 64, right: 'auto', width: 880 }} />}
    <Progress color={theme.accent} />
    {props.segments.map((s, i) => {
      const from = Math.round(cursor / 1000 * state.fps);
      cursor += s.toMs - s.fromMs;
      return <Sequence key={i} from={from} durationInFrames={Math.round(cursor / 1000 * state.fps) - from} layout="none"><Audio src={asset(props.audio)} trimBefore={Math.round(s.fromMs / 1000 * state.fps)} trimAfter={Math.round(s.toMs / 1000 * state.fps)} /></Sequence>;
    })}
    <DuckedMusic src={staticFile('music/bg-pad.wav')} words={state.words} speechVolume={0.10} gapVolume={0.22} fadeOutSeconds={1} />
    {state.cuts.slice(1).map((at, i) => <Sequence key={i} from={Math.round(at / 1000 * state.fps)} durationInFrames={18} layout="none"><Audio src={SFX.switch} volume={0.09} /></Sequence>)}
  </AbsoluteFill>;
};
