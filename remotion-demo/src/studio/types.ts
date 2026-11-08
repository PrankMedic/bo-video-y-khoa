import type { Segment, Word } from '../formats/timeline';

/** words ở dòng thời gian gốc; hệ thống tự retime theo segments. */
export type BaseProps = {
  audio: string;
  words: readonly Word[];
  segments: readonly Segment[];
  aiVoice?: boolean;
  keywords?: readonly string[];
  notice?: string;
};
export type Anchor = { atPhrase: string; nth?: number };
export type Beat = Anchor & { label: string; source?: string };
export type KineticTypeProps = BaseProps & { phrases: readonly (Beat & { emphasis?: string })[] };
export type Focus = 'overview' | 'epidermis' | 'dermis' | 'follicle' | 'sebum';
export type MechanismItem = 'sebum' | 'bacteria' | 'inflammation' | 'uv' | 'active';
export type MechanismProps = BaseProps & { scenes: readonly (Beat & { focus: Focus; items: readonly MechanismItem[] })[] };
export type Chart = { kind: 'column' | 'line' | 'bar'; title: string; unit: string; values: readonly { label: string; value: number }[] };
export type ChartStoryProps = BaseProps & { scenes: readonly (Beat & { charts: readonly Chart[]; focusIndex?: number })[] };
export type VersusProps = BaseProps & { left: string; right: string; criteria: readonly (Beat & { leftText: string; rightText: string; leftScore?: number; rightScore?: number })[] };
export type MythFactProps = BaseProps & { rounds: readonly (Beat & { revealPhrase: string; revealNth?: number; verdict: 'ĐÚNG' | 'SAI' | 'CHƯA ĐỦ'; explanation: string })[];
  /** Thẻ phụ hiện lần lượt sau đáp án: neo theo lời nói (atPhrase) hoặc theo số ms sau đáp án. */
  cards?: readonly { text: string; atPhrase?: string; nth?: number; afterRevealMs?: number }[] };
export type ChatQAProps = BaseProps & { messages: readonly (Beat & { role: 'question' | 'answer' })[] };
export type JourneyProps = BaseProps & { milestones: readonly (Beat & { week: string; note: string })[] };
export type NewsDeskProps = BaseProps & { stories: readonly (Beat & { headline: string; studyType: string; sampleSize: string; pmid?: string })[] };
export type PodcastWaveProps = BaseProps & { chapters: readonly (Beat & { quote: string })[] };
export type CarouselSlideProps = { page: number; pages: number; title: string; content: readonly string[]; source: string; aiVoice?: boolean };
