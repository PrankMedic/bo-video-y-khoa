# Giao việc cho Codex và Antigravity (tuỳ chọn)

Giao việc có lợi khi phần viết file đủ lớn. Video ngắn, ít cảnh thì Claude làm một mình nhanh hơn. Claude luôn giữ phần cần phán đoán chuyên môn và quảng cáo.

| Bước | Giao cho | Kết quả |
|---|---|---|
| Chọn lời, chốt claim, `cuts.json` | Claude | Quyết định chuyên môn |
| `corrections.json`, `prompts.json`, `<Ten>Flow.tsx` | Codex | File trong dự án |
| Góp ý ảnh, tờ duyệt khung hình | Antigravity hoặc Gemini | Nhận xét, không sửa file |
| Render, chuẩn hoá âm | Script, chạy ngoài sandbox | MP4 |
| Xem khung hình, `CAN-DUYET.md`, báo cáo | Claude | Bước cuối |

## Cách giao

Viết brief vào `$P/brief-<viec>.md`, rồi chạy từ gốc bộ công cụ:

```bash
$K/giao.sh codex $P/brief-tsx.md          # Codex được sửa file trong thư mục đang đứng
$K/giao.sh agy Output/antigravity/<viec>/brief-hinh.md   # Antigravity chỉ đọc
```

- Script giới hạn thời gian (mặc định 8 phút, tham số thứ ba để đổi) vì tác nhân có thể treo. Log nằm cạnh brief; chỉ đọc đoạn cuối log.
- Brief gồm: việc cần làm, file được sửa, file mẫu, kết quả mong đợi, cách tự kiểm tra (ví dụ `npx tsc --noEmit`). Dán sẵn số liệu cần thiết.
- Brief cho Antigravity: chỉ đọc, trả lời thẳng, không tạo kế hoạch hay file. Thư mục brief chỉ chứa file cần thiết (tờ duyệt JPG, không gửi MP4), không đặt ở gốc vì có `.env`.

## Giới hạn

- Codex chạy `workspace-write`, không cấp toàn quyền. Sandbox thường không có mạng và trình duyệt, nên render làm bên ngoài.
- `agy` chỉ chạy bằng khoá `GEMINI_API_KEY`, không dùng đăng nhập Google (xem skill `goi-antigravity`).
- Kết quả của tác nhân là bản nháp: Claude kiểm tra bằng diff, `tsc` và khung hình. Số liệu, PMID, câu chữ quảng cáo luôn đối chiếu lại với tài liệu kiểm chứng.
