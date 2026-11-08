import words from '../flow/data/mau.words.json';
import { clips } from './Footage';
import { framesOf, saidAt } from './timeline';
import type { Beat, Panel } from './Formats';
import type { Scene } from './Animation';

export { words };
export const at = (phrase: string) => saidAt(words, phrase);
export const lengthMs = Math.max(...words.map(w => w.endMs));
export const segments = [{ fromMs: 0, toMs: lengthMs }];
export const sampleFrames = Math.ceil((lengthMs / 1000 + 0.8) * 30);
export const source = 'Nguồn: thay bằng PMID đã kiểm chứng';
const common = { words, segments, lengthMs, frames: framesOf(segments), clip: clips.mau };
const beats: readonly Beat[] = [
  { icon: 'bang-hoi', title: 'Bộ công cụ video', sub: 'Thay nội dung bằng lời của bạn', atMs: at('Xin chào'), untilMs: at('mỗi ý') },
  { icon: 'bang-hoi', title: 'Mỗi ý theo lời nói', sub: 'Neo mốc bằng cụm từ', atMs: at('mỗi ý'), untilMs: at('khi có số liệu') },
  { icon: 'ti-le', title: 'Số liệu minh hoạ', sub: 'Thay dữ liệu và kiểm tra nguồn', atMs: at('khi có số liệu'), untilMs: at('hãy thay giọng'), source },
  { icon: 'bang-hoi', title: 'Dùng giọng của bạn', sub: 'Bắt đầu video đầu tiên', atMs: at('hãy thay giọng'), untilMs: lengthMs },
];
export const thangMat = { ...common, hook: 'Tạo video đầu tiên', keywords: ['mẫu', 'nguồn'], beats };
export const tapChi = { ...common, issue: 'Hướng dẫn sử dụng', beats };
const panels: readonly Panel[] = [
  { kind: 'list', atMs: at('Xin chào'), untilMs: at('khi có số liệu'), kicker: 'Mỗi ý theo lời nói', items: [
    { icon: 'bang-hoi', title: 'Thay kịch bản', atMs: at('Xin chào') },
    { icon: 'bang-hoi', title: 'Neo vào lời đọc', atMs: at('mỗi ý') },
  ] },
  { kind: 'study', atMs: at('khi có số liệu'), untilMs: at('hãy thay giọng'), kicker: 'Số liệu minh hoạ', chips: ['Dữ liệu giả'], title: 'Hai nhóm minh hoạ', population: 'Chỉ để thử bố cục', bars: [{ label: 'Mẫu A', value: 40, highlight: true }, { label: 'Mẫu B', value: 60 }], barsAtMs: at('khi có số liệu'), note: 'Số liệu minh hoạ', source },
  { kind: 'list', atMs: at('hãy thay giọng'), untilMs: lengthMs, kicker: 'Bắt đầu sử dụng', items: [{ icon: 'bang-hoi', title: 'Thay giọng mẫu', atMs: at('hãy thay giọng') }] },
];
export const phuDoHoa = { ...common, panels, keywords: ['nguồn'] };
export const banNgang = { ...common, panels, title: 'Bộ công cụ video' };
const scenes: readonly Scene[] = [
  { kind: 'hero', atMs: at('Xin chào'), icon: 'bang-hoi', title: 'Video đầu tiên của bạn', sub: 'Thay giọng, chữ và hình minh hoạ' },
  { kind: 'steps', atMs: at('mỗi ý'), title: 'Mỗi ý theo lời nói', items: [{ icon: 'bang-hoi', title: 'Chọn cụm từ', atMs: at('mỗi ý') }, { icon: 'bang-hoi', title: 'Neo chuyển cảnh', atMs: at('bám theo lời nói') }] },
  { kind: 'hero', atMs: at('khi có số liệu'), icon: 'ti-le', title: 'Số liệu minh hoạ', bars: [{ label: 'Mẫu A', value: 40 }, { label: 'Mẫu B', value: 60 }], source },
  { kind: 'hero', atMs: at('hãy thay giọng'), icon: 'bang-hoi', title: 'Thay bằng giọng của bạn' },
];
export const hoatHinh = { ...common, audio: 'flow/mau/voice.mp3', themeName: 'navy' as const, scenes, disclosure: 'Giọng đọc mẫu' };
export const soTay = { ...hoatHinh, themeName: 'paper' as const, sketch: true };
