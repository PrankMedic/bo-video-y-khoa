// Thư viện icon riêng: lưới 64×64, chỉ dùng nét để có thể vẽ dần trong video.
// `accent` là chỉ số các nét tô màu nhấn.

export type IconGroup = "Da" | "Hoạt chất" | "Sản phẩm" | "Quy trình" | "Bằng chứng" | "Cảnh báo" | "Tư vấn";

export type IconDef = {
  readonly label: string;
  readonly group: IconGroup;
  readonly paths: readonly string[];
  readonly accent?: readonly number[];
};

export const icons = {
  // Da
  "da-ba-lop": { label: "Ba lớp da", group: "Da", paths: ["M8 20c8-5 12 5 24 0s16-5 24 0", "M8 34h48", "M8 48h48", "M8 20v30M56 20v30", "M20 34c0 5 4 5 4 14M40 34c0 5-4 5-4 14"], accent: [0] },
  "hang-rao-da": { label: "Hàng rào da", group: "Da", paths: ["M8 30h14v-10H8zM22 30h14v-10H22zM36 30h20v-10H36z", "M8 44h20V30H8zM28 44h14V30H28zM42 44h14V30H42z", "M8 54h48"], accent: [0] },
  "lo-chan-long": { label: "Lỗ chân lông", group: "Da", paths: ["M6 22h20c2 0 3 2 3 4l1 18c0 3 4 3 4 0l1-18c0-2 1-4 3-4h20", "M32 30v8", "M6 54h52"], accent: [1] },
  "nhan-mun": { label: "Nhân mụn", group: "Da", paths: ["M6 22h18c3 0 3 3 3 5v13c0 7 10 7 10 0V27c0-2 0-5 3-5h18", "M28 38a4 4 0 1 0 8 0 4 4 0 1 0-8 0", "M6 54h52"], accent: [1] },
  "mun-viem": { label: "Mụn viêm", group: "Da", paths: ["M6 40c8 0 10-18 26-18s18 18 26 18", "M32 34a4 4 0 1 0 0 .1", "M6 52h52", "M20 14l-3-6M32 12V5M44 14l3-6"], accent: [1, 3] },
  "khuon-mat": { label: "Khuôn mặt", group: "Da", paths: ["M32 6c-12 0-20 9-20 22 0 16 10 30 20 30s20-14 20-30C52 15 44 6 32 6z", "M22 28h6M36 28h6", "M26 44c4 3 8 3 12 0"], accent: [2] },
  "da-nhay-cam": { label: "Da nhạy cảm", group: "Da", paths: ["M32 6c-12 0-20 9-20 22 0 16 10 30 20 30s20-14 20-30C52 15 44 6 32 6z", "M26 42l4-4 4 4 4-4", "M18 24l4 3-4 3M46 24l-4 3 4 3"], accent: [1, 2] },
  "da-kho": { label: "Da khô", group: "Da", paths: ["M8 14h48v36H8z", "M8 30l12-4 6 10 12-6 18 6", "M26 36l-4 14M38 30l6-16"], accent: [1, 2] },
  "da-dau": { label: "Da dầu", group: "Da", paths: ["M32 8c8 11 14 18 14 26a14 14 0 0 1-28 0c0-8 6-15 14-26z", "M24 36a8 8 0 0 0 8 7"], accent: [1] },
  "ngua": { label: "Ngứa, châm chích", group: "Da", paths: ["M6 46h52", "M14 36l4-8 4 8 4-8 4 8", "M34 36l4-8 4 8 4-8 4 8", "M26 18l-3-8M38 18l3-8"], accent: [1, 2] },
  "do-rat": { label: "Đỏ, rát", group: "Da", paths: ["M32 6c2 10 16 16 16 32a16 16 0 0 1-32 0c0-8 5-11 7-18 3 3 5 5 6 8 3-6 4-13 3-22z", "M32 54a7 7 0 0 1-7-8c0-4 4-6 7-11 3 5 7 7 7 11a7 7 0 0 1-7 8z"], accent: [1] },
  "bong-troc": { label: "Bong tróc", group: "Da", paths: ["M6 44h52", "M14 44c0-10 6-12 12-12l-2 12", "M34 44c2-8 8-14 16-14l-4 14", "M28 18l6-6 2 8z"], accent: [3] },
  // Hoạt chất
  "phan-tu": { label: "Phân tử", group: "Hoạt chất", paths: ["M32 10l18 10v22L32 52 14 42V20z", "M32 10V2M50 42l7 4M14 42l-7 4", "M32 22l8 5v10"], accent: [2] },
  "retinoid": { label: "Retinoid", group: "Hoạt chất", paths: ["M10 24l10-6 10 6v12l-10 6-10-6z", "M30 24l8-5 8 5 8-5", "M54 19v-9", "M20 26v8"], accent: [1, 2] },
  "acid": { label: "Acid", group: "Hoạt chất", paths: ["M24 6h16M28 6v18L12 52c-2 4 0 6 4 6h32c4 0 6-2 4-6L36 24V6", "M19 42h26", "M28 50h.1M38 48h.1"], accent: [1, 2] },
  "binh-cau": { label: "Thí nghiệm", group: "Hoạt chất", paths: ["M26 6h12M29 6v16a18 18 0 1 0 6 0V6", "M16 40h32"], accent: [1] },
  "tang-nong-do": { label: "Nồng độ", group: "Hoạt chất", paths: ["M14 8v44a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V8", "M14 34c9-4 13 4 18 0s9-4 18 0", "M50 18h-8M50 26h-8"], accent: [1] },
  // Sản phẩm
  "tuyp-kem": { label: "Tuýp kem", group: "Sản phẩm", paths: ["M18 8h28L40 48H24z", "M26 48h12v8H26z", "M20 20h24"], accent: [2] },
  "serum": { label: "Serum", group: "Sản phẩm", paths: ["M20 26h24v28a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z", "M26 26v-8h12v8", "M30 18V8a4 4 0 0 1 4 0v10", "M20 40h24"], accent: [3] },
  "chai-bom": { label: "Chai bơm", group: "Sản phẩm", paths: ["M20 24h24v30a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z", "M28 24v-8h8v8", "M22 8h14v8", "M22 8h-6v4"], accent: [2, 3] },
  "hu-kem": { label: "Hũ kem", group: "Sản phẩm", paths: ["M10 26h44v22a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z", "M8 14h48v12H8z", "M22 40h20"], accent: [2] },
  "chong-nang": { label: "Chống nắng", group: "Sản phẩm", paths: ["M26 58V24l4-8h4l4 8v34z", "M12 12a7 7 0 1 0 14 0", "M10 28H4M16 36l-4 4M46 34h12M46 44h12"], accent: [1, 2] },
  "bong-tay": { label: "Bông tẩy trang", group: "Sản phẩm", paths: ["M10 32a22 22 0 1 0 44 0 22 22 0 1 0-44 0", "M20 28c4-3 8 3 12 0s8-3 12 0", "M20 38c4-3 8 3 12 0s8-3 12 0"], accent: [1, 2] },
  // Quy trình
  "lam-sach": { label: "Làm sạch", group: "Quy trình", paths: ["M32 8c7 10 12 15 12 22a12 12 0 0 1-24 0c0-7 5-12 12-22z", "M10 48h44", "M16 56h32", "M48 12v8M44 16h8"], accent: [3] },
  "lay-nhan-mun": { label: "Lấy nhân mụn", group: "Quy trình", paths: ["M10 52l32-32", "M42 20l10-10 3 3-10 10", "M16 58h34", "M28 12l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"], accent: [3] },
  "dap-mat-na": { label: "Đắp mặt nạ", group: "Quy trình", paths: ["M32 6c-12 0-20 9-20 22 0 16 10 30 20 30s20-14 20-30C52 15 44 6 32 6z", "M20 26c3-3 6-3 9 0M35 26c3-3 6-3 9 0", "M26 44c4 2 8 2 12 0", "M12 34h8M44 34h8"], accent: [1, 3] },
  "chieu-den": { label: "Chiếu đèn", group: "Quy trình", paths: ["M12 10h40l-6 14H18z", "M32 4v6", "M22 32l-4 10M32 32v12M42 32l4 10", "M10 54h44"], accent: [2] },
  "tieu-sung": { label: "Tiêu sừng", group: "Quy trình", paths: ["M6 44h52", "M12 44V32h12v12M26 44V26h12v18M40 44V36h12v8", "M32 18V6M26 12l6-6 6 6"], accent: [2] },
  "giam-nhon": { label: "Giảm nhờn", group: "Quy trình", paths: ["M24 8c6 9 10 13 10 19a10 10 0 0 1-20 0c0-6 4-10 10-19z", "M44 20v30M36 42l8 8 8-8"], accent: [1] },
  "giam-viem": { label: "Giảm viêm", group: "Quy trình", paths: ["M32 6v52M12 18l40 28M52 18L12 46", "M32 14l-5-5M32 14l5-5M32 50l-5 5M32 50l5 5"], accent: [0] },
  "sang": { label: "Buổi sáng", group: "Quy trình", paths: ["M20 32a12 12 0 1 0 24 0 12 12 0 1 0-24 0", "M32 6v8M32 50v8M6 32h8M50 32h8M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6"], accent: [0] },
  "toi": { label: "Buổi tối", group: "Quy trình", paths: ["M46 40A22 22 0 0 1 24 10a22 22 0 1 0 30 30 22 22 0 0 1-8 0z", "M44 12l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"], accent: [1] },
  "lich-hen": { label: "Lịch hẹn", group: "Quy trình", paths: ["M8 14h48v42H8z", "M8 26h48", "M20 8v10M44 8v10", "M22 42l7 7 13-14"], accent: [3] },
  "dong-ho": { label: "Thời gian", group: "Quy trình", paths: ["M8 32a24 24 0 1 0 48 0 24 24 0 1 0-48 0", "M32 16v16l10 8"], accent: [1] },
  // Bằng chứng
  "nghien-cuu": { label: "Nghiên cứu", group: "Bằng chứng", paths: ["M12 6h30l10 10v42H12z", "M42 6v10h10", "M20 44V36M30 44V26M40 44V32"], accent: [2] },
  "kinh-lup": { label: "Kiểm chứng", group: "Bằng chứng", paths: ["M8 28a20 20 0 1 0 40 0 20 20 0 1 0-40 0", "M42 42l14 14", "M20 28l6 6 11-12"], accent: [2] },
  "bieu-do": { label: "Số liệu", group: "Bằng chứng", paths: ["M8 8v48h48", "M18 44V30", "M32 44V18", "M46 44V26"], accent: [2] },
  "ti-le": { label: "Tỷ lệ", group: "Bằng chứng", paths: ["M8 32a24 24 0 1 0 48 0 24 24 0 1 0-48 0", "M32 8v24h24"], accent: [1] },
  "bang-hoi": { label: "Bảng hỏi", group: "Bằng chứng", paths: ["M14 10h36v48H14z", "M24 6h16v8H24z", "M22 28l3 3 5-6M36 28h8", "M22 44l3 3 5-6M36 44h8"], accent: [2, 3] },
  "guideline": { label: "Hướng dẫn", group: "Bằng chứng", paths: ["M12 8h34a6 6 0 0 1 6 6v42H18a6 6 0 0 1-6-6z", "M12 50a6 6 0 0 1 6-6h34", "M22 20h20M22 30h14"], accent: [2] },
  "nguon": { label: "Nguồn", group: "Bằng chứng", paths: ["M26 38a12 12 0 0 0 17 0l9-9a12 12 0 0 0-17-17l-4 4", "M38 26a12 12 0 0 0-17 0l-9 9a12 12 0 0 0 17 17l4-4"], accent: [0] },
  // Cảnh báo
  "canh-bao": { label: "Lưu ý", group: "Cảnh báo", paths: ["M32 8L4 56h56z", "M32 26v14", "M32 48h.1"], accent: [1, 2] },
  "dung-lai": { label: "Dừng lại", group: "Cảnh báo", paths: ["M22 6h20l16 16v20L42 58H22L6 42V22z", "M20 32h24"], accent: [1] },
  "hoi-bac-si": { label: "Hỏi bác sĩ", group: "Cảnh báo", paths: ["M8 10h48v34H28L16 56V44H8z", "M28 22a5 5 0 1 1 7 4c-2 1-3 2-3 5", "M32 36h.1"], accent: [1, 2] },
  "thai-ky": { label: "Thai kỳ", group: "Cảnh báo", paths: ["M32 16a6 6 0 1 0 0-.1", "M22 58V36c0-7 4-12 10-12 4 0 6 3 6 5 6 2 8 7 6 13-1 4-5 6-10 6v10", "M36 40h.1"], accent: [2] },
  "khong-tu-y": { label: "Không tự ý", group: "Cảnh báo", paths: ["M8 32a24 24 0 1 0 48 0 24 24 0 1 0-48 0", "M15 15l34 34"], accent: [1] },
  // Tư vấn
  "bac-si": { label: "Bác sĩ", group: "Tư vấn", paths: ["M22 18a10 10 0 1 0 20 0 10 10 0 1 0-20 0", "M10 58c0-14 10-22 22-22s22 8 22 22", "M32 44v8M28 48h8"], accent: [2] },
  "tu-van": { label: "Tư vấn", group: "Tư vấn", paths: ["M6 8h36v24H20l-8 8v-8H6z", "M48 22h10v22h-6v8l-8-8H28v-6", "M16 20h16"], accent: [2] },
  "gia-tri-tron-goi": { label: "Trọn gói", group: "Tư vấn", paths: ["M34 6h22v22L28 56 6 34z", "M44 18h.1", "M22 34l6 6 10-11"], accent: [2] },
  "khong-phat-sinh": { label: "Không phát sinh", group: "Tư vấn", paths: ["M12 6h40v52l-7-5-6 5-7-5-6 5-7-5-7 5z", "M22 22h20M22 32h20", "M18 44l28-34"], accent: [3] },
  "ca-nhan-hoa": { label: "Cá nhân hoá", group: "Tư vấn", paths: ["M14 18a8 8 0 1 0 16 0 8 8 0 1 0-16 0", "M6 50c0-11 7-17 16-17 5 0 8 2 11 5", "M38 46l6 6 14-16"], accent: [2] },
  "tin-nhan": { label: "Nhắn tin", group: "Tư vấn", paths: ["M6 10h52v36H26L14 56V46H6z", "M20 28h.1M32 28h.1M44 28h.1"], accent: [1] },
  "tai-nghe": { label: "Ghi âm", group: "Tư vấn", paths: ["M8 40V32a24 24 0 0 1 48 0v8", "M8 38h8v16H8zM48 38h8v16h-8z"], accent: [1] },
  "micro": { label: "Micro", group: "Tư vấn", paths: ["M22 12a10 10 0 0 1 20 0v18a10 10 0 0 1-20 0z", "M12 28a20 20 0 0 0 40 0", "M32 48v10M22 58h20"], accent: [0] },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as IconName[];
