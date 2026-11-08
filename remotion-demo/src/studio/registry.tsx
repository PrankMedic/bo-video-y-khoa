import { Composition } from 'remotion';
import { framesOf } from '../formats/timeline';
import * as Formats from './Formats';
import type * as Props from './types';

type FormatProps = {
  KineticType: Props.KineticTypeProps; Mechanism: Props.MechanismProps;
  ChartStory: Props.ChartStoryProps; Versus: Props.VersusProps;
  MythFact: Props.MythFactProps; ChatQA: Props.ChatQAProps;
  Journey: Props.JourneyProps; NewsDesk: Props.NewsDeskProps; PodcastWave: Props.PodcastWaveProps;
};
export type StudioEntry = { [K in keyof FormatProps]: { id: string; format: K; props: FormatProps[K] } }[keyof FormatProps];

// Remotion dùng Webpack. Chỉ đọc module dữ liệu trong studio/data, không đọc file ngoài.
declare const require: { context: (path: string, recursive: boolean, pattern: RegExp) => { keys: () => string[]; (key: string): { default?: StudioEntry | readonly StudioEntry[] } } };
const context = require.context('./data', false, /\.ts$/);
const entries = context.keys().sort().flatMap(key => {
  const value = context(key).default;
  // File dữ liệu Bản tin nghiên cứu có composition riêng, không có id nên bỏ qua ở đây
  return value ? (Array.isArray(value) ? value : [value]).filter((item: { id?: string }) => item.id) : [];
}) as StudioEntry[];
const ids = new Set<string>();
for (const entry of entries) {
  if (!/^[a-zA-Z0-9-]+$/.test(entry.id) || entry.id.startsWith('Mau') || ids.has(entry.id)) throw new Error(`ID studio không hợp lệ hoặc trùng: ${entry.id}`);
  ids.add(entry.id);
}
const Entry = ({ entry }: { entry: StudioEntry }) => {
  const common = { id: entry.id, width: 1080, height: 1920, fps: 30, durationInFrames: framesOf(entry.props.segments) };
  switch (entry.format) {
    case 'KineticType': return <Composition {...common} component={Formats.KineticType} defaultProps={entry.props} />;
    case 'Mechanism': return <Composition {...common} component={Formats.Mechanism} defaultProps={entry.props} />;
    case 'ChartStory': return <Composition {...common} component={Formats.ChartStory} defaultProps={entry.props} />;
    case 'Versus': return <Composition {...common} component={Formats.Versus} defaultProps={entry.props} />;
    case 'MythFact': return <Composition {...common} component={Formats.MythFact} defaultProps={entry.props} />;
    case 'ChatQA': return <Composition {...common} component={Formats.ChatQA} defaultProps={entry.props} />;
    case 'Journey': return <Composition {...common} component={Formats.Journey} defaultProps={entry.props} />;
    case 'NewsDesk': return <Composition {...common} component={Formats.NewsDesk} defaultProps={entry.props} />;
    case 'PodcastWave': return <Composition {...common} component={Formats.PodcastWave} defaultProps={entry.props} />;
  }
};
export const DataCompositions = () => <>{entries.map(entry => <Entry key={entry.id} entry={entry} />)}</>;
