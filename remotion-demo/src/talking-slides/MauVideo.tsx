import { AbsoluteFill, staticFile } from 'remotion';
import { at, lengthMs, sampleFrames, source, words } from '../formats/demos';
import { DuckedMusic } from './DuckedMusic';
import { Header } from './Header';
import { KaraokeCaptions } from './KaraokeCaptions';
import { GridSlide, StatSlide, StudySlide } from './Slides';
import { SpeakerCircle } from './SpeakerCircle';
import { colors } from './theme';

// KaraokeCaptions ghép chữ liền nhau: thêm dấu cách đầu mỗi từ (phụ đề từ flow_captions.py không có).
const captionWords = words.map((w, i) => ({ ...w, text: (i ? ' ' : '') + w.text.trim() }));

export const MAU_VIDEO_FRAMES = sampleFrames;
const intro = at('đây là video mẫu') / 1000;
const frame = (phrase: string) => Math.round(at(phrase) / 1000 * 30);
const duration = (from: string, to: string) => frame(to) - frame(from);
export const MauVideo = () => <AbsoluteFill style={{ backgroundColor: colors.paper }}>
  <Header index="Mẫu" label="Bộ công cụ video" introEndSeconds={intro} />
  <StatSlide name="Số liệu mẫu" from={frame('đây là video mẫu')} durationInFrames={duration('đây là video mẫu', 'mỗi ý')} kicker="Số liệu minh hoạ" title="Thử bố cục số lớn" stat="40%" unit="Số liệu minh hoạ" statDelaySeconds={0} source={source} />
  <GridSlide name="Neo theo lời" from={frame('mỗi ý')} durationInFrames={duration('mỗi ý', 'khi có số liệu')} kicker="Mỗi ý theo lời nói" source={source} items={[
    { title: 'Chọn ý', sub: 'Viết nội dung ngắn', delaySeconds: 0 },
    { title: 'Neo lời', sub: 'Chọn cụm từ', delaySeconds: (at('bám theo lời nói') - at('mỗi ý')) / 1000 },
  ]} />
  <StudySlide name="Dữ liệu giả" from={frame('khi có số liệu')} durationInFrames={duration('khi có số liệu', 'hãy thay giọng')} kicker="Số liệu minh hoạ" chips={['Dữ liệu giả']} title="Hai nhóm minh hoạ" population="Chỉ dùng để thử bố cục" metric="Số liệu minh hoạ" bars={[{ label: 'Mẫu A', value: 40, highlight: true }, { label: 'Mẫu B', value: 60, highlight: false }]} barsDelaySeconds={0} note="Thay bằng dữ liệu đã kiểm chứng" noteDelaySeconds={(at('dòng nguồn') - at('khi có số liệu')) / 1000} warning="Số liệu minh hoạ" warningDelaySeconds={0} source={source} />
  <GridSlide name="Bắt đầu sử dụng" from={frame('hãy thay giọng')} durationInFrames={Math.ceil((lengthMs + 800 - at('hãy thay giọng')) / 1000 * 30)} kicker="Video đầu tiên của bạn" source={source} items={[{ title: 'Giọng bạn', sub: 'Thay bản đọc mẫu', delaySeconds: 0 }, { title: 'Bắt đầu', sub: 'Kiểm tra trước khi xuất', delaySeconds: (at('rồi bắt đầu') - at('hãy thay giọng')) / 1000 }]} />
  <SpeakerCircle src={staticFile('mau-nguoi-noi.mp4')} introEndSeconds={intro} faceX={540} faceY={760} zoomSourcePx={660} />
  <KaraokeCaptions words={captionWords} introEndSeconds={intro} keywords={['mẫu', 'nguồn']} />
  <DuckedMusic src={staticFile('music/bg-pad.wav')} words={words} speechVolume={0.22} gapVolume={0.4} fadeOutSeconds={2} />
</AbsoluteFill>;
