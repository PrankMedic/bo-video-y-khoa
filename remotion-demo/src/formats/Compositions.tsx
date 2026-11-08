import { Composition, Still } from 'remotion';
import { Animation } from './Animation';
import { BanNgang, END_CARD_FRAMES, PhuDoHoa, TapChi, ThangMat } from './Formats';
import { banNgang, hoatHinh, phuDoHoa, soTay, tapChi, thangMat } from './demos';
import { IconCatalog } from './icons/IconCatalog';
const vertical = { fps: 30, width: 1080, height: 1920 };
export const FormatCompositions = () => <>
  <Composition id="ThangMat" component={() => <ThangMat {...thangMat} />} durationInFrames={thangMat.frames + END_CARD_FRAMES} {...vertical} />
  <Composition id="TapChi" component={() => <TapChi {...tapChi} />} durationInFrames={tapChi.frames + END_CARD_FRAMES} {...vertical} />
  <Composition id="PhuDoHoa" component={() => <PhuDoHoa {...phuDoHoa} />} durationInFrames={phuDoHoa.frames + END_CARD_FRAMES} {...vertical} />
  <Composition id="BanNgang" component={() => <BanNgang {...banNgang} />} durationInFrames={banNgang.frames + END_CARD_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="HoatHinh" component={() => <Animation {...hoatHinh} />} durationInFrames={hoatHinh.frames + END_CARD_FRAMES} {...vertical} />
  <Composition id="SoTay" component={() => <Animation {...soTay} />} durationInFrames={soTay.frames + END_CARD_FRAMES} {...vertical} />
  <Still id="IconCatalog" component={IconCatalog} width={1800} height={2400} />
</>;
