---
name: goi-antigravity
description: Giao việc chỉ đọc cho Antigravity CLI (agy) qua `giao.sh agy`, chạy không cần người bằng khoá Gemini API - thường để góp ý tờ duyệt khung hình hoặc cho phương án độc lập - rồi đọc và kiểm tra kết quả. Dùng khi người dùng nói "nhờ Antigravity", "giao cho agy", "để Antigravity xem/review". Không điều khiển app Antigravity.
---

# Giao việc qua Antigravity

Script chạy `agy` bằng khoá `GEMINI_API_KEY` trong `.env`, tính phí Gemini API theo token. **Không gọi `agy` bằng đăng nhập Google** từ Claude: FAQ của Antigravity coi việc phần mềm bên thứ ba truy cập bằng đăng nhập Google là vi phạm điều khoản, có thể khiến tài khoản bị tạm ngưng (https://antigravity.google/docs/faq/). Khoá API là đường FAQ khuyến nghị cho tác nhân bên thứ ba.

Cần `agy` trong PATH (hoặc đặt `AGY_BIN`). Kiểm tra: `agy --help`.

## Chuẩn bị

1. Tạo thư mục riêng `Output/antigravity/<viec>/`. Không dùng gốc bộ công cụ, vì có `.env`.
2. Chỉ chép vào đó file cần thiết. Video thì gửi tờ duyệt JPG, không gửi MP4.
3. Viết `brief.md`: việc cần làm, file được đọc, kết quả mong đợi, kèm các quy tắc liên quan trong `CLAUDE.md`.
4. Brief phải có các câu: "Chỉ đọc, không tạo kế hoạch hay file, trả lời trực tiếp", "Không chạy lệnh terminal, dùng công cụ đọc file có sẵn để xem ảnh trực tiếp", "Nếu không mở được ảnh thì nói rõ và dừng, không đoán".
5. Không đưa thông tin nhận diện người bệnh vào thư mục này.

## Chạy

Từ gốc bộ công cụ, chạy nền nếu lâu hơn 2 phút:

```bash
.claude/skills/video-flow-minh-hoa/scripts/giao.sh agy Output/antigravity/<viec>/brief.md 5
```

Câu trả lời nằm trong `brief.agy.log` cạnh brief. Log báo `no output produced` nghĩa là agy đòi chạy một lệnh ngoài danh sách cho phép: thêm câu cấm chạy lệnh vào brief rồi chạy lại. Không dùng `--dangerously-skip-permissions`.

Mỗi việc một phiên mới. Hỏi tiếp trong cùng việc thì viết `brief-2.md` cùng thư mục và thêm `tiep`, không chạy agy nào khác xen giữa:

```bash
.claude/skills/video-flow-minh-hoa/scripts/giao.sh agy Output/antigravity/<viec>/brief-2.md 5 tiep
```

## Sau khi chạy

- Mã 4: có file đổi trong lúc agy chạy, script in danh sách. Agy chỉ được đọc: file do agy đổi thì khôi phục và coi lần chạy là không đạt.
- Kết quả là bản nháp. Tự đối chiếu từng góp ý với khung hình, vì Antigravity có thể đọc sai. Bỏ góp ý sai, nói rõ phần nào do Antigravity làm. PMID/DOI tra lại theo `kiem-chung-nguon`.
- Cùng một lỗi mà hai vòng chưa xong thì dừng và báo, không lặp tiếp.
