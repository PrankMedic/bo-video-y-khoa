import { Audio } from "@remotion/media";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Word } from "./KaraokeCaptions";

// Gaps shorter than this between words count as continuous speech
const MERGE_GAP_MS = 450;
// How long the music takes to dip / come back around speech
const RAMP_MS = 300;

const speechIntervals = (words: readonly Word[]) => {
  const out: [number, number][] = [];
  for (const w of words) {
    const last = out[out.length - 1];
    if (last && w.startMs - last[1] < MERGE_GAP_MS) last[1] = Math.max(last[1], w.endMs);
    else out.push([w.startMs, w.endMs]);
  }
  return out;
};

/**
 * Looped background music that ducks under the speaker's voice.
 * Speech timing comes from the word captions, so no audio analysis is needed.
 */
export const DuckedMusic = ({
  src,
  words,
  speechVolume,
  gapVolume,
  fadeOutSeconds,
}: {
  readonly src: string;
  readonly words: readonly Word[];
  readonly speechVolume: number;
  readonly gapVolume: number;
  readonly fadeOutSeconds: number;
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const dist = Math.min(
    ...speechIntervals(words).map(([a, b]) => (ms < a ? a - ms : ms > b ? ms - b : 0)),
  );
  const speaking = Math.max(0, 1 - dist / RAMP_MS);
  const fadeIn = Math.min(1, frame / (0.5 * fps));
  const fadeOut = Math.min(1, (durationInFrames - frame) / (fadeOutSeconds * fps));

  return (
    <Audio
      name="Nhạc nền"
      src={src}
      loop
      volume={(gapVolume + (speechVolume - gapVolume) * speaking) * fadeIn * Math.max(0, fadeOut)}
    />
  );
};
