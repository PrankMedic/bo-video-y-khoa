---
name: video-flow-minh-hoa
description: Biến clip người nói hoặc file ghi âm thành video dọc không lộ mặt - ảnh minh hoạ (Google Flow hoặc ảnh của bạn) xen slide số liệu, giá và nguồn PubMed, dựng trong Remotion, giữ giọng thật, phụ đề karaoke, nhạc nền và hook âm thanh. Dùng khi người dùng nói "làm video minh hoạ", "video không lộ mặt", "video bằng Flow", "kết hợp ảnh với slide", "biến clip thành video màu nước", "dựng video từ file ghi âm có hình AI". Video có khung tròn người nói dùng video-slide-chuyen-mon.
---

# Video ảnh minh hoạ + slide

Ảnh lo phần dẫn chuyện, slide lo số liệu, giá và nguồn. Mọi thứ dựng trong Remotion để slide, phụ đề và âm thanh bám theo lời nói. Mẫu chạy được: composition `MauFlow` trong [MauFlow.tsx](../../../remotion-demo/src/flow/MauFlow.tsx), thành phần dùng lại trong [FlowKit.tsx](../../../remotion-demo/src/flow/FlowKit.tsx).

Mọi lệnh chạy từ gốc bộ công cụ (thư mục có `CLAUDE.md`; skill được nối ra `~/.claude/skills` thì gốc là thư mục thật của skill (`readlink -f`) đi lên ba cấp). Biến: `P=Output/flow/<ten-video>`, `K=.claude/skills/video-flow-minh-hoa/scripts`, `<slug>` là tên không dấu. Kiểm tra máy: `python3 work/cong_cu.py`. Kiểm tra ổ trống bằng `df -h` trước khi render.

## 1. Chọn lời

Đọc `tai-lieu/nghien-cuu/<chu-de>.md`; chưa có thì chạy skill `kiem-chung-nguon` trước.

- Chỉ giữ câu ✅ hoặc 🟡. Bỏ câu 🔴, câu ⚪ có số liệu, tên thương mại, tên người bệnh.
- Bỏ câu hạ thấp nơi khác và cam kết tuyệt đối. Không chắc thì đánh dấu để người duyệt quyết.
- Clip có quá nhiều câu đỏ thì đề xuất đổi clip.

## 2. Cắt giọng

```bash
python3 -I work/chuan_bi_giong.py Raw/<ten-video>/<nguồn> $P     # words.json, loi-noi.txt
```

Đọc `loi-noi.txt` để bắt chỗ nói vấp, lặp câu. Viết `$P/cuts.json` (`source`, `keep`, `removed` kèm lý do). Cắt ở khoảng lặng (`silencedetect`); không có khoảng lặng thì đo âm lượng theo từng 20 ms rồi cắt ở chỗ thấp nhất.

```bash
python3 $K/flow_voice.py $P          # voice.mp3 từ các đoạn giữ
```

Không cần cắt thì tách thẳng: `ffmpeg -i <nguồn> -vn -b:a 192k $P/voice.mp3`.

## 3. Nghe và sửa chữ

```bash
python3 -I work/chuan_bi_giong.py $P/voice.mp3 $P
```

Đọc `words.json` kèm số thứ tự, viết `$P/corrections.json`:

```json
{"fix": {"8": "bao"}, "merge": {"139": "199.000đ"}, "breaks": [27, 65]}
```

`fix` thay một từ, `merge` gộp với từ kế tiếp (Whisper hay tách `199` và `.000`), `breaks` là từ bắt đầu mỗi cảnh. Sửa theo lời nói thật, không viết lại câu. Whisper nghe một con số hay điều kiện giá khác kịch bản thì báo người dùng.

## 4. Phân cảnh

Mỗi ý một hình, khoảng 5–8 giây.

| Lời | Hình | Thành phần |
|---|---|---|
| Hook, câu chuyện, bối cảnh | Ảnh minh hoạ | `FlowImage`, có thể thêm `Headline` |
| Các bước, 2–4 ý song song | Slide thẻ | `StepsSlide` |
| Giá, con số then chốt | Slide số lớn | `ValuesSlide` |
| Số liệu nghiên cứu | Slide nghiên cứu | `StudySlide` |

Ranh giới này cũng là luật an toàn: ý có nguồn nằm trên slide, ảnh chỉ để minh hoạ, không dùng ảnh tả cơ chế hay kết quả điều trị. Video có claim y khoa cần ít nhất một `StudySlide` và dòng nguồn trên mọi slide có claim, lấy từ tài liệu kiểm chứng. Slide hiện ngay trước khi nói đến mục đầu tiên.

## 5. Ảnh

Viết `$P/prompts.json`, mỗi ảnh một prompt, bắt đầu bằng `S01.`, `S02.`…

- **Google Flow:** làm theo [references/google-flow.md](references/google-flow.md) qua Claude in Chrome, bằng tài khoản Google của người dùng. Hỏi trước nếu thao tác tốn tín dụng. Người dùng cũng có thể tự dán prompt để tiết kiệm token.
- Gom ảnh tải về: `python3 $K/flow_collect.py $P --since "YYYY-MM-DD HH:MM" --count <n>`. Script dựa vào thứ tự tải, nên đối chiếu bảng ánh xạ nó in ra với tiêu đề trên Flow.
- **Ảnh của bạn:** đặt thẳng vào `$P/img/raw-s01.jpg`, `raw-s02.jpg`… (1080×1920 hoặc lớn hơn, cùng tỉ lệ).

Phong cách mặc định: `Soft watercolor illustration on warm paper, ... character centered, top quarter of the frame empty pale wash, pastel palette, no text, no logo, no seal`. Nhân vật lặp lại thì chép nguyên một câu tả cố định trong mọi prompt, kèm "the same".

## 6. Dựng

```bash
python3 -I $K/flow_captions.py $P <slug>
```

Lệnh ghi `remotion-demo/src/flow/data/<slug>.words.json` và chép giọng, ảnh sang `remotion-demo/public/flow/<slug>/`. Chép `MauFlow.tsx` thành `src/flow/<Ten>Flow.tsx`, đổi dữ liệu, cảnh, slide và hook; không sửa `FlowKit` cho riêng một video. Đăng ký trong `Root.tsx`.

- Neo mọi mốc bằng `saidAt(words, "cụm từ")`, không gõ tay số giây.
- `durationInFrames` = `ceil((thời lượng giọng + 0,8) × 30)`.
- `Headline` đặt trong vùng trên cùng của ảnh. `ValuesSlide` chứa khoảng 3 hàng và một dòng cuối; thêm dòng nguồn thì kiểm tra không đè phụ đề ở y=1440.
- Âm thanh: `DuckedMusic` như mẫu, hook khoảng 8–10 giây một lần.

## 7. Soát trước khi render

```bash
cd remotion-demo && npx tsc --noEmit
npx remotion still <Ten>Flow /tmp/f<N>.jpg --frame=<N> --scale=0.33 --port 3313
```

Một khung mỗi cảnh và lúc mọi thẻ đã hiện, ghép bằng `hstack`, xem: chữ đủ dấu, không tràn, phụ đề đọc được, không có slide trống, ảnh đúng nội dung.

## 8. Render

Khi người dùng yêu cầu xuất (khoảng 1–2 phút cho video 1 phút):

```bash
cd remotion-demo && npx remotion render <Ten>Flow ../$P/_raw.mp4 --codec=h264 --port 3316
cd .. && $K/flow_finish.sh $P/_raw.mp4 $P/<ten-video>.mp4 && rm $P/_raw.mp4
```

`flow_finish.sh` đưa âm lượng về −14 LUFS và in số đo.

## 9. QA và giao

- `ffprobe`: 1080×1920, đúng thời lượng, có audio. Đỉnh dưới −1 dB.
- Trích 4 khung từ MP4 thật, gỡ băng lại bản cuối để kiểm mối nối.
- Đối chiếu từng PMID, năm và số liệu trên slide với tài liệu kiểm chứng.
- Ghi `$P/CAN-DUYET.md`: phần đã cắt, phần chưa nghe bằng tai, chữ tự thêm trên hình, danh sách cần người duyệt.

Không báo xong khi chưa xem khung hình của bản render.

## Luật nội dung

- Chỉ gửi prompt tả cảnh lên Flow. Không gửi slide, giọng, tên người.
- Ghi "Hình minh hoạ" trên video. Không dùng ảnh trước/sau, không mô tả kết quả điều trị bằng ảnh AI.
- Không tạo hình bệnh lý nặng hoặc hình cơ chế khi chưa có người chuyên môn duyệt.
- Chữ tự viết trên hình (`Headline`, nhãn slide) cũng là nội dung quảng cáo, vào danh sách duyệt.
- Trước khi đăng: bật khai báo nội dung thương mại và nhãn AI của nền tảng.

## Giao việc để tiết kiệm token (tuỳ chọn)

Bước trình duyệt tốn nhất, khoảng 40.000 token cho 10 ảnh: gom thao tác, chụp màn hình nhỏ. Phần viết file (`corrections.json`, `<Ten>Flow.tsx`) có thể giao Codex, phần góp ý hình giao Antigravity, xem [references/giao-viec.md](references/giao-viec.md).
