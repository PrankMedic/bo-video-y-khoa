---
name: dinh-dang-video
description: Chọn và dựng một trong các định dạng video dọc hoặc ngang từ clip người nói, file ghi âm hoặc chỉ từ text - Thẳng mặt, Tạp chí, Phủ đồ hoạ, Bản ngang 16:9, Hoạt hình chữ và icon, Sổ tay vẽ tay, cùng các mẫu Studio (Hỏi đáp, Lời đồn hay sự thật, Biểu đồ, So sánh, Cơ chế, Hành trình, Podcast, Carousel). Dùng khi người dùng nói "đổi định dạng video", "làm kiểu tạp chí", "bản ngang", "có file ghi âm, làm video", "chuyển thu âm thành video", "video từ text", "làm video không lộ mặt bằng hoạt hình".
---

# Định dạng video

Mã nằm ở `remotion-demo/src/formats/` (định dạng chính) và `src/studio/` (mẫu Studio). Mỗi định dạng có một composition mẫu trong Studio, mở `npx remotion studio --port 3123` để xem trước khi chọn. Mọi lệnh chạy từ gốc bộ công cụ (thư mục có `CLAUDE.md`; skill được nối ra `~/.claude/skills` thì gốc là thư mục thật của skill (`readlink -f`) đi lên ba cấp).

Đọc `CLAUDE.md` trước. Nội dung chuyên môn qua skill `kiem-chung-nguon` trước khi dựng.

## Chọn định dạng

Review nội dung một vòng, đề xuất **một** định dạng phù hợp nhất kèm lý do, chờ người dùng chọn rồi mới dựng. Người dùng đã nói rõ định dạng thì không hỏi lại.

| Composition mẫu | Đầu vào | Hợp với |
|---|---|---|
| `ThangMat` | Clip | Thông điệp ngắn, giá, dịch vụ |
| `TapChi` | Clip | Nội dung cao cấp, tư vấn |
| `PhuDoHoa` | Clip | Có số liệu hoặc danh sách |
| `BanNgang` | Clip | YouTube, bài giảng 16:9 |
| `HoatHinh` | Chỉ cần giọng | Giải thích, không lộ mặt |
| `SoTay` | Chỉ cần giọng | Câu hỏi, câu chuyện, mẹo |
| `Mau*` (Studio) | Chỉ cần giọng | Hỏi đáp, lời đồn, biểu đồ, so sánh, cơ chế, hành trình, podcast, carousel ảnh |

Ưu tiên định dạng làm từ thu âm hoặc text khi người nói không muốn quay. Dùng clip thì chọn bố cục mặt nhỏ.

## Chuẩn bị đầu vào

Mỗi video một thư mục `Raw/<ten-video>/`: `source/` (clip hoặc ghi âm đánh số theo thứ tự `01-...`, `02-...`), `broll/` (hình bổ trợ đã chọn, không chứa người bệnh khi chưa có đồng ý), `kich-ban.md` (lời đã chốt, kèm bảng claim hoặc link tới `tai-lieu/nghien-cuu/`).

Clip có mặt thì lập bảng "giữ tiếng, thay hình" trong `kich-ban.md`: đoạn lời, source in/out, hiện gì (mặt, slide, b-roll), lý do. Lời chạy liên tục, chỉ đổi hình. Xem nội dung từng b-roll, không đoán theo tên file. Thiếu hình đúng ý thì giữ mặt hoặc đồ hoạ và ghi thiếu, không lặp hình để lấp chỗ.

## Giọng

**Từ clip hoặc ghi âm:**

```bash
python3 -I work/chuan_bi_giong.py Raw/<ten-video>/source/01-... Output/<ten-video>
```

- Đọc `loi-noi.txt`. Bản ghi dài thì lập bản đồ nội dung theo mốc, tách thành chuỗi 60–90 giây, mỗi video một ý.
- Rà tên người, người bệnh, kết quả xét nghiệm. Gặp thông tin của một người bệnh cụ thể thì dừng và hỏi.
- Làm sạch âm khi cần: `highpass=f=80,lowpass=f=12000,afftdn=nf=-30,loudnorm=I=-16:TP=-1.5:LRA=7`.
- Cắt câu 🔴, câu nói sai, chỗ vấp bằng `cuts.json` + `work/cat_clip.py` (giữ hình) hoặc `flow_voice.py` (chỉ tiếng). Cắt theo `silencedetect` vì mốc từng từ của Whisper có thể lệch tới 1 giây. Câu nói sai thì cắt khỏi giọng, không để chữ trên màn hình mâu thuẫn với lời.
- Gỡ băng lại bản đã cắt, viết `corrections.json`, xuất phụ đề: `python3 -I .claude/skills/video-flow-minh-hoa/scripts/flow_captions.py Output/<ten-video> <slug>`.

**Từ text:** viết kịch bản đã kiểm chứng vào `kich-ban.txt`, rồi

```bash
cd work && python3 -I tts_gemini.py ../Output/<ten-video>/kich-ban.txt ../Output/<ten-video>
```

Cần `GEMINI_API_KEY`. Kết quả `voice.wav` và `words.json` dạng Remotion. `tts_gemini.py` dùng lại `voice.wav` có sẵn, sửa kịch bản thì xoá file này trước. Chuyển sang MP3 bằng ffmpeg, không đổi đuôi file. Gắn nhãn "Giọng đọc AI" trên video.

## Dựng

- Định dạng dùng clip: chép video vào `remotion-demo/public/`, khai báo clip (tên file, toạ độ mặt) trong hằng `clips` của `src/formats/Footage.tsx`.
- Thêm dữ liệu vào `src/formats/demos.ts` theo mẫu có sẵn, đăng ký trong `src/formats/Compositions.tsx`. Mẫu Studio: thêm một file vào `src/studio/data/`, composition tự đăng ký.
- Neo mọi mốc bằng `saidAt(words, "cụm từ")`, không gõ tay số giây.
- Clip đổi khung giữa chừng thì tách `segments` và ghi `contentTop`, `contentHeight`.

## Chữ, chuyển cảnh, SFX

Mã trong `src/formats/effects.tsx`. SFX tạo bằng `python3 -I work/tao_sfx.py` (đã chạy lúc cài).

- `TwoLineCue`: mỗi cụm tối đa hai hàng. Nền sáng truyền `light={màu nền}`.
- `LightTransition` (`burn` hoặc `leak`): tối đa 2–3 lần mỗi video, chỉ ở điểm chuyển ý lớn, không dùng khi đang nói về da, tổn thương hay biến chứng.
- `Sfx`: `whoosh` ở điểm chuyển cảnh, `digital` lúc thông tin hiện ra; nhỏ hơn giọng (thử 0,45 và 0,7).

## Icon

`LineIcon` trong `src/formats/icons/`: `draw` vẽ dần, `sketch` nét vẽ tay. Thêm icon vào `icons/data.ts` theo lưới 64×64, chỉ dùng nét; xuất SVG bằng `node scripts/export-icons.mts` (Node 22.18+). Xem toàn bộ: Still `IconCatalog`. Thiếu icon thì dùng `lucide-react`, `@phosphor-icons/react`, `@tabler/icons-react` (đã cài).

## Kiểm tra

- `npx tsc --noEmit`, xem khung hình ở mỗi cảnh, đo `volumedetect` (đỉnh dưới 0 dB).
- Chữ trên hình chỉ dùng claim ✅ hoặc 🟡, luôn có dòng nguồn.
- Báo những gì còn cần người duyệt, những gì chưa nghe lại bằng tai.

## Sổ lỗi

Khi người dùng sửa một lỗi có thể lặp lại, thêm một dòng ở đây: lỗi gì, kiểm tra thế nào.

- Chỉ thêm phụ đề hoặc đổi khung chưa tính là đã edit: các bản phải khác rõ về cách kể và hình ảnh.
- Mặt quá to: xem cỡ mặt ở độ phân giải đầy đủ, không cắt cận quá mức.
- Hiệu ứng ánh sáng gắt trên nền tranh: xem chuỗi khung vào, đỉnh, ra, không chỉ một khung.
- Lời lặp hoặc nói vấp còn sót: chạy `work/tim_loi_noi.py` trên âm thanh gốc và bản cuối.
