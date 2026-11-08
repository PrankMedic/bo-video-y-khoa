import { useCurrentFrame, useVideoConfig } from "remotion";
import { circle, colors, fontFamily } from "./theme";

export type Word = {
  readonly text: string;
  readonly startMs: number;
  readonly endMs: number;
  readonly pageBreakAfter?: boolean;
};

const toPages = (words: readonly Word[]) => {
  const pages: Word[][] = [[]];
  for (const w of words) {
    pages[pages.length - 1].push(w);
    if (w.pageBreakAfter) pages.push([]);
  }
  return pages.filter((p) => p.length > 0);
};

const norm = (s: string) => s.trim().toLowerCase().replace(/[.,!?]/g, "");

/** One subtitle line at a time; the word being spoken turns red. */
export const KaraokeCaptions = ({
  words,
  introEndSeconds,
  keywords,
}: {
  readonly words: readonly Word[];
  readonly introEndSeconds: number;
  readonly keywords: readonly string[];
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const intro = frame < (introEndSeconds + 0.35) * fps;
  const keySet = new Set(keywords.map(norm));

  const pages = toPages(words);
  const page = [...pages].reverse().find((p) => p[0].startMs <= ms);
  if (!page || ms > page[page.length - 1].endMs + 1200) return null;

  const { cx, cy, r } = circle;
  const box: React.CSSProperties = intro
    ? {
        left: 80,
        right: 80,
        top: 1480,
        justifyContent: "center",
        textAlign: "center",
        fontSize: 72,
        color: "white",
        textShadow: "0 4px 18px rgba(0,0,0,0.65)",
      }
    : {
        left: cx + r + 56,
        right: 70,
        top: cy - 140,
        height: 280,
        alignContent: "center",
        fontSize: 58,
        color: colors.ink,
      };

  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexWrap: "wrap",
        fontFamily,
        fontWeight: 800,
        lineHeight: 1.25,
        ...box,
      }}
    >
      {page.map((w, i) => {
        const active = ms >= w.startMs && ms < w.endMs;
        const spoken = ms >= w.startMs;
        const key = keySet.has(norm(w.text));
        return (
          <span
            key={i}
            style={{
              whiteSpace: "pre",
              color:
                active || (spoken && key)
                  ? colors.red
                  : spoken || intro
                    ? undefined
                    : colors.muted,
              scale: active ? 1.08 : 1,
              display: "inline-block",
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
