import { AbsoluteFill } from "remotion";
import { icons, iconNames, type IconGroup, type IconName } from "./data";
import { LineIcon } from "./LineIcon";
import { body, themes } from "../theme";
import { BRAND } from "../../brand";

const groups: IconGroup[] = ["Da", "Hoạt chất", "Sản phẩm", "Quy trình", "Bằng chứng", "Cảnh báo", "Tư vấn"];
const t = themes.sage;

export const IconCatalog = () => (
  <AbsoluteFill style={{ backgroundColor: t.bg, padding: 70, fontFamily: body, color: t.ink }}>
    <div style={{ fontSize: 64, fontWeight: 800 }}>Thư viện icon {BRAND.name} · {iconNames.length} icon</div>
    {groups.map((g) => (
      <div key={g} style={{ marginTop: 26 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: t.accent }}>{g}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {iconNames
            .filter((n: IconName) => icons[n].group === g)
            .map((n) => (
              <div key={n} style={{ width: 164, textAlign: "center", fontSize: 19, lineHeight: 1.15 }}>
                <div style={{ display: "grid", placeItems: "center", height: 104 }}>
                  <LineIcon name={n} size={88} color={t.ink} accent={t.accent} />
                </div>
                {icons[n].label}
              </div>
            ))}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
