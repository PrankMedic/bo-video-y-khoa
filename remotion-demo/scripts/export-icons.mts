// Xuất thư viện icon ra SVG rời. Chạy từ remotion-demo: node scripts/export-icons.mts
import { mkdirSync, writeFileSync } from "node:fs";
import { optimize } from "svgo";
// @ts-expect-error Node cần đuôi .ts khi chạy trực tiếp
import { icons, iconNames } from "../src/formats/icons/data.ts";

const out = "public/icons/bo";
mkdirSync(out, { recursive: true });
for (const name of iconNames) {
  const icon = icons[name];
  const paths = icon.paths.map((d) => `<path d="${d}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  writeFileSync(`${out}/${name}.svg`, optimize(svg, { multipass: true }).data);
}
console.log(`${iconNames.length} icon → ${out}`);
