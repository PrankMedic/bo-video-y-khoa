---
name: video-slide-chuyen-mon
description: Biến một clip người nói (bác sĩ, dược sĩ, chuyên gia) thành video dọc 9:16 có khung tròn người nói, phụ đề karaoke, slide nội dung kèm dòng nguồn PubMed, ít nhất một slide số liệu nghiên cứu, nhạc nền tự giảm và hook âm thanh, dựng bằng Remotion. Dùng khi người dùng nói "dựng video slide cho clip X", "video có slide và nguồn", "làm video chuyên môn từ clip này", "thêm slide số liệu vào clip". Video không lộ mặt dùng video-flow-minh-hoa; muốn đổi bố cục khác dùng dinh-dang-video.
---

# Video slide chuyên môn

Lời nói giữ nguyên, người nói thu vào khung tròn, slide nội dung và số liệu chiếm phần trên, dòng nguồn ở dưới. Mẫu chạy được: composition `MauVideo` trong [MauVideo.tsx](../../../remotion-demo/src/talking-slides/MauVideo.tsx).

Đọc `CLAUDE.md` trước: luật nội dung, tên hoạt chất, không cam kết kết quả. Mọi lệnh chạy từ gốc bộ công cụ (thư mục có `CLAUDE.md`; skill được nối ra `~/.claude/skills` thì gốc là thư mục thật của skill (`readlink -f`) đi lên ba cấp). Biến dùng bên dưới: `P=Output/<ten-video>`, `<slug>` là tên video không dấu.

| Bước | Việc | Kết quả |
|---|---|---|
| 1 | Chuẩn bị clip | `$P/clip.mp4`, phụ đề từng từ đã sửa chính tả |
| 2 | Kiểm chứng nguồn | `tai-lieu/nghien-cuu/<chu-de>.md` (skill `kiem-chung-nguon`) |
| 3 | Thiết kế slide | Danh sách slide, nội dung, nguồn |
| 4 | Dựng composition | `<Ten>Video.tsx` + đăng ký trong `Root.tsx` |
| 5 | Âm thanh | Nhạc nền tự giảm, hook 8–10 giây |
| 6 | Kiểm tra | Khung hình mẫu, đo âm thanh |
| 7 | Render và bàn giao | MP4 + danh sách cần duyệt |

Không render MP4 khi người dùng chưa yêu cầu xuất. Trong lúc làm, kiểm tra bằng khung hình tĩnh.

## 1. Chuẩn bị clip

```bash
python3 -I work/chuan_bi_giong.py Raw/<ten-video>/<clip> $P      # goc.wav, words.json, loi-noi.txt
```

- Đọc `loi-noi.txt` (chỗ nói vấp, lặp câu, khoảng im dài) và bảng claim, chọn đoạn bỏ. Viết `$P/cuts.json`: `{"source": "Raw/<ten-video>/<clip>", "keep": [[a, b], ...], "removed": [{"from", "to", "why"}]}`. Cắt ở khoảng lặng (`ffmpeg -af silencedetect=n=-35dB:d=0.25`), không cắt giữa từ.
- `python3 -I work/cat_clip.py $P` tạo `clip.mp4` và `voice.mp3`. Không cần cắt thì dùng nguyên clip: chép thành `$P/clip.mp4` và tách `voice.mp3` bằng ffmpeg.
- Gỡ băng lại bản đã cắt: `python3 -I work/chuan_bi_giong.py $P/clip.mp4 $P`, rồi chạy lại `work/tim_loi_noi.py` trên bản cắt để bắt chỗ nối.
- Đọc `words.json` kèm số thứ tự, viết `$P/corrections.json` (`fix` sửa một từ, `merge` gộp với từ kế tiếp, `breaks` ngắt dòng phụ đề). Sửa theo lời nói thật, không viết lại câu. Chỗ nghe không rõ ghi vào danh sách cần nghe lại.
- `python3 -I .claude/skills/video-flow-minh-hoa/scripts/flow_captions.py $P <slug>` xuất `remotion-demo/src/flow/data/<slug>.words.json`. Chép video: `cp $P/clip.mp4 remotion-demo/public/<slug>.mp4`.
- Thời lượng: `ffprobe`. Composition dài `ceil((giây + 0,8) × 30)` frame.
- Xem 1–2 khung để lấy toạ độ mặt (`faceX`, `faceY`) trong khung 1080×1920.

## 2. Kiểm chứng nguồn

Chạy skill `kiem-chung-nguon` trên lời đã sửa. Cần có trước khi viết slide: bảng claim, danh mục nguồn đã xác minh, một nghiên cứu được chọn cho slide số liệu kèm lý do.

## 3. Thiết kế slide

Chia lời thành 3–4 đoạn ý, mỗi đoạn một slide. Slide đầu bắt đầu sau câu mở đầu toàn khung (`INTRO_END`, khoảng 3,5 giây).

Loại slide trong [Slides.tsx](../../../remotion-demo/src/talking-slides/Slides.tsx):

| Component | Dùng khi | Props chính |
|---|---|---|
| `StatSlide` | Một con số hoặc từ khoá lớn | `title`, `stat`, `unit`, `statDelaySeconds` |
| `CompareSlide` | Hai trạng thái đối lập | `ok*`, `warn*` |
| `GridSlide` | 2–4 ý song song | `items[{title, sub, delaySeconds}]` |
| `StudySlide` | Số liệu từ một nghiên cứu, ít nhất 1 slide mỗi video | `chips`, `title`, `population`, `metric`, `bars`, `note`, `warning` |

- **Chữ trên slide chỉ chứa thông tin ✅ hoặc 🟡.** Câu 🔴 thì cắt khỏi giọng ở bước 1. Câu ⚪ hoặc 🔴 không cắt được thì sửa chữ trên slide cho khớp bằng chứng và ghi vào danh sách cần duyệt, vì lời vẫn nói khác.
- Không tên thương mại trên slide. Mọi slide có `source`: `Nguồn: Họ năm (PMID …)`; `StudySlide` ghi đủ tác giả, tạp chí, năm, tập, trang, PMID.
- Thời điểm hiện từng thẻ = lúc từ khoá được nói (tra `words.json` hoặc `saidAt`) trừ lúc slide bắt đầu.

Giới hạn bố cục 1080×1920: vùng slide y 330–1240; khung tròn tâm (290, 1500) bán kính 200; dòng nguồn khoảng y=1780. `StatSlide` tiêu đề tối đa 3 dòng; `StudySlide` tiêu đề, `population`, `warning` mỗi thứ một dòng (khoảng 45 ký tự); `GridSlide` `sub` tối đa 2 dòng.

## 4. Dựng composition

1. Chép `MauVideo.tsx` thành `<Ten>Video.tsx`, đổi import phụ đề, video, slide và `keywords` (từ tô màu trong phụ đề).
2. Đăng ký `<Composition id="<Ten>Slides" fps={30} width={1080} height={1920} .../>` trong `Root.tsx`.
3. `cd remotion-demo && npx tsc --noEmit` sạch lỗi.

Xem trong lúc làm: `npx remotion studio --port 3123`, mở `http://localhost:3123/<Ten>Slides`.

## 5. Âm thanh

- Nhạc nền `DuckedMusic` với `staticFile("music/bg-pad.wav")`, `speechVolume={0.22}`, `gapVolume={0.4}`, `fadeOutSeconds={2}`. Nhạc tự giảm khi có lời. File nhạc là bản tổng hợp tạm, thay khi có nhạc có giấy phép.
- Hook mỗi 8–10 giây, đúng lúc đổi slide hoặc hiện số liệu: whoosh (0,45) đổi slide, ding (0,35) số liệu, switch (0,5) cảnh báo. Thẻ còn lại: click (0,3).
- SFX trong `Header.tsx` lấy từ `https://remotion.media/*.wav`, cần mạng khi render.

## 6. Kiểm tra

```bash
cd remotion-demo
npx remotion still <Ten>Slides /tmp/f<N>.jpg --frame=<N> --scale=0.5 --port 3313
npx remotion render <Ten>Slides /tmp/mix.wav --codec=wav --port 3317
```

- Mỗi slide ít nhất 1 khung sau khi mọi thẻ đã hiện; ghép bằng `ffmpeg … hstack` để xem nhanh. Tìm chữ tràn, dải cảnh báo đè khung tròn, dòng nguồn bị che.
- Âm thanh bằng `volumedetect`: đỉnh bản mix không vượt đỉnh giọng gốc; nửa giây cuối nhỏ hơn −40 dB.

## 7. Render và bàn giao

Chỉ khi người dùng yêu cầu xuất:

```bash
cd remotion-demo && npx remotion render <Ten>Slides ../$P/_raw.mp4 --codec=h264 --port 3316
cd .. && .claude/skills/video-flow-minh-hoa/scripts/flow_finish.sh $P/_raw.mp4 $P/<ten-video>.mp4 && rm $P/_raw.mp4
```

`flow_finish.sh` đưa âm lượng về −14 LUFS. Kiểm tra `ffprobe` (1080×1920, đúng thời lượng, có audio), xem 3 khung của MP4 thật.

Báo cáo theo thứ tự: (1) cần duyệt trước khi đăng: claim ⚪ 🔴 trong lời, tên thương mại, nhận định chưa có nguồn, lưu ý còn thiếu; (2) những gì chưa kiểm chứng: chưa nghe bằng tai, nhạc tạm; (3) link MP4 và file nguồn.
