import { loadFont as loadBody } from "@remotion/google-fonts/BeVietnamPro";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadHand } from "@remotion/google-fonts/PatrickHand";

export const body = loadBody("normal", {
  weights: ["400", "500", "700", "800"],
  subsets: ["vietnamese", "latin"],
}).fontFamily;
export const serif = loadSerif("normal", {
  weights: ["400", "500", "700"],
  subsets: ["vietnamese", "latin"],
}).fontFamily;
export const hand = loadHand("normal", {
  weights: ["400"],
  subsets: ["vietnamese", "latin"],
}).fontFamily;

export type Theme = {
  readonly bg: string;
  readonly surface: string;
  readonly ink: string;
  readonly muted: string;
  readonly accent: string;
  readonly accent2: string;
  readonly onAccent: string;
  readonly display: string;
  readonly text: string;
};

// Mỗi định dạng một bảng màu riêng; font Be Vietnam Pro vẫn là nền chung của thương hiệu.
export const themes = {
  /** Xanh rêu: bác sĩ toàn màn hình */
  sage: { bg: "#EEF1EA", surface: "#FFFFFF", ink: "#17261F", muted: "#6B7A70", accent: "#1F6F54", accent2: "#E8B44C", onAccent: "#FFFFFF", display: body, text: body },
  /** Đen ấm + vàng: tạp chí */
  noir: { bg: "#14110F", surface: "#201C19", ink: "#F4EEE4", muted: "#A79C8E", accent: "#D9B779", accent2: "#F4EEE4", onAccent: "#14110F", display: serif, text: serif },
  /** Xanh dương đậm: bằng chứng, số liệu */
  navy: { bg: "#0F2238", surface: "#17304D", ink: "#F3F7FB", muted: "#9DB2C7", accent: "#57C5C9", accent2: "#FFB25C", onAccent: "#0F2238", display: body, text: body },
  /** Hồng đất: bản ngang */
  blush: { bg: "#F8EEE9", surface: "#FFFFFF", ink: "#33201C", muted: "#8E756E", accent: "#B4533F", accent2: "#3F6C74", onAccent: "#FFFFFF", display: serif, text: body },
  /** Giấy cũ: sổ tay vẽ tay */
  paper: { bg: "#F4ECD8", surface: "#FBF6E9", ink: "#2C2A26", muted: "#7A7263", accent: "#C2502E", accent2: "#2F6B7C", onAccent: "#FFFFFF", display: hand, text: hand },
  /** Tím than: hội thoại hai giọng */
  plum: { bg: "#1C1730", surface: "#2A2345", ink: "#F5F1FB", muted: "#A79FC2", accent: "#F2A65A", accent2: "#6FD3C1", onAccent: "#1C1730", display: body, text: body },
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof themes;
