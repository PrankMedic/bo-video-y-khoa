import { loadFont } from "@remotion/google-fonts/BeVietnamPro";

export const { fontFamily } = loadFont("normal", {
  weights: ["500", "700", "800"],
  subsets: ["vietnamese", "latin"],
});

export const colors = {
  paper: "#F3EEE7",
  ink: "#1D1B19",
  red: "#E2452B",
  muted: "#A39A90",
  card: "#FFFFFF",
};

// Talking-head circle, in composition pixels (1080x1920)
export const circle = { cx: 290, cy: 1500, r: 200 };
