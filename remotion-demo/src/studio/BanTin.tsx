import type { CSSProperties } from 'react';
import { AbsoluteFill } from 'remotion';
import { BRAND } from '../brand';
import { body } from '../formats/theme';
import { saidAt, toPages } from '../formats/timeline';
import { Shell, clamp, palette, useStudio } from './shared';
import type { Anchor, BaseProps } from './types';

export type NewsItem = Anchor & { text: string; value?: number; suffix?: string; control?: boolean };
export type NewsScene = Anchor & { kind: 'hook' | 'study' | 'twoArms' | 'change' | 'bars' | 'readClosely' | 'limits' | 'safety' | 'takeaway' | 'cta'; label: string; items: NewsItem[]; from?: number; to?: number };
export type BanTinProps = BaseProps & { episode: number; source: string; scenes: NewsScene[] };
const ink = '#143F39';
const brick = '#AA4935';
const theme = { ...palette('#F8F3E8', brick), ink, muted: '#53655C' };
const main: CSSProperties = { fontSize: 96, fontWeight: 800, lineHeight: 1.12, margin: 0, textWrap: 'balance' };
const numeral: CSSProperties = { fontSize: 240, fontWeight: 800, lineHeight: 1.08, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' };
const fmt = (n: number, digits = 0) => n.toFixed(digits).replace('.', ',');

/** Các ý thay nhau theo mốc lời đọc để giữ chữ lớn, tối đa bốn dòng nội dung. */
export const BanTinNghienCuu = (props: BanTinProps) => {
  const state = useStudio(props, props.scenes);
  const scene = props.scenes[state.index];
  const startOf = (a: Anchor) => saidAt(state.words, a.atPhrase, a.nth);
  const itemIndex = Math.max(0, scene.items.reduce((last, item, i) => startOf(item) <= state.ms ? i : last, 0));
  const item = scene.items[itemIndex];
  // Hiện ý đầu ngay khi vào cảnh, kể cả khi mốc lời đọc của ý đó đến sau.
  const itemStart = itemIndex === 0 ? state.starts[state.index] : item ? startOf(item) : state.ms;
  const enter = clamp((state.ms - itemStart) / 350);
  const p = clamp(state.since / 350);
  const dark = scene.kind === 'readClosely';
  const darkMix = dark ? p : props.scenes[state.index - 1]?.kind === 'readClosely' ? 1 - p : 0;
  const color = dark ? '#FFF8E9' : ink;
  const accent = item?.control ? brick : dark ? '#FFE0AF' : ink;
  const numberProgress = clamp((state.ms - itemStart) / 900);
  const number = item?.value === undefined ? null : `${fmt(item.value * numberProgress, Number.isInteger(item.value) ? 0 : 1)}${item.suffix ?? ''}`;
  const changeProgress = clamp((state.since - 350) / 1600);
  const pages = toPages(state.words, 3, 18);
  const caption = [...pages].reverse().find(page => page[0].startMs <= state.ms);
  const showCaption = caption && state.ms <= caption[caption.length - 1].endMs + 500;
  const repeatedTitle = item?.text === scene.label;
  // Hiện trọn ý để không tách câu an toàn hoặc bối cảnh thành trang thiếu nghĩa.
  // Hộp nội dung giữ nguyên trong vùng y 220–1300; phụ đề ở y 1320–1500.

  return <AbsoluteFill style={{ fontFamily: body }}>
    <Shell props={{ ...props, aiVoice: false }} state={state} theme={theme} label="" captions={false}><></></Shell>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 220, height: 1080, background: ink, opacity: darkMix }} />
    <div style={{ position: 'absolute', left: 54, right: 54, top: 130, color: ink, borderBottom: `5px solid ${brick}`, paddingBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 40, lineHeight: 1.2, fontWeight: 800 }}><span>{BRAND.newsTitle.toUpperCase()} · {BRAND.name}</span><span>TẬP {props.episode}</span></div>
    <div style={{ position: 'absolute', left: 64, right: 64, top: 220, height: 1080, display: 'flex', flexDirection: 'column', justifyContent: 'center', color, textAlign: 'center' }}>
      <div style={{ width: '100%', boxSizing: 'border-box', border: scene.kind === 'safety' || scene.kind === 'limits' ? `4px solid ${brick}` : undefined, borderRadius: 28, padding: scene.kind === 'safety' || scene.kind === 'limits' ? '36px 24px' : 0 }}>
        <h1 style={{ ...main, opacity: p, marginBottom: 40 }}>{scene.label}</h1>
        {scene.kind === 'change' ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <div style={numeral}>{fmt(scene.from ?? 0, 2)}</div>
          <svg width="100" height="130" viewBox="0 0 100 130" aria-hidden="true"><path d="M50 8V110M20 80L50 110L80 80" fill="none" stroke={brick} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - clamp(state.since / 900)} /></svg>
          <div style={{ ...numeral, color: brick }}>{fmt((scene.from ?? 0) + ((scene.to ?? 0) - (scene.from ?? 0)) * changeProgress, 2)}</div>
        </div> : item && <div key={`${state.index}-${itemIndex}`} style={{ opacity: enter, transform: `translateY(${(1 - enter) * 18}px)` }}>
          {number && <div style={{ ...numeral, color: accent, marginBottom: 20 }}>{number}</div>}
          {!repeatedTitle && <div style={{ fontSize: dark ? 72 : 64, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'pre-line', textWrap: 'balance', color: accent }}>{item.text}</div>}
          {scene.kind === 'bars' && <div style={{ height: 72, background: '#DCDDD1', borderRadius: 18, marginTop: 32, overflow: 'hidden', border: item.control ? `3px solid ${brick}` : undefined }}><div style={{ height: '100%', width: `${(item.value ?? 0) * numberProgress}%`, background: accent, borderRadius: 14 }} /></div>}
        </div>}
      </div>
    </div>
    {showCaption && <div style={{ position: 'absolute', left: 64, right: 64, top: 1320, height: 180, display: 'flex', alignContent: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 8px', fontSize: 76.8, lineHeight: 1.1, fontWeight: 800, color: ink }}>
      {caption.map((word, i) => {
        const active = state.ms >= word.startMs && state.ms < word.endMs;
        return <span key={i} style={{ alignSelf: 'center', padding: '0 4px', borderRadius: 8, background: active ? brick : 'transparent', color: active ? '#FFFFFF' : ink }}>{word.text}</span>;
      })}
    </div>}
    <div style={{ position: 'absolute', left: 54, right: 54, top: 1510, fontSize: 32, lineHeight: 1.35, color: ink }}>{props.source}</div>
    <div style={{ position: 'absolute', left: 64, top: 1630, fontSize: 32, color: ink }}>Giọng đọc AI</div>
  </AbsoluteFill>;
};
