import { Audio } from '@remotion/media';
import { AbsoluteFill, staticFile } from 'remotion';
import { at, sampleFrames, source, words } from '../formats/demos';
import { DuckedMusic } from '../talking-slides/DuckedMusic';
import { FlowCaptions, FlowImage, Headline, IllustrationNote, ProgressBar, SlideLayer, StepsSlide, wash } from './FlowKit';
export const MAU_FLOW_FRAMES = sampleFrames;
const sec = (phrase: string) => at(phrase) / 1000;
const end = sampleFrames / 30;
const images = [
  { file: 's01.jpg', from: sec('Xin chào'), to: sec('mỗi ý') },
  { file: 's02.jpg', from: sec('mỗi ý'), to: sec('hãy thay giọng') },
  { file: 's03.jpg', from: sec('hãy thay giọng'), to: end },
];
export const MauFlow = () => <AbsoluteFill style={{ backgroundColor: wash.paper }}>
  {images.map(image => <FlowImage key={image.file} src={staticFile(`flow/mau/${image.file}`)} from={image.from} to={image.to} />)}
  <Headline text="Bộ công cụ video của bạn" from={sec('Xin chào')} to={sec('mỗi ý')} />
  <SlideLayer from={sec('mỗi ý')} to={sec('hãy thay giọng')}>
    <StepsSlide kicker="Mỗi ý theo lời nói" at={sec('mỗi ý')} source={source} items={[
      { title: 'Chọn ý', sub: 'Chữ ngắn, dễ đọc', at: sec('mỗi ý') },
      { title: 'Neo lời', sub: 'Dùng cụm từ trong lời đọc', at: sec('bám theo lời nói') },
      { title: 'Gắn nguồn', sub: 'Kiểm tra dữ liệu', at: sec('dòng nguồn') },
    ]} />
  </SlideLayer>
  <Headline text="Thay bằng giọng của bạn" from={sec('hãy thay giọng')} to={end} />
  <FlowCaptions words={words} /><IllustrationNote /><ProgressBar />
  <Audio src={staticFile('flow/mau/voice.mp3')} />
  <DuckedMusic src={staticFile('music/bg-pad.wav')} words={words} speechVolume={0.22} gapVolume={0.4} fadeOutSeconds={2} />
</AbsoluteFill>;
