import { useMemo } from "react";
import rough from "roughjs";
import { icons, type IconDef, type IconName } from "./data";

/**
 * draw: 0→1 vẽ dần từng nét. sketch: nét chì tay bằng roughjs (seed cố định nên mọi khung hình giống nhau).
 */
export const LineIcon = ({
  name,
  size = 96,
  color = "currentColor",
  accent,
  strokeWidth = 3,
  draw = 1,
  sketch = false,
}: {
  readonly name: IconName;
  readonly size?: number;
  readonly color?: string;
  readonly accent?: string;
  readonly strokeWidth?: number;
  readonly draw?: number;
  readonly sketch?: boolean;
}) => {
  const icon: IconDef = icons[name];
  const roughPaths = useMemo(() => {
    if (!sketch) return null;
    const gen = rough.generator();
    return icon.paths.map((d, i) =>
      gen
        .toPaths(gen.path(d, { roughness: 1.1, bowing: 1.4, seed: 7 + i, disableMultiStroke: true }))
        .map((p) => p.d),
    );
  }, [icon, sketch]);

  const n = icon.paths.length;
  const stroke = (i: number) => (accent && icon.accent?.includes(i) ? accent : color);
  const pathDraw = (i: number) => Math.max(0, Math.min(1, draw * n - i));

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      style={{ display: "block", overflow: "visible" }}
    >
      {icon.paths.map((d, i) =>
        roughPaths ? (
          roughPaths[i].map((rd, j) => (
            <path
              key={`${i}-${j}`}
              d={rd}
              stroke={stroke(i)}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - pathDraw(i)}
            />
          ))
        ) : (
          <path
            key={i}
            d={d}
            stroke={stroke(i)}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - pathDraw(i)}
          />
        ),
      )}
    </svg>
  );
};
