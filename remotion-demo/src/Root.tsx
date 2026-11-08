import { Composition, Folder } from 'remotion';
import { MauVideo, MAU_VIDEO_FRAMES } from './talking-slides/MauVideo';
import { MauFlow, MAU_FLOW_FRAMES } from './flow/MauFlow';
import { FormatCompositions } from './formats/Compositions';
import { StudioCompositions } from './studio/Compositions';
const vertical = { fps: 30, width: 1080, height: 1920 };
export const RemotionRoot = () => <>
  <Folder name="1-Bac-si-noi-kem-slide"><Composition id="MauVideo" component={MauVideo} durationInFrames={MAU_VIDEO_FRAMES} {...vertical} /></Folder>
  <Folder name="2-Anh-minh-hoa"><Composition id="MauFlow" component={MauFlow} durationInFrames={MAU_FLOW_FRAMES} {...vertical} /></Folder>
  <Folder name="3-Dinh-dang"><FormatCompositions /></Folder>
  <Folder name="4-Studio"><StudioCompositions /></Folder>
</>;
