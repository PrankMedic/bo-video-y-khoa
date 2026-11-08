import originalWords from '../../flow/data/mau.words.json';
import type { BaseProps, ChartStoryProps, ChatQAProps, JourneyProps, KineticTypeProps, MechanismProps, MythFactProps, NewsDeskProps, PodcastWaveProps, VersusProps, CarouselSlideProps } from '../types';

/** Dữ liệu giả chỉ để thử giao diện. Không phải kịch bản hay bằng chứng y khoa.
 * File giọng và phụ đề chỉ dùng làm tín hiệu đồng bộ theo brief.
 * Không sử dụng các mẫu này để đăng nội dung y khoa.
 */
export const base: BaseProps = {
  audio: 'flow/mau/voice.mp3', words: originalWords,
  segments: [{ fromMs: 0, toMs: Math.max(...originalWords.map(w => w.endMs)) }],
  notice: 'Dữ liệu minh hoạ · giọng đọc mẫu',
  keywords: ['mẫu', 'nguồn'],
};
const source = 'Nguồn: thay bằng PMID đã kiểm chứng';
const anchors = ['Xin chào', 'mỗi ý', 'khi có số liệu'];
export const kinetic: KineticTypeProps = { ...base, phrases: anchors.map((atPhrase, i) => ({ atPhrase, label: ['Một ý mỗi nhịp', 'Chữ đổi theo lời', 'Gọn và dễ đọc'][i], emphasis: ['Lắng nghe', 'Chuyển nhịp', 'Ghi nhớ'][i], source })) };
export const mechanism: MechanismProps = { ...base, scenes: [
  { atPhrase: anchors[0], focus: 'overview', items: ['uv'], label: 'Sơ đồ minh hoạ', source },
  { atPhrase: anchors[1], focus: 'follicle', items: ['sebum', 'bacteria', 'inflammation'], label: 'Đổi góc nhìn minh hoạ', source },
  { atPhrase: anchors[2], focus: 'sebum', items: ['active'], label: 'Chuyển động minh hoạ', source },
] };
export const chart: ChartStoryProps = { ...base, scenes: anchors.map((atPhrase, i) => ({ atPhrase, label: 'Số liệu minh hoạ', source, focusIndex: i % 2, charts: [{ kind: (['column', 'line', 'bar'] as const)[i], title: 'Số liệu minh hoạ', unit: ' điểm', values: [{ label: 'A', value: 24 }, { label: 'B', value: 48 }] }] })) };
export const versus: VersusProps = { ...base, left: 'Đối tượng A', right: 'Đối tượng B', criteria: anchors.map((atPhrase, i) => ({ atPhrase, label: 'Số liệu minh hoạ', leftText: 'Mô tả minh hoạ A', rightText: 'Mô tả minh hoạ B', leftScore: 40 + i * 10, rightScore: 60 - i * 10, source })) };
export const myth: MythFactProps = { ...base, rounds: [{ atPhrase: anchors[0], label: 'Đây là lời đồn minh hoạ?', revealPhrase: anchors[1], verdict: 'CHƯA ĐỦ', explanation: 'Đây chỉ là dữ liệu thử giao diện. Cần thay bằng nội dung đã kiểm chứng.', source }] };
export const chat: ChatQAProps = { ...base, messages: anchors.map((atPhrase, i) => ({ atPhrase, role: i === 0 ? 'question' : 'answer', label: ['Định dạng này hoạt động ra sao?', 'Tin nhắn bám theo lời nói.', 'Nội dung được cuộn dần.'][i], source })) };
export const journey: JourneyProps = { ...base, milestones: anchors.map((atPhrase, i) => ({ atPhrase, week: `Bước minh hoạ ${i + 1}`, label: 'Các mốc minh hoạ', note: ['Bắt đầu theo dõi', 'Ghi nhận thay đổi', 'Đánh giá tiếp theo'][i], source })) };
export const news: NewsDeskProps = { ...base, stories: anchors.map(atPhrase => ({ atPhrase, label: 'Thẻ nghiên cứu mẫu', headline: 'Dữ liệu giả chỉ để thử', studyType: 'Chưa cung cấp', sampleSize: 'Chưa cung cấp', source })) };
export const podcast: PodcastWaveProps = { ...base, chapters: anchors.map((atPhrase, i) => ({ atPhrase, label: ['Mở đầu', 'Giải thích', 'Ghi nhớ'][i], quote: ['Một câu trích minh hoạ.', 'Sóng âm lấy từ giọng thật.', 'Mỗi chương theo một ý.'][i], source })) };
export const carousel: CarouselSlideProps = { page: 1, pages: 3, title: 'Một ý trên mỗi trang', content: ['Dữ liệu giả, chỉ để thử.', 'Thay nội dung và nguồn trước khi dùng.', 'Bố cục dành cho bài nhiều ảnh.'], source };
