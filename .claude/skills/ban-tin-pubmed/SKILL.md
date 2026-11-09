---
name: ban-tin-pubmed
description: Sản xuất video Bản tin sức khoẻ 55–70 giây từ toàn văn một nghiên cứu trên PubMed/PMC - chọn bài, đọc toàn văn (không chỉ abstract), viết kịch bản nói rõ nghiên cứu làm trên ai, so với gì và điều chưa chứng minh được, chặn số sai bằng kiem_so.py, tạo giọng AI, dựng Remotion. Dùng khi người dùng nói "làm bản tin", "tập bản tin mới", "video từ nghiên cứu mới", "làm video từ bài PubMed này".
---

# Bản tin từ PubMed

Điểm khác biệt: không chỉ nói kết quả, mà nói nghiên cứu làm trên ai, so với gì, và **điều chưa chứng minh được**. Mỗi tập có một cảnh "đọc toàn văn mới thấy". Thư mục mỗi tập: `Output/ban-tin/<tap>/`. Mẫu dựng: composition `BanTinMau` và file dữ liệu [ban-tin-mau.ts](../../../remotion-demo/src/studio/data/ban-tin-mau.ts). Mọi lệnh chạy từ gốc bộ công cụ (thư mục có `CLAUDE.md`; skill được nối ra `~/.claude/skills` thì gốc là thư mục thật của skill (`readlink -f`) đi lên ba cấp).

## 1. Chọn bài

```bash
python3 -I .claude/skills/kiem-chung-nguon/scripts/pubmed.py search "<chủ đề>" --type "rct;systematic review" --from 2024 --max 12
```

Chỉ chọn dòng có `PMC` (có toàn văn miễn phí). Ưu tiên chủ đề người xem của kênh hay hỏi. Bỏ bài mà nội dung cần tên hãng, bài quá hẹp, hoặc chỉ làm trên động vật khi không nói rõ được điều đó.

```bash
python3 -I .claude/skills/kiem-chung-nguon/scripts/pubmed.py fulltext <PMID> --out Output/ban-tin/<tap>/fulltext.txt
```

Lệnh in giấy phép của bài. Được tóm tắt dữ kiện bằng lời của mình, kèm nguồn. Không chép biểu đồ hay hình gốc, kể cả bài CC BY: vẽ lại từ số liệu.

## 2. Đọc sâu

Tự đọc phương pháp, bảng và phần giới hạn, không dừng ở abstract. Luôn tìm:

- Abstract có khớp bảng số liệu không (ví dụ abstract ghi "giảm 58%" nhưng đó là phần còn lại, mức giảm thật là 42%).
- Nhóm đối chứng thay đổi bao nhiêu. Đối chứng cũng cải thiện gần bằng thì phải nói.
- Làm trên ai, ở đâu trên cơ thể, ai bị loại khỏi nghiên cứu.
- Xung đột lợi ích và tài trợ: nói "hãng bán sản phẩm được thử", không ghi tên hãng.

## 3. Kịch bản

`kich-ban.txt`, khoảng 190–210 từ (55–70 giây). Mở bằng câu hỏi hoặc con số của nghiên cứu (chữ trên màn hình từ khung 0), rồi mới đến tên bản tin. Hứa một điều ở câu thứ hai và trả ở cuối. Có một câu gợi lại ở 50–80% thời lượng. Chi tiết: [hook-va-nhip.md](../dinh-dang-video/references/hook-va-nhip.md). Có câu về an toàn hoặc chống chỉ định khi nghiên cứu có nêu. Thuốc thì nói cần bác sĩ chỉ định. Không cam kết kết quả, không tên thương mại. Kết bằng lời mời bình luận.

Mọi số tự tính khai trong `so-tinh.json`, ví dụ `{"41": "(6.83-4.02)/6.83*100"}`.

## 4. Kiểm số và giọng

```bash
cd work
python3 -I kiem_so.py ../Output/ban-tin/<tap>
python3 -I tts_gemini.py ../Output/ban-tin/<tap>/kich-ban.txt ../Output/ban-tin/<tap>
```

- `kiem_so.py` báo sai thì dừng, không dựng. Script chỉ kiểm số có trong toàn văn hay không, nên vẫn tự đối chiếu số đó đúng nhóm, đúng chỉ số.
- `tts_gemini.py` cần `GEMINI_API_KEY`. Không có khoá thì người dùng tự thu âm kịch bản và dùng `work/chuan_bi_giong.py` thay thế.
- `tts_gemini.py` dùng lại `voice.wav` có sẵn: sửa kịch bản thì xoá `voice.wav` trước.
- Chuyển giọng sang MP3 (`ffmpeg -i voice.wav -b:a 192k remotion-demo/public/studio/ban-tin-<tap>/goc.mp3`, không đổi đuôi file) và chép `words.json` sang `remotion-demo/src/studio/data/words/ban-tin-<tap>.json`.

## 5. Dựng

Viết `src/studio/data/ban-tin-<tap>.ts` theo `ban-tin-mau.ts` và đăng ký composition `BanTin<Tap>` như `BanTinMau` trong `src/studio/Compositions.tsx`. Neo mốc bằng lời nói, không gõ tay số giây. Có thể giao Codex viết file này (skill `goi-codex`).

Chạy lại `kiem_so.py` với file dữ liệu: `python3 -I kiem_so.py ../Output/ban-tin/<tap> ../remotion-demo/src/studio/data/ban-tin-<tap>.ts`.

## 6. Duyệt

1. Render một khung mỗi cảnh, ghép thành tờ duyệt JPG.
2. Tuỳ chọn: nhờ Antigravity hoặc Gemini xem tờ duyệt (chữ tràn, che phụ đề, sai chính tả). Tự đối chiếu từng góp ý với khung hình, bỏ góp ý sai.
3. Sửa, kiểm số lại, tối đa 2 vòng. Cùng một lỗi mà 2 vòng chưa xong thì dừng và báo.
4. Render và chuẩn hoá âm: `.claude/skills/video-flow-minh-hoa/scripts/flow_finish.sh`.

## 7. Giao

Đọc lại tờ duyệt, đối chiếu từng số trên hình với `fulltext.txt`, gửi người dùng. **Không tự đăng.** Bật khai báo nếu video quảng bá dịch vụ, gắn nhãn giọng AI.
