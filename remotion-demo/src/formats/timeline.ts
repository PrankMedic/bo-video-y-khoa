export type Word = {
  readonly text: string;
  readonly startMs: number;
  readonly endMs: number;
};

/** Một đoạn giữ lại của clip gốc, tính bằng mili-giây. */
export type Segment = {
  readonly fromMs: number;
  readonly toMs: number;
  /** Ghi đè vùng có hình khi clip đổi khung giữa chừng */
  readonly contentTop?: number;
  readonly contentHeight?: number;
};

export const norm = (s: string) =>
  s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%]/gu, "");

const findPhrase = (words: readonly Word[], phrase: string, nth: number) => {
  const target = phrase.split(/\s+/).map(norm).filter(Boolean);
  let seen = 0;
  for (let i = 0; i + target.length <= words.length; i++) {
    if (target.every((t, k) => norm(words[i + k].text) === t)) {
      if (seen === nth) return { first: words[i], last: words[i + target.length - 1] };
      seen++;
    }
  }
  throw new Error(`Không thấy cụm "${phrase}" (lần ${nth + 1}) trong lời thoại`);
};

/** Mốc bắt đầu của một cụm từ. Neo theo lời nói nên đổi cắt không làm lệch đồ hoạ. */
export const saidAt = (words: readonly Word[], phrase: string, nth = 0) =>
  findPhrase(words, phrase, nth).first.startMs;

export const saidEnd = (words: readonly Word[], phrase: string, nth = 0) =>
  findPhrase(words, phrase, nth).last.endMs;

/** Dồn các đoạn giữ lại thành dòng thời gian mới, từ nằm ngoài đoạn bị bỏ. */
export const retime = (words: readonly Word[], segments: readonly Segment[]) => {
  const out: Word[] = [];
  let offset = 0;
  for (const s of segments) {
    for (const w of words) {
      if (w.startMs >= s.fromMs && w.startMs < s.toMs) {
        out.push({
          text: w.text,
          startMs: w.startMs - s.fromMs + offset,
          endMs: Math.min(w.endMs, s.toMs) - s.fromMs + offset,
        });
      }
    }
    offset += s.toMs - s.fromMs;
  }
  return out;
};

export const totalMs = (segments: readonly Segment[]) =>
  segments.reduce((a, s) => a + s.toMs - s.fromMs, 0);

export const framesOf = (segments: readonly Segment[], fps = 30) =>
  Math.ceil((totalMs(segments) / 1000) * fps);

/** Ngắt phụ đề thành từng cụm ngắn, ưu tiên dấu câu và chỗ ngắt hơi. */
export const toPages = (words: readonly Word[], maxWords: number, maxChars: number) => {
  const pages: Word[][] = [[]];
  words.forEach((w, i) => {
    const page = pages[pages.length - 1];
    const chars = page.reduce((a, p) => a + p.text.length + 1, 0);
    const prev = page[page.length - 1];
    if (page.length && (page.length >= maxWords || chars + w.text.length > maxChars || w.startMs - prev.endMs > 450)) {
      pages.push([w]);
    } else {
      page.push(w);
    }
    if (/[.?!:]$/.test(w.text) && i < words.length - 1) pages.push([]);
  });
  return pages.filter((p) => p.length > 0);
};

/** Mức zoom theo câu: đổi mức ở đầu mỗi câu để tạo nhịp mà không cần cắt hình. */
export const sentenceStarts = (words: readonly Word[]) => {
  const out = words.length ? [words[0].startMs] : [];
  words.forEach((w, i) => {
    if (/[.?!]$/.test(w.text) && words[i + 1]) out.push(words[i + 1].startMs);
  });
  return out;
};
